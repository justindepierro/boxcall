/**
 * Coach Analytics Service
 * Professional-grade analytics designed for football coaches
 *
 * Features:
 * - Tendency reports (what do we do in specific situations?)
 * - Play recommendations (what should we call?)
 * - Efficiency metrics (what's working?)
 * - Sample size warnings (can we trust this data?)
 * - Export-ready data structures
 */

import { table } from "../../data/supabase/db";
import {
  ANALYTICS_CONSTANTS,
  getSampleSizeCategory,
  calculateSuccessRate,
  bucketDownDistance,
  bucketFieldZone,
  type FieldZone,
} from "./analyticsContract";
import { logError } from "../../utils/logger";

// ============================================
// TYPES
// ============================================

export interface TendencyReport {
  teamId: string;
  generatedAt: string;

  // Overall tendencies
  overall: {
    totalPlays: number;
    passPercent: number;
    runPercent: number;
    rpoPercent: number;
    avgYardsPerPlay: number;
    successRate: number;
  };

  // By situation
  byDown: Record<
    string,
    {
      total: number;
      passPercent: number;
      runPercent: number;
      successRate: number;
      avgYards: number;
      sampleSize: "insufficient" | "limited" | "reliable" | "strong";
      topPlay?: {
        name: string;
        successRate: number;
        calls: number;
      };
    }
  >;

  // By field zone
  byFieldZone: Record<
    string,
    {
      total: number;
      passPercent: number;
      runPercent: number;
      successRate: number;
      avgYards: number;
      sampleSize: "insufficient" | "limited" | "reliable" | "strong";
    }
  >;

  // By personnel grouping
  byPersonnel: Record<
    string,
    {
      total: number;
      passPercent: number;
      runPercent: number;
      successRate: number;
      formations: string[];
    }
  >;

  // Red zone specific
  redZone: {
    totalPlays: number;
    touchdownRate: number;
    fieldGoalRate: number;
    turnoverRate: number;
    topFormations: Array<{ formation: string; successRate: number }>;
  };

  // Third down specific
  thirdDown: {
    overallConversionRate: number;
    byDistance: {
      short: { attempts: number; conversions: number; rate: number };
      medium: { attempts: number; conversions: number; rate: number };
      long: { attempts: number; conversions: number; rate: number };
    };
    topConversionPlays: Array<{
      name: string;
      attempts: number;
      conversions: number;
      rate: number;
    }>;
  };

  // Warnings for coaches
  warnings: string[];
}

export interface PlayRecommendation {
  playId: string;
  playName: string;
  formation: string;
  personnel?: string;

  // Why we're recommending it
  reason: string;

  // Historical performance in similar situations
  situationStats: {
    attempts: number;
    successRate: number;
    avgYards: number;
  };

  // Confidence level
  confidence: "high" | "medium" | "low";
  confidenceReason: string;

  // Recent trend
  trend: "improving" | "stable" | "declining" | "unknown";
}

export interface EfficiencyMetrics {
  // Success rate by play type
  byPlayType: Record<
    string,
    {
      attempts: number;
      successRate: number;
      avgYards: number;
      explosivePlayRate: number; // 15+ yards
    }
  >;

  // Top 10 most efficient plays (min 5 attempts)
  topPlays: Array<{
    playId: string;
    playName: string;
    attempts: number;
    successRate: number;
    avgYards: number;
    efficiency: number; // Composite score
  }>;

  // Formations that create explosive plays
  explosiveFormations: Array<{
    formation: string;
    attempts: number;
    explosiveRate: number; // % of plays gaining 15+ yards
    biggestPlay: number;
  }>;

  // Practice vs Game transfer
  practiceToGame: {
    playsAnalyzed: number;
    avgPracticeSuccess: number;
    avgGameSuccess: number;
    transferRate: number; // How well practice translates to games
    concernPlays: Array<{
      playId: string;
      playName: string;
      practiceSuccess: number;
      gameSuccess: number;
      gap: number;
    }>;
  };
}

