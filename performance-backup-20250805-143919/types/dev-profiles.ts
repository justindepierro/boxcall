/**
 * Development Profile System Types
 *
 * Professional type definitions for the dev profile system that provides
 * realistic testing scenarios without authentication complexity.
 *
 * @version 2.0.0
 * @author BoxCall Development Team
 */

import type { Database } from "./database";

// Base types from database
type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];
type TeamMember = Database["public"]["Tables"]["team_members"]["Row"];

/**
 * Enhanced development modes with proper profile system
 */
/**
 * Development mode types for professional dev profiles and real world integration
 */
export type DevMode =
  // Real world modes
  | "production" // Production mode with real user data
  | "real_world_dev" // Real user data with dev tools enabled

  // Professional dev profiles
  | "dev_head_coach" // Professional head coach profile
  | "dev_assistant_coach" // Professional assistant coach profile
  | "dev_player" // Professional player profile
  | "dev_super_admin" // Professional super admin profile

  // Testing modes
  | "blank_slate" // New user experience - no data

  // Legacy compatibility
  | "super_admin_real" // Legacy super admin with real data
  | "super_admin_mock" // Legacy super admin with mock data
  | "view_as_head_coach" // Legacy head coach view
  | "view_as_coach" // Legacy coach view
  | "view_as_player" // Legacy player view
  | "view_as_manager" // Legacy manager view
  | "view_as_family"; // Legacy family view

/**
 * Development profile configuration
 * Defines the characteristics of each dev profile type
 */
export interface DevProfileConfig {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
  readonly role: UserProfile["role"];
  readonly description: string;
  readonly permissions: DevProfilePermissions;
  readonly teamMemberships: DevTeamMembership[];
  readonly dataScope: DevDataScope;
}

/**
 * Permissions for dev profiles
 * Defines what each dev profile can access and modify
 */
export interface DevProfilePermissions {
  readonly canViewTeams: boolean;
  readonly canManageTeams: boolean;
  readonly canViewPlayers: boolean;
  readonly canManagePlayers: boolean;
  readonly canViewPlaybook: boolean;
  readonly canManagePlaybook: boolean;
  readonly canViewCalendar: boolean;
  readonly canManageCalendar: boolean;
  readonly canViewAchievements: boolean;
  readonly canManageAchievements: boolean;
  readonly canViewReports: boolean;
  readonly canManageReports: boolean;
  readonly systemAdmin: boolean;
}

/**
 * Team membership for dev profiles
 */
export interface DevTeamMembership {
  readonly teamId: string;
  readonly teamName: string;
  readonly role: TeamMember["role"];
  readonly permissions: Record<string, unknown> | null;
  readonly joinedAt: string;
  readonly isPrimary: boolean;
}

/**
 * Data scope definition for dev profiles
 */
export interface DevDataScope {
  readonly dataSource: "empty" | "dev_realistic" | "user_real" | "legacy_mock";
  readonly teamIds: string[];
  readonly hasAchievements: boolean;
  readonly hasCalendarEvents: boolean;
  readonly hasTeamActivity: boolean;
  readonly achievementCount: number;
  readonly eventCount: number;
  readonly activityCount: number;
}

/**
 * Dev profile runtime state
 * Manages the current active dev profile and its data
 */
export interface DevProfileState {
  readonly currentProfile: DevProfileConfig | null;
  readonly isActive: boolean;
  readonly lastSwitched: Date | null;
  readonly dataCache: DevProfileDataCache;
  readonly loading: boolean;
  readonly error: string | null;
}

/**
 * Cached data for dev profiles to improve performance
 */
export interface DevProfileDataCache {
  readonly achievements: unknown[] | null;
  readonly teamData: unknown[] | null;
  readonly calendarEvents: unknown[] | null;
  readonly activityFeed: unknown[] | null;
  readonly lastUpdated: Date | null;
  readonly cacheExpiry: Date | null;
}

/**
 * Service interface for dev profile management
 */
export interface IDevProfileService {
  /**
   * Switch to a development profile
   * @param devMode - The development mode to switch to
   * @returns Promise resolving to the profile configuration
   */
  switchToProfile(devMode: DevMode): Promise<DevProfileConfig>;

  /**
   * Get data for the current dev profile
   * @param dataType - Type of data to retrieve
   * @returns Promise resolving to the requested data
   */
  getProfileData<T>(dataType: string): Promise<T>;

  /**
   * Clear dev profile cache
   */
  clearCache(): Promise<void>;

  /**
   * Validate dev profile permissions
   * @param action - The action to validate
   * @returns Whether the action is permitted
   */
  validatePermission(action: string): boolean;

  /**
   * Get current profile state
   */
  getCurrentState(): DevProfileState;
}

/**
 * Configuration for the dev profile system
 */
export interface DevProfileSystemConfig {
  readonly cacheTimeoutMs: number;
  readonly autoSwitchOnModeChange: boolean;
  readonly validatePermissions: boolean;
  readonly enableLogging: boolean;
  readonly fallbackToMock: boolean;
}

/**
 * Event types for dev profile system
 */
export type DevProfileEvent =
  | {
      type: "PROFILE_SWITCHED";
      payload: { from: DevMode | null; to: DevMode; profile: DevProfileConfig };
    }
  | { type: "DATA_LOADED"; payload: { dataType: string; count: number } }
  | { type: "CACHE_CLEARED"; payload: { timestamp: Date } }
  | { type: "ERROR_OCCURRED"; payload: { error: string; context: string } }
  | { type: "PERMISSION_DENIED"; payload: { action: string; profile: string } };

/**
 * Dev profile event listener interface
 */
export interface IDevProfileEventListener {
  onProfileEvent(event: DevProfileEvent): void;
}

/**
 * Repository interface for dev profile data
 */
export interface IDevProfileRepository {
  getProfileConfig(devMode: DevMode): Promise<DevProfileConfig>;
  getAchievements(profileId: string): Promise<unknown[]>;
  getTeamData(profileId: string): Promise<unknown[]>;
  getCalendarEvents(profileId: string): Promise<unknown[]>;
  getActivityFeed(profileId: string): Promise<unknown[]>;
}

/**
 * Factory for creating dev profile instances
 */
export interface IDevProfileFactory {
  createProfile(devMode: DevMode): Promise<DevProfileConfig>;
  validateProfile(profile: DevProfileConfig): boolean;
}

// Export all types for external consumption
