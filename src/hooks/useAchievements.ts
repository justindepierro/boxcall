import { useEffect, useState } from "react";
import {
  AchievementService,
  type AchievementData,
} from "../services/achievementService";

/**
 * Hook for managing user achievements
 */
export const useAchievements = (userId: string | undefined) => {
  const [achievements, setAchievements] = useState<AchievementData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const data = await AchievementService.getUserAchievements(userId);

        if (!isCancelled) {
          setAchievements(data);
          setError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load achievements"
          );
          setAchievements(null);
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
  }, [userId]);

  return {
    achievements,
    helmetStickers: achievements?.helmetStickers || [],
    boxcallMedals: achievements?.boxcallMedals || [],
    weeklyStreak: achievements?.weeklyStreak || 0,
    totalPoints: achievements?.totalPoints || 0,
    recentAchievements: achievements?.recentAchievements || [],
    loading,
    error,
  };
};
