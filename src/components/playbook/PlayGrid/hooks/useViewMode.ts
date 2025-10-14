/**
 * useViewMode Hook
 * Manages view mode (list/grid) with media query auto-detection
 */

import { useCallback, useEffect } from "react";
import { usePreference } from "../../../../hooks/usePreferences";

export function useViewMode() {
  const [hasManualViewModeOverride, setHasManualViewModeOverride] =
    usePreference("bc_playgrid_view_manual", false);

  const [viewMode, setViewModeState] = usePreference(
    "bc_playgrid_view",
    "list" as "list" | "grid"
  );

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
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hasManualViewModeOverride) {
      console.log(
        "[PlayGrid] Skipping auto view mode - user has manual override"
      );
      return;
    }
    if (typeof window.matchMedia !== "function") return;

    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const applyPreferredView = (matches: boolean) => {
      const newMode = matches ? "grid" : "list";
      console.log(`[PlayGrid] Auto-switching view mode based on screen size:`, {
        matches,
        newMode,
        screenWidth: window.innerWidth,
      });
      setViewMode(newMode, false);
    };

    applyPreferredView(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      console.log("[PlayGrid] Media query changed:", event.matches);
      applyPreferredView(event.matches);
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
    } else if (typeof mediaQuery.addListener === "function") {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", handleChange);
      } else if (typeof mediaQuery.removeListener === "function") {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [hasManualViewModeOverride, setViewMode]);

  return {
    viewMode,
    setViewMode,
    hasManualViewModeOverride,
  };
}
