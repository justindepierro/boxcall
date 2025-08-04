/**
 * Development Profile Repository
 *
 * Repository pattern implementation for dev profile data management.
 * Handles data persistence, caching, and retrieval for development profiles.
 *
 * @version 2.0.0
 * @author BoxCall Development Team
 */

import { supabase } from "../../lib/supabase";
import type {
  DevMode,
  DevProfileConfig,
  IDevProfileRepository,
  DevProfilePermissions,
} from "../../types/dev-profiles";

/**
 * Professional repository for dev profile data
 * Implements separation of concerns and proper error handling
 */
export class DevProfileRepository implements IDevProfileRepository {
  private static instance: DevProfileRepository;
  private readonly cacheMap = new Map<
    string,
    { data: unknown; expiry: number }
  >();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  /**
   * Singleton pattern for repository instance
   */
  public static getInstance(): DevProfileRepository {
    if (!DevProfileRepository.instance) {
      DevProfileRepository.instance = new DevProfileRepository();
    }
    return DevProfileRepository.instance;
  }

  /**
   * Get profile configuration for a dev mode
   * @param devMode - The development mode
   * @returns Promise resolving to profile configuration
   */
  public async getProfileConfig(devMode: DevMode): Promise<DevProfileConfig> {
    const cacheKey = `profile_config_${devMode}`;
    const cached = this.getCachedData<DevProfileConfig>(cacheKey);

    if (cached) {
      return cached;
    }

    const config = await this.buildProfileConfig(devMode);
    this.setCachedData(cacheKey, config);

    return config;
  }