// ============================================
// COACH ANALYTICS SERVICE
// ============================================

export class CoachAnalytics {
  /**
   * Generate comprehensive tendency report for a team
   */
  static async getTendencyReport(teamId: string): Promise<TendencyReport> {
    const generatedAt = new Date().toISOString();
    const warnings: string[] = [];

    // Fetch all executions with play data
    const { data: executions, error } = await table("play_executions")
      .select(
        `
        id,
        play_id,
        result,
        yards_gained,
        down,
        distance,
        yard_line,
        quarter,
        game_session_id,
        practice_session_id,
        plays!inner (
          play_name,
          p_type,
          formation,
          personnel
        )
      `
      )
      .eq("team_id", teamId)
      .not("result", "eq", "skipped")
      .order("executed_at", { ascending: false })
      .limit(1000);

    if (error) {
      logError("Failed to fetch executions for tendency report", error);
      throw new Error(`Failed to generate tendency report: ${error.message}`);
    }

    if (!executions || executions.length === 0) {
      return this.getEmptyTendencyReport(teamId, generatedAt);
    }

    // Filter to game executions for tendencies (practice is for confidence)
    const gameExecs = executions.filter((e) => e.game_session_id != null);

    if (gameExecs.length < ANALYTICS_CONSTANTS.MIN_SAMPLE_FOR_RATE) {
      warnings.push(
        `Only ${gameExecs.length} game executions found. Tendency data includes practice reps for better insights.`
      );
    }

    const dataToAnalyze = gameExecs.length >= 10 ? gameExecs : executions;

    // Calculate overall tendencies
    const overall = this.calculateOverallTendencies(dataToAnalyze as any);

    // Calculate by down
    const byDown = this.calculateDownTendencies(dataToAnalyze as any);

    // Calculate by field zone
    const byFieldZone = this.calculateFieldZoneTendencies(dataToAnalyze as any);

    // Calculate by personnel
    const byPersonnel = this.calculatePersonnelTendencies(dataToAnalyze as any);

    // Red zone analysis
    const redZone = this.calculateRedZoneAnalysis(dataToAnalyze as any);

    // Third down analysis
    const thirdDown = this.calculateThirdDownAnalysis(dataToAnalyze as any);

    // Add sample size warnings
    if (dataToAnalyze.length < ANALYTICS_CONSTANTS.RELIABLE_SAMPLE_SIZE) {
      warnings.push(
        `Limited data (${dataToAnalyze.length} plays). Trends may not be reliable until you have ${ANALYTICS_CONSTANTS.RELIABLE_SAMPLE_SIZE}+ executions.`
      );
    }

    return {
      teamId,
      generatedAt,
      overall,
      byDown,
      byFieldZone,
      byPersonnel,
      redZone,
      thirdDown,
      warnings,
    };
  }

