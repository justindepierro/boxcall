/**
 * Performance Analytics Service
 *
 * Player performance tracking and team analytics
 * (Renamed from playerPerformanceAnalyticsService.ts for consistency)
 */

import { table } from "../data/supabase/db";
import { logError } from "../utils/logger";

export interface PlayerPerformanceMetrics {
  playerId: string;
  playerName: string;
  position: string;
  totalActivities: number;
  averageRating: number;
  improvementTrend: "improving" | "declining" | "stable";
  strengths: string[];
  weaknesses: string[];
  recentPerformances: Array<{
    date: string;
    activity: string;
    rating: number;
    notes?: string;
  }>;
}

export interface TeamPerformanceOverview {
  totalPlayers: number;
  averageTeamRating: number;
  topPerformers: PlayerPerformanceMetrics[];
  playersNeedingAttention: PlayerPerformanceMetrics[];
  positionBreakdown: Record<
    string,
    {
      count: number;
      averageRating: number;
      topPerformer: string;
    }
  >;
  recentActivities: Array<{
    date: string;
    activity: string;
    participants: number;
    averageRating: number;
  }>;
}

export interface PerformanceInsights {
  recommendations: string[];
  trends: Array<{
    metric: string;
    trend: "up" | "down" | "stable";
    change: number;
    period: string;
  }>;
  alerts: Array<{
    type: "warning" | "critical" | "info";
    message: string;
    playerId?: string;
  }>;
}

export class PlayerPerformanceAnalyticsService {
  private static ratingForAttendanceStatus(status: string): number {
    switch (status) {
      case "present":
        return 7;
      case "excused":
        return 6;
      case "late":
        return 5;
      case "absent":
        return 2;
      default:
        return 5;
    }
  }

  private static ratingForAchievementType(_type: string): number {
    return 9;
  }

  private static ratingForStickerType(_type: string): number {
    return 8;
  }

  private static average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  private static formatPlayerName(
    firstName?: string | null,
    lastName?: string | null
  ) {
    return `${firstName || ""} ${lastName || ""}`.trim() || "Unknown Player";
  }

  private static computeTrendFromRecent(
    ratings: number[]
  ): "improving" | "declining" | "stable" {
    const recent = ratings.slice(0, 5);
    const older = ratings.slice(5, 10);
    const recentAvg = this.average(recent);
    const olderAvg = this.average(older);

    if (recentAvg > olderAvg + 0.5) return "improving";
    if (recentAvg < olderAvg - 0.5) return "declining";
    return "stable";
  }

