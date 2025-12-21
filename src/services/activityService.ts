/**
 * Activity Service
 * Tracks and retrieves user activity for plays, practice scripts, and game plans
 */

import { table } from "../data/supabase/db";
import { getCurrentUserId } from "../lib/auth-helpers";
import { info, error as logError } from "../utils/logger";
import type { Json } from "../types/database";

export type ActivityType =
  | "created"
  | "updated"
  | "duplicated"
  | "added_to_script"
  | "added_to_gameplan"
  | "deleted";

/**
 * Play activity item interface
 */
export interface PlayActivityItem {
  id: string;
  userId: string;
  teamId?: string;
  playId?: string;
  activityType: ActivityType;
  playName?: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface CreateActivityParams {
  type: ActivityType;
  playId: string;
  playName: string;
  teamId?: string;
  details?: Record<string, unknown>;
}

export class ActivityService {
  /**
   * Record a new activity event
   * Stores activity in the database for tracking user actions
   */
  static async recordActivity(
    params: CreateActivityParams
  ): Promise<PlayActivityItem | null> {
    try {
      // Get current user
      const userId = getCurrentUserId();
      if (!userId) {
        logError("Cannot record activity: User not authenticated");
        return null;
      }

      const activityData = {
        user_id: userId,
        team_id: params.teamId,
        action: params.type,
        entity_type: "play",
        entity_id: params.playId,
        metadata: {
          playName: params.playName,
          details: (params.details ?? null) as unknown as Json,
        } as Json,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await table("activities")
        .insert(activityData)
        .select()
        .single();

      if (error) {
        logError("Failed to record activity:", error);
        return null;
      }

      info(`Activity recorded: ${params.type} - ${params.playName}`);

      return {
        id: data.id,
        activityType: params.type,
        playName: params.playName,
        createdAt: data.created_at ?? new Date().toISOString(),
        details: params.details,
        userId,
        teamId: params.teamId,
        playId: params.playId,
      };
    } catch (err) {
      logError("Error recording activity:", err);
      return null;
    }
  }

  /**
   * Get recent activities, optionally filtered by team
   */
  static async getRecentActivities(
    teamId?: string,
    limit: number = 10
  ): Promise<PlayActivityItem[]> {
    try {
      // Get current user
      const userId = getCurrentUserId();
      if (!userId) {
        logError("Cannot fetch activities: User not authenticated");
        return [];
      }

      let query = table("activities")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      // Filter by team if provided
      if (teamId) {
        query = query.eq("team_id", teamId);
      }

      const { data, error } = await query;

      if (error) {
        logError("Failed to fetch activities:", error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Transform database records to PlayActivityItem format
      return data.map((record) => ({
        id: record.id,
        activityType: record.action as ActivityType,
        playName:
          typeof record.metadata === "object" && record.metadata
            ? ((record.metadata as any).playName as string | undefined)
            : undefined,
        createdAt: record.created_at ?? new Date().toISOString(),
        details:
          typeof record.metadata === "object" && record.metadata
            ? ((record.metadata as any).details as
                | Record<string, unknown>
                | undefined)
            : undefined,
        userId: record.user_id ?? userId,
        teamId: record.team_id ?? undefined,
        playId: record.entity_id ?? undefined,
      }));
    } catch (err) {
      logError("Error fetching activities:", err);
      return [];
    }
  }

  /**
   * Get activities for a specific play
   * Useful for viewing the history of changes to a play
   */
  static async getPlayActivities(playId: string): Promise<PlayActivityItem[]> {
    try {
      const { data, error } = await table("activities")
        .select("*")
        .eq("play_id", playId)
        .order("created_at", { ascending: false });

      if (error) {
        logError("Failed to fetch play activities:", error);
        return [];
      }

      if (!data) return [];

      return data.map((record) => ({
        id: record.id,
        activityType: record.action as ActivityType,
        playName:
          typeof record.metadata === "object" && record.metadata
            ? ((record.metadata as any).playName as string | undefined)
            : undefined,
        createdAt: record.created_at ?? new Date().toISOString(),
        details:
          typeof record.metadata === "object" && record.metadata
            ? ((record.metadata as any).details as
                | Record<string, unknown>
                | undefined)
            : undefined,
        userId: record.user_id ?? "",
        teamId: record.team_id ?? undefined,
        playId: record.entity_id ?? undefined,
      }));
    } catch (err) {
      logError("Error fetching play activities:", err);
      return [];
    }
  }

  /**
   * Delete activities older than a specified number of days
   * Useful for cleaning up old activity logs
   */
  static async cleanupOldActivities(daysOld: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { data, error } = await table("activities")
        .delete()
        .lt("created_at", cutoffDate.toISOString())
        .select();

      if (error) {
        logError("Failed to cleanup old activities:", error);
        return 0;
      }

      const deletedCount = data?.length || 0;
      info(`Cleaned up ${deletedCount} activities older than ${daysOld} days`);
      return deletedCount;
    } catch (err) {
      logError("Error cleaning up activities:", err);
      return 0;
    }
  }

  /**
   * Get activity statistics for a user
   * Returns counts by activity type
   */
  static async getActivityStats(
    teamId?: string
  ): Promise<Record<ActivityType, number>> {
    try {
      const userId = getCurrentUserId();
      if (!userId) return {} as Record<ActivityType, number>;

      let query = table("activities").select("action").eq("user_id", userId);

      if (teamId) {
        query = query.eq("team_id", teamId);
      }

      const { data, error } = await query;

      if (error || !data) return {} as Record<ActivityType, number>;

      // Count activities by type
      const stats: Record<string, number> = {};
      data.forEach((record) => {
        const type = record.action;
        stats[type] = (stats[type] || 0) + 1;
      });

      return stats as Record<ActivityType, number>;
    } catch (err) {
      logError("Error fetching activity stats:", err);
      return {} as Record<ActivityType, number>;
    }
  }
}
