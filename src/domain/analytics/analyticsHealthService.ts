/**
 * Analytics Data Health Service
 * Audit and validate analytics data integrity
 *
 * Use this service to:
 * - Check for orphan executions (play deleted but executions remain)
 * - Identify plays with inconsistent counters
 * - Find sessions with missing context
 * - Validate data quality for coach reports
 */

import { fromAny, table } from "../../data/supabase/db";
import { ANALYTICS_CONSTANTS } from "./analyticsContract";
import { logError, warn } from "../../utils/logger";

// ============================================
// HEALTH CHECK TYPES
// ============================================

export interface HealthCheckResult {
  status: "healthy" | "warnings" | "critical";
  timestamp: string;
  teamId: string;

  // Summary counts
  summary: {
    totalPlays: number;
    totalExecutions: number;
    activeSessions: number;
    archivedSessions: number;
  };

  // Issue categories
  issues: {
    orphanExecutions: OrphanExecutionIssue[];
    counterMismatches: CounterMismatchIssue[];
    missingContext: MissingContextIssue[];
    dataCoverage: DataCoverageIssue[];
  };

  // Recommendations
  recommendations: string[];
}

export interface OrphanExecutionIssue {
  execution_id: string;
  play_id: string;
  executed_at: string;
  reason: "play_deleted" | "play_archived" | "playbook_deleted";
}

export interface CounterMismatchIssue {
  play_id: string;
  play_name: string;
  stored_times_called: number;
  actual_times_called: number;
  stored_times_successful: number;
  actual_times_successful: number;
  severity: "minor" | "major";
}

export interface MissingContextIssue {
  execution_id: string;
  play_id: string;
  session_type: "practice" | "game";
  missing_fields: string[];
}

export interface DataCoverageIssue {
  category: string;
  description: string;
  affected_count: number;
  recommendation: string;
}

// ============================================
// HEALTH CHECK SERVICE
// ============================================

