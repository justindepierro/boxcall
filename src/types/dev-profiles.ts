/**
 * Development Profiles - Types
 * Dedicated types for the dev profile system, separate from app dev mode.
 */

// Dev profile modes supported by the dev-profile system
export type DevMode =
  | "production"
  | "blank_slate"
  | "real_world_dev"
  | "dev_head_coach"
  | "dev_assistant_coach"
  | "dev_player"
  | "dev_super_admin"
  | "super_admin_real"
  | "super_admin_mock"
  | "view_as_head_coach"
  | "view_as_coach"
  | "view_as_player"
  | "view_as_manager"
  | "view_as_family";

export interface DevProfilePermissions {
  canViewTeams: boolean;
  canManageTeams: boolean;
  canViewPlayers: boolean;
  canManagePlayers: boolean;
  canViewPlaybook: boolean;
  canManagePlaybook: boolean;
  canViewCalendar: boolean;
  canManageCalendar: boolean;
  canViewAchievements: boolean;
  canManageAchievements: boolean;
  canViewReports: boolean;
  canManageReports: boolean;
  systemAdmin: boolean;
}

export interface DevTeamMembership {
  teamId: string;
  teamName: string;
  role: string;
  permissions: Record<string, boolean> | null;
  joinedAt: string; // ISO date string
  isPrimary: boolean;
}

export interface DevProfileDataScope {
  dataSource: "user_real" | "dev_realistic" | "empty";
  teamIds: string[];
  hasAchievements: boolean;
  hasCalendarEvents: boolean;
  hasTeamActivity: boolean;
  achievementCount: number;
  eventCount: number;
  activityCount: number;
}

export interface DevProfileConfig {
  id: string;
  email: string;
  fullName: string;
  role: "coach" | "player" | "admin" | null;
  description: string;
  permissions: DevProfilePermissions;
  teamMemberships: DevTeamMembership[];
  dataScope: DevProfileDataScope;
}

export interface DevProfileCacheState {
  achievements: unknown[] | null;
  teamData: unknown[] | null;
  calendarEvents: unknown[] | null;
  activityFeed: unknown[] | null;
  lastUpdated: Date | null;
  cacheExpiry: Date | null;
}

export interface DevProfileState {
  currentProfile: DevProfileConfig | null;
  isActive: boolean;
  lastSwitched: Date | null;
  dataCache: DevProfileCacheState;
  loading: boolean;
  error: string | null;
}

export type DevProfileEvent =
  | {
      type: "PROFILE_SWITCHED";
      payload: { from: DevMode | null; to: DevMode; profile: DevProfileConfig };
    }
  | { type: "DATA_LOADED"; payload: { dataType: string; count: number } }
  | { type: "CACHE_CLEARED"; payload: { timestamp: Date } }
  | { type: "PERMISSION_DENIED"; payload: { action: string; profile: string } }
  | { type: "ERROR_OCCURRED"; payload: { error: string; context: string } };

export interface IDevProfileEventListener {
  onProfileEvent(event: DevProfileEvent): void;
}

export interface DevProfileSystemConfig {
  cacheTimeoutMs: number;
  autoSwitchOnModeChange: boolean;
  validatePermissions: boolean;
  enableLogging: boolean;
  fallbackToMock: boolean;
}

export interface IDevProfileService {
  switchToProfile(devMode: DevMode): Promise<DevProfileConfig>;
  getProfileData<T>(dataType: string): Promise<T>;
  clearCache(): Promise<void>;
  validatePermission(action: string): boolean;
  getCurrentState(): DevProfileState;
  addEventListener(listener: IDevProfileEventListener): void;
  removeEventListener(listener: IDevProfileEventListener): void;
  updateConfig(newConfig: Partial<DevProfileSystemConfig>): void;
  isInDevMode(): boolean;
  getCurrentPermissions(): DevProfilePermissions | null;
}

export interface IDevProfileRepository {
  getProfileConfig(devMode: DevMode): Promise<DevProfileConfig>;
  getAchievements(profileId: string): Promise<unknown[]>;
  getTeamData(profileId: string): Promise<unknown[]>;
  getCalendarEvents(profileId: string): Promise<unknown[]>;
  getActivityFeed(profileId: string): Promise<unknown[]>;
  clearCache(): void;
}
