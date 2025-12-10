// @ts-nocheck - Type mismatches with Supabase generated types
/**
 * Situational Recommender Service
 * Phase 13.1: "What should I call right now?" engine
 * Phase 13.2: Added coverage-based recommendations
 *
 * Analyzes current game situation and recommends best plays based on:
 * - Confidence scores (from Phase 11)
 * - Situational match (down, distance, field zone)
 * - Historical success in similar situations
 * - Practice-to-game transfer rates
 * - Current momentum (streaks)
 * - Coverage-specific success rates (Phase 13.2)
 */

import { PlayConfidenceService } from "./playConfidenceService";
import { ExecutionTrackingService } from "./executionTrackingService";
import type { GameSituation } from "../types/session";
import type { Play } from "../types/database";
import { logError } from "../utils/logger";

// ==============================================
// TYPES
// ==============================================

export interface PlayRecommendation {
  play: Play;
  overallScore: number; // 0-100 (weighted: 70% confidence, 30% situation match)
  confidenceScore: number; // 0-100 (from PlayConfidenceService)
  situationMatchScore: number; // 0-100 (how well it fits current situation)
  reasoning: string[]; // Human-readable reasons for recommendation
  stats?: {
    successRate: number;
    avgYardsGained: number;
    executionCount: number;
  };
  coverageStats?: {
    // Phase 13.2: Coverage-specific performance
    successRate: number;
    avgYardsGained: number;
    executionCount: number;
    coverage: string; // e.g., "Cover 2"
  };
  hashStats?: {
    // Phase 13.3: Hash preference analysis
    left: {
      successRate: number;
      avgYardsGained: number;
      executionCount: number;
    };
    middle: {
      successRate: number;
      avgYardsGained: number;
      executionCount: number;
    };
    right: {
      successRate: number;
      avgYardsGained: number;
      executionCount: number;
    };
    bestHash?: "left" | "middle" | "right";
    currentHash?: "left" | "middle" | "right";
  };
}

export interface RecommendationOptions {
  maxResults?: number; // Default: 5
  minConfidence?: number; // Filter out low-confidence plays (default: 40)
  includeStats?: boolean; // Include detailed stats (default: true)
}

// ==============================================
// SITUATIONAL RECOMMENDER
// ==============================================

export class SituationalRecommender {
  /**
   * Get top play recommendations for current situation
   */
  static async getRecommendations(
    plays: Play[],
    teamId: string,
    situation: GameSituation,
    options: RecommendationOptions = {}
  ): Promise<PlayRecommendation[]> {
    const { maxResults = 5, minConfidence = 40, includeStats = true } = options;

    // Calculate confidence scores for all plays
    const confidenceMap = await PlayConfidenceService.getBatchConfidence(
      plays.map((p) => p.id),
      teamId,
      situation
    );

    // Build recommendations
    const recommendations: PlayRecommendation[] = [];

    for (const play of plays) {
      const confidence = confidenceMap.get(play.id);
      if (!confidence || confidence.overallScore < minConfidence) {
        continue; // Skip low-confidence plays
      }

      // Calculate situation match score
      const situationMatchScore = await this.calculateSituationMatch(
        play,
        situation,
        confidence,
        teamId
      );

      // Calculate overall score (70% confidence, 30% situation match)
      const overallScore = Math.round(
        confidence.overallScore * 0.7 + situationMatchScore * 0.3
      );

      // Build reasoning
      const reasoning = await this.buildReasoning(
        play,
        situation,
        confidence,
        situationMatchScore,
        teamId
      );

      // Optional: Include stats
      const stats = includeStats
        ? await this.getPlayStats(play.id, teamId, situation)
        : undefined;

      // Phase 13.2: Get coverage-specific stats if opponent coverage is known
      const coverageStats =
        includeStats &&
        situation.opponentCoverage &&
        situation.opponentCoverage !== "Unknown"
          ? await this.getCoverageStats(
              play.id,
              teamId,
              situation.opponentCoverage
            )
          : undefined;

      // Phase 13.3: Get hash preference stats
      const hashStatsData = includeStats
        ? await this.getHashStats(play.id, teamId)
        : undefined;

      const hashStats = hashStatsData
        ? {
            ...hashStatsData,
            currentHash: situation.hashMark,
          }
        : undefined;

      recommendations.push({
        play,
        overallScore,
        confidenceScore: confidence.overallScore,
        situationMatchScore,
        reasoning,
        stats,
        coverageStats,
        hashStats,
      });
    }

    // Sort by overall score (descending)
    recommendations.sort((a, b) => b.overallScore - a.overallScore);

    return recommendations.slice(0, maxResults);
  }

