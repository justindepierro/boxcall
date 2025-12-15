/**
 * Dashboard Store Types
 * Type definitions for dashboard personalization and adaptive content system.
 */

export type WidgetType =
  | "profile"
  | "calendar"
  | "trophy-shelf"
  | "team-feeds"
  | "quick-actions"
  | "performance-stats"
  | "announcements"
  | "practice-plans"
  | "game-schedule"
  | "shared-goals"
  | "team-vote"
  | "progress-sharing"
  | "collaborative-notes";

export type LayoutSize = "small" | "medium" | "large";
export type UserRole = "coach" | "player" | "family" | "admin";

export type ContextType =
  | "game-day"
  | "practice-day"
  | "off-season"
  | "recruiting"
  | "tournament"
  | "team-meeting";

export type TimeContext =
  | "morning"
  | "pre-practice"
  | "practice-time"
  | "post-practice"
  | "game-time"
  | "evening";

export interface UserActivity {
  widgetId: string;
  action: "view" | "interact" | "edit" | "share";
  timestamp: number;
  duration: number;
  context: ContextType;
}

export interface WidgetPriority {
  widgetId: string;
  priority: number;
  reason: string;
  contextFactors: string[];
  lastCalculated: number;
}

export interface ContextualAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  contexts: ContextType[];
  roles: UserRole[];
  priority: number;
  conditions?: () => boolean;
}

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  visible: boolean;
  position: {
    row: number;
    column: number;
    order: number;
  };
  size: LayoutSize;
  preferences: Record<string, unknown>;
  adaptiveSettings?: {
    autoHide: boolean;
    contextualResize: boolean;
    smartPrioritization: boolean;
    lastInteraction?: number;
    avgDailyUse?: number;
    preferredContexts?: ContextType[];
  };
}

export interface DashboardLayout {
  id: string;
  name: string;
  userId: string;
  userRole: UserRole;
  isDefault: boolean;
  widgets: WidgetConfig[];
  gridConfig: {
    columns: number;
    gap: number;
    padding: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PersonalizationSettings {
  theme: "light" | "dark" | "auto";
  compactMode: boolean;
  showWelcomeMessages: boolean;
  enableNotifications: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  preferredLanguage: string;
  adaptiveFeatures: {
    enableSmartPrioritization: boolean;
    enableContextualActions: boolean;
    enableAutoLayoutOptimization: boolean;
    enableUsageAnalytics: boolean;
    adaptiveNotifications: boolean;
    learningMode: "aggressive" | "moderate" | "conservative";
  };
}
