import { fromAny, table } from "../data/supabase/db";
import { TeamSituationDefinitionsService } from "./teamSituationDefinitionsService";
import type { SituationDefinitions } from "../types/situationDefinitions";
import {
  bucketFieldZoneKey,
  getFieldZoneDefinitions,
} from "../utils/situationBucketing";

/**
 * Session Analytics Service - Phase 14.1
 * Provides comprehensive analytics for game and practice sessions
 */

export interface SessionAnalytics {
  sessionId: string;
  sessionType: "game" | "practice";
  date: string;
  opponent?: string;

  // Overall stats
  totalPlays: number;
  successRate: number;
  avgYardsPerPlay: number;
  totalYards: number;

  // Breakdown by down/distance
  byDown: {
    down: number;
    attempts: number;
    successes: number;
    successRate: number;
    avgYards: number;
  }[];

  // Play type distribution
  byPlayType: {
    type: string;
    count: number;
    percentage: number;
    successRate: number;
    avgYards: number;
  }[];

  // Formation effectiveness
  byFormation: {
    formationName: string;
    attempts: number;
    successRate: number;
    avgYards: number;
  }[];

  // Coverage performance (Phase 13)
  byCoverage: {
    coverage: string;
    attempts: number;
    successRate: number;
    avgYards: number;
  }[];

  // Hash success (Phase 13)
  byHash: {
    hash: "left" | "middle" | "right";
    attempts: number;
    successRate: number;
    avgYards: number;
  }[];

  // Timeline data
  timeline: {
    playNumber: number;
    yardsGained: number;
    runningAverage: number;
    quarter?: number;
    time?: string;
  }[];

  // Field position zones
  byFieldZone: {
    zone: string;
    yardLine: number;
    attempts: number;
    successRate: number;
    avgYards: number;
  }[];
}

export interface PlayTrendData {
  date: string;
  confidence: number;
  executions: number;
  successRate: number;
  avgYards: number;
}

export interface FormationTrendData {
  date: string;
  formationName: string;
  avgConfidence: number;
  totalPlays: number;
  successRate: number;
}

export class SessionAnalyticsService {
  /**
   * Get comprehensive analytics for a session
   */
  static async getSessionAnalytics(
    sessionId: string
  ): Promise<SessionAnalytics> {
    const { data: session, error: sessionError } = await fromAny(
      "live_sessions"
    )
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError) throw sessionError;
    if (!session) throw new Error("Session not found");

    const { data: executions, error: execError } = await table(
      "play_executions"
    )
      .select(
        `
        *,
        plays!inner (
          name,
          play_type,
          formations!inner (name)
        )
      `
      )
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (execError) throw execError;
    if (!executions || executions.length === 0) {
      return this.getEmptyAnalytics(sessionId, session);
    }

    // Calculate overall stats
    const totalPlays = executions.length;
    const successCount = executions.filter(
      (e) => e.result === "success"
    ).length;
    const successRate = (successCount / totalPlays) * 100;
    const totalYards = executions.reduce(
      (sum, e) => sum + (e.yards_gained || 0),
      0
    );
    const avgYardsPerPlay = totalYards / totalPlays;

    // Calculate by down
    const byDown = this.calculateByDown(executions);

    // Calculate by play type
    const byPlayType = this.calculateByPlayType(executions);

    // Calculate by formation
    const byFormation = this.calculateByFormation(executions);

    // Calculate by coverage (Phase 13)
    const byCoverage = this.calculateByCoverage(executions);

    // Calculate by hash (Phase 13)
    const byHash = this.calculateByHash(executions);

    // Calculate timeline
    const timeline = this.calculateTimeline(executions);

    // Calculate by field zone
    let teamDefs: SituationDefinitions | null = null;
    try {
      const inferredTeamId = (executions[0] as any)?.team_id as
        | string
        | undefined;
      if (inferredTeamId) {
        teamDefs = await TeamSituationDefinitionsService.get(inferredTeamId);
      }
    } catch {
      teamDefs = null;
    }

    const byFieldZone = this.calculateByFieldZone(executions, teamDefs);

