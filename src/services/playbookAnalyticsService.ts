import { supabase } from "../lib/supabase";

/**
 * Advanced Playbook Analytics Service - Phase 4
 * Leverages the rich analytics foundation in the database
 */

interface PlayData {
  id: string;
  play_name: string;
  formation: string;
  p_type: string;
  confidence_base?: number;
  times_called?: number;
  times_successful?: number;
  complexity_score?: number;
  personnel?: string;
  down_distance?: string;
  field_position?: string;
}

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
    byDown: Record<string, { called: number; successful: number; rate: number }>;
    byFieldPosition: Record<string, { called: number; successful: number; rate: number }>;
    byPersonnel: Record<string, { called: number; successful: number; rate: number }>;
  };
  complexityDistribution: {
    low: number; // 1-3
    medium: number; // 4-7
    high: number; // 8-10
  };
}

export class PlaybookAnalyticsService {
  /**
   * Get comprehensive analytics for a playbook
   */
  static async getPlaybookAnalytics(playbookId: string): Promise<PlaybookAnalyticsSummary> {
    // Get all plays with analytics data
    const { data: plays, error } = await supabase
      .from("plays")
      .select(`
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
      `)
      .eq("playbook_id", playbookId);

    if (error) throw error;
    if (!plays) return this.getEmptyAnalytics();

    // Calculate comprehensive analytics
    const playAnalytics = plays.map(play => this.calculatePlayAnalytics(play));
    const formationAnalytics = this.calculateFormationAnalytics(plays);
    const situationalPerformance = this.calculateSituationalPerformance(plays);

    const totalPlays = plays.length;
    const totalSuccessRate = playAnalytics.reduce((sum, play) => sum + play.successRate, 0) / totalPlays;
    const averageComplexity = playAnalytics.reduce((sum, play) => sum + play.complexityScore, 0) / totalPlays;

    // Top performing plays (by success rate, min 5 calls)
    const topPerformingPlays = playAnalytics
      .filter(play => play.timesCalled >= 5)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 10);

    // Complexity distribution
    const complexityDistribution = {
      low: playAnalytics.filter(p => p.complexityScore <= 3).length,
      medium: playAnalytics.filter(p => p.complexityScore >= 4 && p.complexityScore <= 7).length,
      high: playAnalytics.filter(p => p.complexityScore >= 8).length,
    };

