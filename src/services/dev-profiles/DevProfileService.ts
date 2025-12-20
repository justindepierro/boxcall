/**
 * Development Profile Service
 *
 * Professional service layer for managing development profiles.
 * Implements business logic, validation, and coordination between
 * repository and application layers.
 *
 * @version 2.0.0
 * @author BoxCall Development Team
 */

import { DevProfileRepository } from "./DevProfileRepository";
import { debug, logError, warn } from "../../utils/logger";

import type {
  DevMode,
  DevProfileConfig,
  DevProfileState,
  DevProfileEvent,
  IDevProfileService,
  IDevProfileEventListener,
  DevProfileSystemConfig,
} from "../../types/dev-profiles";

/**
 * Professional service for development profile management
 * Implements business logic and maintains system state
 */
export class DevProfileService implements IDevProfileService {
  private static instance: DevProfileService;
  private readonly repository: DevProfileRepository;
  private currentState: DevProfileState;
  private readonly eventListeners: Set<IDevProfileEventListener> = new Set();
  private readonly config: DevProfileSystemConfig;

  private constructor() {
    this.repository = DevProfileRepository.getInstance();
    this.config = this.getDefaultConfig();
    this.currentState = this.getInitialState();
  }

  /**
   * Singleton pattern for service instance
   */
  public static getInstance(): DevProfileService {
    if (!DevProfileService.instance) {
      DevProfileService.instance = new DevProfileService();
    }
    return DevProfileService.instance;
  }

  /**
   * Switch to a development profile
   * @param devMode - The development mode to switch to
   * @returns Promise resolving to the profile configuration
   */
  public async switchToProfile(devMode: DevMode): Promise<DevProfileConfig> {
    const previousMode = this.currentState.currentProfile?.id || null;

    try {
      this.updateState({ loading: true, error: null });

      // Validate dev mode
      if (!this.isValidDevMode(devMode)) {
        throw new Error(`Invalid development mode: ${devMode}`);
      }

      // Get profile configuration
      const profileConfig = await this.repository.getProfileConfig(devMode);

      // Update state
      this.updateState({
        currentProfile: profileConfig,
        isActive: devMode !== "production",
        lastSwitched: new Date(),
        loading: false,
        error: null,
      });

      // Clear cache if switching between different profiles
      if (previousMode && previousMode !== devMode) {
        await this.clearCache();
      }

      // Emit event
      this.emitEvent({
        type: "PROFILE_SWITCHED",
        payload: {
          from: previousMode as DevMode | null,
          to: devMode,
          profile: profileConfig,
        },
      });

      return profileConfig;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.updateState({ loading: false, error: errorMessage });

      this.emitEvent({
        type: "ERROR_OCCURRED",
        payload: {
          error: errorMessage,
          context: `switchToProfile(${devMode})`,
        },
      });

      throw error;
    }
  }

  /**
   * Get data for the current dev profile
   * @param dataType - Type of data to retrieve
   * @returns Promise resolving to the requested data
   */
  public async getProfileData<T>(dataType: string): Promise<T> {
    if (!this.currentState.currentProfile) {
      throw new Error("No active development profile");
    }

    const profileId = this.currentState.currentProfile.id;

    try {
      let data: unknown;

      switch (dataType) {
        case "achievements":
          data = await this.repository.getAchievements(profileId);
          break;
        case "teams":
          data = await this.repository.getTeamData(profileId);
          break;
        case "calendar":
          data = await this.repository.getCalendarEvents(profileId);
          break;
        case "activity":
          data = await this.repository.getActivityFeed(profileId);
          break;
        default:
          throw new Error(`Unknown data type: ${dataType}`);
      }

      // Update cache timestamp
      this.updateState({
        dataCache: {
          ...this.currentState.dataCache,
          lastUpdated: new Date(),
        },
      });

      this.emitEvent({
        type: "DATA_LOADED",
        payload: {
          dataType,
          count: Array.isArray(data) ? data.length : 1,
        },
      });

      return data as T;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      this.emitEvent({
        type: "ERROR_OCCURRED",
        payload: {
          error: errorMessage,
          context: `getProfileData(${dataType})`,
        },
      });

      throw error;
    }
  }

  /**
   * Clear dev profile cache
   */
  public async clearCache(): Promise<void> {
    this.repository.clearCache();

    this.updateState({
      dataCache: {
        achievements: null,
        teamData: null,
        calendarEvents: null,
        activityFeed: null,
        lastUpdated: null,
        cacheExpiry: null,
      },
    });

    this.emitEvent({
      type: "CACHE_CLEARED",
      payload: { timestamp: new Date() },
    });
  }

