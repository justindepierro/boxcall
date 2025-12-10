/**
 * useTeamActivity Hook
 * Fetches and calculates team activity statistics for the hero section
 *
 * Uses the unified api() client for database queries.
 * Optimized for fast loading with proper error handling.
 */

import { useState, useEffect, useRef } from "react";
import { api } from "../lib/api/client";
import { logError } from "../utils/logger";

export interface TeamActivityStats {
  newPostsToday: number;
  recentAchievements: number;
  upcomingEvents: number;
  onlineMembers: number;
  loading: boolean;
}

const INITIAL_STATS: TeamActivityStats = {
  newPostsToday: 0,
  recentAchievements: 0,
  upcomingEvents: 0,
  onlineMembers: 0,
  loading: true,
};

export function useTeamActivity(teamId: string): TeamActivityStats {
  const [stats, setStats] = useState<TeamActivityStats>(INITIAL_STATS);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    if (!teamId) {
      setStats({ ...INITIAL_STATS, loading: false });
      return;
    }

    async function loadStats() {
      try {
        const now = new Date();
        const fiveMinutesAgo = new Date(
          now.getTime() - 5 * 60 * 1000
        ).toISOString();

        // Fetch team members - fast query with minimal data
        const { data: teamMembers, error: membersError } = await api("team_members")
          .select("user_id")
          .eq("team_id", teamId)
          .limit(100); // Cap at 100 to prevent slow queries

        if (membersError) {
          console.warn("[useTeamActivity] Failed to fetch team members:", membersError);
          if (mountedRef.current) {
            setStats({ ...INITIAL_STATS, loading: false });
          }
          return;
        }

        const userIds = (teamMembers || [])
          .map((m) => m.user_id)
          .filter((id): id is string => id != null);

        // Count online members (only if we have user IDs)
        let onlineCount = 0;
        if (userIds.length > 0 && userIds.length <= 50) {
          // Only check online status for teams with <= 50 members (performance)
          const { data: onlineProfiles } = await api("profiles")
            .select("id")
            .gte("last_login", fiveMinutesAgo)
            .in("id", userIds);
          onlineCount = onlineProfiles?.length || 0;
        }

        if (mountedRef.current) {
          setStats({
            newPostsToday: 0, // TODO: Implement when team_announcements is ready
            recentAchievements: 0,
            upcomingEvents: 0,
            onlineMembers: onlineCount,
            loading: false,
          });
        }
      } catch (error) {
        logError("Error loading team activity stats:", error);
        if (mountedRef.current) {
          setStats({ ...INITIAL_STATS, loading: false });
        }
      }
    }

    loadStats();

    // Refresh stats every 60 seconds (increased from 30s for better performance)
    const interval = setInterval(loadStats, 60000);
    
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [teamId]);

  return stats;
}
