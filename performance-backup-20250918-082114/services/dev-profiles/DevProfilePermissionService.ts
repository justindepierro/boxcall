/**
 * Development Profile Permission Service
 *
 * Centralized permission management for development profiles.
 * Provides standardized permission sets for different user roles.
 *
 * @version 1.0.0
 * @author BoxCall Development Team
 */

import type { DevProfilePermissions } from "../../types/dev-profiles";

/**
 * Service for managing development profile permissions
 * Implements standardized permission sets for consistent access control
 */
export class DevProfilePermissionService {
  private static instance: DevProfilePermissionService;

  private constructor() {}

  /**
   * Singleton pattern for service instance
   */
  public static getInstance(): DevProfilePermissionService {
    if (!DevProfilePermissionService.instance) {
      DevProfilePermissionService.instance = new DevProfilePermissionService();
    }
    return DevProfilePermissionService.instance;
  }

  /**
   * Get production user permissions (real user data)
   */
  public getProductionPermissions(): DevProfilePermissions {
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

  /**
   * Get basic coach permissions (minimal access)
   */
  public getCoachPermissions(): DevProfilePermissions {
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

  /**
   * Get head coach permissions (full team management)
   */
  public getHeadCoachPermissions(): DevProfilePermissions {
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

  /**
   * Get assistant coach permissions (limited management)
   */
  public getAssistantCoachPermissions(): DevProfilePermissions {
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

  /**
   * Get player permissions (view-only for most features)
   */
  public getPlayerPermissions(): DevProfilePermissions {
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

  /**
   * Get super admin permissions (full system access)
   */
  public getSuperAdminPermissions(): DevProfilePermissions {
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