  /**
   * Calculate how well a play matches the current situation
   * Returns 0-100 score
   */
  private static async calculateSituationMatch(
    play: Play,
    situation: GameSituation,
    confidence: any,
    teamId: string
  ): Promise<number> {
    let score = 50; // Baseline

    // Down-specific bonuses
    if (situation.down === 1) {
      // 1st down: Favor runs and high-percentage passes
      if (play.play_type === "run") score += 10;
      if (play.play_type === "pass" && play.concept?.includes("quick"))
        score += 5;
    } else if (situation.down === 2) {
      // 2nd down: Balanced
      score += 5;
    } else if (situation.down === 3) {
      // 3rd down: Favor plays that gain required yards
      if (play.play_type === "pass") score += 15;
      if (situation.distance <= 3 && play.concept?.includes("quick"))
        score += 10;
    } else if (situation.down === 4) {
      // 4th down: High confidence plays only
      score -= 20; // Start lower, add back based on confidence
      if (confidence.overallScore >= 80) score += 30;
    }

    // Distance-specific bonuses
    if (situation.distance <= 3) {
      // Short yardage
      if (play.play_type === "run") score += 10;
      if (
        play.formation?.includes("I-Form") ||
        play.formation?.includes("Heavy")
      ) {
        score += 5;
      }
    } else if (situation.distance <= 7) {
      // Medium yardage
      if (play.concept?.includes("stick") || play.concept?.includes("mesh")) {
        score += 10;
      }
    } else {
      // Long yardage (8+)
      if (play.play_type === "pass") score += 15;
      if (
        play.concept?.includes("vertical") ||
        play.concept?.includes("deep")
      ) {
        score += 10;
      }
    }

    // Field zone bonuses
    if (situation.yardLine <= 20) {
      // Red zone
      if (play.concept?.includes("fade") || play.concept?.includes("corner")) {
        score += 15;
      }
      if (play.play_type === "run" && situation.distance <= 3) score += 10;
    } else if (situation.yardLine <= 50) {
      // Own territory - conservative
      if (play.play_type === "run") score += 5;
      if (confidence.overallScore >= 75) score += 5;
    } else {
      // Opponent territory - aggressive OK
      if (play.play_type === "pass") score += 5;
    }

    // Streak bonus/penalty (Phase 12.3)
    if (confidence.streak?.isHot) {
      score += 15; // Hot streak - ride the momentum!
    } else if (confidence.streak?.isCold) {
      score -= 10; // Cold streak - be cautious
    }

    // Practice-to-game bonus (Phase 12.4)
    if (confidence.practiceToGame?.needsMorePractice) {
      score -= 15; // Not ready for prime time
    } else if (
      confidence.practiceToGame &&
      confidence.practiceToGame.transferRate >= 10
    ) {
      score += 10; // Proven in games
    }

    // Phase 13.2: Coverage-based bonus
    if (
      situation.opponentCoverage &&
      situation.opponentCoverage !== "Unknown"
    ) {
      const coverageStats = await this.getCoverageStats(
        play.id,
        teamId,
        situation.opponentCoverage
      );

      if (coverageStats && coverageStats.executionCount >= 3) {
        // Only use coverage data if we have enough samples (3+)
        if (coverageStats.successRate >= 90) {
          score += 25; // Huge bonus for proven plays vs this coverage
        } else if (coverageStats.successRate >= 75) {
          score += 15; // Good success vs this coverage
        } else if (coverageStats.successRate >= 60) {
          score += 5; // Decent success
        } else if (coverageStats.successRate < 40) {
          score -= 15; // This play struggles vs this coverage
        }
      }
    }

    // Phase 13.3: Hash preference bonus
    const hashStats = await this.getHashStats(play.id, teamId);
    if (hashStats && hashStats.bestHash) {
      const currentHashStats = hashStats[situation.hashMark];
      const bestHashStats = hashStats[hashStats.bestHash];

      // Bonus if we're on the best hash and have good data
      if (
        situation.hashMark === hashStats.bestHash &&
        bestHashStats.executionCount >= 3 &&
        bestHashStats.successRate >= 70
      ) {
        score += 10; // Good bonus for being on preferred hash
      }
      // Penalty if we're NOT on best hash and there's a significant difference
      else if (
        situation.hashMark !== hashStats.bestHash &&
        currentHashStats.executionCount >= 3 &&
        bestHashStats.executionCount >= 3 &&
        bestHashStats.successRate - currentHashStats.successRate >= 20
      ) {
        score -= 10; // Play works much better from different hash
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Build human-readable reasoning for recommendation
   */
  private static async buildReasoning(
    play: Play,
    situation: GameSituation,
    confidence: any,
    matchScore: number,
    teamId: string
  ): Promise<string[]> {
    const reasons: string[] = [];

    // Confidence-based reasoning
    if (confidence.overallScore >= 80) {
      reasons.push("High AI confidence (80%+)");
    } else if (confidence.overallScore >= 60) {
      reasons.push("Good AI confidence");
    }

    // Situation fit
    if (matchScore >= 80) {
      reasons.push("Perfect fit for this situation");
    } else if (matchScore >= 60) {
      reasons.push("Good match for down/distance");
    }

    // Down-specific
    if (situation.down === 3 && situation.distance <= 3) {
      if (play.play_type === "run") {
        reasons.push("Strong 3rd & short conversion play");
      } else if (play.concept?.includes("quick")) {
        reasons.push("Quick-hitting 3rd down concept");
      }
    } else if (situation.down === 3 && situation.distance >= 8) {
      if (play.play_type === "pass") {
        reasons.push("Designed for 3rd & long");
      }
    }

    // Field zone specific
    if (situation.yardLine <= 20 && situation.yardLine >= 5) {
      reasons.push("Red zone tested");
    } else if (situation.yardLine <= 5) {
      reasons.push("Goal line package");
    }

    // Streak momentum
    if (confidence.streak?.isHot) {
      reasons.push(`🔥 Hot streak (${confidence.streak.current} in a row)`);
    }

    // Practice-to-game
    if (
      confidence.practiceToGame &&
      confidence.practiceToGame.transferRate >= 10
    ) {
      reasons.push("Proven in game situations");
    } else if (confidence.practiceToGame?.needsMorePractice) {
      reasons.push("⚠️ Needs more practice");
    }

    // Execution count
    if (confidence.executionCount >= 20) {
      reasons.push("Well-practiced play");
    } else if (confidence.executionCount < 5) {
      reasons.push("Limited execution history");
    }

    // Phase 13.2: Coverage-specific reasoning
    if (
      situation.opponentCoverage &&
      situation.opponentCoverage !== "Unknown"
    ) {
      const coverageStats = await this.getCoverageStats(
        play.id,
        teamId,
        situation.opponentCoverage
      );

      if (coverageStats && coverageStats.executionCount >= 3) {
        if (coverageStats.successRate >= 90) {
          reasons.push(
            `🎯 Excellent vs ${situation.opponentCoverage} (${coverageStats.successRate.toFixed(0)}%, ${coverageStats.executionCount} plays)`
          );
        } else if (coverageStats.successRate >= 75) {
          reasons.push(
            `✓ Proven vs ${situation.opponentCoverage} (${coverageStats.successRate.toFixed(0)}%)`
          );
        } else if (coverageStats.successRate < 40) {
          reasons.push(
            `⚠️ Struggles vs ${situation.opponentCoverage} (${coverageStats.successRate.toFixed(0)}%)`
          );
        }
      } else if (coverageStats && coverageStats.executionCount > 0) {
        reasons.push(
          `Limited data vs ${situation.opponentCoverage} (${coverageStats.executionCount} plays)`
        );
      }
    }

    // Phase 13.3: Hash preference reasoning
    const hashStats = await this.getHashStats(play.id, teamId);
    if (hashStats && hashStats.bestHash) {
      const currentHashStats = hashStats[situation.hashMark];
      const bestHashStats = hashStats[hashStats.bestHash];

      // On the best hash
      if (
        situation.hashMark === hashStats.bestHash &&
        bestHashStats.executionCount >= 3 &&
        bestHashStats.successRate >= 75
      ) {
        reasons.push(
          `📍 Best from ${hashStats.bestHash} hash (${bestHashStats.successRate.toFixed(0)}%)`
        );
      }
      // Not on best hash, show difference
      else if (
        hashStats.bestHash &&
        currentHashStats.executionCount >= 3 &&
        bestHashStats.executionCount >= 3
      ) {
        const diff = bestHashStats.successRate - currentHashStats.successRate;
        if (diff >= 20) {
          reasons.push(
            `⚠️ Better from ${hashStats.bestHash} hash (${bestHashStats.successRate.toFixed(0)}% vs ${currentHashStats.successRate.toFixed(0)}% here)`
          );
        }
      }
    }

    return reasons;
  }

  /**
   * Get play statistics for the situation
   */
  private static async getPlayStats(
    playId: string,
    teamId: string,
    _situation: GameSituation
  ): Promise<{
    successRate: number;
    avgYardsGained: number;
    executionCount: number;
  }> {
    try {
      const stats = await ExecutionTrackingService.getPlayStats(playId, teamId);
      return {
        successRate: stats.successRate,
        avgYardsGained: stats.avgYardsGained,
        executionCount: stats.executionCount,
      };
    } catch (error) {
      logError("Error fetching play stats:", error);
      return {
        successRate: 0,
        avgYardsGained: 0,
        executionCount: 0,
      };
    }
  }

  /**
   * Phase 13.2: Get coverage-specific statistics
   */
  private static async getCoverageStats(
    playId: string,
    teamId: string,
    coverage: string
  ): Promise<{
    successRate: number;
    avgYardsGained: number;
    executionCount: number;
    coverage: string;
  } | null> {
    try {
      const stats = await ExecutionTrackingService.getCoverageStats(
        playId,
        teamId,
        coverage
      );

      // Only return if we have meaningful data
      if (stats.executionCount === 0) {
        return null;
      }

      return {
        successRate: stats.successRate,
        avgYardsGained: stats.avgYardsGained,
        executionCount: stats.executionCount,
        coverage,
      };
    } catch (error) {
      logError("Error fetching coverage stats:", error);
      return null;
    }
  }

  /**
   * Phase 13.3: Get hash-specific statistics
   */
  private static async getHashStats(
    playId: string,
    teamId: string
  ): Promise<{
    left: {
      successRate: number;
      avgYardsGained: number;
      executionCount: number;
    };
    middle: {
      successRate: number;
      avgYardsGained: number;
      executionCount: number;
    };
    right: {
      successRate: number;
      avgYardsGained: number;
      executionCount: number;
    };
    bestHash?: "left" | "middle" | "right";
  } | null> {
    try {
      const stats = await ExecutionTrackingService.getHashStats(playId, teamId);

      // Only return if we have some hash data
      const totalExecutions =
        stats.left.executionCount +
        stats.middle.executionCount +
        stats.right.executionCount;
      if (totalExecutions === 0) {
        return null;
      }

      return stats;
    } catch (error) {
      logError("Error fetching hash stats:", error);
      return null;
    }
  }
}
