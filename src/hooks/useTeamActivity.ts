/**
 * useTeamActivity Hook
 * Fetches and calculates team activity statistics for the hero section
 */

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

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
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayStartISO = todayStart.toISOString();

        // 1. Count announcements created today
        const { count: postsCount } = await supabase
          .from("team_announcements")
          .select("id", { count: "exact", head: true })
          .eq("team_id", teamId)
          .eq("status", "published")
          .gte("created_at", todayStartISO);

        // 2. Count recent achievements (placeholder - you can wire this up to your achievements system)
        // For now, just show a static number or 0
        const recentAchievements = 0;

        // 3. Count upcoming events (placeholder - wire up to calendar/events)
        const upcomingEvents = 0;

        // 4. Count online members (users active in last 5 minutes)
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
        
        // First get team member user IDs
        const { data: teamMembers } = await supabase
          .from("team_members")
          .select("user_id")
          .eq("team_id", teamId);

        const userIds = (teamMembers || []).map((m) => m.user_id);

        // Then count online members
        let onlineCount = 0;
        if (userIds.length > 0) {
          const { count } = await supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .gte("last_active", fiveMinutesAgo)
            .in("id", userIds);
          onlineCount = count || 0;
        }

        setStats({
          newPostsToday: postsCount || 0,
          recentAchievements,
          upcomingEvents,
          onlineMembers: onlineCount,
          loading: false,
        });
      } catch (error) {
        console.error("Error loading team activity stats:", error);
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
