/**
 * Dashboard Store Defaults
 * Default configurations for widgets, layouts, and settings.
 */

import type {
  DashboardLayout,
  PersonalizationSettings,
  UserRole,
  WidgetConfig,
} from "./types";

export const defaultPersonalizationSettings: PersonalizationSettings = {
  theme: "auto",
  compactMode: false,
  showWelcomeMessages: true,
  enableNotifications: true,
  autoRefresh: true,
  refreshInterval: 300,
  preferredLanguage: "en",
  adaptiveFeatures: {
    enableSmartPrioritization: true,
    enableContextualActions: true,
    enableAutoLayoutOptimization: true,
    enableUsageAnalytics: true,
    adaptiveNotifications: true,
    learningMode: "moderate",
  },
};

const commonWidgets: WidgetConfig[] = [
  {
    id: "profile",
    type: "profile",
    title: "Profile",
    visible: true,
    position: { row: 0, column: 0, order: 0 },
    size: "medium",
    preferences: {},
  },
  {
    id: "calendar",
    type: "calendar",
    title: "Calendar",
    visible: true,
    position: { row: 1, column: 0, order: 3 },
    size: "large",
    preferences: { view: "week" },
  },
];

const roleSpecificWidgets: Record<UserRole, WidgetConfig[]> = {
  coach: [
    ...commonWidgets,
    {
      id: "team-feeds",
      type: "team-feeds",
      title: "Team Updates",
      visible: true,
      position: { row: 0, column: 1, order: 1 },
      size: "medium",
      preferences: { showAll: true },
    },
    {
      id: "practice-plans",
      type: "practice-plans",
      title: "Practice Plans",
      visible: true,
      position: { row: 0, column: 2, order: 2 },
      size: "medium",
      preferences: { upcoming: 3 },
    },
  ],
  player: [
    ...commonWidgets,
    {
      id: "trophy-shelf",
      type: "trophy-shelf",
      title: "Achievements",
      visible: true,
      position: { row: 0, column: 1, order: 1 },
      size: "medium",
      preferences: { showRecent: 5 },
    },
    {
      id: "performance-stats",
      type: "performance-stats",
      title: "Performance",
      visible: true,
      position: { row: 0, column: 2, order: 2 },
      size: "medium",
      preferences: { period: "month" },
    },
  ],
  family: [
    ...commonWidgets,
    {
      id: "announcements",
      type: "announcements",
      title: "Announcements",
      visible: true,
      position: { row: 0, column: 1, order: 1 },
      size: "medium",
      preferences: { priority: "high" },
    },
    {
      id: "game-schedule",
      type: "game-schedule",
      title: "Games",
      visible: true,
      position: { row: 0, column: 2, order: 2 },
      size: "medium",
      preferences: { upcoming: 5 },
    },
  ],
  admin: [
    ...commonWidgets,
    {
      id: "team-feeds",
      type: "team-feeds",
      title: "All Teams",
      visible: true,
      position: { row: 0, column: 1, order: 1 },
      size: "large",
      preferences: { showAll: true },
    },
  ],
};

export function getDefaultWidgetsForRole(role: UserRole): WidgetConfig[] {
  return roleSpecificWidgets[role] || commonWidgets;
}

export function createDefaultLayout(
  userId: string,
  userRole: UserRole
): DashboardLayout {
  const now = new Date().toISOString();

  return {
    id: `default-${userRole}-${userId}`,
    name: `Default ${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Layout`,
    userId,
    userRole,
    isDefault: true,
    widgets: getDefaultWidgetsForRole(userRole),
    gridConfig: {
      columns: 3,
      gap: 24,
      padding: 16,
    },
    createdAt: now,
    updatedAt: now,
  };
}
