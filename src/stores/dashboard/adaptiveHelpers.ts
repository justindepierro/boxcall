/**
 * Dashboard Adaptive Content Helpers
 * Helper functions for calculating priorities and contextual actions.
 */

import type {
  ContextType,
  ContextualAction,
  DashboardLayout,
  PersonalizationSettings,
  TimeContext,
  UserActivity,
  WidgetConfig,
  WidgetPriority,
} from "./types";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Calculate priority for a single widget based on usage and context
 */
function calculateSingleWidgetPriority(
  widget: WidgetConfig,
  userActivity: UserActivity[],
  currentContext: ContextType,
  timeContext: TimeContext,
  now: number
): WidgetPriority {
  let priority = 50;
  const reasons: string[] = [];
  const contextFactors: string[] = [];

  // Factor 1: Recent usage
  const recentActivity = userActivity.filter(
    (a) => a.widgetId === widget.id && now - a.timestamp < ONE_DAY_MS
  ).length;

  if (recentActivity > 0) {
    priority += Math.min(recentActivity * 5, 25);
    reasons.push(`Used ${recentActivity} times today`);
    contextFactors.push("recent-usage");
  }

  // Factor 2: Context relevance
  if (currentContext === "game-day" && widget.type === "performance-stats") {
    priority += 20;
    reasons.push("Relevant for game day");
    contextFactors.push("context-match");
  }

  if (currentContext === "practice-day" && widget.type === "practice-plans") {
    priority += 20;
    reasons.push("Relevant for practice");
    contextFactors.push("context-match");
  }

  // Factor 3: Time of day
  if (timeContext === "morning" && widget.type === "calendar") {
    priority += 15;
    reasons.push("Schedule relevant in morning");
    contextFactors.push("time-relevance");
  }

  return {
    widgetId: widget.id,
    priority: Math.min(priority, 100),
    reason: reasons.join(", ") || "Base priority",
    contextFactors,
    lastCalculated: now,
  };
}

/**
 * Calculate priorities for all widgets
 */
export function calculateWidgetPriorities(
  layout: DashboardLayout | null,
  userActivity: UserActivity[],
  currentContext: ContextType,
  timeContext: TimeContext,
  settings: PersonalizationSettings
): WidgetPriority[] {
  if (!settings.adaptiveFeatures.enableSmartPrioritization || !layout) {
    return [];
  }

  const now = Date.now();
  return layout.widgets.map((widget) =>
    calculateSingleWidgetPriority(
      widget,
      userActivity,
      currentContext,
      timeContext,
      now
    )
  );
}

/**
 * Get contextual actions based on current context
 */
export function getContextualActions(
  currentContext: ContextType,
  settings: PersonalizationSettings
): ContextualAction[] {
  if (!settings.adaptiveFeatures.enableContextualActions) {
    return [];
  }

  const actions: ContextualAction[] = [];

  if (currentContext === "game-day") {
    actions.push({
      id: "quick-game-plan",
      title: "Quick Game Plan",
      description: "Access today's game strategy",
      icon: "gamepad-2",
      action: () => console.info("Opening game plan"),
      contexts: ["game-day"],
      roles: ["coach", "player"],
      priority: 90,
    });
  }

  if (currentContext === "practice-day") {
    actions.push({
      id: "practice-checklist",
      title: "Practice Checklist",
      description: "Review today's practice plan",
      icon: "check-square",
      action: () => console.info("Opening practice checklist"),
      contexts: ["practice-day"],
      roles: ["coach"],
      priority: 85,
    });
  }

  // Collaborative features - always available
  actions.push(
    {
      id: "team-messaging",
      title: "Team Messages",
      description: "Chat with your team in real-time",
      icon: "message",
      action: () => (window.location.href = "/collaborative-demo"),
      contexts: ["practice-day", "game-day", "team-meeting"],
      roles: ["coach", "player", "family"],
      priority: 75,
    },
    {
      id: "team-planning",
      title: "Collaborative Planning",
      description: "Set goals and make decisions together",
      icon: "users",
      action: () => (window.location.href = "/collaborative-demo"),
      contexts: ["practice-day", "team-meeting"],
      roles: ["coach", "player"],
      priority: 70,
    }
  );

  return actions.sort((a, b) => b.priority - a.priority);
}

/**
 * Generate adaptive recommendations based on usage patterns
 */
export function generateAdaptiveRecommendations(
  layout: DashboardLayout | null,
  userActivity: UserActivity[],
  currentContext: ContextType
): string[] {
  const recommendations: string[] = [];

  const widgetUsage = userActivity.reduce(
    (acc, activity) => {
      acc[activity.widgetId] = (acc[activity.widgetId] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const allWidgets = layout?.widgets || [];
  const underusedWidgets = allWidgets.filter(
    (w) => (widgetUsage[w.id] || 0) < 5
  );

  if (underusedWidgets.length > 0) {
    recommendations.push(
      `Consider hiding or resizing ${underusedWidgets.length} rarely used widgets`
    );
  }

  if (currentContext === "game-day") {
    recommendations.push(
      "Enable game-day focused layout for better performance tracking"
    );
  }

  return recommendations;
}

/**
 * Adapt layout widgets for a specific context
 */
export function adaptWidgetsForContext(
  widgets: WidgetConfig[],
  context: ContextType
): WidgetConfig[] {
  return widgets.map((widget) => {
    const adapted = { ...widget };

    if (context === "game-day") {
      if (widget.type === "performance-stats") {
        adapted.size = "large";
        adapted.position = { ...adapted.position, order: 0 };
      }
      if (widget.type === "trophy-shelf") {
        adapted.size = "small";
      }
    }

    if (context === "practice-day") {
      if (widget.type === "practice-plans") {
        adapted.size = "large";
        adapted.position = { ...adapted.position, order: 0 };
      }
    }

    return adapted;
  });
}
