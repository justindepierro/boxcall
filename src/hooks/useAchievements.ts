import { useState, useEffect } from "react";
import {
  AchievementService,
  type AchievementData,
} from "../services/achievementService";
import { useDevMode } from "../app/dev-mode-hooks";
/**
 * Hook for managing user achievements
 */
export function useAchievements(userId?: string) {
  const [achievements, setAchievements] = useState<AchievementData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { devMode } = useDevMode();

  useEffect(() => {
    let isCancelled = false;

    const fetchAchievements = async () => {
      if (!userId) {
        setAchievements(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await AchievementService.getUserAchievements(
          userId,
          devMode
        );
        if (!isCancelled) {
          setAchievements(data);
          setError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load achievements"
          );
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchAchievements();

    return () => {
      isCancelled = true;
    };
  }, [userId, devMode]);

  return { achievements, loading, error };
}
