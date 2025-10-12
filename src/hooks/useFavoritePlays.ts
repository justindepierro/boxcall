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
      setFavoriteIds((prev) => {
        // Ensure prev is always an array (handles corrupted localStorage data)
        const prevArray = Array.isArray(prev) ? prev : [];
        if (prevArray.includes(playId)) {
          // Remove from favorites
          return prevArray.filter((id) => id !== playId);
        }
        // Add to favorites
        return [...prevArray, playId];
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