export class AnalyticsHealthService {
  /**
   * Run comprehensive health check for a team's analytics data
   */
  static async runHealthCheck(teamId: string): Promise<HealthCheckResult> {
    const timestamp = new Date().toISOString();

    try {
      // Gather all data in parallel
      const [summary, orphans, mismatches, missingContext, coverage] =
        await Promise.all([
          this.getSummary(teamId),
          this.findOrphanExecutions(teamId),
          this.findCounterMismatches(teamId),
          this.findMissingContext(teamId),
          this.checkDataCoverage(teamId),
        ]);

      // Determine overall status
      const status = this.calculateStatus(
        orphans,
        mismatches,
        missingContext,
        coverage
      );

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        orphans,
        mismatches,
        missingContext,
        coverage
      );

      return {
        status,
        timestamp,
        teamId,
        summary,
        issues: {
          orphanExecutions: orphans,
          counterMismatches: mismatches,
          missingContext,
          dataCoverage: coverage,
        },
        recommendations,
      };
    } catch (error) {
      logError("Health check failed", error);
      throw new Error(
        `Analytics health check failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get summary counts for the team
   */
  private static async getSummary(
    teamId: string
  ): Promise<HealthCheckResult["summary"]> {
    // Get play count
    const { count: playCount, error: playError } = await fromAny("plays")
      .select("id", { count: "exact", head: true })
      .eq("playbook.team_id", teamId);

    // Get execution count
    const { count: execCount, error: execError } = await table(
      "play_executions"
    )
      .select("id", { count: "exact", head: true })
      .eq("team_id", teamId);

    // Get session counts
    const { data: practiceSessions } = await fromAny("practice_sessions")
      .select("id, is_archived")
      .eq("team_id", teamId);

    const { data: gameSessions } = await fromAny("game_sessions")
      .select("id, is_archived")
      .eq("team_id", teamId);

    const allSessions = [...(practiceSessions || []), ...(gameSessions || [])];
    const activeSessions = allSessions.filter((s) => !s.is_archived).length;
    const archivedSessions = allSessions.filter((s) => s.is_archived).length;

    if (playError || execError) {
      warn("Error fetching summary counts", { playError, execError });
    }

    return {
      totalPlays: playCount || 0,
      totalExecutions: execCount || 0,
      activeSessions,
      archivedSessions,
    };
  }

  /**
   * Find executions that reference deleted or archived plays
   */
  private static async findOrphanExecutions(
    teamId: string
  ): Promise<OrphanExecutionIssue[]> {
    const issues: OrphanExecutionIssue[] = [];

    // Query executions with LEFT JOIN to plays
    const { data: executions, error } = await table("play_executions")
      .select(
        `
        id,
        play_id,
        executed_at,
        plays!left (
          id,
          is_archived,
          playbook_id
        )
      `
      )
      .eq("team_id", teamId)
      .limit(1000);

    if (error) {
      warn("Error checking orphan executions", error);
      return issues;
    }

    for (const exec of executions || []) {
      const play = (exec as any).plays;

      if (!play) {
        issues.push({
          execution_id: exec.id,
          play_id: exec.play_id || "unknown",
          executed_at: exec.executed_at || new Date().toISOString(),
          reason: "play_deleted",
        });
      } else if (play.is_archived) {
        issues.push({
          execution_id: exec.id,
          play_id: exec.play_id || "unknown",
          executed_at: exec.executed_at || new Date().toISOString(),
          reason: "play_archived",
        });
      }
    }

    return issues;
  }

  /**
   * Find plays where stored counters don't match actual execution counts
   */
  private static async findCounterMismatches(
    teamId: string
  ): Promise<CounterMismatchIssue[]> {
    const issues: CounterMismatchIssue[] = [];

    // Get plays with their stored counters
    const { data: plays, error: playError } = await fromAny("plays")
      .select(
        `
        id,
        play_name,
        times_called,
        times_successful,
        playbooks!inner (team_id)
      `
      )
      .eq("playbooks.team_id", teamId);

    if (playError || !plays) {
      warn("Error fetching plays for mismatch check", playError);
      return issues;
    }

    // Get actual counts from play_execution_stats view
    const playIds = plays.map((p: { id: string }) => p.id);

    if (playIds.length === 0) return issues;

    const { data: stats, error: statsError } = await fromAny(
      "play_execution_stats"
    )
      .select("play_id, times_called, times_successful")
      .in("play_id", playIds);

    if (statsError) {
      warn("Error fetching execution stats", statsError);
      return issues;
    }

    // Build stats lookup
    type StatsEntry = { times_called: number; times_successful: number };
    const statsMap = new Map<string, StatsEntry>(
      (stats || []).map(
        (s: {
          play_id: string;
          times_called?: number;
          times_successful?: number;
        }) => [
          s.play_id,
          {
            times_called: s.times_called || 0,
            times_successful: s.times_successful || 0,
          },
        ]
      )
    );

    // Compare
    for (const play of plays as Array<{
      id: string;
      play_name: string;
      times_called: number;
      times_successful: number;
    }>) {
      const actual: StatsEntry = statsMap.get(play.id) || {
        times_called: 0,
        times_successful: 0,
      };

      const calledMismatch = play.times_called !== actual.times_called;
      const successMismatch = play.times_successful !== actual.times_successful;

      if (calledMismatch || successMismatch) {
        const diff = Math.abs(play.times_called - actual.times_called);

        issues.push({
          play_id: play.id,
          play_name: play.play_name,
          stored_times_called: play.times_called,
          actual_times_called: actual.times_called,
          stored_times_successful: play.times_successful,
          actual_times_successful: actual.times_successful,
          severity: diff > 5 ? "major" : "minor",
        });
      }
    }

    return issues;
  }

  /**
   * Find executions with missing important context
   */
  private static async findMissingContext(
    teamId: string
  ): Promise<MissingContextIssue[]> {
    const issues: MissingContextIssue[] = [];

    // Get game session executions that should have game context
    const { data: gameExecs, error: gameError } = await table("play_executions")
      .select(
        `
        id,
        play_id,
        game_session_id,
        down,
        distance,
        yard_line,
        quarter,
        yards_gained
      `
      )
      .eq("team_id", teamId)
      .not("game_session_id", "is", null)
      .limit(500);

    if (!gameError && gameExecs) {
      for (const exec of gameExecs) {
        const missing: string[] = [];

        if (exec.down == null) missing.push("down");
        if (exec.distance == null) missing.push("distance");
        if (exec.yard_line == null) missing.push("yard_line");
        if (exec.quarter == null) missing.push("quarter");
        if (exec.yards_gained == null) missing.push("yards_gained");

        // Only report if significant context is missing
        if (missing.length >= 3) {
          issues.push({
            execution_id: exec.id,
            play_id: exec.play_id || "unknown",
            session_type: "game",
            missing_fields: missing,
          });
        }
      }
    }

    // Get practice session executions
    const { data: practiceExecs, error: practiceError } = await table(
      "play_executions"
    )
      .select(
        `
        id,
        play_id,
        practice_session_id,
        rep_number
      `
      )
      .eq("team_id", teamId)
      .not("practice_session_id", "is", null)
      .is("rep_number", null)
      .limit(500);

    if (!practiceError && practiceExecs) {
      for (const exec of practiceExecs) {
        issues.push({
          execution_id: exec.id,
          play_id: exec.play_id || "unknown",
          session_type: "practice",
          missing_fields: ["rep_number"],
        });
      }
    }

    return issues;
  }

  /**
   * Check overall data coverage and identify gaps
   */
  private static async checkDataCoverage(
    teamId: string
  ): Promise<DataCoverageIssue[]> {
    const issues: DataCoverageIssue[] = [];

    // Check plays without any executions
    const { data: playsWithoutExecs, error: noExecError } = await fromAny(
      "plays"
    )
      .select(
        `
        id,
        playbooks!inner (team_id)
      `
      )
      .eq("playbooks.team_id", teamId)
      .eq("times_called", 0);

    if (!noExecError && playsWithoutExecs && playsWithoutExecs.length > 0) {
      const threshold = 20; // Warn if many plays have never been executed
      if (playsWithoutExecs.length > threshold) {
        issues.push({
          category: "unused_plays",
          description: `${playsWithoutExecs.length} plays have never been executed`,
          affected_count: playsWithoutExecs.length,
          recommendation:
            "Consider archiving unused plays or including them in practice scripts",
        });
      }
    }

    // Check plays with limited sample size
    const { data: limitedSamplePlays } = await fromAny("play_execution_stats")
      .select("play_id, times_called")
      .gt("times_called", 0)
      .lt("times_called", ANALYTICS_CONSTANTS.RELIABLE_SAMPLE_SIZE);

    if (limitedSamplePlays && limitedSamplePlays.length > 10) {
      issues.push({
        category: "limited_sample",
        description: `${limitedSamplePlays.length} plays have limited execution data (< ${ANALYTICS_CONSTANTS.RELIABLE_SAMPLE_SIZE} reps)`,
        affected_count: limitedSamplePlays.length,
        recommendation:
          "Analytics for these plays may not be reliable. Increase practice reps to improve confidence.",
      });
    }

    // Check for sessions with no executions
    const { data: emptySessions } = await fromAny("practice_sessions")
      .select("id, name, created_at")
      .eq("team_id", teamId)
      .eq("total_plays", 0);

    if (emptySessions && emptySessions.length > 5) {
      issues.push({
        category: "empty_sessions",
        description: `${emptySessions.length} practice sessions have no logged executions`,
        affected_count: emptySessions.length,
        recommendation:
          "These sessions may have been created but not used. Consider deleting or archiving them.",
      });
    }

    return issues;
  }

  /**
   * Calculate overall health status
   */
  private static calculateStatus(
    orphans: OrphanExecutionIssue[],
    mismatches: CounterMismatchIssue[],
    missingContext: MissingContextIssue[],
    coverage: DataCoverageIssue[]
  ): HealthCheckResult["status"] {
    const majorMismatches = mismatches.filter((m) => m.severity === "major");

    // Critical: data integrity issues
    if (orphans.length > 10 || majorMismatches.length > 5) {
      return "critical";
    }

    // Warnings: quality issues
    if (
      orphans.length > 0 ||
      mismatches.length > 0 ||
      missingContext.length > 20 ||
      coverage.length > 0
    ) {
      return "warnings";
    }

    return "healthy";
  }

  /**
   * Generate actionable recommendations
   */
  private static generateRecommendations(
    orphans: OrphanExecutionIssue[],
    mismatches: CounterMismatchIssue[],
    missingContext: MissingContextIssue[],
    coverage: DataCoverageIssue[]
  ): string[] {
    const recommendations: string[] = [];

    if (orphans.length > 0) {
      recommendations.push(
        `Clean up ${orphans.length} orphan execution records from deleted plays to improve query performance.`
      );
    }

    if (mismatches.length > 0) {
      const majorCount = mismatches.filter(
        (m) => m.severity === "major"
      ).length;
      if (majorCount > 0) {
        recommendations.push(
          `${majorCount} plays have major counter mismatches. Run database maintenance to resync counters from play_executions.`
        );
      }
    }

    if (missingContext.length > 10) {
      const gameCount = missingContext.filter(
        (m) => m.session_type === "game"
      ).length;
      if (gameCount > 0) {
        recommendations.push(
          `${gameCount} game executions are missing situational context (down/distance/yard line). Ensure BoxCall Live captures full game context.`
        );
      }
    }

    for (const issue of coverage) {
      recommendations.push(issue.recommendation);
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Your analytics data is healthy! Keep tracking executions to build stronger insights."
      );
    }

    return recommendations;
  }

  /**
   * Quick check if analytics data is ready for reporting
   */
  static async isReadyForReporting(teamId: string): Promise<{
    ready: boolean;
    reason?: string;
    stats: {
      totalExecutions: number;
      playsWithData: number;
    };
  }> {
    const { count: execCount } = await table("play_executions")
      .select("id", { count: "exact", head: true })
      .eq("team_id", teamId);

    const { count: playsWithData } = await fromAny(
      "play_execution_stats"
    ).select("play_id", { count: "exact", head: true });

    const totalExecutions = execCount || 0;
    const plays = playsWithData || 0;

    if (totalExecutions < ANALYTICS_CONSTANTS.MIN_SAMPLE_FOR_RATE) {
      return {
        ready: false,
        reason: `Need at least ${ANALYTICS_CONSTANTS.MIN_SAMPLE_FOR_RATE} play executions to generate meaningful analytics. Currently have ${totalExecutions}.`,
        stats: { totalExecutions, playsWithData: plays },
      };
    }

    if (plays < 3) {
      return {
        ready: false,
        reason: `Need execution data for at least 3 different plays. Currently have data for ${plays} plays.`,
        stats: { totalExecutions, playsWithData: plays },
      };
    }

    return {
      ready: true,
      stats: { totalExecutions, playsWithData: plays },
    };
  }
}