  /**
   * Get achievements for a profile
   * @param profileId - The profile identifier
   * @returns Promise resolving to achievements array
   */
  public async getAchievements(profileId: string): Promise<unknown[]> {
    const cacheKey = `achievements_${profileId}`;
    const cached = this.getCachedData<unknown[]>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", profileId)
        .order("earned_at", { ascending: false });

      if (error) {
        console.error("Error fetching achievements:", error);
        return [];
      }

      const achievements = data || [];
      this.setCachedData(cacheKey, achievements);
      return achievements;
    } catch (error) {
      console.error("Repository error fetching achievements:", error);
      return [];
    }
  }

  /**
   * Get team data for a profile
   * @param profileId - The profile identifier
   * @returns Promise resolving to team data array
   */
  public async getTeamData(profileId: string): Promise<unknown[]> {
    const cacheKey = `team_data_${profileId}`;
    const cached = this.getCachedData<unknown[]>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await supabase
        .from("team_members")
        .select(
          `
          *,
          teams (*)
        `
        )
        .eq("user_id", profileId)
        .eq("status", "active");

      if (error) {
        console.error("Error fetching team data:", error);
        return [];
      }

      const teamData = data || [];
      this.setCachedData(cacheKey, teamData);
      return teamData;
    } catch (error) {
      console.error("Repository error fetching team data:", error);
      return [];
    }
  }

  /**
   * Get calendar events for a profile
   * @param profileId - The profile identifier
   * @returns Promise resolving to calendar events array
   */
  public async getCalendarEvents(profileId: string): Promise<unknown[]> {
    const cacheKey = `calendar_events_${profileId}`;
    const cached = this.getCachedData<unknown[]>(cacheKey);

    if (cached) {
      return cached;
    }

    // For now, return empty array - will implement real calendar queries later
    const events: unknown[] = [];
    this.setCachedData(cacheKey, events);
    return events;
  }

  /**
   * Get activity feed for a profile
   * @param profileId - The profile identifier
   * @returns Promise resolving to activity feed array
   */
  public async getActivityFeed(profileId: string): Promise<unknown[]> {
    const cacheKey = `activity_feed_${profileId}`;
    const cached = this.getCachedData<unknown[]>(cacheKey);

    if (cached) {
      return cached;
    }

    // For now, return empty array - will implement real activity queries later
    const activities: unknown[] = [];
    this.setCachedData(cacheKey, activities);
    return activities;
  }

  /**
   * Clear all cached data
   */
  public clearCache(): void {
    this.cacheMap.clear();
  }

  /**
   * Build profile configuration based on dev mode
   * @private
   */
  private async buildProfileConfig(
    devMode: DevMode
  ): Promise<DevProfileConfig> {
    const configs = this.getDevProfileConfigs();
    const config = configs[devMode];

    if (!config) {
      throw new Error(`Unknown dev mode: ${devMode}`);
    }

    return config;
  }

  /**
   * Get cached data if valid
   * @private
   */
  private getCachedData<T>(key: string): T | null {
    const cached = this.cacheMap.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data as T;
    }

    // Clean up expired cache
    if (cached) {
      this.cacheMap.delete(key);
    }

    return null;
  }

  /**
   * Set cached data with expiry
   * @private
   */
  private setCachedData<T>(key: string, data: T): void {
    this.cacheMap.set(key, {
      data,
      expiry: Date.now() + this.CACHE_DURATION,
    });
  }

  /**
   * Get all dev profile configurations
   * @private
   */
  private getDevProfileConfigs(): Record<DevMode, DevProfileConfig> {
    return {
      production: {
        id: "production",
        email: "",
        fullName: "Production User",
        role: null,
        description: "Real user data",
        permissions: this.getProductionPermissions(),
        teamMemberships: [],
        dataScope: {
          dataSource: "user_real",
          teamIds: [],
          hasAchievements: false,
          hasCalendarEvents: false,
          hasTeamActivity: false,
          achievementCount: 0,
          eventCount: 0,
          activityCount: 0,
        },
      },

      blank_slate: {
        id: "blank_slate",
        email: "dev_blank_slate@boxcall.dev",
        fullName: "New Coach",
        role: "coach",
        description: "Empty state for new user testing",
        permissions: this.getCoachPermissions(),
        teamMemberships: [],
        dataScope: {
          dataSource: "empty",
          teamIds: [],
          hasAchievements: false,
          hasCalendarEvents: false,
          hasTeamActivity: false,
          achievementCount: 0,
          eventCount: 0,
          activityCount: 0,
        },
      },

      dev_head_coach: {
        id: "dev_head_coach",
        email: "dev_head_coach@boxcall.dev",
        fullName: "Coach Mike Thompson",
        role: "coach",
        description: "Head coach with full team access",
        permissions: this.getHeadCoachPermissions(),
        teamMemberships: [
          {
            teamId: "dev-team-varsity",
            teamName: "BoxCall Development Varsity",
            role: "head_coach",
            permissions: null,
            joinedAt: "2024-08-01T00:00:00Z",
            isPrimary: true,
          },
        ],
        dataScope: {
          dataSource: "dev_realistic",
          teamIds: ["dev-team-varsity"],
          hasAchievements: true,
          hasCalendarEvents: true,
          hasTeamActivity: true,
          achievementCount: 12,
          eventCount: 25,
          activityCount: 50,
        },
      },

      dev_assistant_coach: {
        id: "dev_assistant_coach",
        email: "dev_assistant_coach@boxcall.dev",
        fullName: "Coach Sarah Rodriguez",
        role: "coach",
        description: "Assistant coach with limited access",
        permissions: this.getAssistantCoachPermissions(),
        teamMemberships: [
          {
            teamId: "dev-team-varsity",
            teamName: "BoxCall Development Varsity",
            role: "coach",
            permissions: { canManagePlaybook: false, canManageRoster: false },
            joinedAt: "2024-08-15T00:00:00Z",
            isPrimary: true,
          },
        ],
        dataScope: {
          dataSource: "dev_realistic",
          teamIds: ["dev-team-varsity"],
          hasAchievements: true,
          hasCalendarEvents: true,
          hasTeamActivity: true,
          achievementCount: 8,
          eventCount: 20,
          activityCount: 30,
        },
      },

      dev_player: {
        id: "dev_player",
        email: "dev_player@boxcall.dev",
        fullName: "Jake Williams",
        role: "player",
        description: "Player #15, Quarterback, Junior",
        permissions: this.getPlayerPermissions(),
        teamMemberships: [
          {
            teamId: "dev-team-varsity",
            teamName: "BoxCall Development Varsity",
            role: "player",
            permissions: null,
            joinedAt: "2024-07-01T00:00:00Z",
            isPrimary: true,
          },
        ],
        dataScope: {
          dataSource: "dev_realistic",
          teamIds: ["dev-team-varsity"],
          hasAchievements: true,
          hasCalendarEvents: true,
          hasTeamActivity: true,
          achievementCount: 15,
          eventCount: 18,
          activityCount: 40,
        },
      },

      dev_super_admin: {
        id: "dev_super_admin",
        email: "dev_super_admin@boxcall.dev",
        fullName: "System Administrator",
        role: "admin",
        description: "System admin with all access",
        permissions: this.getSuperAdminPermissions(),
        teamMemberships: [
          {
            teamId: "dev-team-varsity",
            teamName: "BoxCall Development Varsity",
            role: "head_coach",
            permissions: null,
            joinedAt: "2024-01-01T00:00:00Z",
            isPrimary: true,
          },
          {
            teamId: "dev-team-jv",
            teamName: "BoxCall Development JV",
            role: "head_coach",
            permissions: null,
            joinedAt: "2024-01-01T00:00:00Z",
            isPrimary: false,
          },
        ],
        dataScope: {
          dataSource: "dev_realistic",
          teamIds: ["dev-team-varsity", "dev-team-jv"],
          hasAchievements: true,
          hasCalendarEvents: true,
          hasTeamActivity: true,
          achievementCount: 25,
          eventCount: 50,
          activityCount: 100,
        },
      },

      real_world_dev: {
        id: "real_world_dev",
        email: "",
        fullName: "Real World Dev User",
        role: null,
        description: "Real user data with dev tools",
        permissions: this.getProductionPermissions(),
        teamMemberships: [],
        dataScope: {
          dataSource: "user_real",
          teamIds: [],
          hasAchievements: false,
          hasCalendarEvents: false,
          hasTeamActivity: false,
          achievementCount: 0,
          eventCount: 0,
          activityCount: 0,
        },
      },

      super_admin_real: {
        id: "super_admin_real",
        email: "",
        fullName: "Super Admin (Real)",
        role: null,
        description: "Legacy super admin with real data",
        permissions: this.getSuperAdminPermissions(),
        teamMemberships: [],
        dataScope: {
          dataSource: "user_real",
          teamIds: [],
          hasAchievements: false,
          hasCalendarEvents: false,
          hasTeamActivity: false,
          achievementCount: 0,
          eventCount: 0,
          activityCount: 0,
        },
      },

      super_admin_mock: {
        id: "super_admin_mock",
        email: "",
        fullName: "Super Admin (Mock)",
        role: null,
        description: "Legacy super admin with mock data",
        permissions: this.getSuperAdminPermissions(),
        teamMemberships: [],
        dataScope: {
          dataSource: "legacy_mock",
          teamIds: ["mock-team-eagles"],
          hasAchievements: true,
          hasCalendarEvents: true,
          hasTeamActivity: true,
          achievementCount: 10,
          eventCount: 15,
          activityCount: 20,
        },
      },

      view_as_head_coach: {
        id: "view_as_head_coach",
        email: "",
        fullName: "View as Head Coach",
        role: "coach",
        description: "Legacy head coach view",
        permissions: this.getHeadCoachPermissions(),
        teamMemberships: [],
        dataScope: {
          dataSource: "legacy_mock",
          teamIds: ["mock-team-eagles"],
          hasAchievements: true,
          hasCalendarEvents: true,
          hasTeamActivity: true,
          achievementCount: 12,
          eventCount: 25,
          activityCount: 50,
        },
      },

      view_as_coach: {
        id: "view_as_coach",
        email: "",
        fullName: "View as Coach",
        role: "coach",
        description: "Legacy coach view",
        permissions: this.getAssistantCoachPermissions(),
        teamMemberships: [],
        dataScope: {
          dataSource: "legacy_mock",
          teamIds: ["mock-team-eagles"],
          hasAchievements: true,
          hasCalendarEvents: true,
          hasTeamActivity: true,
          achievementCount: 8,
          eventCount: 20,
          activityCount: 30,
        },
      },

      view_as_player: {
        id: "view_as_player",
        email: "",
        fullName: "View as Player",
        role: "player",
        description: "Legacy player view",
        permissions: this.getPlayerPermissions(),
        teamMemberships: [],
        dataScope: {
          dataSource: "legacy_mock",
          teamIds: ["mock-team-eagles"],
          hasAchievements: true,
          hasCalendarEvents: true,
          hasTeamActivity: true,
          achievementCount: 15,
          eventCount: 18,
          activityCount: 40,
        },
      },

      view_as_manager: {
        id: "view_as_manager",
        email: "",
        fullName: "View as Manager",
        role: "coach",
        description: "Legacy manager view",
        permissions: this.getCoachPermissions(),
        teamMemberships: [],
        dataScope: {
          dataSource: "legacy_mock",
          teamIds: ["mock-team-eagles"],
          hasAchievements: false,
          hasCalendarEvents: true,
          hasTeamActivity: true,
          achievementCount: 0,
          eventCount: 30,
          activityCount: 25,
        },
      },

      view_as_family: {
        id: "view_as_family",
        email: "",
        fullName: "View as Family",
        role: "family",
        description: "Legacy family view",
        permissions: this.getCoachPermissions(),
        teamMemberships: [],
        dataScope: {
          dataSource: "legacy_mock",
          teamIds: ["mock-team-eagles"],
          hasAchievements: false,
          hasCalendarEvents: true,
          hasTeamActivity: true,
          achievementCount: 0,
          eventCount: 12,
          activityCount: 15,
        },
      },
    };
  }

  // Permission methods
  private getProductionPermissions(): DevProfilePermissions {
    return {
      canViewTeams: true,
      canManageTeams: true,
      canViewPlayers: true,
      canManagePlayers: true,
      canViewPlaybook: true,
      canManagePlaybook: true,
      canViewCalendar: true,
      canManageCalendar: true,
      canViewAchievements: true,
      canManageAchievements: true,
      canViewReports: true,
      canManageReports: true,
      systemAdmin: false,
    };
  }

  private getCoachPermissions(): DevProfilePermissions {
    return {
      canViewTeams: false,
      canManageTeams: false,
      canViewPlayers: false,
      canManagePlayers: false,
      canViewPlaybook: false,
      canManagePlaybook: false,
      canViewCalendar: false,
      canManageCalendar: false,
      canViewAchievements: false,
      canManageAchievements: false,
      canViewReports: false,
      canManageReports: false,
      systemAdmin: false,
    };
  }

  private getHeadCoachPermissions(): DevProfilePermissions {
    return {
      canViewTeams: true,
      canManageTeams: true,
      canViewPlayers: true,
      canManagePlayers: true,
      canViewPlaybook: true,
      canManagePlaybook: true,
      canViewCalendar: true,
      canManageCalendar: true,
      canViewAchievements: true,
      canManageAchievements: true,
      canViewReports: true,
      canManageReports: true,
      systemAdmin: false,
    };
  }

  private getAssistantCoachPermissions(): DevProfilePermissions {
    return {
      canViewTeams: true,
      canManageTeams: false,
      canViewPlayers: true,
      canManagePlayers: false,
      canViewPlaybook: true,
      canManagePlaybook: false,
      canViewCalendar: true,
      canManageCalendar: true,
      canViewAchievements: true,
      canManageAchievements: true,
      canViewReports: true,
      canManageReports: false,
      systemAdmin: false,
    };
  }

  private getPlayerPermissions(): DevProfilePermissions {
    return {
      canViewTeams: true,
      canManageTeams: false,
      canViewPlayers: true,
      canManagePlayers: false,
      canViewPlaybook: true,
      canManagePlaybook: false,
      canViewCalendar: true,
      canManageCalendar: false,
      canViewAchievements: true,
      canManageAchievements: false,
      canViewReports: false,
      canManageReports: false,
      systemAdmin: false,
    };
  }

  private getSuperAdminPermissions(): DevProfilePermissions {
    return {
      canViewTeams: true,
      canManageTeams: true,
      canViewPlayers: true,
      canManagePlayers: true,
      canViewPlaybook: true,
      canManagePlaybook: true,
      canViewCalendar: true,
      canManageCalendar: true,
      canViewAchievements: true,
      canManageAchievements: true,
      canViewReports: true,
      canManageReports: true,
      systemAdmin: true,
    };
  }
}
