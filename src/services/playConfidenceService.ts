// @ts-nocheck - Type mismatches with Supabase generated types
/**
 * PlayConfidenceService
 * Phase 11 Intelligence System - AI Confidence Scoring Engine
 * Phase 12.1: Added quick stats (success rate, avg yards, execution count)
 * Phase 12.2: Added detailed confidence breakdowns
 *
 * Calculates dynamic confidence scores (0-100) for plays based on:
 * - Game success rate (40%)
 * - Situational fit (20%)
 * - Recent performance (15%)
 * - Practice-to-game transfer (15%)
 * - Practice execution quality (10%)
 */

import { supabase } from "../lib/supabase";
import type { GameSituation, ExecutionResult } from "../types/session";

// ==============================================
// TYPES
// ==============================================

export interface ConfidenceScore {
  playId: string;
  overallScore: number; // 0-100
  breakdown: {
    historicalSuccess: number; // 0-100
    situationalSuccess: number; // 0-100
    recentTrend: number; // 0-100
    practiceQuality: number; // 0-100
  };
  executionCount: number; // Total times executed
  lastExecutedAt?: Date;
  recommendation: "high" | "medium" | "low"; // Based on overall score
  // Phase 12.3: Streak tracking
  streak?: {
    current: number; // Positive = success streak, negative = failure streak
    isHot: boolean; // 3+ consecutive successes
    isCold: boolean; // 3+ consecutive failures
    last5Results: ExecutionResult[]; // Most recent 5 results
  };
  // Phase 12.4: Practice-to-game analytics
  practiceToGame?: {
    practiceStats: {
      executions: number;
      successRate: number; // 0-100
    };
    gameStats: {
      executions: number;
      successRate: number; // 0-100
    };
    transferRate: number; // How well practice translates to games (-100 to +100)
    needsMorePractice: boolean; // True if insufficient practice or poor transfer
  };
}

export interface SituationFilter {
  down?: number; // 1-4
  distanceCategory?: "short" | "medium" | "long"; // short: 1-3, medium: 4-7, long: 8+
  fieldZone?: "own" | "midfield" | "red-zone" | "goal-line"; // own: 0-49, midfield: 50-79, red: 80-94, goal: 95-100
}

interface ExecutionRecord {
  id: string;
  play_id: string;
  result: ExecutionResult;
  yards_gained?: number;
  executed_at: string;
  // Game context (if from game session)
  down?: number;
  distance?: number;
  yard_line?: number;
  // Practice context
  rep_number?: number;
}

// ==============================================
// CONFIDENCE CALCULATION
// ==============================================

export class PlayConfidenceService {
  /**
   * Calculate confidence score for a specific play
   */
  static async getPlayConfidence(
    playId: string,
    teamId: string,
    situation?: GameSituation
  ): Promise<ConfidenceScore> {
    // Fetch all executions for this play
    const executions = await this.getPlayExecutions(playId, teamId);

    if (executions.length === 0) {
      // No execution history - return baseline score
      return this.getBaselineScore(playId);
    }

    // Calculate each component
    const historicalSuccess = this.calculateHistoricalSuccess(executions);
    const situationalSuccess = situation
      ? this.calculateSituationalSuccess(executions, situation)
      : historicalSuccess; // Fall back to overall if no situation
    const recentTrend = this.calculateRecentTrend(executions);
    const practiceQuality = await this.calculatePracticeQuality(playId, teamId);

    // Weighted average
    const overallScore = Math.round(
      historicalSuccess * 0.4 +
        situationalSuccess * 0.3 +
        recentTrend * 0.2 +
        practiceQuality * 0.1
    );

    // Phase 12.3: Calculate streak
    const streak = this.calculateStreak(executions);

    // Phase 12.4: Calculate practice-to-game analytics
    const practiceToGame = this.calculatePracticeToGame(executions);

    return {
      playId,
      overallScore: Math.max(0, Math.min(100, overallScore)), // Clamp 0-100
      breakdown: {
        historicalSuccess,
        situationalSuccess,
        recentTrend,
        practiceQuality,
      },
      executionCount: executions.length,
      lastExecutedAt: executions[0]
        ? new Date(executions[0].executed_at)
        : undefined,
      recommendation: this.getRecommendation(overallScore),
      streak, // Phase 12.3
      practiceToGame, // Phase 12.4
    };
  }

