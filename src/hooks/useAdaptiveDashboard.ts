/**
 * Adaptive Dashboard Context Hook
 * Phase 2A Sprint 2: Real-time context detection and dashboard adaptation
 *
 * Provides automatic context detection, real-time updates, and intelligent
 * dashboard adaptations based on time, user behavior, and situation.
 */

import { useEffect, useCallback, useRef } from "react";
import { useDashboardStore } from "../stores/dashboardStore";
import { AdaptiveContentService } from "../services/adaptiveContentService";
import { useAuth } from "../app/auth-store";

export interface AdaptiveContextState {
  isAdaptiveMode: boolean;
  contextConfidence: number;
  lastContextUpdate: number;
  adaptiveRecommendations: string[];
  contextualActions: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    priority: number;
  }>;
}

/**
 * Hook for managing adaptive dashboard behavior
 */
export function useAdaptiveDashboard() {
  const { profile } = useAuth();
  const {
    currentContext,
    timeContext,
    userActivity,
    personalizationSettings,
    setCurrentContext,
    setTimeContext,
    trackUserActivity,
    calculateWidgetPriorities,
    getContextualActions,
    updateAdaptiveRecommendations,
    adaptLayoutForContext,
  } = useDashboardStore();

  const contextUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Convert app role to dashboard role
  const userRole = (() => {
    const appRole = profile?.role || "player";
    switch (appRole) {
      case "coach":
      case "super_admin":
        return "coach" as const;
      case "player":
        return "player" as const;
      case "family":
        return "family" as const;
      default:
        return "player" as const;
    }
  })();

  /**
   * Detect and update current context
   */
  const updateContext = useCallback(() => {
    if (!personalizationSettings?.adaptiveFeatures?.enableSmartPrioritization) {
      return;
    }

    const detection = AdaptiveContentService.detectCurrentContext(userRole);

    // Only update if context has changed or confidence is high
    if (
      detection.context !== currentContext ||
      detection.timeContext !== timeContext ||
      detection.confidence > 0.8
    ) {
      setCurrentContext(detection.context);
      setTimeContext(detection.timeContext);

      // Trigger layout adaptation if enabled
      if (
        personalizationSettings?.adaptiveFeatures?.enableAutoLayoutOptimization
      ) {
        adaptLayoutForContext(detection.context);
      }

      // Update priorities and recommendations
      calculateWidgetPriorities();
      updateAdaptiveRecommendations();
    }
  }, [
    userRole,
    currentContext,
    timeContext,
    personalizationSettings.adaptiveFeatures,
    setCurrentContext,
    setTimeContext,
    adaptLayoutForContext,
    calculateWidgetPriorities,
    updateAdaptiveRecommendations,
  ]);

  /**
   * Track widget interaction
   */
  const trackWidgetInteraction = useCallback(
    (
      widgetId: string,
      action: "view" | "interact" | "edit" | "share",
      duration: number = 1000
    ) => {
      if (!personalizationSettings?.adaptiveFeatures?.enableUsageAnalytics) {
        return;
      }

      trackUserActivity({
        widgetId,
        action,
        timestamp: Date.now(),
        duration,
        context: currentContext,
      });
    },
    [
      personalizationSettings.adaptiveFeatures,
      trackUserActivity,
      currentContext,
    ]
  );

  /**
   * Get contextual actions for current situation
   */
  const getAdaptiveActions = useCallback(() => {
    if (!personalizationSettings?.adaptiveFeatures?.enableContextualActions) {
      return [];
    }

    return getContextualActions();
  }, [personalizationSettings?.adaptiveFeatures, getContextualActions]);

  /**
   * Force context refresh
   */
  const refreshContext = useCallback(() => {
    updateContext();
  }, [updateContext]);

  /**
   * Setup automatic context updates
   */
  useEffect(() => {
    if (!personalizationSettings?.adaptiveFeatures?.enableSmartPrioritization) {
      return;
    }

    // Initial context detection
    updateContext();

    // Setup periodic context updates (every 5 minutes)
    contextUpdateIntervalRef.current = setInterval(
      updateContext,
      5 * 60 * 1000
    );

    return () => {
      if (contextUpdateIntervalRef.current) {
        clearInterval(contextUpdateIntervalRef.current);
      }
    };
  }, [
    updateContext,
    personalizationSettings?.adaptiveFeatures?.enableSmartPrioritization,
  ]);

  /**
   * Setup context change detection based on time
   */
  useEffect(() => {
    // Check for time-based context changes every hour
    const timeCheckInterval = setInterval(
      () => {
        const currentHour = new Date().getHours();
        const shouldUpdate =
          (currentHour === 6 && timeContext !== "morning") ||
          (currentHour === 12 && timeContext !== "pre-practice") ||
          (currentHour === 14 && timeContext !== "practice-time") ||
          (currentHour === 16 && timeContext !== "post-practice") ||
          (currentHour === 18 && timeContext !== "evening");

        if (shouldUpdate) {
          updateContext();
        }
      },
      60 * 60 * 1000
    ); // Check every hour

    return () => clearInterval(timeCheckInterval);
  }, [timeContext, updateContext]);

  return {
    // Current state
    currentContext,
    timeContext,
    userActivity,

    // Adaptive features
    isAdaptiveMode:
      personalizationSettings?.adaptiveFeatures?.enableSmartPrioritization ??
      false,
    contextConfidence: 0.8, // TODO: Get from actual detection
    lastContextUpdate: Date.now(),

    // Actions
    trackWidgetInteraction,
    getAdaptiveActions,
    refreshContext,

    // Computed values
    adaptiveRecommendations:
      useDashboardStore.getState().adaptiveRecommendations,
    contextualActions: getAdaptiveActions(),
  };
}

/**
 * Hook for widget-specific adaptive behavior
 */
export function useAdaptiveWidget(widgetId: string, widgetType: string) {
  const { trackWidgetInteraction, currentContext, timeContext } =
    useAdaptiveDashboard();
  const { profile } = useAuth();

  // Convert app role to dashboard role
  const userRole = (() => {
    const appRole = profile?.role || "player";
    switch (appRole) {
      case "coach":
      case "super_admin":
        return "coach" as const;
      case "player":
        return "player" as const;
      case "family":
        return "family" as const;
      default:
        return "player" as const;
    }
  })();

  /**
   * Get priority boost for this widget in current context
   */
  const getPriorityBoost = useCallback(() => {
    return AdaptiveContentService.getContextualPriorityBoost(
      widgetType,
      currentContext,
      timeContext,
      userRole
    );
  }, [widgetType, currentContext, timeContext, userRole]);

  /**
   * Track when widget becomes visible
   */
  const trackView = useCallback(() => {
    trackWidgetInteraction(widgetId, "view");
  }, [widgetId, trackWidgetInteraction]);

  /**
   * Track widget interaction
   */
  const trackInteraction = useCallback(
    (duration?: number) => {
      trackWidgetInteraction(widgetId, "interact", duration);
    },
    [widgetId, trackWidgetInteraction]
  );

  /**
   * Track widget edit action
   */
  const trackEdit = useCallback(() => {
    trackWidgetInteraction(widgetId, "edit");
  }, [widgetId, trackWidgetInteraction]);

  return {
    priorityBoost: getPriorityBoost(),
    trackView,
    trackInteraction,
    trackEdit,
    isHighPriority: getPriorityBoost() > 15,
    contextRelevance: getPriorityBoost() > 0 ? "high" : "normal",
  };
}

export default useAdaptiveDashboard;
