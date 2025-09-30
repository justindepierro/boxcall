import { supabase } from "../lib/supabase";

import type { Database } from "../types/database";

// Type definitions with proper database types
type DatabaseTeam = Database["public"]["Tables"]["teams"]["Row"];
type DatabaseTeamMember = Database["public"]["Tables"]["team_members"]["Row"];
type DatabaseProfile = Database["public"]["Tables"]["profiles"]["Row"];

// Export refined types for the service
export type TeamMember = DatabaseTeamMember;
export type Team = DatabaseTeam;
export type UserProfile = DatabaseProfile;
export interface UserTeamData {
  team: Team;
  membership: TeamMember;
  memberCount?: number;
}
export interface DashboardData {
  userTeams: UserTeamData[];
  totalTeams: number;
  activeTeams: UserTeamData[];
  recentActivity?: ActivityItem[];
}
export interface ActivityItem {
  id: string;
  type: "achievement" | "message" | "event" | "practice" | "game";
  title: string;
  description: string;
  timestamp: string;
  teamId?: string;
  teamName?: string;
  icon: string;
  color: string;
}
/**
 * Dashboard Data Service
 * Provides centralized data fetching for dashboard components
 */
export class DashboardService {
  /**
   * Update the current user's profile (bio, avatar_url, etc.)
   */
  static async updateUserProfile(
    userId: string,
    updates: Partial<{ bio: string; avatar_url: string }>
  ): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();
    if (error) {
      // TODO: Handle error (was: console.error)
      return null;
    }
    return data as UserProfile;
  }
  /**
   * Get all teams for a user with their membership data
   */
  static async getUserTeams(userId: string): Promise<UserTeamData[]> {
    try {
      // Get user's team memberships first
      const { data: memberships, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active");

      if (error) {
        // TODO: Handle error fetching user teams (was: console.error)
        return [];
      }

      if (!memberships || memberships.length === 0) {
        return [];
      }

      // Get unique team IDs with proper typing
      const teamIds = [
        ...new Set(
          memberships.map((m) => (m as unknown as TeamMember).team_id)
        ),
      ];

      // Get team data separately
      const { data: teams, error: teamsError } = await supabase
        .from("teams")
        .select("*")
        .in("id", teamIds);

      if (teamsError) {
        // TODO: Handle error fetching teams (was: console.error)
        return [];
      }

      if (!teams) {
        return [];
      }

      // Transform the data with proper type handling
      const userTeams: UserTeamData[] = [];

      // Get member counts for all teams in a single query to avoid N+1
      const { data: memberCounts } = await supabase
        .from("team_members")
        .select("team_id")
        .in("team_id", teamIds)
        .eq("status", "active");

      // Group member counts by team_id
      const memberCountMap = new Map<string, number>();
      if (memberCounts) {
        memberCounts.forEach(member => {
          const teamId = member.team_id;
          memberCountMap.set(teamId, (memberCountMap.get(teamId) || 0) + 1);
        });
      }

      for (const membership of memberships) {
        const typedMembership = membership as unknown as TeamMember;
        const team = teams.find(
          (t) => (t as unknown as Team).id === typedMembership.team_id
        );
        if (!team) continue;

        userTeams.push({
          team: team as unknown as Team,
          membership: membership as unknown as TeamMember,
          memberCount: memberCountMap.get(typedMembership.team_id) || 0,
        });
      }

      return userTeams;
    } catch {
      // TODO: Handle error in getUserTeams (was: console.error)
      return [];
    }
  }
  /**
   * Get comprehensive dashboard data for a user
   */
  static async getDashboardData(
    userId: string,
    devMode?: string
  ): Promise<DashboardData> {
    try {
      const userTeams = await this.getUserTeams(userId);
      // Filter active teams (in season)
      const activeTeams = userTeams.filter(() => {
        // TODO: Add season logic - for now, all teams are considered active
        return true;
      });
      // Get recent activity with dev mode awareness
      const recentActivity = await this.getRecentActivity(
        userId,
        userTeams,
        devMode
      );
      return {
        userTeams,
        totalTeams: userTeams.length,
        activeTeams,
        recentActivity,
      };
    } catch {
      // TODO: Handle error fetching dashboard data (was: console.error)
      return {
        userTeams: [],
        totalTeams: 0,
        activeTeams: [],
        recentActivity: [],
      };
    }
  }
  /**
   * Get recent activity for dashboard
   * TODO: Implement real activity feed from events, messages, achievements
   */
  static async getRecentActivity(
    _userId: string,
    userTeams: UserTeamData[],
    devMode?: string
  ): Promise<ActivityItem[]> {
    // For blank slate mode, return empty activity
    if (devMode === "blank_slate") {
      // TODO: Remove dashboard debug log (was: console.log)
      return [];
    }

    // For production/real modes, try to get real data
    if (devMode === "production" || devMode === "super_admin_real") {
      try {
        // TODO: Implement real activity feed from Supabase
        console.info(
          "[Search/Investigate] Dashboard Service: Attempting to fetch real activity..."
        );

        // For now, return empty until real implementation
        // In the future, this will fetch from activity/notifications tables
        return [];
      } catch (_error) {
        console.warn(
          "Dashboard Service: Could not fetch real activity:",
          _error
        );
        return [];
      }
    }

    // For users with no teams, return empty activity
    if (!userTeams || userTeams.length === 0) {
      return [];
    }

    // TODO: Implement real activity fetching from Supabase
    // For now, return empty until we have real data
    return [];
  }
  /**
   * Get team status for display
   */
  static getTeamStatus(): { status: string; color: string } {
    // TODO: Implement real season/status logic from database
    // For now, simple logic based on current date
    const currentMonth = new Date().getMonth(); // 0-11
    if (currentMonth >= 7 && currentMonth <= 11) {
      // Aug-Dec
      return { status: "Active", color: "jade" };
    } else if (currentMonth >= 2 && currentMonth <= 5) {
      // Mar-Jun
      return { status: "Spring Season", color: "blue" };
    } else {
      return { status: "Off Season", color: "gray" };
    }
  }
  /**
   * Get user's primary team (most recent active membership)
   */
  static getPrimaryTeam(userTeams: UserTeamData[]): UserTeamData | null {
    if (userTeams.length === 0) return null;
    // Sort by joined date and return most recent
    const sorted = [...userTeams].sort(
      (a, b) =>
        new Date(b.membership.joined_at || "").getTime() -
        new Date(a.membership.joined_at || "").getTime()
    );
    return sorted[0];
  }
}