  /**
   * Get comprehensive performance metrics for a player
   */
  static async getPlayerPerformanceMetrics(
    playerId: string
  ): Promise<PlayerPerformanceMetrics | null> {
    try {
      // Accept either a `team_players.id` or a `profiles.id`.
      const { data: teamPlayerById } = await table("team_players")
        .select("id, first_name, last_name, position")
        .eq("id", playerId)
        .maybeSingle();

      const teamPlayer = teamPlayerById
        ? {
            id: teamPlayerById.id as string,
            first_name: (teamPlayerById as any).first_name as string | null,
            last_name: (teamPlayerById as any).last_name as string | null,
            position: (teamPlayerById as any).position as string | null,
          }
        : null;

      // If not a team_players ID, try mapping from profile/user id.
      const { data: teamPlayerByUser } = teamPlayer
        ? { data: null }
        : await table("team_players")
            .select("id, first_name, last_name, position")
            .eq("user_id", playerId)
            .eq("is_active", true)
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle();

      const resolvedTeamPlayer =
        teamPlayer ??
        (teamPlayerByUser
          ? {
              id: teamPlayerByUser.id as string,
              first_name: (teamPlayerByUser as any).first_name as string | null,
              last_name: (teamPlayerByUser as any).last_name as string | null,
              position: (teamPlayerByUser as any).position as string | null,
            }
          : null);

      if (!resolvedTeamPlayer) {
        // Fallback to profile name if present.
        const { data: profile } = await table("profiles")
          .select("id, full_name")
          .eq("id", playerId)
          .maybeSingle();
        if (!profile) return null;

        return {
          playerId,
          playerName: (profile as any).full_name || "Unknown Player",
          position: "",
          totalActivities: 0,
          averageRating: 0,
          improvementTrend: "stable",
          strengths: [],
          weaknesses: [],
          recentPerformances: [],
        };
      }

      const [achievementsRes, stickersRes] = await Promise.all([
        table("achievements")
          .select("player_id, achievement_type, description, earned_date")
          .eq("player_id", resolvedTeamPlayer.id)
          .order("earned_date", { ascending: false })
          .limit(100),
        table("helmet_stickers")
          .select("player_id, sticker_type, earned_date")
          .eq("player_id", resolvedTeamPlayer.id)
          .order("earned_date", { ascending: false })
          .limit(100),
      ]);

      const performances: PlayerPerformanceMetrics["recentPerformances"] = [];

      for (const a of achievementsRes.data ?? []) {
        const date = (a as any).earned_date as string;
        const achievementType = (a as any).achievement_type as string;
        performances.push({
          date,
          activity: `Achievement: ${achievementType}`,
          rating: this.ratingForAchievementType(achievementType),
          notes: (a as any).description || undefined,
        });
      }

      for (const s of stickersRes.data ?? []) {
        const date = (s as any).earned_date as string;
        const stickerType = (s as any).sticker_type as string;
        performances.push({
          date,
          activity: `Helmet Sticker: ${stickerType}`,
          rating: this.ratingForStickerType(stickerType),
        });
      }

      performances.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      const ratings = performances.map((p) => p.rating);
      const averageRating = this.average(ratings);

      return {
        playerId: resolvedTeamPlayer.id,
        playerName: this.formatPlayerName(
          resolvedTeamPlayer.first_name,
          resolvedTeamPlayer.last_name
        ),
        position: resolvedTeamPlayer.position || "",
        totalActivities: performances.length,
        averageRating: Math.round(averageRating * 10) / 10,
        improvementTrend: this.computeTrendFromRecent(ratings),
        strengths: [],
        weaknesses: [],
        recentPerformances: performances.slice(0, 5),
      };
    } catch (error) {
      logError("Error fetching player performance metrics:", error);
      return null;
    }
  }

