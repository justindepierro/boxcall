/**
 * Clean, simplified dev system types
 */

// Clear subscription tiers (app-level billing)
export type SubscriptionTier =
  | "boxcall_free" // $0 - Players, family, initial registration
  | "boxcall_pro" // $19.99 - Coaches
  | "boxcall_premium"; // $199.99/year - Program owners

// Clear team roles (program-level permissions)
export type TeamRole =
  | "head_coach" // Program owner (BoxCall Premium subscriber)
  | "coach" // Assistant coaches (BoxCall Pro subscribers)
  | "manager" // Administrative staff (BoxCall Free with elevated permissions)
  | "player" // Athletes (BoxCall Free)
  | "family"; // Parents/guardians (BoxCall Free)

// Simplified dev modes for testing
export type DevMode =
  | "production" // Real data, real permissions
  | "blank_slate" // New user experience
  | "test_as_head_coach" // Test head coach permissions
  | "test_as_coach" // Test assistant coach permissions
  | "test_as_player" // Test player experience
  | "test_as_family"; // Test family portal

// Dev tool state
export interface DevToolsState {
  mode: DevMode;
  isVisible: boolean;
  isExpanded: boolean;
  activeTab: DevToolTab;
}

export type DevToolTab = "overview" | "database" | "permissions" | "logs";

// System status for monitoring
export interface SystemStatus {
  database: "connected" | "disconnected" | "error";
  auth: "authenticated" | "anonymous" | "error";
  dataCount: {
    teams: number;
    playbooks: number;
    plays: number;
  };
  performance: {
    renderTime: number;
    memoryUsage: number;
  };
}

// Action results for user feedback
export interface ActionResult {
  success: boolean;
  message: string;
  data?: unknown;
}

// Log entry for debugging
export interface LogEntry {
  id: string;
  timestamp: Date;
  level: "info" | "warning" | "error" | "success";
  module: string;
  message: string;
  data?: unknown;
}
