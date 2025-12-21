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

    // TODO: Implement actual team search API
    debug("[JoinTeam] Searching for teams", searchQuery);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock results - replace with actual search
    setSearchResults(
      MOCK_SEARCH_RESULTS.filter(
        (team) =>
          team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          team.school.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    setIsLoading(false);
  };

  const handleJoinTeam = (team: TeamSearchResult) => {
    setSelectedTeam(team);

    if (team.requiresApproval) {
      // Send join request
      debug("[JoinTeam] Sending join request for team", team.name);
      // TODO: Implement join request logic
      setCurrentStep("request");
    } else {
      // Join immediately
      debug("[JoinTeam] Joining team immediately", team.name);
      // TODO: Implement immediate join logic
      setCurrentStep("complete");
    }
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const handleGoToTeam = () => {
    navigate("/team/new-team-id/bulletin");
  };

  const handleJoinAnother = () => {
    setCurrentStep("method");
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
