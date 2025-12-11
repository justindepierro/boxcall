/**
 * Execution Tracking Service
 * Manages play execution logging and retrieval
 * Supports both practice and game sessions
 */

// TODO: Regenerate Supabase types for new tables (practice_sessions, game_sessions, play_executions)

import { supabase } from "../lib/supabase";
import { getCurrentUserId } from "../lib/auth-helpers";
import type {
  PlayExecution,
  CreatePlayExecutionData,
  ExecutionFilters,
  ExecutionStats,
  PracticeSession,
  GameSession,
  CreatePracticeSessionData,
  CreateGameSessionData,
  UpdateSessionData,
} from "../types/session";

export class ExecutionTrackingService {
  // ================================================
  // PRACTICE SESSION CRUD
  // ================================================

  static async createPracticeSession(
    data: CreatePracticeSessionData
  ): Promise<PracticeSession> {
    const { data: session, error } = await supabase
      .from("practice_sessions")
      .insert({
        team_id: data.teamId,
        name: data.name,
        practice_script_id: data.practiceScriptId,
        session_type: data.sessionMode === "live" ? "practice" : "walkthrough",
        status: "active",
        started_at: data.startedAt?.toISOString() || new Date().toISOString(),
        notes: data.notes,
        created_by: getCurrentUserId(),
      })
      .select()
      .single();

    if (error)
      throw new Error(`Failed to create practice session: ${error.message}`);

    return this.mapPracticeSession(session);
  }

  static async getPracticeSession(sessionId: string): Promise<PracticeSession> {
    const { data: session, error } = await supabase
      .from("practice_sessions")
      .select(
        `
        *,
        practice_scripts (
          id,
          title,
          description
        )
      `
      )
      .eq("id", sessionId)
      .single();

    if (error)
      throw new Error(`Failed to get practice session: ${error.message}`);

    return this.mapPracticeSession(session);
  }

