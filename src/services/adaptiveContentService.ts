/**
 * Adaptive Content Service
 * Phase 2A Sprint 2: Smart context detection and adaptive behavior
 *
 * Automatically detects context and time-based situations to optimize
 * dashboard content and provide intelligent recommendations.
 */

import type {
  ContextType,
  TimeContext,
  UserRole,
} from "../stores/dashboard";

export interface ContextDetectionResult {
  context: ContextType;
  timeContext: TimeContext;
  confidence: number;
  reasons: string[];
}

export class AdaptiveContentService {
  private static determineTimeContext(
    hour: number,
    reasons: string[]
  ): TimeContext {
    if (hour >= 6 && hour < 9) {
      reasons.push("Morning hours (6-9 AM)");
      return "morning";
    }
    if (hour >= 12 && hour < 14) {
      reasons.push("Pre-practice hours (12-2 PM)");
      return "pre-practice";
    }
    if (hour >= 14 && hour < 16) {
      reasons.push("Typical practice hours (2-4 PM)");
      return "practice-time";
    }
    if (hour >= 16 && hour < 18) {
      reasons.push("Post-practice hours (4-6 PM)");
      return "post-practice";
    }
    if (hour >= 18 && hour < 22) {
      reasons.push("Evening hours (6-10 PM)");
      return "evening";
    }

    reasons.push("Default time context");
    return "morning";
  }

  private static determineMainContext(
    timeContext: TimeContext,
    dayOfWeek: number,
    month: number,
    reasons: string[]
  ): { context: ContextType; confidence: number } {
    // Weekend = potential game day
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      reasons.push("Weekend day (potential game day)");
      return { context: "game-day", confidence: 0.7 };
    }

    // Weekday practice times
    if (timeContext === "practice-time" && dayOfWeek >= 1 && dayOfWeek <= 5) {
      reasons.push("Weekday during practice hours");
      return { context: "practice-day", confidence: 0.8 };
    }

    // Weekday evenings
    if (timeContext === "evening" && dayOfWeek >= 1 && dayOfWeek <= 5) {
      reasons.push("Weekday evening (practice review time)");
      return { context: "practice-day", confidence: 0.6 };
    }

    // Summer months = potential off-season
    if (month >= 5 && month <= 7) {
      reasons.push("Summer months (potential off-season)");
      return { context: "off-season", confidence: 0.6 };
    }