  /**
   * Calculate confidence for multiple plays (batch operation)
   */
  static async getBatchConfidence(
    playIds: string[],
    teamId: string,
    situation?: GameSituation
  ): Promise<Map<string, ConfidenceScore>> {
    const results = new Map<string, ConfidenceScore>();

    // Process in parallel
    const scores = await Promise.all(
      playIds.map((playId) => this.getPlayConfidence(playId, teamId, situation))
    );

    scores.forEach((score) => {
      results.set(score.playId, score);
    });

    return results;
  }

  /**
   * Get top N recommended plays for a situation
   */
  static async getTopPlays(
    playIds: string[],
    teamId: string,
    situation: GameSituation,
    limit: number = 5
  ): Promise<ConfidenceScore[]> {
    const scores = await this.getBatchConfidence(playIds, teamId, situation);

    return Array.from(scores.values())
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, limit);
  }

  // ==============================================
  // COMPONENT CALCULATIONS
  // ==============================================

  /**
   * Historical success rate (all time)
   * Weight: 40%
   */
  private static calculateHistoricalSuccess(
    executions: ExecutionRecord[]
  ): number {
    if (executions.length === 0) return 50; // Neutral baseline

    const successCount = executions.filter(
      (e) => e.result === "success"
    ).length;
    const totalCount = executions.filter((e) => e.result !== "skipped").length;

    if (totalCount === 0) return 50;

    const successRate = (successCount / totalCount) * 100;

    // Apply confidence based on sample size
    const sampleSizeConfidence = this.getSampleSizeMultiplier(totalCount);

    return Math.round(successRate * sampleSizeConfidence);
  }

  /**
   * Situational success rate (specific game situation)
   * Weight: 30%
   */
  private static calculateSituationalSuccess(
    executions: ExecutionRecord[],
    situation: GameSituation
  ): number {
    // Filter executions that match the situation
    const situationalExecutions = executions.filter((e) => {
      // Match down
      if (e.down && e.down !== situation.down) return false;

      // Match distance category
      if (e.distance) {
        const executionCategory = this.getDistanceCategory(e.distance);
        const situationCategory = this.getDistanceCategory(situation.distance);
        if (executionCategory !== situationCategory) return false;
      }

      // Match field zone
      if (e.yard_line) {
        const executionZone = this.getFieldZone(e.yard_line);
        const situationZone = this.getFieldZone(situation.yardLine);
        if (executionZone !== situationZone) return false;
      }

      return true;
    });

    if (situationalExecutions.length === 0) {
      // No situational data - return slightly reduced historical score
      return this.calculateHistoricalSuccess(executions) * 0.8;
    }

    // Calculate success rate for this specific situation
    const successCount = situationalExecutions.filter(
      (e) => e.result === "success"
    ).length;
    const totalCount = situationalExecutions.filter(
      (e) => e.result !== "skipped"
    ).length;

    if (totalCount === 0) return 50;

    const successRate = (successCount / totalCount) * 100;

    // Apply confidence based on situational sample size
    const sampleSizeConfidence = this.getSampleSizeMultiplier(totalCount);

    return Math.round(successRate * sampleSizeConfidence);
  }

  /**
   * Recent performance trend (last 10-20 executions)
   * Weight: 20%
   */
  private static calculateRecentTrend(executions: ExecutionRecord[]): number {
    // Get last 20 executions (or all if less)
    const recentExecutions = executions.slice(
      0,
      Math.min(20, executions.length)
    );

    if (recentExecutions.length === 0) return 50;

    // Calculate weighted moving average (more recent = higher weight)
    let weightedSum = 0;
    let weightSum = 0;

    recentExecutions.forEach((execution, index) => {
      const weight = recentExecutions.length - index; // Most recent has highest weight
      const score = this.getExecutionScore(execution);

      weightedSum += score * weight;
      weightSum += weight;
    });

    const weightedAverage = weightSum > 0 ? weightedSum / weightSum : 50;

    // Compare recent trend to overall historical
    const recentSuccess =
      (recentExecutions.filter((e) => e.result === "success").length /
        recentExecutions.filter((e) => e.result !== "skipped").length) *
      100;

    const overallSuccess = this.calculateHistoricalSuccess(executions);

    // Boost score if trending up, reduce if trending down
    const trendAdjustment = (recentSuccess - overallSuccess) * 0.2;

    return Math.round(
      Math.max(0, Math.min(100, weightedAverage + trendAdjustment))
    );
  }

  /**
   * Calculate current streak (Phase 12.3)
   * Analyzes consecutive successes/failures
   */
  private static calculateStreak(executions: ExecutionRecord[]): {
    current: number;
    isHot: boolean;
    isCold: boolean;
    last5Results: ExecutionResult[];
  } {
    if (executions.length === 0) {
      return {
        current: 0,
        isHot: false,
        isCold: false,
        last5Results: [],
      };
    }

    // Get last 5 results (excluding skipped)
    const last5 = executions
      .filter((e) => e.result !== "skipped")
      .slice(0, 5)
      .map((e) => e.result);

    // Calculate current streak (consecutive same results)
    let current = 0;
    const firstResult = executions[0]?.result;

    if (firstResult === "skipped") {
      // Skip to next non-skipped result
      const nonSkipped = executions.find((e) => e.result !== "skipped");
      if (!nonSkipped) {
        return {
          current: 0,
          isHot: false,
          isCold: false,
          last5Results: last5,
        };
      }
    }

    // Count consecutive successes or failures
    for (const execution of executions) {
      if (execution.result === "skipped") continue;

      if (execution.result === firstResult) {
        if (firstResult === "success") {
          current++;
        } else if (firstResult === "failure") {
          current--;
        } else {
          break; // Neutral breaks streak
        }
      } else {
        break; // Different result breaks streak
      }
    }

    return {
      current,
      isHot: current >= 3, // 3+ consecutive successes
      isCold: current <= -3, // 3+ consecutive failures
      last5Results: last5,
    };
  }

  /**
   * Phase 12.4: Calculate practice-to-game analytics
   * Compares practice success rate vs game success rate
   *
   * Transfer rate calculation:
   * - Positive: Game performance better than practice
   * - Zero: Same performance
   * - Negative: Game performance worse than practice
   */
  private static calculatePracticeToGame(executions: ExecutionRecord[]): {
    practiceStats: { executions: number; successRate: number };
    gameStats: { executions: number; successRate: number };
    transferRate: number;
    needsMorePractice: boolean;
  } {
    // Separate practice and game executions
    // Practice executions have rep_number, game executions have down/distance
    const practiceExecs = executions.filter((e) => e.rep_number !== undefined);
    const gameExecs = executions.filter(
      (e) => e.down !== undefined || e.distance !== undefined
    );

    // Calculate practice success rate
    const practiceSuccesses = practiceExecs.filter(
      (e) => e.result === "success"
    ).length;
    const practiceSuccessRate =
      practiceExecs.length > 0
        ? Math.round((practiceSuccesses / practiceExecs.length) * 100)
        : 0;

    // Calculate game success rate
    const gameSuccesses = gameExecs.filter(
      (e) => e.result === "success"
    ).length;
    const gameSuccessRate =
      gameExecs.length > 0
        ? Math.round((gameSuccesses / gameExecs.length) * 100)
        : 0;

    // Calculate transfer rate (how well practice translates to games)
    // Range: -100 to +100
    // Positive = games better than practice, Negative = games worse
    const transferRate =
      practiceExecs.length > 0 && gameExecs.length > 0
        ? gameSuccessRate - practiceSuccessRate
        : 0;

    // Flag if needs more practice:
    // 1. Less than 10 practice reps
    // 2. Transfer rate significantly negative (< -20)
    // 3. Game success rate below 50% but practice above 70% (not translating)
    const needsMorePractice =
      practiceExecs.length < 10 ||
      transferRate < -20 ||
      (gameSuccessRate < 50 && practiceSuccessRate > 70);

    return {
      practiceStats: {
        executions: practiceExecs.length,
        successRate: practiceSuccessRate,
      },
      gameStats: {
        executions: gameExecs.length,
        successRate: gameSuccessRate,
      },
      transferRate,
      needsMorePractice,
    };
  }

  /**
   * Practice execution quality (practice reps performance)
   * Weight: 10%
```
   */
  private static async calculatePracticeQuality(
    playId: string,
    _teamId: string
  ): Promise<number> {
    // Get practice session executions only
    const { data: practiceExecutions, error } = await supabase
      .from("play_executions")
      .select("result, rep_number")
      .eq("play_id", playId)
      .not("practice_session_id", "is", null)
      .order("executed_at", { ascending: false })
      .limit(50); // Last 50 practice reps

    if (error || !practiceExecutions || practiceExecutions.length === 0) {
      return 50; // Neutral if no practice data
    }

    // Calculate practice success rate
    const successCount = practiceExecutions.filter(
      (e) => e.result === "success"
    ).length;
    const totalCount = practiceExecutions.filter(
      (e) => e.result !== "skipped"
    ).length;

    if (totalCount === 0) return 50;

    const practiceSuccessRate = (successCount / totalCount) * 100;

    // Boost if practiced recently (last 7 days)
    const recentPracticeBonus = practiceExecutions.length >= 10 ? 10 : 0;

    return Math.round(Math.min(100, practiceSuccessRate + recentPracticeBonus));
  }

  // ==============================================
  // HELPER FUNCTIONS
  // ==============================================

  /**
   * Get all executions for a play
   */
  private static async getPlayExecutions(
    playId: string,
    teamId: string
  ): Promise<ExecutionRecord[]> {
    const { data, error } = await supabase
      .from("play_executions")
      .select("*")
      .eq("play_id", playId)
      .eq("team_id", teamId)
      .order("executed_at", { ascending: false })
      .limit(100); // Last 100 executions

    if (error) {
      console.error("Error fetching play executions:", error);
      return [];
    }

    return data || [];
  }

  /**
   * Baseline score for plays with no execution history
   */
  private static getBaselineScore(playId: string): ConfidenceScore {
    return {
      playId,
      overallScore: 50, // Neutral baseline
      breakdown: {
        historicalSuccess: 50,
        situationalSuccess: 50,
        recentTrend: 50,
        practiceQuality: 50,
      },
      executionCount: 0,
      recommendation: "medium",
      streak: {
        current: 0,
        isHot: false,
        isCold: false,
        last5Results: [],
      },
    };
  }

  /**
   * Convert execution to numeric score (0-100)
   */
  private static getExecutionScore(execution: ExecutionRecord): number {
    switch (execution.result) {
      case "success":
        return 100;
      case "neutral":
        return 50;
      case "failure":
        return 0;
      case "skipped":
        return 50; // Don't count skipped
      default:
        return 50;
    }
  }

  /**
   * Sample size confidence multiplier
   * More executions = higher confidence in the score
   */
  private static getSampleSizeMultiplier(sampleSize: number): number {
    if (sampleSize >= 20) return 1.0; // Full confidence
    if (sampleSize >= 10) return 0.9;
    if (sampleSize >= 5) return 0.8;
    if (sampleSize >= 3) return 0.7;
    return 0.6; // Low confidence for 1-2 samples
  }

  /**
   * Get distance category for filtering
   */
  private static getDistanceCategory(
    distance: number
  ): "short" | "medium" | "long" {
    if (distance <= 3) return "short";
    if (distance <= 7) return "medium";
    return "long";
  }

  /**
   * Get field zone for filtering
   */
  private static getFieldZone(
    yardLine: number
  ): "own" | "midfield" | "red-zone" | "goal-line" {
    if (yardLine < 50) return "own";
    if (yardLine < 80) return "midfield";
    if (yardLine < 95) return "red-zone";
    return "goal-line";
  }

  /**
   * Convert numeric score to recommendation level
   */
  private static getRecommendation(score: number): "high" | "medium" | "low" {
    if (score >= 70) return "high";
    if (score >= 40) return "medium";
    return "low";
  }

  /**
   * Refresh confidence scores after new execution
   * Call this after logging a play to update confidence in real-time
   */
  static async refreshAfterExecution(
    playId: string,
    teamId: string,
    situation?: GameSituation
  ): Promise<ConfidenceScore> {
    // Invalidate any cached scores (if caching is implemented)
    // For now, just recalculate
    return this.getPlayConfidence(playId, teamId, situation);
  }

  /**
   * Get confidence trends over time
   * Useful for analytics dashboard
   */
  static async getConfidenceTrend(
    playId: string,
    teamId: string,
    days: number = 30
  ): Promise<Array<{ date: Date; score: number }>> {
    const { data: executions, error } = await supabase
      .from("play_executions")
      .select("executed_at, result")
      .eq("play_id", playId)
      .eq("team_id", teamId)
      .gte(
        "executed_at",
        new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      )
      .order("executed_at", { ascending: true });

    if (error || !executions) return [];

    // Group by day and calculate daily confidence
    const dailyScores = new Map<string, number[]>();

    executions.forEach((execution) => {
      const date = new Date(execution.executed_at).toISOString().split("T")[0];
      const score = this.getExecutionScore(execution as any);

      if (!dailyScores.has(date)) {
        dailyScores.set(date, []);
      }
      dailyScores.get(date)!.push(score);
    });

    // Calculate average for each day
    return Array.from(dailyScores.entries()).map(([dateStr, scores]) => ({
      date: new Date(dateStr),
      score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }));
  }
}
