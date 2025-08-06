/**
 * Dashboard Service Migration - Phase 4 Implementation
 *
 * New dashboard service that uses DataResolutionService for clean data loading.
 * Replaces the old dashboardService with dev mode awareness.
 *
 * @version 4.0.0 - Phase 4 Data Resolution Integration
 * @author BoxCall Development Team
 */

import { DataResolutionService } from "./DataResolutionService";
import type {
  CleanDevMode,
  DataResolutionContext,
} from "../app/dev-mode-types-clean";

export interface ActivityItem {
  id: string;
  type: "achievement" | "practice" | "message" | "game" | "meeting";
  title: string;
  description: string;
  timestamp: string;
  teamId?: string;
  teamName?: string;
  icon: string;
  color: string;
}

export interface UserTeamData {
  team: {
    id: string;
    name: string;
    description?: string;
    team_code?: string;
    subscription_tier?: string;
    season_year?: number;
    school?: string;
    mascot?: string;
  };
  membership: {
    role: string;
    status?: string;
    joined_at?: string;
  };
  memberCount: number;
}

export interface DashboardData {
  userTeams: UserTeamData[];
  totalTeams: number;
  activeTeams: UserTeamData[];
  recentActivity: ActivityItem[];
}

/**
 * Clean Dashboard Service using DataResolutionService
 */
export class DashboardServiceV4 {
  private static instance: DashboardServiceV4;
  private dataResolver: DataResolutionService;

  private constructor() {
    this.dataResolver = DataResolutionService.getInstance();
  }

  public static getInstance(): DashboardServiceV4 {
    if (!DashboardServiceV4.instance) {
      DashboardServiceV4.instance = new DashboardServiceV4();
    }
    return DashboardServiceV4.instance;
  }

  /**
   * Get comprehensive dashboard data using clean data resolution
   */
  async getDashboardData(
    userId: string,
    userEmail: string,
    devMode: CleanDevMode
  ): Promise<DashboardData> {
    try {
      console.log("[Statistics/Chart] Dashboard V4: Loading dashboard data", {
        userId,
        devMode,
      });

      // Get data resolution context
      const context = this.dataResolver.resolveDataContext(
        devMode,
        userId,
        userEmail
      );

      // Load teams and achievements in parallel
      const [teams, achievementsResult] = await Promise.all([
        this.dataResolver.getTeamData(context, userId),
        this.dataResolver.getAchievements(context),
      ]);

      // Type guard for achievements
      const isValidAchievementArray = (
        data: unknown
      ): data is Array<{
        id: string;
        title: string;
        description?: string;
        date: string;
        [key: string]: unknown;
      }> => {
        return (
          Array.isArray(data) &&
          data.every(
            (item) =>
              item &&
              typeof item === "object" &&
              "id" in item &&
              "title" in item &&
              "date" in item
          )
        );
      };

      const achievements = isValidAchievementArray(achievementsResult)
        ? achievementsResult
        : [];

      // Transform teams into user team data
      const userTeams: UserTeamData[] = (teams || []).map((team) => ({
        team,
        membership: {
          role: this.getUserRoleForTeam(context, team.id),
          status: "active",
          joined_at: new Date().toISOString(),
        },
        memberCount: this.getMemberCountForTeam(context, team.id),
      }));

      // Generate recent activity from achievements
      const recentActivity = this.generateRecentActivity(
        achievements,
        userTeams
      );

      const dashboardData: DashboardData = {
        userTeams,
        totalTeams: userTeams.length,
        activeTeams: userTeams, // All teams are active for now
        recentActivity,
      };

      console.log("[Success/Complete] Dashboard V4: Successfully loaded data", {
        teamsCount: userTeams.length,
        activitiesCount: recentActivity.length,
        dataSource: context.dataSource,
      });

      return dashboardData;
    } catch (error) {
      console.error(
        "[Error/Failed] Dashboard V4: Error loading dashboard data",
        error
      );
      return {
        userTeams: [],
        totalTeams: 0,
        activeTeams: [],
        recentActivity: [],
      };
    }
  }

  /**
   * Get user role for a specific team based on context
   */
  private getUserRoleForTeam(
    context: DataResolutionContext,
    _teamId: string
  ): string {
    // Use permission context to determine role
    switch (context.permissionContext) {
      case "super_admin":
        return "super_admin";
      case "head_coach":
        return "head_coach";
      case "assistant_coach":
        return "assistant_coach";
      case "player":
        return "player";
      case "manager":
        return "manager";
      case "family":
        return "family";
      default:
        return "viewer";
    }
  }

  /**
   * Get member count for team based on context
   */
  private getMemberCountForTeam(
    context: DataResolutionContext,
    _teamId: string
  ): number {
    // Return realistic member counts based on data source
    switch (context.dataSource) {
      case "user_real":
        // TODO: Load real member count from database
        return 15;
      case "dev_realistic":
        return 25; // Realistic high school team size
      case "legacy_mock":
        return 20; // Old mock data
      case "empty":
        return 0;
      default:
        return 0;
    }
  }

  /**
   * Generate recent activity from achievements and other data
   */
  private generateRecentActivity(
    achievements: Array<{
      id: string;
      title: string;
      description?: string;
      date: string;
      [key: string]: unknown;
    }>,
    userTeams: UserTeamData[]
  ): ActivityItem[] {
    const activities: ActivityItem[] = [];

    // Convert achievements to activities
    achievements.slice(0, 3).forEach((achievement) => {
      activities.push({
        id: achievement.id,
        type: "achievement",
        title: achievement.title,
        description: achievement.description || "Team achievement unlocked",
        timestamp: achievement.date,
        teamId: userTeams[0]?.team?.id,
        teamName: userTeams[0]?.team?.name,
        icon: "award",
        color: "jade",
      });
    });

    // Add some default activities if we don't have enough
    if (activities.length < 3 && userTeams.length > 0) {
      const team = userTeams[0].team;

      activities.push({
        id: "practice-update",
        type: "practice",
        title: "Practice plan updated",
        description: "Weekly practice schedule has been updated",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        teamId: team.id,
        teamName: team.name,
        icon: "file",
        color: "blue",
      });

      activities.push({
        id: "message-coach",
        type: "message",
        title: "Message from coach",
        description: "Important team announcement",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        teamId: team.id,
        teamName: team.name,
        icon: "message",
        color: "purple",
      });
    }

    return activities.slice(0, 5); // Limit to 5 most recent
  }

  /**
   * Get team status information
   */
  getTeamStatus(): { status: string; color: string } {
    const currentMonth = new Date().getMonth(); // 0-11

    if (currentMonth >= 7 && currentMonth <= 11) {
      // Aug-Dec: Football season
      return { status: "In Season", color: "jade" };
    } else if (currentMonth >= 0 && currentMonth <= 2) {
      // Jan-Mar: Off-season training
      return { status: "Off-Season Training", color: "amber" };
    } else {
      // Apr-Jul: Pre-season
      return { status: "Pre-Season", color: "blue" };
    }
  }
}

// Export singleton instance
export const dashboardServiceV4 = DashboardServiceV4.getInstance();
export default dashboardServiceV4;