  /**
   * Validate dev profile permissions
   * @param action - The action to validate
   * @returns Whether the action is permitted
   */
  public validatePermission(action: string): boolean {
    if (!this.config.validatePermissions) {
      return true; // Skip validation if disabled
    }

    if (!this.currentState.currentProfile) {
      return false; // No active profile
    }

    const permissions = this.currentState.currentProfile.permissions;

    // Map actions to permission properties
    const permissionMap: Record<string, keyof typeof permissions> = {
      view_teams: "canViewTeams",
      manage_teams: "canManageTeams",
      view_players: "canViewPlayers",
      manage_players: "canManagePlayers",
      view_playbook: "canViewPlaybook",
      manage_playbook: "canManagePlaybook",
      view_calendar: "canViewCalendar",
      manage_calendar: "canManageCalendar",
      view_achievements: "canViewAchievements",
      manage_achievements: "canManageAchievements",
      view_reports: "canViewReports",
      manage_reports: "canManageReports",
      system_admin: "systemAdmin",
    };

    const permissionKey = permissionMap[action];
    if (!permissionKey) {
      warn(`Unknown permission action: ${action}`);
      return false;
    }

    const hasPermission = permissions[permissionKey];

    if (!hasPermission) {
      this.emitEvent({
        type: "PERMISSION_DENIED",
        payload: {
          action,
          profile: this.currentState.currentProfile.id,
        },
      });
    }

    return hasPermission;
  }

  /**
   * Get current profile state
   */
  public getCurrentState(): DevProfileState {
    return { ...this.currentState }; // Return copy to prevent mutations
  }

  /**
   * Add event listener
   * @param listener - Event listener to add
   */
  public addEventListener(listener: IDevProfileEventListener): void {
    this.eventListeners.add(listener);
  }

  /**
   * Remove event listener
   * @param listener - Event listener to remove
   */
  public removeEventListener(listener: IDevProfileEventListener): void {
    this.eventListeners.delete(listener);
  }

  /**
   * Update service configuration
   * @param newConfig - Partial configuration to update
   */
  public updateConfig(newConfig: Partial<DevProfileSystemConfig>): void {
    Object.assign(this.config, newConfig);
  }

  /**
   * Check if currently in development mode
   */
  public isInDevMode(): boolean {
    return this.currentState.isActive;
  }

  /**
   * Get current profile permissions
   */
  public getCurrentPermissions() {
    return this.currentState.currentProfile?.permissions || null;
  }

  /**
   * Private helper methods
   */

  private updateState(updates: Partial<DevProfileState>): void {
    this.currentState = { ...this.currentState, ...updates };
  }

  private emitEvent(event: DevProfileEvent): void {
    if (this.config.enableLogging) {
      debug("DevProfile Event:", event);
    }

    this.eventListeners.forEach((listener) => {
      try {
        listener.onProfileEvent(event);
      } catch (error) {
        logError("Error in event listener:", error);
      }
    });
  }

  private isValidDevMode(devMode: DevMode): boolean {
    const validModes: DevMode[] = [
      "production",
      "real_world_dev",
      "dev_head_coach",
      "dev_assistant_coach",
      "dev_player",
      "dev_super_admin",
      "blank_slate",
      "super_admin_real",
      "super_admin_mock",
      "view_as_head_coach",
      "view_as_coach",
      "view_as_player",
      "view_as_manager",
      "view_as_family",
    ];

    return validModes.includes(devMode);
  }

  private getInitialState(): DevProfileState {
    return {
      currentProfile: null,
      isActive: false,
      lastSwitched: null,
      dataCache: {
        achievements: null,
        teamData: null,
        calendarEvents: null,
        activityFeed: null,
        lastUpdated: null,
        cacheExpiry: null,
      },
      loading: false,
      error: null,
    };
  }

  private getDefaultConfig(): DevProfileSystemConfig {
    return {
      cacheTimeoutMs: 5 * 60 * 1000, // 5 minutes
      autoSwitchOnModeChange: true,
      validatePermissions: true,
      enableLogging: import.meta.env.DEV && import.meta.env.MODE !== "test",
      fallbackToMock: true,
    };
  }
}

/**
 * Hook factory for React integration
 */
export function createDevProfileHooks() {
  const service = DevProfileService.getInstance();

  return {
    /**
     * Hook for accessing dev profile service
     */
    useDevProfileService: () => service,

    /**
     * Hook for current profile state
     */
    useDevProfileState: () => service.getCurrentState(),

    /**
     * Hook for current permissions
     */
    useDevProfilePermissions: () => service.getCurrentPermissions(),
  };
}
