/**
 * DevTools State Types
 * Shared types for DevTools components
 */
export interface DevToolsState {
  isExpanded: boolean;
  activeTab: "overview" | "data" | "auth" | "performance" | "testing" | "logs";
  isVisible: boolean;
  isHovered: boolean;
  opacity: number;
  autoHideTimer: NodeJS.Timeout | null;
}

export interface DevLog {
  id: string;
  level: "info" | "warning" | "error" | "success";
  message: string;
  timestamp: Date;
  source: string;
}

export const DEV_MODES = [
  {
    mode: "production",
    label: "🏠 Production",
    description: "Real user data",
    color: "green",
  },
  {
    mode: "test_as_head_coach",
    label: "👑 Head Coach",
    description: "Coach permissions",
    color: "purple",
  },
  {
    mode: "test_as_coach",
    label: "🎯 Assistant Coach",
    description: "Limited coach access",
    color: "orange",
  },
  {
    mode: "test_as_player",
    label: "🏃 Player",
    description: "Player perspective",
    color: "blue",
  },
  {
    mode: "test_as_family",
    label: "👨‍👩‍👧‍👦 Family",
    description: "Parent portal",
    color: "pink",
  },
  {
    mode: "blank_slate",
    label: "📄 Blank Slate",
    description: "New user - no data",
    color: "gray",
  },
] as const;
