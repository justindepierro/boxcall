/**
 * useJoinTeamHandlers Hook
 *
 * Manages state and handlers for the Join Team wizard
 */

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import type { JoinStep, TeamSearchResult, JoinTeamState } from "./types";
import { MOCK_SEARCH_RESULTS, INVITE_CODE_LENGTH } from "./constants";
import { debug } from "../../utils/logger";
import { supabase } from "../../lib/supabase";
import { getCurrentUserId } from "../../lib/auth-helpers";
import { table } from "../../data/supabase/db";
import { teamRoutes } from "../../routes/paths";
import { storageKeys, writeLocalString } from "../../utils/storage";

function extractInvitationTokenFromInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // If it's a URL (or looks like one), try to parse and extract `token`.
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const token = url.searchParams.get("token");
      return token ? token.trim() : null;
    } catch {
      // Fall through to regex extraction.
    }
  }

  // Also support pasting an internal path like `/invite/accept?token=...`
  const tokenMatch = trimmed.match(/[?&]token=([^&]+)/i);
  if (tokenMatch?.[1]) {
    try {
      return decodeURIComponent(tokenMatch[1]).trim();
    } catch {
      return tokenMatch[1].trim();
    }
  }

  // Otherwise treat the input itself as the token/code.
  return trimmed;
}

type SearchTeamsRow = {
  id: string;
  name: string;
  school_name: string | null;
  season_year: number | null;
  member_count: number | null;
  coach_name: string | null;
};

export interface UseJoinTeamHandlersReturn extends JoinTeamState {
  handleMethodSelect: (methodId: string) => void;
  handleInviteCodeChange: (value: string) => void;
  handleInviteCodeSubmit: () => Promise<void>;
  handleSearchQueryChange: (value: string) => void;
  handleTeamSearch: () => Promise<void>;
  handleJoinTeam: (team: TeamSearchResult) => void;
  handleGoToDashboard: () => void;
  handleGoToTeam: () => void;
  handleJoinAnother: () => void;
  handleSwitchToSearch: () => void;
  handleSwitchToInviteCode: () => void;
  handleBackToMethods: () => void;
}

export function useJoinTeamHandlers(): UseJoinTeamHandlersReturn {
  const navigate = useNavigate();
  const toast = useToast();

  // State
  const [currentStep, setCurrentStep] = useState<JoinStep>("method");
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [inviteCode, setInviteCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TeamSearchResult[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamSearchResult | null>(
    null
  );
  const [joinedTeamId, setJoinedTeamId] = useState<string | null>(null);
  const [selectedRole, _setSelectedRole] = useState("player");
  const [isLoading, setIsLoading] = useState(false);

  const inviteAcceptPath = useMemo(() => "/invite/accept", []);

  // Handlers
  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);

    // Email invitations already route through the invitation acceptance page.
    // Reuse the invite-code entry UI to accept either an invite token or full link.
    if (methodId === "email-invite") {
      setCurrentStep("invite-code");
      return;
    }

    setCurrentStep(methodId as JoinStep);
  };

  const handleInviteCodeChange = (value: string) => {
    // Preserve user input so they can paste a full invite link.
    // We normalize on submit (trim/extract token).
    setInviteCode(value);
  };

  const handleInviteCodeSubmit = async () => {
    const token = extractInvitationTokenFromInput(inviteCode);
    if (!token || token.length < INVITE_CODE_LENGTH) {
      toast.error(
        `Please enter a valid invite code (at least ${INVITE_CODE_LENGTH} characters), or paste the full invite link`
      );
      return;
    }

    setIsLoading(true);

    debug("[JoinTeam] Redirecting to invitation acceptance", {
      hasUrl: inviteCode.includes("/invite/") || inviteCode.includes("http"),
      tokenLength: token.length,
    });

    // Use the real invitation acceptance flow.
    // That page handles token validation + auth + atomic membership creation.
    navigate(`${inviteAcceptPath}?token=${encodeURIComponent(token)}`);
    setIsLoading(false);
  };

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleTeamSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);

    try {
      debug("[JoinTeam] Searching teams via RPC", { query: searchQuery });

      const { data, error } = await supabase.rpc("search_teams", {
        p_query: searchQuery.trim(),
        p_limit: 10,
      });

      if (error) {
        throw error;
      }

      const rows = (data ?? []) as SearchTeamsRow[];
      const mapped: TeamSearchResult[] = rows.map((row) => ({
        id: row.id,
        name: row.name,
        school: row.school_name || "",
        sport: "Football",
        level: "Varsity",
        memberCount: row.member_count ?? 0,
        coachName: row.coach_name || "",
        isPublic: true,
        requiresApproval: false,
      }));

      setSearchResults(mapped);
    } catch (err) {
      debug("[JoinTeam] Team search RPC failed, falling back to mock", err);

      setSearchResults(
        MOCK_SEARCH_RESULTS.filter(
          (team) =>
            team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            team.school.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinTeam = (team: TeamSearchResult) => {
    void (async () => {
      setSelectedTeam(team);

      if (team.requiresApproval) {
        // Request-to-join workflow isn't backed by a DB primitive yet.
        setCurrentStep("request");
        return;
      }

      const userId = getCurrentUserId();
      if (!userId) {
        toast.error("Please sign in to join a team");
        return;
      }

      setIsLoading(true);
      try {
        debug("[JoinTeam] Joining team via team_members insert", {
          teamId: team.id,
        });

        const { error } = await table("team_members").insert({
          team_id: team.id,
          user_id: userId,
          team_role: "player",
          status: "active",
        });

        if (error) {
          // PGRST116 is no rows; here we'd get 409-ish for uniqueness.
          throw error;
        }

        setJoinedTeamId(team.id);
        try {
          writeLocalString(storageKeys.activeTeamId, team.id);
        } catch {
          /* ignore */
        }

        setCurrentStep("complete");
      } catch (err) {
        debug("[JoinTeam] Join failed", err);
        toast.error(
          "Could not join team. If you already joined, try going to your dashboard."
        );
      } finally {
        setIsLoading(false);
      }
    })();
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const handleGoToTeam = () => {
    if (!joinedTeamId) {
      navigate("/dashboard");
      return;
    }

    navigate(teamRoutes.bulletin(joinedTeamId));
  };

  const handleJoinAnother = () => {
    setCurrentStep("method");
    setSelectedTeam(null);
    setJoinedTeamId(null);
    setInviteCode("");
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSwitchToSearch = () => {
    setCurrentStep("search");
  };

  const handleSwitchToInviteCode = () => {
    setCurrentStep("invite-code");
  };

  const handleBackToMethods = () => {
    setCurrentStep("method");
  };

  return {
    // State
    currentStep,
    selectedMethod,
    inviteCode,
    searchQuery,
    searchResults,
    selectedTeam,
    selectedRole,
    isLoading,
    // Handlers
    handleMethodSelect,
    handleInviteCodeChange,
    handleInviteCodeSubmit,
    handleSearchQueryChange,
    handleTeamSearch,
    handleJoinTeam,
    handleGoToDashboard,
    handleGoToTeam,
    handleJoinAnother,
    handleSwitchToSearch,
    handleSwitchToInviteCode,
    handleBackToMethods,
  };
}