    return {
      totalPlays,
      averageSuccessRate: Math.round(totalSuccessRate * 100) / 100,
      averageComplexity: Math.round(averageComplexity * 100) / 100,
      formationsCount: formationAnalytics.length,
      topPerformingPlays,
      formationAnalytics,
      situationalPerformance,
      complexityDistribution,
    };
  }

  /**
   * Get analytics for a specific play
   */
  static async getPlayAnalytics(playId: string): Promise<PlayAnalytics | null> {
    const { data: play, error } = await supabase
      .from("plays")
      .select(`
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
      `)
      .eq("id", playId)
      .single();

    if (error || !play) return null;

    return this.calculatePlayAnalytics(play);
  }

  /**
   * Get formation-based analytics
   */
  static async getFormationAnalytics(playbookId: string): Promise<FormationAnalytics[]> {
    const { data: plays, error } = await supabase
      .from("plays")
      .select("formation, p_type, personnel, down_distance, field_position, times_called, times_successful")
      .eq("playbook_id", playbookId);

    if (error) throw error;

    return this.calculateFormationAnalytics(plays || []);
  }

  /**
   * Calculate analytics for a single play
   */
  private static calculatePlayAnalytics(play: any): PlayAnalytics {
    const timesCalled = play.times_called || 0;
    const timesSuccessful = play.times_successful || 0;
    const successRate = timesCalled > 0 ? (timesSuccessful / timesCalled) * 100 : 0;

    // Calculate situational performance (mock data for now - would come from game results)
    const situationalPerformance = {
      redZone: { called: Math.floor(timesCalled * 0.2), successful: Math.floor(timesSuccessful * 0.25), rate: 0 },
      thirdDown: { called: Math.floor(timesCalled * 0.15), successful: Math.floor(timesSuccessful * 0.18), rate: 0 },
      goalLine: { called: Math.floor(timesCalled * 0.05), successful: Math.floor(timesSuccessful * 0.08), rate: 0 },
    };

    // Calculate rates
    situationalPerformance.redZone.rate = situationalPerformance.redZone.called > 0
      ? (situationalPerformance.redZone.successful / situationalPerformance.redZone.called) * 100 : 0;
    situationalPerformance.thirdDown.rate = situationalPerformance.thirdDown.called > 0
      ? (situationalPerformance.thirdDown.successful / situationalPerformance.thirdDown.called) * 100 : 0;
    situationalPerformance.goalLine.rate = situationalPerformance.goalLine.called > 0
      ? (situationalPerformance.goalLine.successful / situationalPerformance.goalLine.called) * 100 : 0;

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
      situationalPerformance,
    };
  }

  /**
   * Calculate formation-based analytics
   */
  private static calculateFormationAnalytics(plays: any[]): FormationAnalytics[] {
    const formationGroups = plays.reduce((groups, play) => {
      const formation = play.formation;
      if (!groups[formation]) {
        groups[formation] = [];
      }
      groups[formation].push(play);
      return groups;
    }, {} as Record<string, any[]>);

    return Object.entries(formationGroups).map(([formation, formationPlays]) => {
      const typedFormationPlays = formationPlays as any[];
      const totalPlays = typedFormationPlays.length;
      const totalCalled = typedFormationPlays.reduce((sum: number, play: any) => sum + (play.times_called || 0), 0);
      const totalSuccessful = typedFormationPlays.reduce((sum: number, play: any) => sum + (play.times_successful || 0), 0);
      const successRate = totalCalled > 0 ? (totalSuccessful / totalCalled) * 100 : 0;
      const averageComplexity = typedFormationPlays.reduce((sum: number, play: any) => sum + (play.complexity_score || 0), 0) / totalPlays;

      // Personnel breakdown
      const personnelBreakdown = typedFormationPlays.reduce((breakdown: Record<string, number>, play: any) => {
        const personnel = play.personnel || "Unknown";
        breakdown[personnel] = (breakdown[personnel] || 0) + 1;
        return breakdown;
      }, {} as Record<string, number>);

      // Situational usage
      const situationalUsage = typedFormationPlays.reduce((usage: Record<string, number>, play: any) => {
        const situation = play.down_distance || "Unknown";
        usage[situation] = (usage[situation] || 0) + (play.times_called || 0);
        return usage;
      }, {} as Record<string, number>);

      return {
        formation,
        totalPlays,
        successRate: Math.round(successRate * 100) / 100,
        averageComplexity: Math.round(averageComplexity * 100) / 100,
        personnelBreakdown,
        situationalUsage,
      };
    });
  }

  /**
   * Calculate situational performance analytics
   */
  private static calculateSituationalPerformance(plays: any[]) {
    const byDown = plays.reduce((acc, play) => {
      const down = play.down_distance || "Unknown";
      if (!acc[down]) acc[down] = { called: 0, successful: 0, rate: 0 };
      acc[down].called += play.times_called || 0;
      acc[down].successful += play.times_successful || 0;
      return acc;
    }, {} as Record<string, { called: number; successful: number; rate: number }>);

    const byFieldPosition = plays.reduce((acc, play) => {
      const position = play.field_position || "Unknown";
      if (!acc[position]) acc[position] = { called: 0, successful: 0, rate: 0 };
      acc[position].called += play.times_called || 0;
      acc[position].successful += play.times_successful || 0;
      return acc;
    }, {} as Record<string, { called: number; successful: number; rate: number }>);

    const byPersonnel = plays.reduce((acc, play) => {
      const personnel = play.personnel || "Unknown";
      if (!acc[personnel]) acc[personnel] = { called: 0, successful: 0, rate: 0 };
      acc[personnel].called += play.times_called || 0;
      acc[personnel].successful += play.times_successful || 0;
      return acc;
    }, {} as Record<string, { called: number; successful: number; rate: number }>);

    // Calculate rates
    (Object.values(byDown) as { called: number; successful: number; rate: number }[]).forEach(stats => {
      stats.rate = stats.called > 0 ? (stats.successful / stats.called) * 100 : 0;
    });
    (Object.values(byFieldPosition) as { called: number; successful: number; rate: number }[]).forEach(stats => {
      stats.rate = stats.called > 0 ? (stats.successful / stats.called) * 100 : 0;
    });
    (Object.values(byPersonnel) as { called: number; successful: number; rate: number }[]).forEach(stats => {
      stats.rate = stats.called > 0 ? (stats.successful / stats.called) * 100 : 0;
    });

    return { byDown, byFieldPosition, byPersonnel };
  }

  /**
   * Get empty analytics structure
   */
  private static getEmptyAnalytics(): PlaybookAnalyticsSummary {
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