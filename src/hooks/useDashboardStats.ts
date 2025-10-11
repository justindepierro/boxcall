/**
 * Dashboard Stats Hook
 *
 * Fetches and aggregates dashboard statistics for the mobile hero card:
 * - Total plays across all user teams
 * - This week's activity count
 * - Achievement/badge count
 */

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { AchievementService } from "../services/achievementService";

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
        // userId is guaranteed to be defined here due to early return above
        const userIdStr = userId as string;

        // Parallel fetch all stats
        const [playsResult, activityResult, achievementsResult] =
          await Promise.all([
            fetchTotalPlays(userIdStr),
            fetchThisWeekActivity(userIdStr),
            fetchAchievementCount(userIdStr),
          ]);

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
        console.error("[useDashboardStats] Error fetching stats:", error);
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
 */
async function fetchTotalPlays(userId: string): Promise<number> {
  try {
    // Get user's team memberships
    const { data: memberships, error: memberError } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", userId)
      .eq("status", "active");

    if (memberError || !memberships || memberships.length === 0) {
      return 0;
    }

    const teamIds = memberships.map((m) => (m as { team_id: string }).team_id);

    // Count plays across all teams
    const { count, error: playsError } = await supabase
      .from("plays")
      .select("*", { count: "exact", head: true })
      .in("team_id", teamIds);

    if (playsError) {
      console.warn("[fetchTotalPlays] Error:", playsError.message);
      return 0;
    }

    return count ?? 0;
  } catch (error) {
    console.error("[fetchTotalPlays] Unexpected error:", error);
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
    startOfWeek.setDate(now.getDate() - now.getDay()); // Go back to Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfWeekISO = startOfWeek.toISOString();

    // Get user's team IDs first
    const { data: memberships, error: memberError } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", userId)
      .eq("status", "active");

    if (memberError || !memberships || memberships.length === 0) {
      return 0;
    }

    const teamIds = memberships.map((m) => (m as { team_id: string }).team_id);

    // Count posts from this week
    const { count: postsCount, error: postsError } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .in("team_id", teamIds)
      .gte("created_at", startOfWeekISO);

    // Count calendar events from this week (practices + games)
    const { count: eventsCount, error: eventsError } = await supabase
      .from("calendar_events")
      .select("*", { count: "exact", head: true })
      .in("team_id", teamIds)
      .gte("created_at", startOfWeekISO);

    if (postsError || eventsError) {
      console.warn("[fetchThisWeekActivity] Error fetching activity counts");
      return (postsCount ?? 0) + (eventsCount ?? 0); // Return partial data
    }

    return (postsCount ?? 0) + (eventsCount ?? 0);
  } catch (error) {
    console.error("[fetchThisWeekActivity] Unexpected error:", error);
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
    console.error("[fetchAchievementCount] Error:", error);
    return 0;
  }
}