  static async getPracticeSessions(
    teamId: string,
    filters?: { limit?: number; offset?: number; isArchived?: boolean }
  ): Promise<PracticeSession[]> {
    let query = supabase
      .from("practice_sessions")
      .select("*")
      .eq("team_id", teamId)
      .order("session_date", { ascending: false });

    if (filters?.isArchived !== undefined) {
      query = query.eq("is_archived", filters.isArchived);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 10) - 1
      );
    }

    const { data: sessions, error } = await query;

    if (error)
      throw new Error(`Failed to get practice sessions: ${error.message}`);

    return sessions.map(this.mapPracticeSession);
  }

  static async updatePracticeSession(
    sessionId: string,
    updates: UpdateSessionData
  ): Promise<void> {
    const { error } = await supabase
      .from("practice_sessions")
      .update({
        ended_at: updates.endedAt?.toISOString(),
        notes: updates.notes,
        weather: updates.weather,
        field_conditions: updates.fieldConditions,
        is_archived: updates.isArchived,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (error)
      throw new Error(`Failed to update practice session: ${error.message}`);
  }

  static async deletePracticeSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from("practice_sessions")
      .delete()
      .eq("id", sessionId);

    if (error)
      throw new Error(`Failed to delete practice session: ${error.message}`);
  }

  // ================================================
  // GAME SESSION CRUD
  // ================================================

  static async createGameSession(
    data: CreateGameSessionData
  ): Promise<GameSession> {
    const { data: session, error } = await supabase
      .from("game_sessions")
      .insert({
        team_id: data.teamId,
        game_plan_id: data.gamePlanId,
        session_mode: data.sessionMode,
        game_date: data.gameDate.toISOString().split("T")[0],
        opponent: data.opponent,
        is_home_game: data.isHomeGame,
        started_at: data.startedAt?.toISOString() || new Date().toISOString(),
        notes: data.notes,
        weather: data.weather,
        field_conditions: data.fieldConditions,
        recorded_by: getCurrentUserId(),
      })
      .select()
      .single();

    if (error)
      throw new Error(`Failed to create game session: ${error.message}`);

    return this.mapGameSession(session);
  }

  static async getGameSession(sessionId: string): Promise<GameSession> {
    const { data: session, error } = await supabase
      .from("game_sessions")
      .select(
        `
        *,
        game_plans (
          id,
          opponent,
          game_date,
          venue
        )
      `
      )
      .eq("id", sessionId)
      .single();

    if (error) throw new Error(`Failed to get game session: ${error.message}`);

    return this.mapGameSession(session);
  }

  static async getGameSessions(
    teamId: string,
    filters?: { limit?: number; offset?: number; isArchived?: boolean }
  ): Promise<GameSession[]> {
    let query = supabase
      .from("game_sessions")
      .select("*")
      .eq("team_id", teamId)
      .order("game_date", { ascending: false });

    if (filters?.isArchived !== undefined) {
      query = query.eq("is_archived", filters.isArchived);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 10) - 1
      );
    }

    const { data: sessions, error } = await query;

    if (error) throw new Error(`Failed to get game sessions: ${error.message}`);

    return sessions.map(this.mapGameSession);
  }

  static async updateGameSession(
    sessionId: string,
    updates: UpdateSessionData
  ): Promise<void> {
    const { error } = await supabase
      .from("game_sessions")
      .update({
        ended_at: updates.endedAt?.toISOString(),
        team_score: updates.teamScore,
        opponent_score: updates.opponentScore,
        notes: updates.notes,
        weather: updates.weather,
        field_conditions: updates.fieldConditions,
        is_archived: updates.isArchived,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (error)
      throw new Error(`Failed to update game session: ${error.message}`);
  }

  static async deleteGameSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from("game_sessions")
      .delete()
      .eq("id", sessionId);

    if (error)
      throw new Error(`Failed to delete game session: ${error.message}`);
  }

  // ================================================
  // PLAY EXECUTION CRUD
  // ================================================

  static async logExecution(
    data: CreatePlayExecutionData
  ): Promise<PlayExecution> {
    const { data: execution, error } = await supabase
      .from("play_executions")
      .insert({
        practice_session_id: data.practiceSessionId,
        game_session_id: data.gameSessionId,
        play_id: data.playId,
        formation_id: data.formationId,
        result: data.result,
        yards_gained: data.yardsGained,
        quarter: data.quarter,
        time_remaining: data.timeRemaining,
        down: data.down,
        distance: data.distance,
        yard_line: data.yardLine,
        hash_mark: data.hashMark,
        opponent_coverage: data.opponentCoverage, // Phase 13.2
        rep_number: data.repNumber,
        was_touchdown: data.wasTouchdown || false,
        was_turnover: data.wasTurnover || false,
        was_penalty: data.wasPenalty || false,
        penalty_yards: data.penaltyYards,
        notes: data.notes,
        quick_tags: data.quickTags,
        executed_at: data.executedAt?.toISOString() || new Date().toISOString(),
        team_id: data.teamId,
        recorded_by: getCurrentUserId(),
        recorded_mode: data.recordedMode,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to log execution: ${error.message}`);

    return this.mapExecution(execution);
  }

  static async bulkLogExecutions(
    executions: CreatePlayExecutionData[]
  ): Promise<PlayExecution[]> {
    const userId = getCurrentUserId();

    const { data, error } = await supabase
      .from("play_executions")
      .insert(
        executions.map((e) => ({
          practice_session_id: e.practiceSessionId,
          game_session_id: e.gameSessionId,
          play_id: e.playId,
          formation_id: e.formationId,
          result: e.result,
          yards_gained: e.yardsGained,
          quarter: e.quarter,
          time_remaining: e.timeRemaining,
          down: e.down,
          distance: e.distance,
          yard_line: e.yardLine,
          hash_mark: e.hashMark,
          opponent_coverage: e.opponentCoverage, // Phase 13.2
          rep_number: e.repNumber,
          was_touchdown: e.wasTouchdown || false,
          was_turnover: e.wasTurnover || false,
          was_penalty: e.wasPenalty || false,
          penalty_yards: e.penaltyYards,
          notes: e.notes,
          quick_tags: e.quickTags,
          executed_at: e.executedAt?.toISOString() || new Date().toISOString(),
          team_id: e.teamId,
          recorded_by: userId,
          recorded_mode: e.recordedMode,
        }))
      )
      .select();

    if (error)
      throw new Error(`Failed to bulk log executions: ${error.message}`);

    return data.map(this.mapExecution);
  }

  static async getExecutions(
    filters: ExecutionFilters
  ): Promise<PlayExecution[]> {
    let query = supabase
      .from("play_executions")
      .select(
        `
        *,
        plays (*),
        formations (*)
      `
      )
      .order("executed_at", { ascending: false });

    if (filters.playId) {
      query = query.eq("play_id", filters.playId);
    }

    if (filters.formationId) {
      query = query.eq("formation_id", filters.formationId);
    }

    if (filters.result) {
      query = query.eq("result", filters.result);
    }

    if (filters.sessionId) {
      query = query.or(
        `practice_session_id.eq.${filters.sessionId},game_session_id.eq.${filters.sessionId}`
      );
    }

    if (filters.startDate) {
      query = query.gte("executed_at", filters.startDate.toISOString());
    }

    if (filters.endDate) {
      query = query.lte("executed_at", filters.endDate.toISOString());
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 10) - 1
      );
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to get executions: ${error.message}`);

    return data.map(this.mapExecution);
  }

  static async updateExecution(
    executionId: string,
    updates: Partial<PlayExecution>
  ): Promise<void> {
    const { error } = await supabase
      .from("play_executions")
      .update({
        result: updates.result,
        yards_gained: updates.yardsGained,
        notes: updates.notes,
        quick_tags: updates.quickTags,
        opponent_coverage: updates.opponentCoverage, // Phase 13.2
        was_touchdown: updates.wasTouchdown,
        was_turnover: updates.wasTurnover,
        was_penalty: updates.wasPenalty,
        penalty_yards: updates.penaltyYards,
      })
      .eq("id", executionId);

    if (error) throw new Error(`Failed to update execution: ${error.message}`);
  }

  static async deleteExecution(executionId: string): Promise<void> {
    const { error } = await supabase
      .from("play_executions")
      .delete()
      .eq("id", executionId);

    if (error) throw new Error(`Failed to delete execution: ${error.message}`);
  }

  // ================================================
  // ANALYTICS
  // ================================================

  static async getPlayStats(
    playId: string,
    teamId: string
  ): Promise<ExecutionStats> {
    const { data, error } = await supabase
      .from("play_executions")
      .select("*")
      .eq("play_id", playId)
      .eq("team_id", teamId);

    if (error) throw new Error(`Failed to get play stats: ${error.message}`);

    const totalExecutions = data.length;
    const successfulExecutions = data.filter(
      (e) => e.result === "success"
    ).length;
    const failedExecutions = data.filter((e) => e.result === "failure").length;
    const neutralExecutions = data.filter((e) => e.result === "neutral").length;
    const successRate =
      totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;
    const avgYardsGained =
      data.length > 0
        ? data.reduce((sum, e) => sum + (e.yards_gained || 0), 0) / data.length
        : 0;
    const touchdowns = data.filter((e) => e.was_touchdown).length;
    const turnovers = data.filter((e) => e.was_turnover).length;
    const lastExecuted =
      data.length > 0 ? new Date(data[0].executed_at) : undefined;

    return {
      playId,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      neutralExecutions,
      successRate,
      avgYardsGained,
      touchdowns,
      turnovers,
      lastExecuted,
    };
  }

  /**
   * Phase 13.2: Get coverage-specific stats for a play
   */
  static async getCoverageStats(
    playId: string,
    teamId: string,
    coverage: string
  ): Promise<{
    successRate: number;
    avgYardsGained: number;
    executionCount: number;
  }> {
    const { data, error } = await supabase
      .from("play_executions")
      .select("*")
      .eq("play_id", playId)
      .eq("team_id", teamId)
      .eq("opponent_coverage", coverage);

    if (error)
      throw new Error(`Failed to get coverage stats: ${error.message}`);

    const executionCount = data.length;
    const successfulExecutions = data.filter(
      (e) => e.result === "success"
    ).length;
    const successRate =
      executionCount > 0 ? (successfulExecutions / executionCount) * 100 : 0;
    const avgYardsGained =
      executionCount > 0
        ? data.reduce((sum, e) => sum + (e.yards_gained || 0), 0) /
          executionCount
        : 0;

    return {
      successRate,
      avgYardsGained,
      executionCount,
    };
  }

  /**
   * Phase 13.3: Get hash-specific stats for a play
   */
  static async getHashStats(
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
  }> {
    const { data, error } = await supabase
      .from("play_executions")
      .select("*")
      .eq("play_id", playId)
      .eq("team_id", teamId)
      .not("hash_mark", "is", null);

    if (error) throw new Error(`Failed to get hash stats: ${error.message}`);

    const executions = data as any[];

    // Calculate stats for each hash
    const hashStats = {
      left: this.calculateHashMetrics(
        executions.filter((e) => e.hash_mark === "left")
      ),
      middle: this.calculateHashMetrics(
        executions.filter((e) => e.hash_mark === "middle")
      ),
      right: this.calculateHashMetrics(
        executions.filter((e) => e.hash_mark === "right")
      ),
    };

    // Determine best hash (minimum 3 executions required)
    let bestHash: "left" | "middle" | "right" | undefined;
    let bestSuccessRate = 0;

    (["left", "middle", "right"] as const).forEach((hash) => {
      if (
        hashStats[hash].executionCount >= 3 &&
        hashStats[hash].successRate > bestSuccessRate
      ) {
        bestSuccessRate = hashStats[hash].successRate;
        bestHash = hash;
      }
    });

    return {
      ...hashStats,
      bestHash,
    };
  }

  /**
   * Helper: Calculate metrics for hash data
   */
  private static calculateHashMetrics(data: any[]): {
    successRate: number;
    avgYardsGained: number;
    executionCount: number;
  } {
    const executionCount = data.length;
    const successfulExecutions = data.filter(
      (e) => e.result === "success"
    ).length;
    const successRate =
      executionCount > 0 ? (successfulExecutions / executionCount) * 100 : 0;
    const avgYardsGained =
      executionCount > 0
        ? data.reduce((sum, e) => sum + (e.yards_gained || 0), 0) /
          executionCount
        : 0;

    return {
      successRate,
      avgYardsGained,
      executionCount,
    };
  }

  // ================================================
  // RECENT SESSIONS (Combined Practice + Game)
  // ================================================

  /**
   * Get recent sessions (both practice and game) for the team
   * Returns combined list sorted by most recent first
   *
   * NOTE: Uses supabase directly because practice_sessions/game_sessions tables
   * are not yet in the TypeScript database types. Will migrate when types are updated.
   */
  static async getRecentSessions(
    teamId: string,
    limit: number = 5
  ): Promise<Array<PracticeSession | GameSession>> {
    // Use supabase directly - these tables aren't in our typed schema yet
    const [practiceResult, gameResult] = await Promise.allSettled([
      supabase
        .from("practice_sessions")
        .select(
          `
          *,
          practice_scripts (id, title)
        `
        )
        .eq("team_id", teamId)
        .eq("is_archived", false)
        .order("session_date", { ascending: false })
        .limit(limit),
      supabase
        .from("game_sessions")
        .select(
          `
          *,
          game_plans (id, opponent)
        `
        )
        .eq("team_id", teamId)
        .eq("is_archived", false)
        .order("game_date", { ascending: false })
        .limit(limit),
    ]);

    const sessions: Array<PracticeSession | GameSession> = [];

    // Process practice sessions
    if (practiceResult.status === "fulfilled" && practiceResult.value.data) {
      sessions.push(...practiceResult.value.data.map(this.mapPracticeSession));
    }

    // Process game sessions
    if (gameResult.status === "fulfilled" && gameResult.value.data) {
      sessions.push(...gameResult.value.data.map(this.mapGameSession));
    }

    // Sort by most recent date and limit
    return sessions
      .sort((a, b) => {
        const dateA = a.type === "practice" ? a.sessionDate : a.gameDate;
        const dateB = b.type === "practice" ? b.sessionDate : b.gameDate;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
      .slice(0, limit);
  }

  // ================================================
  // MAPPING FUNCTIONS
  // ================================================

  private static mapPracticeSession(data: any): PracticeSession {
    return {
      type: "practice",
      id: data.id,
      teamId: data.team_id,
      practiceScriptId: data.practice_script_id,
      sessionMode: data.session_mode,
      sessionDate: new Date(data.session_date),
      startedAt: new Date(data.started_at),
      endedAt: data.ended_at ? new Date(data.ended_at) : undefined,
      durationMinutes: data.duration_minutes,
      totalPlays: data.total_plays,
      totalReps: data.total_reps,
      completedReps: data.completed_reps,
      successfulReps: data.successful_reps,
      failedReps: data.failed_reps,
      neutralReps: data.neutral_reps,
      successRate: data.success_rate,
      notes: data.notes,
      weather: data.weather,
      fieldConditions: data.field_conditions,
      recordedBy: data.recorded_by,
      isArchived: data.is_archived,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private static mapGameSession(data: any): GameSession {
    return {
      type: "game",
      id: data.id,
      teamId: data.team_id,
      gamePlanId: data.game_plan_id,
      sessionMode: data.session_mode,
      gameDate: new Date(data.game_date),
      opponent: data.opponent,
      isHomeGame: data.is_home_game,
      startedAt: new Date(data.started_at),
      endedAt: data.ended_at ? new Date(data.ended_at) : undefined,
      teamScore: data.team_score,
      opponentScore: data.opponent_score,
      totalPlays: data.total_plays,
      successfulPlays: data.successful_plays,
      failedPlays: data.failed_plays,
      neutralPlays: data.neutral_plays,
      successRate: data.success_rate,
      totalYards: data.total_yards,
      totalTouchdowns: data.total_touchdowns,
      totalTurnovers: data.total_turnovers,
      notes: data.notes,
      weather: data.weather,
      fieldConditions: data.field_conditions,
      recordedBy: data.recorded_by,
      isArchived: data.is_archived,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private static mapExecution(data: any): PlayExecution {
    return {
      id: data.id,
      practiceSessionId: data.practice_session_id,
      gameSessionId: data.game_session_id,
      playId: data.play_id,
      formationId: data.formation_id,
      result: data.result,
      yardsGained: data.yards_gained,
      quarter: data.quarter,
      timeRemaining: data.time_remaining,
      down: data.down,
      distance: data.distance,
      yardLine: data.yard_line,
      hashMark: data.hash_mark,
      opponentCoverage: data.opponent_coverage, // Phase 13.2
      repNumber: data.rep_number,
      wasTouchdown: data.was_touchdown,
      wasTurnover: data.was_turnover,
      wasPenalty: data.was_penalty,
      penaltyYards: data.penalty_yards,
      notes: data.notes,
      quickTags: data.quick_tags,
      confidenceBefore: data.confidence_before,
      confidenceAfter: data.confidence_after,
      executedAt: new Date(data.executed_at),
      teamId: data.team_id,
      recordedBy: data.recorded_by,
      recordedMode: data.recorded_mode,
      createdAt: new Date(data.created_at),
      play: data.plays,
      formation: data.formations,
    };
  }
}