  /**
   * Get play recommendations for a specific situation
   */
  static async getRecommendations(
    teamId: string,
    situation: {
      down: number;
      distance: number;
      yardLine: number;
      personnelFilter?: string;
    }
  ): Promise<PlayRecommendation[]> {
    const { down, distance, yardLine, personnelFilter } = situation;
    const downDistBucket = bucketDownDistance(down, distance);
    const fieldZone = bucketFieldZone(yardLine);

    // Get plays with their execution stats in similar situations
    const { data: executions, error } = await table("play_executions")
      .select(
        `
        play_id,
        result,
        yards_gained,
        down,
        distance,
        yard_line,
        plays!inner (
          id,
          play_name,
          formation,
          personnel,
          p_type,
          confidence_base
        )
      `
      )
      .eq("team_id", teamId)
      .not("result", "eq", "skipped");

    if (error || !executions) {
      logError("Failed to fetch executions for recommendations", error);
      return [];
    }

    // Filter to similar situations
    const similarExecs = executions.filter((e) => {
      const execDown = e.down;
      const execDist = e.distance;
      const execYard = e.yard_line;

      // Same down and similar distance
      const downMatch = execDown === down;
      const distMatch =
        execDist != null &&
        bucketDownDistance(execDown || 1, execDist) === downDistBucket;

      // Similar field zone
      const zoneMatch =
        execYard != null && bucketFieldZone(execYard) === fieldZone;

      // Personnel filter
      const personnelMatch =
        !personnelFilter ||
        (e.plays as any)?.personnel?.includes(personnelFilter);

      return (
        (downMatch || distMatch) && (zoneMatch || !execYard) && personnelMatch
      );
    });

    // Group by play and calculate stats
    const playStats = new Map<
      string,
      {
        play: any;
        attempts: number;
        successes: number;
        yards: number[];
      }
    >();

    for (const exec of similarExecs) {
      const play = exec.plays as any;
      if (!play || !exec.play_id) continue;

      const playId = exec.play_id;
      const stats = playStats.get(playId) || {
        play,
        attempts: 0,
        successes: 0,
        yards: [],
      };

      stats.attempts++;
      if (exec.result === "success") stats.successes++;
      if (exec.yards_gained != null) stats.yards.push(exec.yards_gained);

      playStats.set(playId, stats);
    }

    // Convert to recommendations
    const recommendations: PlayRecommendation[] = [];

    for (const [playId, stats] of playStats) {
      if (stats.attempts < 2) continue; // Need at least 2 attempts

      const successRate = calculateSuccessRate(stats.successes, stats.attempts);
      const avgYards =
        stats.yards.length > 0
          ? stats.yards.reduce((a, b) => a + b, 0) / stats.yards.length
          : 0;

      const sampleSize = getSampleSizeCategory(stats.attempts);
      const confidence =
        sampleSize === "strong" || sampleSize === "reliable"
          ? "high"
          : sampleSize === "limited"
            ? "medium"
            : "low";

      recommendations.push({
        playId,
        playName: stats.play.play_name,
        formation: stats.play.formation,
        personnel: stats.play.personnel,
        reason: this.generateRecommendationReason(
          stats.play,
          successRate,
          avgYards,
          stats.attempts
        ),
        situationStats: {
          attempts: stats.attempts,
          successRate,
          avgYards: Math.round(avgYards * 10) / 10,
        },
        confidence,
        confidenceReason: `Based on ${stats.attempts} similar situations (${sampleSize} sample)`,
        trend: "unknown", // Would need historical data to determine
      });
    }

    // Sort by success rate and confidence
    return recommendations
      .sort((a, b) => {
        if (a.confidence !== b.confidence) {
          return a.confidence === "high" ? -1 : b.confidence === "high" ? 1 : 0;
        }
        return b.situationStats.successRate - a.situationStats.successRate;
      })
      .slice(0, 10);
  }

