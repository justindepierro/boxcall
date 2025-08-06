import { Permission, DataScopeMode } from "../../types/rbac";
import type { DataScope } from "../../types/rbac";
import type { DevMode } from "../../app/dev-mode-types";

// Super Admin Email (YOU) - Gets unlimited access
const SUPER_ADMIN_EMAIL = "justindepierro@gmail.com";

export interface UserProfile {
  id: string;
  email: string;
  role?: string;
  permissions?: Permission[];
  teamMemberships?: { teamId: string; role: string }[];
}

/**
 * Role-Based Access Control Service
 * Industry standard RBAC with super admin override for system owner
 */
export class RBACService {
  /**
   * Check if user has specific permission
   * Super admin (justindepierro@gmail.com) gets unlimited access
   */
  static hasPermission(
    user: UserProfile | null,
    permission: Permission,
    _context?: { teamId?: string }
  ): boolean {
    if (!user) return false;

    // [Target] SUPER ADMIN OVERRIDE - You get unlimited access
    if (user.email === SUPER_ADMIN_EMAIL) {
      console.log(
        `[Unlocked/Access] Super admin override: ${user.email} granted ${permission}`
      );
      return true;
    }

    // TODO: Implement regular permission checking logic for other users
    // For now, grant basic permissions to all authenticated users
    const basicPermissions: Permission[] = [
      Permission.CREATE_TEAM, // Let authenticated users create teams for now
    ];

    return basicPermissions.includes(permission);
  }

  /**
   * Get all effective permissions for a user
   */
  static getEffectivePermissions(
    user: UserProfile | null,
    devMode?: DevMode
  ): Permission[] {
    if (!user) return [];

    // Super admin gets everything
    if (user.email === SUPER_ADMIN_EMAIL) {
      return Object.values(Permission);
    }

    // Dev mode overrides for testing
    if (devMode && devMode !== "production") {
      return this.getDevModePermissions(devMode);
    }

    // TODO: Production permissions based on role
    return [Permission.CREATE_TEAM]; // Basic permission for now
  }

  /**
   * Get permissions for dev mode testing
   */
  private static getDevModePermissions(devMode: DevMode): Permission[] {
    switch (devMode) {
      case "view_as_head_coach":
        return [
          Permission.CREATE_TEAM,
          Permission.MANAGE_TEAM_SETTINGS,
          Permission.INVITE_USERS,
          Permission.EDIT_SCHEDULE,
        ];
      case "view_as_player":
        return []; // Players have minimal permissions
      case "view_as_manager":
        return [Permission.EDIT_SCHEDULE];
      case "view_as_family":
        return []; // View only
      default:
        return [Permission.CREATE_TEAM];
    }
  }

  /**
   * Get data scope (what data user can access)
   */
  static getDataScope(user: UserProfile | null, devMode?: DevMode): DataScope {
    if (!user) {
      return {
        mode: DataScopeMode.DEV_BLANK_SLATE,
        teamIds: [],
        restrictions: ["no_user"],
      };
    }

    // Super admin sees everything
    if (user.email === SUPER_ADMIN_EMAIL) {
      const mode =
        devMode === "blank_slate"
          ? DataScopeMode.DEV_BLANK_SLATE
          : DataScopeMode.SYSTEM_WIDE;

      return {
        mode,
        teamIds: ["*"], // Access to all teams
        userId: user.id,
        restrictions: [], // No restrictions
      };
    }

    // Regular users see their team data
    return {
      mode: DataScopeMode.PRODUCTION,
      teamIds: user.teamMemberships?.map((m) => m.teamId) || [],
      userId: user.id,
      restrictions: [],
    };
  }

  /**
   * Check if user is the system super admin
   */
  static isSuperAdmin(user: UserProfile | null): boolean {
    return user?.email === SUPER_ADMIN_EMAIL;
  }

  /**
   * Check if user can create teams without restrictions
   */
  static canCreateTeamUnlimited(user: UserProfile | null): boolean {
    return this.isSuperAdmin(user);
  }
}
