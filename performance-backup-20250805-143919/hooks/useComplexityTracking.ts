/**
 * Complexity Tracking Hook
 *
 * Manages complexity achievement tracking and personal records
 */

import React from "react";
import { analyzePlayComplexity } from "../utils/playComplexity";
import type { Play } from "../types/play";

/**
 * Hook for tracking complexity achievements
 */
export function useComplexityTracking() {
  const [bestScore, setBestScore] = React.useState(0);
  const [recentAchievements, setRecentAchievements] = React.useState<string[]>(
    []
  );

  const trackComplexity = React.useCallback(
    (play: Play) => {
      const metrics = analyzePlayComplexity(play);

      // Check for new personal record
      if (metrics.totalScore > bestScore) {
        setBestScore(metrics.totalScore);

        // Check for milestone achievements
        const milestones = [
          { score: 26, message: "First Intermediate Play! 🎯" },
          { score: 51, message: "Advanced Strategist! ⚡" },
          { score: 76, message: "Expert Play Designer! 👑" },
          { score: 91, message: "Innovative Genius! 💎" },
        ];

        milestones.forEach((milestone) => {
          if (
            metrics.totalScore >= milestone.score &&
            bestScore < milestone.score
          ) {
            setRecentAchievements((prev) => [...prev, milestone.message]);
          }
        });
      }

      return metrics;
    },
    [bestScore]
  );

  const clearAchievements = React.useCallback(() => {
    setRecentAchievements([]);
  }, []);

  return {
    bestScore,
    recentAchievements,
    trackComplexity,
    clearAchievements,
  };
}
