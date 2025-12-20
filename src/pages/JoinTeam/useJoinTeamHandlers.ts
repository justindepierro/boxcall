/**
 * useJoinTeamHandlers Hook
 *
 * Manages state and handlers for the Join Team wizard
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import type { JoinStep, TeamSearchResult, JoinTeamState } from "./types";
import { MOCK_SEARCH_RESULTS, INVITE_CODE_LENGTH } from "./constants";
import { debug } from "../../utils/logger";

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

  // Handlers
  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setCurrentStep(methodId as JoinStep);
  };

  const handleInviteCodeChange = (value: string) => {
    setInviteCode(value.toUpperCase());
  };

  const handleInviteCodeSubmit = async () => {
    if (!inviteCode || inviteCode.length !== INVITE_CODE_LENGTH) {
      toast.error(
        `Please enter a valid ${INVITE_CODE_LENGTH}-digit invite code`
      );
      return;
    }

    setIsLoading(true);

    // TODO: Implement actual invite code verification
    debug("[JoinTeam] Verifying invite code", inviteCode);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock success - replace with actual logic
    setIsLoading(false);
    setCurrentStep("complete");
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