  /**
   * Get efficiency metrics for coach analysis
   */
  static async getEfficiencyMetrics(
    teamId: string
  ): Promise<EfficiencyMetrics> {
    const { data: executions, error } = await table("play_executions")
      .select(
        `
        play_id,
        result,
        yards_gained,
        game_session_id,
        practice_session_id,
        plays!inner (
          play_name,
          p_type,
          formation
        )
      `
      )
      .eq("team_id", teamId)
      .not("result", "eq", "skipped");

    if (error || !executions) {
      logError("Failed to fetch executions for efficiency metrics", error);
      throw new Error(`Failed to calculate efficiency: ${error?.message}`);
    }

    // By play type
    const byPlayType = this.calculatePlayTypeEfficiency(executions as any);

    // Top plays
    const topPlays = this.calculateTopPlays(executions as any);

    // Explosive formations
    const explosiveFormations = this.calculateExplosiveFormations(
      executions as any
    );

    // Practice to game transfer
    const practiceToGame = this.calculatePracticeToGameTransfer(
      executions as any
    );

    return {
      byPlayType,
      topPlays,
      explosiveFormations,
      practiceToGame,
    };
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private static getEmptyTendencyReport(
    teamId: string,
    generatedAt: string
  ): TendencyReport {
    return {
      teamId,
      generatedAt,
      overall: {
        totalPlays: 0,
        passPercent: 0,
        runPercent: 0,
        rpoPercent: 0,
        avgYardsPerPlay: 0,
        successRate: 0,
      },
      byDown: {},
      byFieldZone: {},
      byPersonnel: {},
      redZone: {
        totalPlays: 0,
        touchdownRate: 0,
        fieldGoalRate: 0,
        turnoverRate: 0,
        topFormations: [],
      },
      thirdDown: {
        overallConversionRate: 0,
        byDistance: {
          short: { attempts: 0, conversions: 0, rate: 0 },
          medium: { attempts: 0, conversions: 0, rate: 0 },
          long: { attempts: 0, conversions: 0, rate: 0 },
        },
        topConversionPlays: [],
      },
      warnings: [
        "No execution data found. Start tracking plays to see tendencies.",
      ],
    };
  }

  private static calculateOverallTendencies(
    executions: Array<{
      result: string;
      yards_gained: number | null;
      plays: { p_type: string };
    }>
  ) {
    const total = executions.length;
    const pass = executions.filter(
      (e) => e.plays?.p_type?.toLowerCase() === "pass"
    ).length;
    const run = executions.filter(
      (e) => e.plays?.p_type?.toLowerCase() === "run"
    ).length;
    const rpo = executions.filter(
      (e) => e.plays?.p_type?.toLowerCase() === "rpo"
    ).length;
    const successes = executions.filter((e) => e.result === "success").length;
    const totalYards = executions.reduce(
      (sum, e) => sum + (e.yards_gained || 0),
      0
    );

    return {
      totalPlays: total,
      passPercent: total > 0 ? Math.round((pass / total) * 100) : 0,
      runPercent: total > 0 ? Math.round((run / total) * 100) : 0,
      rpoPercent: total > 0 ? Math.round((rpo / total) * 100) : 0,
      avgYardsPerPlay:
        total > 0 ? Math.round((totalYards / total) * 10) / 10 : 0,
      successRate: calculateSuccessRate(successes, total),
    };
  }

  private static calculateDownTendencies(
    executions: Array<{
      down: number | null;
      distance: number | null;
      result: string;
      yards_gained: number | null;
      plays: { p_type: string; play_name: string };
    }>
  ) {
    const byDown: TendencyReport["byDown"] = {};

    const downGroups = ["1st", "2nd", "3rd", "4th"];

    for (const downLabel of downGroups) {
      const downNum = downGroups.indexOf(downLabel) + 1;
      const filtered = executions.filter((e) => e.down === downNum);

      if (filtered.length === 0) continue;

      const pass = filtered.filter(
        (e) => e.plays?.p_type?.toLowerCase() === "pass"
      ).length;
      const run = filtered.filter(
        (e) => e.plays?.p_type?.toLowerCase() === "run"
      ).length;
      const successes = filtered.filter((e) => e.result === "success").length;
      const totalYards = filtered.reduce(
        (sum, e) => sum + (e.yards_gained || 0),
        0
      );

      // Find top play for this down
      const playStats = new Map<
        string,
        { name: string; calls: number; successes: number }
      >();
      for (const exec of filtered) {
        const name = exec.plays?.play_name || "Unknown";
        const stats = playStats.get(name) || { name, calls: 0, successes: 0 };
        stats.calls++;
        if (exec.result === "success") stats.successes++;
        playStats.set(name, stats);
      }

      let topPlay: TendencyReport["byDown"][""]["topPlay"] | undefined;
      let maxCalls = 0;
      for (const stats of playStats.values()) {
        if (stats.calls > maxCalls) {
          maxCalls = stats.calls;
          topPlay = {
            name: stats.name,
            successRate: calculateSuccessRate(stats.successes, stats.calls),
            calls: stats.calls,
          };
        }
      }

      byDown[downLabel] = {
        total: filtered.length,
        passPercent: Math.round((pass / filtered.length) * 100),
        runPercent: Math.round((run / filtered.length) * 100),
        successRate: calculateSuccessRate(successes, filtered.length),
        avgYards: Math.round((totalYards / filtered.length) * 10) / 10,
        sampleSize: getSampleSizeCategory(filtered.length),
        topPlay,
      };
    }

    return byDown;
  }

  private static calculateFieldZoneTendencies(
    executions: Array<{
      yard_line: number | null;
      result: string;
      yards_gained: number | null;
      plays: { p_type: string };
    }>
  ) {
    const byFieldZone: TendencyReport["byFieldZone"] = {};

    const zones: FieldZone[] = [
      "backed_up",
      "own_territory",
      "plus_territory",
      "red_zone",
      "goal_line",
    ];

    for (const zone of zones) {
      const filtered = executions.filter(
        (e) => e.yard_line != null && bucketFieldZone(e.yard_line) === zone
      );

      if (filtered.length === 0) continue;

      const pass = filtered.filter(
        (e) => e.plays?.p_type?.toLowerCase() === "pass"
      ).length;
      const run = filtered.filter(
        (e) => e.plays?.p_type?.toLowerCase() === "run"
      ).length;
      const successes = filtered.filter((e) => e.result === "success").length;
      const totalYards = filtered.reduce(
        (sum, e) => sum + (e.yards_gained || 0),
        0
      );

      byFieldZone[zone] = {
        total: filtered.length,
        passPercent: Math.round((pass / filtered.length) * 100),
        runPercent: Math.round((run / filtered.length) * 100),
        successRate: calculateSuccessRate(successes, filtered.length),
        avgYards: Math.round((totalYards / filtered.length) * 10) / 10,
        sampleSize: getSampleSizeCategory(filtered.length),
      };
    }

    return byFieldZone;
  }

  private static calculatePersonnelTendencies(
    executions: Array<{
      result: string;
      plays: { p_type: string; personnel: string | null; formation: string };
    }>
  ) {
    const byPersonnel: TendencyReport["byPersonnel"] = {};

    const personnelGroups = new Map<
      string,
      {
        total: number;
        pass: number;
        run: number;
        successes: number;
        formations: Set<string>;
      }
    >();

    for (const exec of executions) {
      const personnel = exec.plays?.personnel || "Unknown";
      const group = personnelGroups.get(personnel) || {
        total: 0,
        pass: 0,
        run: 0,
        successes: 0,
        formations: new Set<string>(),
      };

      group.total++;
      if (exec.plays?.p_type?.toLowerCase() === "pass") group.pass++;
      if (exec.plays?.p_type?.toLowerCase() === "run") group.run++;
      if (exec.result === "success") group.successes++;
      if (exec.plays?.formation) group.formations.add(exec.plays.formation);

      personnelGroups.set(personnel, group);
    }

    for (const [personnel, group] of personnelGroups) {
      if (group.total < 3) continue; // Skip personnel with very few plays

      byPersonnel[personnel] = {
        total: group.total,
        passPercent: Math.round((group.pass / group.total) * 100),
        runPercent: Math.round((group.run / group.total) * 100),
        successRate: calculateSuccessRate(group.successes, group.total),
        formations: Array.from(group.formations),
      };
    }

    return byPersonnel;
  }

  private static calculateRedZoneAnalysis(
    executions: Array<{
      yard_line: number | null;
      result: string;
      plays: { formation: string };
    }>
  ) {
    const redZoneExecs = executions.filter(
      (e) => e.yard_line != null && e.yard_line >= 80
    );

    if (redZoneExecs.length === 0) {
      return {
        totalPlays: 0,
        touchdownRate: 0,
        fieldGoalRate: 0,
        turnoverRate: 0,
        topFormations: [],
      };
    }

    // Group by formation
    const formationStats = new Map<
      string,
      { total: number; successes: number }
    >();
    for (const exec of redZoneExecs) {
      const formation = exec.plays?.formation || "Unknown";
      const stats = formationStats.get(formation) || { total: 0, successes: 0 };
      stats.total++;
      if (exec.result === "success") stats.successes++;
      formationStats.set(formation, stats);
    }

    const topFormations = Array.from(formationStats.entries())
      .map(([formation, stats]) => ({
        formation,
        successRate: calculateSuccessRate(stats.successes, stats.total),
      }))
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 5);

    const successes = redZoneExecs.filter((e) => e.result === "success").length;

    return {
      totalPlays: redZoneExecs.length,
      touchdownRate: calculateSuccessRate(successes, redZoneExecs.length), // Simplified
      fieldGoalRate: 0, // Would need more data
      turnoverRate: 0, // Would need more data
      topFormations,
    };
  }

