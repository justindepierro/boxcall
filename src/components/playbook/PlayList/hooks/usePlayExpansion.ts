/**
 * usePlayExpansion Hook
 * Manages which play card is currently expanded (only one at a time)
 */

import { useState, useCallback, useEffect } from "react";
import { debug } from "../../../../utils/logger";

export function usePlayExpansion(viewMode: "list" | "grid") {
  const [expandedPlayId, setExpandedPlayId] = useState<string | null>(null);

  // Log when expanded play changes (dev tracking)
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    debug(`[PlayList] expandedPlayId changed:`, {
      expandedPlayId,
      viewMode,
    });
  }, [expandedPlayId, viewMode]);

  const handleToggleExpand = useCallback(
    (playId: string) => {
      debug(`[PlayList] handleToggleExpand called:`, {
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
