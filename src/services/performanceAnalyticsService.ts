/**
 * Performance Analytics Service
 *
 * Player performance tracking and team analytics
 * (Renamed from playerPerformanceAnalyticsService.ts for consistency)
 */

import { supabase } from "../lib/supabase";
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
  /**
   * Get comprehensive performance metrics for a player
   */
  static async getPlayerPerformanceMetrics(
    playerId: string
  ): Promise<PlayerPerformanceMetrics | null> {
    try {
      // Get player basic info
      const { data: player, error: playerError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", playerId)
        .single();

      if (playerError || !player) return null;

      // Get performance data (using mock data since tables don't exist yet)
      // In real implementation, this would query player_performance table
      const mockPerformances = this.generateMockPerformanceData(playerId);

      const totalActivities = mockPerformances.length;
      const averageRating =
        totalActivities > 0
          ? mockPerformances.reduce((sum, p) => sum + p.rating, 0) /
            totalActivities
          : 0;

      // Calculate improvement trend (simple mock logic)
      const recentRatings = mockPerformances.slice(0, 5).map((p) => p.rating);
      const olderRatings = mockPerformances.slice(5, 10).map((p) => p.rating);
      const recentAvg =
        recentRatings.length > 0
          ? recentRatings.reduce((a, b) => a + b) / recentRatings.length
          : 0;
      const olderAvg =
        olderRatings.length > 0
          ? olderRatings.reduce((a, b) => a + b) / olderRatings.length
          : 0;

      let improvementTrend: "improving" | "declining" | "stable" = "stable";
      if (recentAvg > olderAvg + 0.5) improvementTrend = "improving";
      else if (recentAvg < olderAvg - 0.5) improvementTrend = "declining";

      return {
        playerId,
        playerName: player.full_name || "Unknown Player",
        position: "QB", // Mock position
        totalActivities,
        averageRating: Math.round(averageRating * 10) / 10,
        improvementTrend,
        strengths: ["Accuracy", "Decision making"], // Mock strengths
        weaknesses: ["Mobility", "Pocket presence"], // Mock weaknesses
        recentPerformances: mockPerformances.slice(0, 5),
      };
    } catch (error) {
      logError("Error fetching player performance metrics:", error);
      return null;
    }
  }

  /**
   * Get team-wide performance overview
   */
  static async getTeamPerformanceOverview(
    teamId: string
  ): Promise<TeamPerformanceOverview> {
    try {
      // Get team members
      const { data: members, error: membersError } = await supabase
        .from("team_members")
        .select("user_id")
        .eq("team_id", teamId)
        .eq("status", "active");

      if (membersError) throw membersError;

      const playerIds = members?.map((m) => m.user_id) || [];

      // Get performance metrics for all players (mock data)
      const playerMetrics = await Promise.all(
        playerIds.map((id) => this.getPlayerPerformanceMetrics(id))
      );

      const validMetrics = playerMetrics.filter(
        (m): m is PlayerPerformanceMetrics => m !== null
      );

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

      return {
        totalPlayers,
        averageTeamRating: Math.round(averageTeamRating * 10) / 10,
        topPerformers,
        playersNeedingAttention,
        positionBreakdown,
        recentActivities: [], // Mock empty for now
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
        trend:
          overview.averageTeamRating > 7
            ? "up"
            : overview.averageTeamRating < 6
              ? "down"
              : "stable",
        change: 0.3, // Mock change
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

  /**
   * Generate mock performance data for development
   */
  private static generateMockPerformanceData(_playerId: string) {
    const activities = [
      "Practice",
      "Scrimmage",
      "Game",
      "Drill",
      "Conditioning",
    ];
    const performances = [];

    for (let i = 0; i < 15; i++) {
      performances.push({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        activity: activities[Math.floor(Math.random() * activities.length)],
        rating: Math.round((Math.random() * 4 + 6) * 10) / 10, // 6-10 rating
        notes: Math.random() > 0.7 ? "Good performance" : undefined,
      });
    }

    return performances.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
}
