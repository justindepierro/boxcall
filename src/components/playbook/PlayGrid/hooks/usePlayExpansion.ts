/**
 * usePlayExpansion Hook
 * Manages which play card is currently expanded (only one at a time)
 */

import { useState, useCallback, useEffect } from "react";

export function usePlayExpansion(viewMode: "list" | "grid") {
  const [expandedPlayId, setExpandedPlayId] = useState<string | null>(null);

  // Log when expanded play changes (dev tracking)
  useEffect(() => {
    console.log(`[PlayGrid] expandedPlayId changed:`, {
      expandedPlayId,
      viewMode,
      timestamp: new Date().toISOString(),
    });
  }, [expandedPlayId, viewMode]);

  const handleToggleExpand = useCallback(
    (playId: string) => {
      console.log(`[PlayGrid] handleToggleExpand called:`, {
        playId,
        currentExpandedId: expandedPlayId,
        willExpand: expandedPlayId !== playId,
        currentViewMode: viewMode,
      });
      setExpandedPlayId((current) => (current === playId ? null : playId));
    },
    [expandedPlayId, viewMode]
  );

  return {
    expandedPlayId,
    setExpandedPlayId,
    handleToggleExpand,
  };
}