    return {
      sessionId,
      sessionType: session.session_type as "game" | "practice",
      date: session.created_at ?? new Date().toISOString(),
      opponent: session.opponent ?? undefined,
      totalPlays,
      successRate: Math.round(successRate * 10) / 10,
      avgYardsPerPlay: Math.round(avgYardsPerPlay * 10) / 10,
      totalYards,
      byDown,
      byPlayType,
      byFormation,
      byCoverage,
      byHash,
      timeline,
      byFieldZone,
    };
  }

  /**
   * Get play confidence trend over time
   */
  static async getPlayTrend(
    playId: string,
    teamId: string,
    startDate?: string,
    endDate?: string
  ): Promise<PlayTrendData[]> {
    let query = table("play_executions")
      .select(
        `
        created_at,
        result,
        yards_gained,
        plays!inner (id, team_id)
      `
      )
      .eq("play_id", playId)
      .eq("plays.team_id", teamId)
      .order("created_at", { ascending: true });

    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Group by week
    const weeklyData = this.groupByWeek(data);

    return weeklyData.map((week) => ({
      date: week.weekStart,
      confidence: week.successRate, // Simplified - could integrate with PlayConfidenceService
      executions: week.count,
      successRate: week.successRate,
      avgYards: week.avgYards,
    }));
  }

  /**
   * Get formation trend over time
   */
  static async getFormationTrend(
    formationId: string,
    teamId: string,
    startDate?: string,
    endDate?: string
  ): Promise<FormationTrendData[]> {
    let query = table("play_executions")
      .select(
        `
        created_at,
        result,
        plays!inner (
          formation_id,
          formations!inner (id, name, team_id)
        )
      `
      )
      .eq("plays.formation_id", formationId)
      .eq("plays.formations.team_id", teamId)
      .order("created_at", { ascending: true });

    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Group by week
    const weeklyData = this.groupByWeek(data);

    return weeklyData.map((week) => ({
      date: week.weekStart,
      formationName: (data[0] as any).plays.formations.name,
      avgConfidence: week.successRate,
      totalPlays: week.count,
      successRate: week.successRate,
    }));
  }

  // Helper methods

  private static calculateByDown(executions: any[]) {
    const downStats = [1, 2, 3, 4].map((down) => {
      const downExecs = executions.filter((e) => e.down === down);
      const successes = downExecs.filter((e) => e.result === "success").length;
      const totalYards = downExecs.reduce(
        (sum, e) => sum + (e.yards_gained || 0),
        0
      );

      return {
        down,
        attempts: downExecs.length,
        successes,
        successRate:
          downExecs.length > 0
            ? Math.round((successes / downExecs.length) * 1000) / 10
            : 0,
        avgYards:
          downExecs.length > 0
            ? Math.round((totalYards / downExecs.length) * 10) / 10
            : 0,
      };
    });

    return downStats.filter((s) => s.attempts > 0);
  }

  private static calculateByPlayType(executions: any[]) {
    const typeMap = new Map<
      string,
      { count: number; successes: number; totalYards: number }
    >();

    executions.forEach((e) => {
      const type = e.plays?.play_type || "Unknown";
      const current = typeMap.get(type) || {
        count: 0,
        successes: 0,
        totalYards: 0,
      };
      typeMap.set(type, {
        count: current.count + 1,
        successes: current.successes + (e.result === "success" ? 1 : 0),
        totalYards: current.totalYards + (e.yards_gained || 0),
      });
    });

    const total = executions.length;
    return Array.from(typeMap.entries())
      .map(([type, stats]) => ({
        type,
        count: stats.count,
        percentage: Math.round((stats.count / total) * 1000) / 10,
        successRate: Math.round((stats.successes / stats.count) * 1000) / 10,
        avgYards: Math.round((stats.totalYards / stats.count) * 10) / 10,
      }))
      .sort((a, b) => b.count - a.count);
  }

  private static calculateByFormation(executions: any[]) {
    const formationMap = new Map<
      string,
      { count: number; successes: number; totalYards: number }
    >();

    executions.forEach((e) => {
      const formation = e.plays?.formations?.name || "Unknown";
      const current = formationMap.get(formation) || {
        count: 0,
        successes: 0,
        totalYards: 0,
      };
      formationMap.set(formation, {
        count: current.count + 1,
        successes: current.successes + (e.result === "success" ? 1 : 0),
        totalYards: current.totalYards + (e.yards_gained || 0),
      });
    });

    return Array.from(formationMap.entries())
      .map(([formationName, stats]) => ({
        formationName,
        attempts: stats.count,
        successRate: Math.round((stats.successes / stats.count) * 1000) / 10,
        avgYards: Math.round((stats.totalYards / stats.count) * 10) / 10,
      }))
      .sort((a, b) => b.attempts - a.attempts);
  }

  private static calculateByCoverage(executions: any[]) {
    const coverageExecs = executions.filter((e) => e.opponent_coverage);
    const coverageMap = new Map<
      string,
      { count: number; successes: number; totalYards: number }
    >();

    coverageExecs.forEach((e) => {
      const coverage = e.opponent_coverage;
      const current = coverageMap.get(coverage) || {
        count: 0,
        successes: 0,
        totalYards: 0,
      };
      coverageMap.set(coverage, {
        count: current.count + 1,
        successes: current.successes + (e.result === "success" ? 1 : 0),
        totalYards: current.totalYards + (e.yards_gained || 0),
      });
    });

    return Array.from(coverageMap.entries())
      .map(([coverage, stats]) => ({
        coverage,
        attempts: stats.count,
        successRate: Math.round((stats.successes / stats.count) * 1000) / 10,
        avgYards: Math.round((stats.totalYards / stats.count) * 10) / 10,
      }))
      .sort((a, b) => b.attempts - a.attempts);
  }

  private static calculateByHash(executions: any[]) {
    const hashExecs = executions.filter((e) => e.hash_mark);
    const hashMap = new Map<
      string,
      { count: number; successes: number; totalYards: number }
    >();

    hashExecs.forEach((e) => {
      const hash = e.hash_mark;
      const current = hashMap.get(hash) || {
        count: 0,
        successes: 0,
        totalYards: 0,
      };
      hashMap.set(hash, {
        count: current.count + 1,
        successes: current.successes + (e.result === "success" ? 1 : 0),
        totalYards: current.totalYards + (e.yards_gained || 0),
      });
    });

    const hashOrder = ["left", "middle", "right"];
    return hashOrder
      .map((hash) => {
        const stats = hashMap.get(hash);
        if (!stats) return null;
        return {
          hash: hash as "left" | "middle" | "right",
          attempts: stats.count,
          successRate: Math.round((stats.successes / stats.count) * 1000) / 10,
          avgYards: Math.round((stats.totalYards / stats.count) * 10) / 10,
        };
      })
      .filter((h) => h !== null) as any[];
  }

  private static calculateTimeline(executions: any[]) {
    let runningTotal = 0;
    return executions.map((e, index) => {
      runningTotal += e.yards_gained || 0;
      const runningAverage = runningTotal / (index + 1);

      return {
        playNumber: index + 1,
        yardsGained: e.yards_gained || 0,
        runningAverage: Math.round(runningAverage * 10) / 10,
        quarter: e.quarter,
        time: e.time_remaining,
      };
    });
  }

  private static calculateByFieldZone(
    executions: any[],
    teamDefs: Partial<SituationDefinitions> | null | undefined
  ) {
    const zoneStats = new Map<
      string,
      { count: number; successes: number; totalYards: number }
    >();

    const zones = getFieldZoneDefinitions(teamDefs);

    for (const e of executions) {
      const yardLine = (e?.yard_line ?? 50) as number;
      const zoneKey = bucketFieldZoneKey(teamDefs, yardLine);
      const key = zoneKey || "unknown";
      const current = zoneStats.get(key) || {
        count: 0,
        successes: 0,
        totalYards: 0,
      };

      zoneStats.set(key, {
        count: current.count + 1,
        successes: current.successes + (e.result === "success" ? 1 : 0),
        totalYards: current.totalYards + (e.yards_gained || 0),
      });
    }

    const ordered = zones
      .map((z) => {
        const stats = zoneStats.get(z.id);
        if (!stats) return null;

        return {
          zone: z.label,
          yardLine: (z.start_yard_line + z.end_yard_line) / 2,
          attempts: stats.count,
          successRate:
            stats.count > 0
              ? Math.round((stats.successes / stats.count) * 1000) / 10
              : 0,
          avgYards:
            stats.count > 0
              ? Math.round((stats.totalYards / stats.count) * 10) / 10
              : 0,
        };
      })
      .filter((z) => z !== null) as any[];

    const unknownStats = zoneStats.get("unknown");
    if (unknownStats) {
      ordered.push({
        zone: "Unknown",
        yardLine: 50,
        attempts: unknownStats.count,
        successRate:
          unknownStats.count > 0
            ? Math.round((unknownStats.successes / unknownStats.count) * 1000) /
              10
            : 0,
        avgYards:
          unknownStats.count > 0
            ? Math.round((unknownStats.totalYards / unknownStats.count) * 10) /
              10
            : 0,
      });
    }

    return ordered;
  }

  private static groupByWeek(data: any[]) {
    const weekMap = new Map<
      string,
      { count: number; successes: number; totalYards: number }
    >();

    data.forEach((item) => {
      const date = new Date(item.created_at);
      const weekStart = this.getWeekStart(date);
      const current = weekMap.get(weekStart) || {
        count: 0,
        successes: 0,
        totalYards: 0,
      };
      weekMap.set(weekStart, {
        count: current.count + 1,
        successes: current.successes + (item.result === "success" ? 1 : 0),
        totalYards: current.totalYards + (item.yards_gained || 0),
      });
    });

    return Array.from(weekMap.entries())
      .map(([weekStart, stats]) => ({
        weekStart,
        count: stats.count,
        successRate: Math.round((stats.successes / stats.count) * 1000) / 10,
        avgYards: Math.round((stats.totalYards / stats.count) * 10) / 10,
      }))
      .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  }

  private static getWeekStart(date: Date): string {
    const day = date.getDay();
    const diff = date.getDate() - day;
    const weekStart = new Date(date.setDate(diff));
    return weekStart.toISOString().split("T")[0];
  }

  private static getEmptyAnalytics(
    sessionId: string,
    session: any
  ): SessionAnalytics {
    return {
      sessionId,
      sessionType: session.session_type as "game" | "practice",
      date: session.created_at,
      opponent: session.opponent,
      totalPlays: 0,
      successRate: 0,
      avgYardsPerPlay: 0,
      totalYards: 0,
      byDown: [],
      byPlayType: [],
      byFormation: [],
      byCoverage: [],
      byHash: [],
      timeline: [],
      byFieldZone: [],
    };
  }
}
