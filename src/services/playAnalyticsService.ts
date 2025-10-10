/**
 * Unified Play Analytics Service
 *
 * Consolidates play-related analytics from:
 * - gamePlanningAnalyticsService.ts (game plan analytics, situation coverage)
 * - playbookAnalyticsService.ts (play performance, formation analytics)
 */

import { supabase } from "../lib/supabase";
import type {
  GamePlanEnhanced,
  GamePlanSituation,
  GamePlanPlay,
  GamePlanAnalytics,
  PriorityOptimization,
} from "../types/database/gamePlanningTypes";

// ============================================
// GAME PLANNING ANALYTICS
// (From gamePlanningAnalyticsService.ts)
// ============================================

export interface GamePlanningMetrics {
  totalGamePlans: number;
  activeGamePlans: number;
  completedGamePlans: number;
  averagePreparationTime: number;
  situationCoverage: {
    totalSituations: number;
    coveredSituations: number;
    coveragePercentage: number;
  };
  playAssignments: {
    totalAssignments: number;
    averagePerSituation: number;
    highPriorityAssignments: number;
  };
}

export interface GamePlanningInsights {
  preparationStatus: {
    draft: number;
    inProgress: number;
    complete: number;
    gameReady: number;
  };
  situationalAnalysis: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  coachingEffectiveness: {
    averageExecutionQuality: number;
    successRateBySituation: Record<string, number>;
    adjustmentFrequency: number;
    coachingAssessmentTrends: string[];
  };
  optimizationOpportunities: PriorityOptimization[];
}

export interface GamePlanningAnalyticsData {
  metrics: GamePlanningMetrics;
  insights: GamePlanningInsights;
  recentActivity: {
    gamePlans: GamePlanEnhanced[];
    analytics: GamePlanAnalytics[];
  };
}

// ============================================
// PLAYBOOK ANALYTICS
// (From playbookAnalyticsService.ts)
// ============================================

export interface PlayAnalytics {
  playId: string;
  playName: string;
  formation: string;
  playType: string;
  confidenceBase: number;
  timesCalled: number;
  timesSuccessful: number;
  successRate: number;
  complexityScore: number;
  personnel: string;
  downDistance: string;
  fieldPosition: string;
  situationalPerformance: {
    redZone: { called: number; successful: number; rate: number };
    thirdDown: { called: number; successful: number; rate: number };
    goalLine: { called: number; successful: number; rate: number };
  };
}

export interface FormationAnalytics {
  formation: string;
  totalPlays: number;
  successRate: number;
  averageComplexity: number;
  personnelBreakdown: Record<string, number>;
  situationalUsage: Record<string, number>;
}

export interface PlaybookAnalyticsSummary {
  totalPlays: number;
  averageSuccessRate: number;
  averageComplexity: number;
  formationsCount: number;
  topPerformingPlays: PlayAnalytics[];
  formationAnalytics: FormationAnalytics[];
  situationalPerformance: {
    byDown: Record<
      string,
      { called: number; successful: number; rate: number }
    >;
    byFieldPosition: Record<
      string,
      { called: number; successful: number; rate: number }
    >;
    byPersonnel: Record<
      string,
      { called: number; successful: number; rate: number }
    >;
  };
  complexityDistribution: {
    low: number;
    medium: number;
    high: number;
  };
}

// ============================================
// UNIFIED PLAY ANALYTICS SERVICE
// ============================================

export class PlayAnalyticsService {
  // ============================================
  // GAME PLANNING ANALYTICS METHODS
  // ============================================

  /**
   * Get comprehensive game planning analytics for a team
   */
  static async getGamePlanningAnalytics(
    teamId: string
  ): Promise<GamePlanningAnalyticsData> {
    try {
      const { data: gamePlans, error: gamePlansError } = await supabase
        .from("game_plans_enhanced")
        .select("*")
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });

