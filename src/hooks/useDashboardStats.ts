/**
 * Dashboard Stats Hook
 *
 * Fetches and aggregates dashboard statistics for the mobile hero card:
 * - Total plays across all user teams
 * - This week's activity count
 * - Achievement/badge count
 *
 * Uses the supabase client for all database queries.
 */

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { AchievementService } from "../services/achievementService";
import { debug, error as logError } from "../utils/logger";

export interface DashboardStats {
  totalPlays: number;
  thisWeekActivity: number;
  achievements: number;
  loading: boolean;
  error: string | null;
}

/**
 * Fetch dashboard statistics for the current user
 */
export function useDashboardStats(userId: string | undefined): DashboardStats {
  const [stats, setStats] = useState<DashboardStats>({
    totalPlays: 0,
    thisWeekActivity: 0,
    achievements: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!userId) {
      setStats({
        totalPlays: 0,
        thisWeekActivity: 0,
        achievements: 0,
        loading: false,
        error: "No user ID provided",
      });
      return;
    }

    let mounted = true;

    async function fetchStats() {
      try {
        const userIdStr = userId as string;
        debug("[useDashboardStats] Fetching stats for user:", userIdStr);

        // Parallel fetch all stats
        const [playsResult, activityResult, achievementsResult] =
          await Promise.all([
            fetchTotalPlays(userIdStr),
            fetchThisWeekActivity(userIdStr),
            fetchAchievementCount(userIdStr),
          ]);

        debug("[useDashboardStats] Results:", {
          plays: playsResult,
          activity: activityResult,
          achievements: achievementsResult,
        });

        if (mounted) {
          setStats({
            totalPlays: playsResult,
            thisWeekActivity: activityResult,
            achievements: achievementsResult,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        logError("[useDashboardStats] Error fetching stats:", error);
        if (mounted) {
          setStats({
            totalPlays: 0,
            thisWeekActivity: 0,
            achievements: 0,
            loading: false,
            error:
              error instanceof Error ? error.message : "Failed to fetch stats",
          });
        }
      }
    }

    fetchStats();

    return () => {
      mounted = false;
    };
  }, [userId]);

  return stats;
}

/**
 * Count total plays across all user's teams
 * Uses supabase client
 */
async function fetchTotalPlays(userId: string): Promise<number> {
  try {
    console.log("🔍 [fetchTotalPlays] Starting for userId:", userId);

    // Step 1: Get user's team memberships
    const { data: memberships, error: memberError } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", userId)
      .eq("status", "active");

    console.log("🔍 [fetchTotalPlays] team_members result:", {
      data: memberships,
      error: memberError,
    });

    if (memberError || !memberships || memberships.length === 0) {
      console.log(
        "🔍 [fetchTotalPlays] No memberships found - THIS IS THE PROBLEM"
      );
      debug("[fetchTotalPlays] No memberships found");
      return 0;
    }

    const teamIds = memberships
      .map((m) => m.team_id)
      .filter((id): id is string => !!id);

    if (teamIds.length === 0) return 0;
    debug("[fetchTotalPlays] Team IDs:", teamIds);

    // Step 2: Get playbook IDs for these teams
    const { data: playbooks, error: playbooksError } = await supabase
      .from("playbooks")
      .select("id")
      .in("team_id", teamIds);

    if (playbooksError || !playbooks || playbooks.length === 0) {
      debug("[fetchTotalPlays] No playbooks found");
      return 0;
    }

    const playbookIds = playbooks.map((pb) => pb.id);
    debug("[fetchTotalPlays] Playbook IDs:", playbookIds);

    // Step 3: Count plays across all playbooks
    const { data: plays, error: playsError } = await supabase
      .from("plays")
      .select("id")
      .in("playbook_id", playbookIds);

    if (playsError) {
      console.warn(
        "[fetchTotalPlays] Error counting plays:",
        playsError.message
      );
      return 0;
    }

    const totalPlays = plays?.length ?? 0;
    debug("[fetchTotalPlays] Total plays:", totalPlays);
    return totalPlays;
  } catch (error) {
    logError("[fetchTotalPlays] Unexpected error:", error);
    return 0;
  }
}

/**
 * Count activity items from this week
 * Activity sources: posts, events, practice plans, game plans
 */
async function fetchThisWeekActivity(userId: string): Promise<number> {
  try {
    // Calculate start of this week (Sunday)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfWeekISO = startOfWeek.toISOString();

    // Step 1: Get user's team memberships
    const { data: memberships, error: memberError } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", userId)
      .eq("status", "active");

    if (memberError || !memberships || memberships.length === 0) {
      return 0;
    }

    const teamIds = memberships
      .map((m) => m.team_id)
      .filter((id): id is string => typeof id === "string" && id.length > 0);

    if (teamIds.length === 0) {
      return 0;
    }

    // Step 2: Count posts from this week
    const { data: posts, error: postsError } = await supabase
      .from("team_posts")
      .select("id")
      .in("team_id", teamIds)
      .gte("created_at", startOfWeekISO);

    // Step 3: Count calendar events from this week
    const { data: events, error: eventsError } = await supabase
      .from("calendar_events")
      .select("id")
      .in("team_id", teamIds)
      .gte("created_at", startOfWeekISO);

    if (postsError || eventsError) {
      console.warn(
        "[fetchThisWeekActivity] Partial error - returning available data"
      );
    }

    return (posts?.length ?? 0) + (events?.length ?? 0);
  } catch (error) {
    logError("[fetchThisWeekActivity] Unexpected error:", error);
    return 0;
  }
}

/**
 * Count user's achievements/badges
 */
async function fetchAchievementCount(userId: string): Promise<number> {
  try {
    const achievements = await AchievementService.getUserAchievements(userId);

    // Count helmet stickers and boxcall medals
    const stickerCount = achievements.helmetStickers?.length ?? 0;
    const medalCount = achievements.boxcallMedals?.length ?? 0;

    return stickerCount + medalCount;
  } catch (error) {
    logError("[fetchAchievementCount] Error:", error);
    return 0;
  }
}