  /**
   * Get team-wide performance overview
   */
  // eslint-disable-next-line max-lines-per-function, complexity
  static async getTeamPerformanceOverview(
    teamId: string
  ): Promise<TeamPerformanceOverview> {
    try {
      // Use roster players (team_players) for team analytics.
      const { data: players, error: playersError } = await table("team_players")
        .select("id, first_name, last_name, position")
        .eq("team_id", teamId)
        .eq("is_active", true);

      if (playersError) throw playersError;

      const teamPlayers = (players ?? []) as Array<any>;
      const playerIds = teamPlayers.map((p) => p.id as string);

      const [achievementsRes, stickersRes, practicesRes] = await Promise.all([
        playerIds.length > 0
          ? table("achievements")
              .select("player_id, achievement_type, description, earned_date")
              .in("player_id", playerIds)
              .order("earned_date", { ascending: false })
              .limit(500)
          : Promise.resolve({ data: [], error: null } as any),
        playerIds.length > 0
          ? table("helmet_stickers")
              .select("player_id, sticker_type, earned_date")
              .in("player_id", playerIds)
              .order("earned_date", { ascending: false })
              .limit(500)
          : Promise.resolve({ data: [], error: null } as any),
        table("practice_schedules")
          .select("id, practice_date")
          .eq("team_id", teamId)
          .order("practice_date", { ascending: false })
          .limit(30),
      ]);

      const practices = (practicesRes.data ?? []) as Array<any>;
      const practiceDateById = new Map<string, string>();
      for (const pr of practices) {
        practiceDateById.set(pr.id as string, pr.practice_date as string);
      }

      const practiceIds = practices.map((p) => p.id as string);
      const attendanceRes =
        practiceIds.length > 0
          ? await table("practice_attendance")
              .select("practice_id, player_id, status")
              .in("practice_id", practiceIds)
              .limit(5000)
          : ({ data: [], error: null } as any);

      const achievements = (achievementsRes.data ?? []) as Array<any>;
      const stickers = (stickersRes.data ?? []) as Array<any>;
      const attendance = (attendanceRes.data ?? []) as Array<any>;

      const achievementsByPlayer = new Map<string, Array<any>>();
      for (const a of achievements) {
        const pid = a.player_id as string;
        const arr = achievementsByPlayer.get(pid) ?? [];
        arr.push(a);
        achievementsByPlayer.set(pid, arr);
      }

      const stickersByPlayer = new Map<string, Array<any>>();
      for (const s of stickers) {
        const pid = s.player_id as string;
        const arr = stickersByPlayer.get(pid) ?? [];
        arr.push(s);
        stickersByPlayer.set(pid, arr);
      }

      const attendanceByPlayer = new Map<string, Array<any>>();
      for (const at of attendance) {
        const pid = at.player_id as string;
        const arr = attendanceByPlayer.get(pid) ?? [];
        arr.push(at);
        attendanceByPlayer.set(pid, arr);
      }

      const validMetrics: PlayerPerformanceMetrics[] = teamPlayers.map((p) => {
        const playerId = p.id as string;
        const playerName = this.formatPlayerName(p.first_name, p.last_name);
        const position = (p.position as string | null) || "";

        const performances: PlayerPerformanceMetrics["recentPerformances"] = [];

        for (const a of achievementsByPlayer.get(playerId) ?? []) {
          const date = a.earned_date as string;
          const achievementType = a.achievement_type as string;
          performances.push({
            date,
            activity: `Achievement: ${achievementType}`,
            rating: this.ratingForAchievementType(achievementType),
            notes: a.description || undefined,
          });
        }

        for (const s of stickersByPlayer.get(playerId) ?? []) {
          const date = s.earned_date as string;
          const stickerType = s.sticker_type as string;
          performances.push({
            date,
            activity: `Helmet Sticker: ${stickerType}`,
            rating: this.ratingForStickerType(stickerType),
          });
        }

        for (const at of attendanceByPlayer.get(playerId) ?? []) {
          const practiceId = at.practice_id as string;
          const date = practiceDateById.get(practiceId);
          if (!date) continue;
          const status = at.status as string;
          performances.push({
            date,
            activity: "Practice",
            rating: this.ratingForAttendanceStatus(status),
            notes: status !== "present" ? status : undefined,
          });
        }

        performances.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        const ratings = performances.map((pp) => pp.rating);
        const averageRating = this.average(ratings);

        // Simple heuristics from real data.
        const strengths: string[] = [];
        const weaknesses: string[] = [];
        const attendanceEvents = (attendanceByPlayer.get(playerId) ??
          []) as any[];
        const lateOrAbsent = attendanceEvents.filter(
          (e) => e.status === "late" || e.status === "absent"
        ).length;
        if (attendanceEvents.length > 0) {
          const reliability = 1 - lateOrAbsent / attendanceEvents.length;
          if (reliability >= 0.9) strengths.push("Reliability");
          if (reliability <= 0.75) weaknesses.push("Attendance");
        }

        const recentAchievements = (achievementsByPlayer.get(playerId) ?? [])
          .slice(0, 3)
          .map((a) => a.achievement_type as string);
        if (recentAchievements.length >= 2) strengths.push("Production");
        if (recentAchievements.length === 0) weaknesses.push("Recognition");

        return {
          playerId,
          playerName,
          position,
          totalActivities: performances.length,
          averageRating: Math.round(averageRating * 10) / 10,
          improvementTrend: this.computeTrendFromRecent(ratings),
          strengths,
          weaknesses,
          recentPerformances: performances.slice(0, 5),
        };
      });

      const totalPlayers = validMetrics.length;
      const averageTeamRating =
        totalPlayers > 0
          ? validMetrics.reduce(
              (sum, player) => sum + player.averageRating,
              0
            ) / totalPlayers
          : 0;

      // Top performers
      const topPerformers = validMetrics
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 5);

      // Players needing attention (low ratings or declining trend)
      const playersNeedingAttention = validMetrics
        .filter(
          (player) =>
            player.averageRating < 6 || player.improvementTrend === "declining"
        )
        .slice(0, 5);

      // Position breakdown
      const positionBreakdown = validMetrics.reduce(
        (acc, player) => {
          const pos = player.position;
          if (!acc[pos]) {
            acc[pos] = { count: 0, averageRating: 0, topPerformer: "" };
          }
          acc[pos].count++;
          acc[pos].averageRating =
            (acc[pos].averageRating * (acc[pos].count - 1) +
              player.averageRating) /
            acc[pos].count;
          if (
            player.averageRating >
            (validMetrics.find((p) => p.playerName === acc[pos].topPerformer)
              ?.averageRating || 0)
          ) {
            acc[pos].topPerformer = player.playerName;
          }
          return acc;
        },
        {} as Record<
          string,
          { count: number; averageRating: number; topPerformer: string }
        >
      );

      // Recent activities: last practice sessions.
      const recentActivities: TeamPerformanceOverview["recentActivities"] = [];
      for (const pr of practices.slice(0, 5)) {
        const practiceId = pr.id as string;
        const date = pr.practice_date as string;
        const rows = attendance.filter((a) => a.practice_id === practiceId);
        if (rows.length === 0) continue;
        const ratings = rows.map((r) =>
          this.ratingForAttendanceStatus(r.status as string)
        );
        recentActivities.push({
          date,
          activity: "Practice",
          participants: rows.length,
          averageRating: Math.round(this.average(ratings) * 10) / 10,
        });
      }

      return {
        totalPlayers,
        averageTeamRating: Math.round(averageTeamRating * 10) / 10,
        topPerformers,
        playersNeedingAttention,
        positionBreakdown,
        recentActivities,
      };
    } catch (error) {
      logError("Error fetching team performance overview:", error);
      return {
        totalPlayers: 0,
        averageTeamRating: 0,
        topPerformers: [],
        playersNeedingAttention: [],
        positionBreakdown: {},
        recentActivities: [],
      };
    }
  }

  /**
   * Get performance insights and recommendations
   */
  static async getPerformanceInsights(
    teamId: string
  ): Promise<PerformanceInsights> {
    try {
      const overview = await this.getTeamPerformanceOverview(teamId);

      const recommendations: string[] = [];
      const alerts: PerformanceInsights["alerts"] = [];
      const trends: PerformanceInsights["trends"] = [];

      // Generate recommendations based on data
      if (overview.averageTeamRating < 7) {
        recommendations.push(
          "Consider additional training sessions to improve overall team performance."
        );
      }

      if (
        overview.playersNeedingAttention.length >
        overview.totalPlayers * 0.3
      ) {
        recommendations.push(
          "Many players need individual attention - consider one-on-one coaching sessions."
        );
      }

      if (overview.topPerformers.length > 0) {
        recommendations.push(
          `Leverage ${overview.topPerformers[0].playerName} as a team leader and mentor.`
        );
      }

      // Generate alerts
      overview.playersNeedingAttention.forEach((player) => {
        alerts.push({
          type: player.averageRating < 5 ? "critical" : "warning",
          message: `${player.playerName} needs immediate attention (${player.averageRating}/10 rating)`,
          playerId: player.playerId,
        });
      });

      // Mock trends
      trends.push({
        metric: "Team Average Rating",
        trend: (() => {
          if (overview.averageTeamRating > 7) return "up";
          if (overview.averageTeamRating < 6) return "down";
          return "stable";
        })(),
        change: 0,
        period: "Last 30 days",
      });

      return {
        recommendations,
        trends,
        alerts,
      };
    } catch (error) {
      logError("Error fetching performance insights:", error);
      return {
        recommendations: [],
        trends: [],
        alerts: [],
      };
    }
  }
}
