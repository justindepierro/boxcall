import { useCallback } from "react";
import { usePreference } from "./usePreferences";

/**
 * Hook for managing favorite/starred plays
 * Maintains a list of favorited play IDs
 */
export function useFavoritePlays() {
  const [favoriteIds, setFavoriteIds] = usePreference("bc_favorite_plays", []);

  /**
   * Toggle a play's favorite status
   */
  const toggleFavorite = useCallback(
    (playId: string) => {
      setFavoriteIds((prev = []) => {
        if (prev.includes(playId)) {
          // Remove from favorites
          return prev.filter((id) => id !== playId);
        }
        // Add to favorites
        return [...prev, playId];
      });
    },
    [setFavoriteIds]
  );

  /**
   * Check if a play is favorited
   */
  const isFavorite = useCallback(
    (playId: string) => {
      return (favoriteIds || []).includes(playId);
    },
    [favoriteIds]
  );

  /**
   * Clear all favorites
   */
  const clearFavorites = useCallback(() => {
    setFavoriteIds([]);
  }, [setFavoriteIds]);

  return {
    favoriteIds: favoriteIds || [],
    toggleFavorite,
    isFavorite,
    clearFavorites,
  };
}
