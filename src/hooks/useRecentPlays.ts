import { useCallback } from "react";
import { usePreference } from "./usePreferences";

/**
 * Hook for tracking and retrieving recently viewed plays
 * Maintains a list of the last 10 viewed play IDs
 */
export function useRecentPlays() {
  const [recentPlayIds, setRecentPlayIds] = usePreference(
    "bc_recently_viewed_plays",
    []
  );

  /**
   * Track that a play was viewed
   * Moves play to front of list, removes duplicates, keeps max 10
   */
  const trackPlayView = useCallback(
    (playId: string) => {
      setRecentPlayIds((prev = []) => {
        // Remove if already in list
        const filtered = prev.filter((id) => id !== playId);
        // Add to front, keep max 10
        return [playId, ...filtered].slice(0, 10);
      });
    },
    [setRecentPlayIds]
  );

  /**
   * Clear all recent plays
   */
  const clearRecentPlays = useCallback(() => {
    setRecentPlayIds([]);
  }, [setRecentPlayIds]);

  return {
    recentPlayIds: recentPlayIds || [],
    trackPlayView,
    clearRecentPlays,
  };
}