  private static calculateThirdDownAnalysis(
    executions: Array<{
      down: number | null;
      distance: number | null;
      result: string;
      plays: { play_name: string };
    }>
  ) {
    const thirdDownExecs = executions.filter((e) => e.down === 3);

    if (thirdDownExecs.length === 0) {
      return {
        overallConversionRate: 0,
        byDistance: {
          short: { attempts: 0, conversions: 0, rate: 0 },
          medium: { attempts: 0, conversions: 0, rate: 0 },
          long: { attempts: 0, conversions: 0, rate: 0 },
        },
        topConversionPlays: [],
      };
    }

    const conversions = thirdDownExecs.filter(
      (e) => e.result === "success"
    ).length;

    // By distance
    const short = thirdDownExecs.filter(
      (e) => e.distance != null && e.distance <= 3
    );
    const medium = thirdDownExecs.filter(
      (e) => e.distance != null && e.distance > 3 && e.distance <= 7
    );
    const long = thirdDownExecs.filter(
      (e) => e.distance != null && e.distance > 7
    );

    const shortConv = short.filter((e) => e.result === "success").length;
    const medConv = medium.filter((e) => e.result === "success").length;
    const longConv = long.filter((e) => e.result === "success").length;

    // Top conversion plays
    const playStats = new Map<
      string,
      { name: string; attempts: number; conversions: number }
    >();
    for (const exec of thirdDownExecs) {
      const name = exec.plays?.play_name || "Unknown";
      const stats = playStats.get(name) || {
        name,
        attempts: 0,
        conversions: 0,
      };
      stats.attempts++;
      if (exec.result === "success") stats.conversions++;
      playStats.set(name, stats);
    }

    const topConversionPlays = Array.from(playStats.values())
      .filter((s) => s.attempts >= 2)
      .map((s) => ({
        ...s,
        rate: calculateSuccessRate(s.conversions, s.attempts),
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);

    return {
      overallConversionRate: calculateSuccessRate(
        conversions,
        thirdDownExecs.length
      ),
      byDistance: {
        short: {
          attempts: short.length,
          conversions: shortConv,
          rate: calculateSuccessRate(shortConv, short.length),
        },
        medium: {
          attempts: medium.length,
          conversions: medConv,
          rate: calculateSuccessRate(medConv, medium.length),
        },
        long: {
          attempts: long.length,
          conversions: longConv,
          rate: calculateSuccessRate(longConv, long.length),
        },
      },
      topConversionPlays,
    };
  }

  private static calculatePlayTypeEfficiency(
    executions: Array<{
      result: string;
      yards_gained: number | null;
      plays: { p_type: string };
    }>
  ): EfficiencyMetrics["byPlayType"] {
    const byType: EfficiencyMetrics["byPlayType"] = {};

    const types = new Map<
      string,
      {
        attempts: number;
        successes: number;
        yards: number[];
        explosives: number;
      }
    >();

    for (const exec of executions) {
      const type = exec.plays?.p_type || "Unknown";
      const stats = types.get(type) || {
        attempts: 0,
        successes: 0,
        yards: [],
        explosives: 0,
      };

      stats.attempts++;
      if (exec.result === "success") stats.successes++;
      if (exec.yards_gained != null) {
        stats.yards.push(exec.yards_gained);
        if (exec.yards_gained >= 15) stats.explosives++;
      }

      types.set(type, stats);
    }

    for (const [type, stats] of types) {
      byType[type] = {
        attempts: stats.attempts,
        successRate: calculateSuccessRate(stats.successes, stats.attempts),
        avgYards:
          stats.yards.length > 0
            ? Math.round(
                (stats.yards.reduce((a, b) => a + b, 0) / stats.yards.length) *
                  10
              ) / 10
            : 0,
        explosivePlayRate:
          stats.yards.length > 0
            ? Math.round((stats.explosives / stats.yards.length) * 1000) / 10
            : 0,
      };
    }

    return byType;
  }

  private static calculateTopPlays(
    executions: Array<{
      play_id: string;
      result: string;
      yards_gained: number | null;
      plays: { play_name: string };
    }>
  ): EfficiencyMetrics["topPlays"] {
    const playStats = new Map<
      string,
      { name: string; attempts: number; successes: number; yards: number[] }
    >();

    for (const exec of executions) {
      const stats = playStats.get(exec.play_id) || {
        name: exec.plays?.play_name || "Unknown",
        attempts: 0,
        successes: 0,
        yards: [],
      };

      stats.attempts++;
      if (exec.result === "success") stats.successes++;
      if (exec.yards_gained != null) stats.yards.push(exec.yards_gained);

      playStats.set(exec.play_id, stats);
    }

    return Array.from(playStats.entries())
      .filter(([_, stats]) => stats.attempts >= 5)
      .map(([playId, stats]) => {
        const successRate = calculateSuccessRate(
          stats.successes,
          stats.attempts
        );
        const avgYards =
          stats.yards.length > 0
            ? stats.yards.reduce((a, b) => a + b, 0) / stats.yards.length
            : 0;

        // Efficiency = weighted combo of success rate and yards
        const efficiency = successRate * 0.6 + avgYards * 4;

        return {
          playId,
          playName: stats.name,
          attempts: stats.attempts,
          successRate,
          avgYards: Math.round(avgYards * 10) / 10,
          efficiency: Math.round(efficiency * 10) / 10,
        };
      })
      .sort((a, b) => b.efficiency - a.efficiency)
      .slice(0, 10);
  }

  private static calculateExplosiveFormations(
    executions: Array<{
      yards_gained: number | null;
      plays: { formation: string };
    }>
  ): EfficiencyMetrics["explosiveFormations"] {
    const formationStats = new Map<
      string,
      { attempts: number; explosives: number; maxYards: number }
    >();

    for (const exec of executions) {
      const formation = exec.plays?.formation || "Unknown";
      const stats = formationStats.get(formation) || {
        attempts: 0,
        explosives: 0,
        maxYards: 0,
      };

      if (exec.yards_gained != null) {
        stats.attempts++;
        if (exec.yards_gained >= 15) stats.explosives++;
        if (exec.yards_gained > stats.maxYards)
          stats.maxYards = exec.yards_gained;
      }

      formationStats.set(formation, stats);
    }

    return Array.from(formationStats.entries())
      .filter(([_, stats]) => stats.attempts >= 5)
      .map(([formation, stats]) => ({
        formation,
        attempts: stats.attempts,
        explosiveRate:
          Math.round((stats.explosives / stats.attempts) * 1000) / 10,
        biggestPlay: stats.maxYards,
      }))
      .sort((a, b) => b.explosiveRate - a.explosiveRate)
      .slice(0, 5);
  }

  private static calculatePracticeToGameTransfer(
    executions: Array<{
      play_id: string;
      result: string;
      game_session_id: string | null;
      practice_session_id: string | null;
      plays: { play_name: string };
    }>
  ): EfficiencyMetrics["practiceToGame"] {
    const playStats = new Map<
      string,
      {
        name: string;
        practiceAttempts: number;
        practiceSuccesses: number;
        gameAttempts: number;
        gameSuccesses: number;
      }
    >();

    for (const exec of executions) {
      const stats = playStats.get(exec.play_id) || {
        name: exec.plays?.play_name || "Unknown",
        practiceAttempts: 0,
        practiceSuccesses: 0,
        gameAttempts: 0,
        gameSuccesses: 0,
      };

      if (exec.practice_session_id) {
        stats.practiceAttempts++;
        if (exec.result === "success") stats.practiceSuccesses++;
      } else if (exec.game_session_id) {
        stats.gameAttempts++;
        if (exec.result === "success") stats.gameSuccesses++;
      }

      playStats.set(exec.play_id, stats);
    }

    // Find plays with both practice and game data
    const playsWithBoth = Array.from(playStats.entries()).filter(
      ([_, s]) => s.practiceAttempts >= 3 && s.gameAttempts >= 2
    );

    if (playsWithBoth.length === 0) {
      return {
        playsAnalyzed: 0,
        avgPracticeSuccess: 0,
        avgGameSuccess: 0,
        transferRate: 0,
        concernPlays: [],
      };
    }

    let totalPracticeSuccess = 0;
    let totalGameSuccess = 0;
    const concernPlays: EfficiencyMetrics["practiceToGame"]["concernPlays"] =
      [];

    for (const [playId, stats] of playsWithBoth) {
      const practiceRate = calculateSuccessRate(
        stats.practiceSuccesses,
        stats.practiceAttempts
      );
      const gameRate = calculateSuccessRate(
        stats.gameSuccesses,
        stats.gameAttempts
      );

      totalPracticeSuccess += practiceRate;
      totalGameSuccess += gameRate;

      const gap = practiceRate - gameRate;
      if (gap > 20) {
        concernPlays.push({
          playId,
          playName: stats.name,
          practiceSuccess: practiceRate,
          gameSuccess: gameRate,
          gap,
        });
      }
    }

    const avgPractice = totalPracticeSuccess / playsWithBoth.length;
    const avgGame = totalGameSuccess / playsWithBoth.length;

    return {
      playsAnalyzed: playsWithBoth.length,
      avgPracticeSuccess: Math.round(avgPractice * 10) / 10,
      avgGameSuccess: Math.round(avgGame * 10) / 10,
      transferRate: Math.round((avgGame / avgPractice) * 1000) / 10,
      concernPlays: concernPlays.sort((a, b) => b.gap - a.gap).slice(0, 5),
    };
  }

  private static generateRecommendationReason(
    play: { p_type: string; formation: string; personnel?: string },
    successRate: number,
    avgYards: number,
    attempts: number
  ): string {
    const reasons: string[] = [];

    if (successRate >= 70) {
      reasons.push(`High success rate (${successRate}%)`);
    } else if (successRate >= 50) {
      reasons.push(`Solid success rate (${successRate}%)`);
    }

    if (avgYards >= 7) {
      reasons.push(`explosive potential (${avgYards.toFixed(1)} avg yards)`);
    } else if (avgYards >= 4) {
      reasons.push(`consistent gains (${avgYards.toFixed(1)} avg yards)`);
    }

    if (attempts >= 10) {
      reasons.push("proven in similar situations");
    }

    if (reasons.length === 0) {
      return `${play.formation} ${play.p_type?.toLowerCase() || "play"} with ${attempts} attempts`;
    }

    return reasons.join(", ");
  }
}
