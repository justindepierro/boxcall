/**
 * useTeamActivity Hook
 * Fetches and calculates team activity statistics for the hero section
 *
 * Uses the unified api() client for database queries.
 */

import { useState, useEffect } from "react";
import { api } from "../lib/api/client";
import { logError } from "../utils/logger";

export interface TeamActivityStats {
  newPostsToday: number;
  recentAchievements: number;
  upcomingEvents: number;
  onlineMembers: number;
  loading: boolean;
}

export function useTeamActivity(teamId: string): TeamActivityStats {
  const [stats, setStats] = useState<TeamActivityStats>({
    newPostsToday: 0,
    recentAchievements: 0,
    upcomingEvents: 0,
    onlineMembers: 0,
    loading: true,
  });

  useEffect(() => {
    if (!teamId) return;

    async function loadStats() {
      try {
        const now = new Date();
        // const todayStart = new Date(
        //   now.getFullYear(),
        //   now.getMonth(),
        //   now.getDate()
        // );
        // const todayStartISO = todayStart.toISOString(); // Not currently used

        // 1. Count announcements created today
        // TODO: Implement team_announcements table and re-enable this query
        const postsCount = 0;

        // 2. Count recent achievements (placeholder)
        const recentAchievements = 0;

        // 3. Count upcoming events (placeholder)
        const upcomingEvents = 0;

        // 4. Count online members (users active in last 5 minutes)
        const fiveMinutesAgo = new Date(
          now.getTime() - 5 * 60 * 1000
        ).toISOString();

        // First get team member user IDs
        const { data: teamMembers } = await api("team_members")
          .select("user_id")
          .eq("team_id", teamId);

        const userIds = (teamMembers || []).map((m) => m.user_id);

        // Then count online members (using last_login as activity indicator)
        let onlineCount = 0;
        if (userIds.length > 0) {
          const { data: onlineProfiles } = await api("profiles")
            .select("id")
            .gte("last_login", fiveMinutesAgo)
            .in("id", userIds);
          onlineCount = onlineProfiles?.length || 0;
        }

        setStats({
          newPostsToday: postsCount || 0,
          recentAchievements,
          upcomingEvents,
          onlineMembers: onlineCount,
          loading: false,
        });
      } catch (error) {
        logError("Error loading team activity stats:", error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    }

    loadStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [teamId]);

  return stats;
}