    // Default to practice day for active season
    reasons.push("Default context during active season");
    return { context: "practice-day", confidence: 0.5 };
  }

  private static applyRoleAdjustments(
    userRole: UserRole,
    timeContext: TimeContext,
    base: { context: ContextType; confidence: number },
    reasons: string[]
  ): { context: ContextType; confidence: number } {
    if (userRole === "coach" && timeContext === "morning") {
      reasons.push("Coaches typically plan in mornings");
      return {
        context: "practice-day",
        confidence: Math.min(base.confidence + 0.1, 1.0),
      };
    }

    return base;
  }

  /**
   * Automatically detect current context based on various signals
   */
  static detectCurrentContext(
    userRole: UserRole,
    currentTime: Date = new Date()
  ): ContextDetectionResult {
    const hour = currentTime.getHours();
    const dayOfWeek = currentTime.getDay(); // 0 = Sunday, 6 = Saturday
    const month = currentTime.getMonth();
    const reasons: string[] = [];

    const timeContext = AdaptiveContentService.determineTimeContext(
      hour,
      reasons
    );

    const base = AdaptiveContentService.determineMainContext(
      timeContext,
      dayOfWeek,
      month,
      reasons
    );

    const adjusted = AdaptiveContentService.applyRoleAdjustments(
      userRole,
      timeContext,
      base,
      reasons
    );

    return {
      context: adjusted.context,
      timeContext,
      confidence: adjusted.confidence,
      reasons,
    };
  }

  /**
   * Get priority boost for widgets based on current context
   */
  static getContextualPriorityBoost(
    widgetType: string,
    context: ContextType,
    timeContext: TimeContext,
    userRole: UserRole
  ): number {
    let boost = 0;

    // Game day boosts
    if (context === "game-day") {
      switch (widgetType) {
        case "performance-stats":
          boost += 25;
          break;
        case "team-feeds":
          boost += 20;
          break;
        case "quick-actions":
          boost += 15;
          break;
        case "calendar":
          boost += 10;
          break;
        default:
          break;
      }
    }

    // Practice day boosts
    if (context === "practice-day") {
      switch (widgetType) {
        case "practice-plans":
          boost += 25;
          break;
        case "calendar":
          boost += 15;
          break;
        case "quick-actions":
          boost += 15;
          break;
        case "team-feeds":
          boost += 10;
          break;
        default:
          break;
      }
    }

    // Time-based boosts
    if (timeContext === "morning") {
      switch (widgetType) {
        case "calendar":
          boost += 15;
          break;
        case "announcements":
          boost += 10;
          break;
        default:
          break;
      }
    }

    // Role-specific boosts
    if (userRole === "coach") {
      switch (widgetType) {
        case "practice-plans":
          boost += 10;
          break;
        case "team-feeds":
          boost += 5;
          break;
        default:
          break;
      }
    }

    if (userRole === "player") {
      switch (widgetType) {
        case "performance-stats":
          boost += 10;
          break;
        case "trophy-shelf":
          boost += 5;
          break;
        default:
          break;
      }
    }

    return Math.min(boost, 50); // Cap at 50 point boost
  }

  /**
   * Get recommended quick actions for current context
   */
  static getRecommendedQuickActions(
    context: ContextType,
    timeContext: TimeContext,
    userRole: UserRole
  ): Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    priority: number;
    contexts: ContextType[];
    roles: UserRole[];
  }> {
    const actions = [];

    // Game day actions
    if (context === "game-day") {
      if (userRole === "coach") {
        actions.push({
          id: "pre-game-checklist",
          title: "Pre-Game Checklist",
          description: "Review game day preparation",
          icon: "check-square",
          priority: 95,
          contexts: ["game-day" as ContextType],
          roles: ["coach" as UserRole],
        });
      }

      if (userRole === "player") {
        actions.push({
          id: "warm-up-routine",
          title: "Warm-up Routine",
          description: "Access your personal warm-up",
          icon: "activity",
          priority: 90,
          contexts: ["game-day" as ContextType],
          roles: ["player" as UserRole],
        });
      }
    }

    // Practice day actions
    if (context === "practice-day") {
      if (userRole === "coach") {
        actions.push({
          id: "practice-plan",
          title: "Today's Practice",
          description: "View and edit practice plan",
          icon: "clipboard",
          priority: 85,
          contexts: ["practice-day" as ContextType],
          roles: ["coach" as UserRole],
        });
      }

      actions.push({
        id: "attendance-check",
        title: "Attendance",
        description: "Check who's coming to practice",
        icon: "users",
        priority: 80,
        contexts: ["practice-day" as ContextType],
        roles: ["coach" as UserRole, "player" as UserRole],
      });
    }

    // Morning actions
    if (timeContext === "morning") {
      actions.push({
        id: "daily-schedule",
        title: "Today's Schedule",
        description: "See what's planned for today",
        icon: "calendar",
        priority: 75,
        contexts: ["practice-day" as ContextType, "game-day" as ContextType],
        roles: [
          "coach" as UserRole,
          "player" as UserRole,
          "family" as UserRole,
        ],
      });
    }

    return actions.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Calculate optimal widget layout for current context
   */
  static calculateOptimalLayout(
    currentWidgets: Array<{
      id: string;
      type: string;
      position: { row: number; column: number; order: number };
      [key: string]: unknown;
    }>,
    context: ContextType,
    timeContext: TimeContext,
    userRole: UserRole
  ): Array<{
    id: string;
    type: string;
    position: { row: number; column: number; order: number };
    adaptivePriority?: number;
    [key: string]: unknown;
  }> {
    return currentWidgets
      .map((widget) => ({
        ...widget,
        adaptivePriority: this.getContextualPriorityBoost(
          widget.type,
          context,
          timeContext,
          userRole
        ),
      }))
      .sort((a, b) => (b.adaptivePriority || 0) - (a.adaptivePriority || 0))
      .map((widget, index) => ({
        ...widget,
        position: {
          ...widget.position,
          order: index,
        },
      }));
  }

  /**
   * Generate adaptive recommendations based on usage patterns
   */
  static generateAdaptiveRecommendations(
    userActivity: Array<{
      widgetId: string;
      action: string;
      timestamp: number;
      duration: number;
      context: ContextType;
    }>,
    context: ContextType,
    userRole: UserRole
  ): string[] {
    const recommendations: string[] = [];
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Analyze recent activity
    const recentActivity = userActivity.filter(
      (activity) => now - activity.timestamp < oneDay
    );

    if (recentActivity.length === 0) {
      recommendations.push(
        "Start exploring your dashboard widgets to get personalized recommendations"
      );
      return recommendations;
    }

    // Widget usage analysis
    const widgetUsage = recentActivity.reduce(
      (acc, activity) => {
        acc[activity.widgetId] = (acc[activity.widgetId] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const mostUsedWidget = Object.entries(widgetUsage).sort(
      ([, a], [, b]) => (b as number) - (a as number)
    )[0];

    if (mostUsedWidget && (mostUsedWidget[1] as number) > 5) {
      recommendations.push(
        `Consider enlarging your ${mostUsedWidget[0]} widget - you use it frequently`
      );
    }

    // Context-specific recommendations
    if (context === "game-day" && userRole === "player") {
      recommendations.push("Enable performance tracking for game day insights");
    }

    if (context === "practice-day" && userRole === "coach") {
      recommendations.push(
        "Quick access to practice modifications is available in your settings"
      );
    }

    return recommendations;
  }
}
