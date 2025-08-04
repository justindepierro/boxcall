import { supabase } from "../lib/supabase";
import type { Database } from "../types/database";
// Type definitions
export type TeamMember = Database["public"]["Tables"]["team_members"]["Row"];
export type Team = Database["public"]["Tables"]["teams"]["Row"];
export type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];
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
   * Get all teams for a user with their membership data
   */
  static async getUserTeams(userId: string): Promise<UserTeamData[]> {
    try {
      const { data: memberships, error } = await supabase
        .from("team_members")
        .select(
          `
          *,
          teams (*)
        `
        )
        .eq("user_id", userId)
        .eq("status", "active");
      if (error) {
        console.error("Error fetching user teams:", error);
        return [];
      }
      // Transform data and get member counts
      const userTeams = await Promise.all(
        (memberships || []).map(async (membership) => {
          // Get member count for each team
          const { count } = await supabase
            .from("team_members")
            .select("*", { count: "exact", head: true })
            .eq("team_id", membership.team_id)
            .eq("status", "active");
          return {
            team: membership.teams as Team,
            membership: membership as TeamMember,
            memberCount: count || 0,
          };
        })
      );
      return userTeams;
    } catch (error) {
      console.error("Error in getUserTeams:", error);
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
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
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
      console.log(
        "🆕 Dashboard Service: Blank slate mode - returning empty activity"
      );
      return [];
    }

    // For production/real modes, try to get real data
    if (devMode === "production" || devMode === "super_admin_real") {
      try {
        // TODO: Implement real activity feed from Supabase
        console.log(
          "🔍 Dashboard Service: Attempting to fetch real activity..."
        );

        // For now, return empty until real implementation
        // In the future, this will fetch from activity/notifications tables
        return [];
      } catch (error) {
        console.warn(
          "Dashboard Service: Could not fetch real activity:",
          error
        );
        return [];
      }
    }

    // For dev modes that need mock activity, check if user has teams
    if (!userTeams || userTeams.length === 0) {
      return [];
    }

    // Return mock data only for dev mock modes
    console.log("🧪 Dashboard Service: Returning mock activity for dev mode");
    const mockActivity: ActivityItem[] = [
      {
        id: "1",
        type: "achievement",
        title: "New helmet sticker earned",
        description: "Touchdown Pass - Game vs. Central",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        teamId: userTeams[0]?.team?.id,
        teamName: userTeams[0]?.team?.name,
        icon: "award",
        color: "jade",
      },
      {
        id: "2",
        type: "practice",
        title: "Practice script updated",
        description: "Friday practice plan uploaded",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        teamId: userTeams[0]?.team?.id,
        teamName: userTeams[0]?.team?.name,
        icon: "file",
        color: "blue",
      },
      {
        id: "3",
        type: "message",
        title: "New message from coach",
        description: "Important update about Saturday game",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        teamId: userTeams[0]?.team?.id,
        teamName: userTeams[0]?.team?.name,
        icon: "message",
        color: "purple",
      },
    ];
    return mockActivity;
  }
  /**
   * Get team status for display
   */
  static getTeamStatus(): { status: string; color: string } {
    // TODO: Implement real season/status logic
    // For now, simple mock logic based on current date
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
