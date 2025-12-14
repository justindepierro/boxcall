/**
 * JoinTeam Types
 *
 * Type definitions for the Join Team wizard component
 */

/**
 * Join method option displayed on the method selection step
 */
export interface JoinMethod {
  id: string;
  title: string;
  description: string;
  icon: string;
  primary?: boolean;
}

/**
 * Team search result from the API
 */
export interface TeamSearchResult {
  id: string;
  name: string;
  school: string;
  sport: string;
  level: string;
  memberCount: number;
  coachName: string;
  isPublic: boolean;
  requiresApproval: boolean;
}

/**
 * Current step in the join wizard
 */
export type JoinStep =
  | "method"
  | "invite-code"
  | "search"
  | "email-invite"
  | "request"
  | "complete";

/**
 * State for the join team wizard
 */
export interface JoinTeamState {
  currentStep: JoinStep;
  selectedMethod: string;
  inviteCode: string;
  searchQuery: string;
  searchResults: TeamSearchResult[];
  selectedTeam: TeamSearchResult | null;
  selectedRole: string;
  isLoading: boolean;
}

/**
 * Props for individual step components
 */
export interface MethodStepProps {
  joinMethods: JoinMethod[];
  onMethodSelect: (methodId: string) => void;
}

export interface InviteCodeStepProps {
  inviteCode: string;
  isLoading: boolean;
  onInviteCodeChange: (value: string) => void;
  onSubmit: () => void;
  onSwitchToSearch: () => void;
}

export interface SearchStepProps {
  searchQuery: string;
  searchResults: TeamSearchResult[];
  isLoading: boolean;
  onSearchQueryChange: (value: string) => void;
  onSearch: () => void;
  onJoinTeam: (team: TeamSearchResult) => void;
  onSwitchToInviteCode: () => void;
}

export interface RequestStepProps {
  selectedTeam: TeamSearchResult | null;
  onGoToDashboard: () => void;
  onJoinAnother: () => void;
}

export interface CompleteStepProps {
  selectedRole: string;
  onGoToTeam: () => void;
  onGoToDashboard: () => void;
}
