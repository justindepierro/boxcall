/**
 * useViewMode Hook
 * Manages view mode (list/grid) with mobile detection
 * 
 * Uses centralized useIsMobile() hook for consistent breakpoint detection (< 768px)
 */

import { useCallback, useEffect } from "react";
import { usePreference } from "../../../../hooks/usePreferences";
import { useIsMobile } from "../../../../hooks/useBreakpoint";

export function useViewMode() {
  const [hasManualViewModeOverride, setHasManualViewModeOverride] =
    usePreference("bc_playgrid_view_manual", false);

  const [viewMode, setViewModeState] = usePreference(
    "bc_playgrid_view",
    "list" as "list" | "grid"
  );

  // Use centralized mobile detection hook
  const isMobile = useIsMobile();

  const setViewMode = useCallback(
    (mode: "list" | "grid", manual = true) => {
      console.log(`[PlayGrid] setViewMode called:`, {
        newMode: mode,
        previousMode: viewMode,
        manual,
        hasManualOverride: hasManualViewModeOverride,
        stackTrace: new Error().stack?.split("\n").slice(1, 4).join("\n"),
      });

      // Only update if different to avoid unnecessary re-renders
      if (mode !== viewMode) {
        setViewModeState(mode);
      }

      if (manual) {
        setHasManualViewModeOverride(true);
      }
    },
    [
      setViewModeState,
      setHasManualViewModeOverride,
      viewMode,
      hasManualViewModeOverride,
    ]
  );

  // Auto-detect mobile viewport for initial view mode (unless user has manual override)
  // Uses centralized useIsMobile() hook instead of manual media queries
  useEffect(() => {
    if (hasManualViewModeOverride) {
      console.log(
        "[PlayGrid] Skipping auto view mode - user has manual override"
      );
      return;
    }

    const newMode = isMobile ? "grid" : "list";
    console.log(`[PlayGrid] Auto-switching view mode based on screen size:`, {
      isMobile,
      newMode,
      previousMode: viewMode,
    });
    
    // Only update if different to avoid unnecessary re-renders
    if (newMode !== viewMode) {
      setViewMode(newMode, false);
    }
  }, [isMobile, hasManualViewModeOverride, viewMode, setViewMode]);

  return {
    viewMode,
    setViewMode,
    hasManualViewModeOverride,
  };
}