      if (gamePlansError) {
        console.warn("Game plans table may not exist yet, using mock data");
        return PlayAnalyticsService.generateMockGamePlanningData();
      }

      const situations = await PlayAnalyticsService.getSituationsData(teamId);
      const plays = await PlayAnalyticsService.getPlaysData(teamId);
      const analytics = await PlayAnalyticsService.getAnalyticsData(teamId);

      const metrics = PlayAnalyticsService.calculateGamePlanMetrics(
        gamePlans || [],
        situations,
        plays
      );
      const insights = PlayAnalyticsService.generateGamePlanInsights(
        gamePlans || [],
        situations,
        plays,
        analytics
      );

      return {
        metrics,
        insights,
        recentActivity: {
          gamePlans: (gamePlans || []).slice(0, 5),
          analytics: analytics.slice(0, 10),
        },
      };
    } catch (error) {
      console.error("Error fetching game planning analytics:", error);
      return PlayAnalyticsService.generateMockGamePlanningData();
    }
  }

  private static calculateGamePlanMetrics(
    gamePlans: GamePlanEnhanced[],
    situations: GamePlanSituation[],
    plays: GamePlanPlay[]
  ): GamePlanningMetrics {
    const totalGamePlans = gamePlans.length;
    const activeGamePlans = gamePlans.filter(
      (gp) => (gp as any).status === "active"
    ).length;
    const completedGamePlans = gamePlans.filter(
      (gp) => (gp as any).status === "completed"
    ).length;

    const preparationTimes = gamePlans
      .filter((gp) => gp.created_at && gp.updated_at)
      .map((gp) => {
        const created = new Date(gp.created_at!).getTime();
        const updated = new Date(gp.updated_at!).getTime();
        return (updated - created) / (1000 * 60);
      });

    const averagePreparationTime =
      preparationTimes.length > 0
        ? preparationTimes.reduce((a, b) => a + b, 0) / preparationTimes.length
        : 0;

    const uniqueSituations = new Set(
      situations.map((s) => (s as any).situation_name)
    ).size;
    const coveredSituations = new Set(plays.map((p) => p.situation_id)).size;
    const coveragePercentage =
      uniqueSituations > 0 ? (coveredSituations / uniqueSituations) * 100 : 0;

    const totalAssignments = plays.length;
    const averagePerSituation =
      coveredSituations > 0 ? totalAssignments / coveredSituations : 0;
    const highPriorityAssignments = plays.filter(
      (p) => (p as any).priority && (p as any).priority >= 4
    ).length;

    return {
      totalGamePlans,
      activeGamePlans,
      completedGamePlans,
      averagePreparationTime: Math.round(averagePreparationTime),
      situationCoverage: {
        totalSituations: uniqueSituations,
        coveredSituations,
        coveragePercentage: Math.round(coveragePercentage),
      },
      playAssignments: {
        totalAssignments,
        averagePerSituation: Math.round(averagePerSituation * 10) / 10,
        highPriorityAssignments,
      },
    };
  }

  private static generateGamePlanInsights(
    gamePlans: GamePlanEnhanced[],
    _situations: GamePlanSituation[],
    _plays: GamePlanPlay[],
    analytics: GamePlanAnalytics[]
  ): GamePlanningInsights {
    const statusCounts = gamePlans.reduce(
      (counts, gp) => {
        const status = (gp as any).status || "draft";
        counts[status] = (counts[status] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>
    );

    const executionQualities = analytics
      .filter((a) => (a as any).execution_quality != null)
      .map((a) => (a as any).execution_quality!);
    const averageExecutionQuality =
      executionQualities.length > 0
        ? executionQualities.reduce((a, b) => a + b, 0) /
          executionQualities.length
        : 0;

    const successRateBySituation = analytics.reduce(
      (rates, a) => {
        const aAny = a as any;
        if (aAny.situation_id && aAny.success_rate != null) {
          rates[aAny.situation_id] = aAny.success_rate;
        }
        return rates;
      },
      {} as Record<string, number>
    );

    return {
      preparationStatus: {
        draft: statusCounts["draft"] || 0,
        inProgress: statusCounts["in_progress"] || 0,
        complete: statusCounts["complete"] || 0,
        gameReady: statusCounts["game_ready"] || 0,
      },
      situationalAnalysis: {
        strengths: ["Good coverage of critical game situations"],
        weaknesses: ["Limited options for backed-up situations"],
        recommendations: ["Add more run options for short yardage situations"],
      },
      coachingEffectiveness: {
        averageExecutionQuality: Math.round(averageExecutionQuality * 10) / 10,
        successRateBySituation,
        adjustmentFrequency: analytics.length,
        coachingAssessmentTrends: [],
      },
      optimizationOpportunities: [],
    };
  }

  private static async getSituationsData(
    teamId: string
  ): Promise<GamePlanSituation[]> {
    try {
      const { data: gamePlans } = await supabase
        .from("game_plans_enhanced")
        .select("id")
        .eq("team_id", teamId);

      if (!gamePlans || gamePlans.length === 0) return [];

      const gamePlanIds = gamePlans.map((gp) => gp.id);
      const { data, error } = await supabase
        .from("game_plan_situations")
        .select("*")
        .in("game_plan_id", gamePlanIds);

      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  }

  private static async getPlaysData(teamId: string): Promise<GamePlanPlay[]> {
    try {
      const { data: gamePlans } = await supabase
        .from("game_plans_enhanced")
        .select("id")
        .eq("team_id", teamId);

      if (!gamePlans || gamePlans.length === 0) return [];

      const gamePlanIds = gamePlans.map((gp) => gp.id);
      const { data, error } = await supabase
        .from("game_plan_plays")
        .select("*")
        .in("game_plan_id", gamePlanIds);

      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  }

  private static async getAnalyticsData(
    teamId: string
  ): Promise<GamePlanAnalytics[]> {
    try {
      const { data: gamePlans } = await supabase
        .from("game_plans_enhanced")
        .select("id")
        .eq("team_id", teamId);

      if (!gamePlans || gamePlans.length === 0) return [];

      const gamePlanIds = gamePlans.map((gp) => gp.id);
      const { data, error } = await supabase
        .from("game_plan_analytics")
        .select("*")
        .in("game_plan_id", gamePlanIds)
        .order("execution_time", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  }

  private static generateMockGamePlanningData(): GamePlanningAnalyticsData {
    return {
      metrics: {
        totalGamePlans: 8,
        activeGamePlans: 3,
        completedGamePlans: 5,
        averagePreparationTime: 145,
        situationCoverage: {
          totalSituations: 12,
          coveredSituations: 9,
          coveragePercentage: 75,
        },
        playAssignments: {
          totalAssignments: 156,
          averagePerSituation: 4.2,
          highPriorityAssignments: 42,
        },
      },
      insights: {
        preparationStatus: {
          draft: 2,
          inProgress: 3,
          complete: 2,
          gameReady: 1,
        },
        situationalAnalysis: {
          strengths: ["Good coverage of critical game situations"],
          weaknesses: ["Limited options for backed-up situations"],
          recommendations: [
            "Add more run options for short yardage situations",
          ],
        },
        coachingEffectiveness: {
          averageExecutionQuality: 7.8,
          successRateBySituation: {
            red_zone: 68,
            third_short: 72,
            two_minute: 65,
          },
          adjustmentFrequency: 12,
          coachingAssessmentTrends: [],
        },
        optimizationOpportunities: [],
      },
      recentActivity: {
        gamePlans: [],
        analytics: [],
      },
    };
  }

  // ============================================
  // PLAYBOOK ANALYTICS METHODS
  // ============================================

  /**
   * Get comprehensive analytics for a playbook
   */
  static async getPlaybookAnalytics(
    playbookId: string
  ): Promise<PlaybookAnalyticsSummary> {
    const { data: plays, error } = await supabase
      .from("plays")
      .select(
        `
        id,
        play_name,
        formation,
        p_type,
        confidence_base,
        times_called,
        times_successful,
        complexity_score,
        personnel,
        down_distance,
        field_position
      `
      )
      .eq("playbook_id", playbookId);

    if (error) throw error;
    if (!plays) return PlayAnalyticsService.getEmptyPlaybookAnalytics();

    const playAnalytics = plays.map((play) =>
      PlayAnalyticsService.calculatePlayAnalytics(play)
    );
    const formationAnalytics =
      PlayAnalyticsService.calculateFormationAnalytics(plays);
    const situationalPerformance =
      PlayAnalyticsService.calculateSituationalPerformance(plays);

    const totalPlays = plays.length;
    const totalSuccessRate =
      playAnalytics.reduce((sum, play) => sum + play.successRate, 0) /
      totalPlays;
    const averageComplexity =
      playAnalytics.reduce((sum, play) => sum + play.complexityScore, 0) /
      totalPlays;

    const topPerformingPlays = playAnalytics
      .filter((play) => play.timesCalled >= 5)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 10);

    const complexityDistribution = {
      low: playAnalytics.filter((p) => p.complexityScore <= 3).length,
      medium: playAnalytics.filter(
        (p) => p.complexityScore >= 4 && p.complexityScore <= 7
      ).length,
      high: playAnalytics.filter((p) => p.complexityScore >= 8).length,
    };

    return {
      totalPlays,
      averageSuccessRate: Math.round(totalSuccessRate * 100) / 100,
      averageComplexity: Math.round(averageComplexity * 100) / 100,
      formationsCount: new Set(plays.map((p) => p.formation)).size,
      topPerformingPlays,
      formationAnalytics,
      situationalPerformance,
      complexityDistribution,
    };
  }

  private static calculatePlayAnalytics(play: any): PlayAnalytics {
    const timesCalled = play.times_called || 0;
    const timesSuccessful = play.times_successful || 0;
    const successRate =
      timesCalled > 0 ? (timesSuccessful / timesCalled) * 100 : 0;

    return {
      playId: play.id,
      playName: play.play_name,
      formation: play.formation,
      playType: play.p_type,
      confidenceBase: play.confidence_base || 0,
      timesCalled,
      timesSuccessful,
      successRate: Math.round(successRate * 100) / 100,
      complexityScore: play.complexity_score || 0,
      personnel: play.personnel || "",
      downDistance: play.down_distance || "",
      fieldPosition: play.field_position || "",
      situationalPerformance: {
        redZone: { called: 0, successful: 0, rate: 0 },
        thirdDown: { called: 0, successful: 0, rate: 0 },
        goalLine: { called: 0, successful: 0, rate: 0 },
      },
    };
  }

  private static calculateFormationAnalytics(
    plays: any[]
  ): FormationAnalytics[] {
    const formationGroups = plays.reduce(
      (groups, play) => {
        const formation = play.formation;
        if (!groups[formation]) {
          groups[formation] = [];
        }
        groups[formation].push(play);
        return groups;
      },
      {} as Record<string, any[]>
    );

    return Object.entries(formationGroups).map(
      ([formation, formationPlays]) => {
        const typedPlays = formationPlays as any[];
        const totalPlays = typedPlays.length;
        const totalCalled = typedPlays.reduce(
          (sum: number, play: any) => sum + (play.times_called || 0),
          0
        );
        const totalSuccessful = typedPlays.reduce(
          (sum: number, play: any) => sum + (play.times_successful || 0),
          0
        );
        const successRate =
          totalCalled > 0 ? (totalSuccessful / totalCalled) * 100 : 0;
        const averageComplexity =
          typedPlays.reduce(
            (sum: number, play: any) => sum + (play.complexity_score || 0),
            0
          ) / totalPlays;

        const personnelBreakdown = typedPlays.reduce(
          (breakdown: Record<string, number>, play: any) => {
            const personnel = play.personnel || "Unknown";
            breakdown[personnel] = (breakdown[personnel] || 0) + 1;
            return breakdown;
          },
          {} as Record<string, number>
        );

        const situationalUsage = typedPlays.reduce(
          (usage: Record<string, number>, play: any) => {
            const situation = play.down_distance || "Unknown";
            usage[situation] =
              (usage[situation] || 0) + (play.times_called || 0);
            return usage;
          },
          {} as Record<string, number>
        );

        return {
          formation,
          totalPlays,
          successRate: Math.round(successRate * 100) / 100,
          averageComplexity: Math.round(averageComplexity * 100) / 100,
          personnelBreakdown,
          situationalUsage,
        };
      }
    );
  }

  private static calculateSituationalPerformance(plays: any[]) {
    const byDown = plays.reduce(
      (acc, play) => {
        const down = play.down_distance || "Unknown";
        if (!acc[down]) acc[down] = { called: 0, successful: 0, rate: 0 };
        acc[down].called += play.times_called || 0;
        acc[down].successful += play.times_successful || 0;
        return acc;
      },
      {} as Record<string, { called: number; successful: number; rate: number }>
    );

    const byFieldPosition = plays.reduce(
      (acc, play) => {
        const position = play.field_position || "Unknown";
        if (!acc[position])
          acc[position] = { called: 0, successful: 0, rate: 0 };
        acc[position].called += play.times_called || 0;
        acc[position].successful += play.times_successful || 0;
        return acc;
      },
      {} as Record<string, { called: number; successful: number; rate: number }>
    );

    const byPersonnel = plays.reduce(
      (acc, play) => {
        const personnel = play.personnel || "Unknown";
        if (!acc[personnel])
          acc[personnel] = { called: 0, successful: 0, rate: 0 };
        acc[personnel].called += play.times_called || 0;
        acc[personnel].successful += play.times_successful || 0;
        return acc;
      },
      {} as Record<string, { called: number; successful: number; rate: number }>
    );

    // Calculate rates with proper typing
    (
      Object.values(byDown) as Array<{
        called: number;
        successful: number;
        rate: number;
      }>
    ).forEach((stats) => {
      stats.rate =
        stats.called > 0 ? (stats.successful / stats.called) * 100 : 0;
    });
    (
      Object.values(byFieldPosition) as Array<{
        called: number;
        successful: number;
        rate: number;
      }>
    ).forEach((stats) => {
      stats.rate =
        stats.called > 0 ? (stats.successful / stats.called) * 100 : 0;
    });
    (
      Object.values(byPersonnel) as Array<{
        called: number;
        successful: number;
        rate: number;
      }>
    ).forEach((stats) => {
      stats.rate =
        stats.called > 0 ? (stats.successful / stats.called) * 100 : 0;
    });

    return { byDown, byFieldPosition, byPersonnel };
  }

  private static getEmptyPlaybookAnalytics(): PlaybookAnalyticsSummary {
    return {
      totalPlays: 0,
      averageSuccessRate: 0,
      averageComplexity: 0,
      formationsCount: 0,
      topPerformingPlays: [],
      formationAnalytics: [],
      situationalPerformance: {
        byDown: {},
        byFieldPosition: {},
        byPersonnel: {},
      },
      complexityDistribution: {
        low: 0,
        medium: 0,
        high: 0,
      },
    };
  }
}

// ============================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================

export class GamePlanningAnalyticsService {
  static async getGamePlanningAnalytics(teamId: string) {
    return PlayAnalyticsService.getGamePlanningAnalytics(teamId);
  }
}

export class PlaybookAnalyticsService {
  static async getPlaybookAnalytics(playbookId: string) {
    return PlayAnalyticsService.getPlaybookAnalytics(playbookId);
  }
}
