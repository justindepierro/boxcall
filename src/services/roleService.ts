/**
 * Role Service - Centralized role and permission management
 *
 * This service provides a unified API for checking roles, permissions,
 * and capabilities across the application. It replaces scattered role
 * checking logic with a consistent, type-safe approach.
 */

import type {
  AppRole,
  TeamRole,
  Capability,
  UserRoleContext,
  TeamMembership,
  UIPermissions,
} from "../types/roles";
import {
  DEFAULT_TEAM_ROLE_CAPABILITIES,
  TEAM_ROLE_HIERARCHY,
  capabilityListFromFlags,
} from "../types/roles";
import { supabase } from "../lib/supabase";
import { debug, warn, logError } from "../utils/logger";

export class RoleService {
  private static roleContextCache = new Map<
    string,
    { context: UserRoleContext; timestamp: number }
  >();
  private static readonly CACHE_DURATION = 30000; // 30 seconds

  private static getCachedRoleContext(userId: string): UserRoleContext | null {
    this.clearExpiredCache();
    const cached = this.roleContextCache.get(userId);
    if (!cached) return null;
    if (Date.now() - cached.timestamp >= this.CACHE_DURATION) return null;
    debug("RoleService: Returning cached role context");
    return cached.context;
  }

  private static cacheRoleContext(userId: string, context: UserRoleContext) {
    this.roleContextCache.set(userId, {
      context,
      timestamp: Date.now(),
    });
  }

  private static buildFallbackContext(userId: string): UserRoleContext {
    return {
      appRole: "player" as AppRole,
      teamMemberships: [],
      userId,
      lastUpdated: new Date(),
    };
  }

  private static extractProfile(
    profileResult: any,
    userId: string
  ): any | null {
    if (profileResult?.error) {
      console.warn(
        "🔍 RoleService: Profile query error:",
        profileResult.error.message
      );
      return null;
    }

    if (profileResult?.data) {
      const profile = profileResult.data;
      console.log("🔍 RoleService: Got profile with role:", profile.role);
      return profile;
    }

    console.log("🔍 RoleService: No profile found for user:", userId);
    return null;
  }

  private static extractMemberships(membershipsResult: any): any[] {
    if (membershipsResult?.error) {
      console.warn(
        "🔍 RoleService: Team memberships query error:",
        membershipsResult.error.message
      );
      return [];
    }

    const memberships = membershipsResult?.data || [];
    console.log("🔍 RoleService: Got memberships:", memberships);
    return memberships;
  }

  private static async fetchTeamsByIds(teamIds: string[]): Promise<any[]> {
    if (teamIds.length === 0) return [];

    const teamsQueryStart = Date.now();
    const teamsResult = await supabase
      .from("teams")
      .select("id, name")
      .in("id", teamIds);

    debug(`RoleService: Teams query took ${Date.now() - teamsQueryStart}ms`);

    if (teamsResult.error) {
      warn("RoleService: Team names fetch failed:", teamsResult.error.message);
      return [];
    }

    return teamsResult.data || [];
  }

  private static buildTeamMemberships(
    memberships: any[],
    teamNameMap: Map<string, string>
  ): TeamMembership[] {
    return memberships.map((membership: any) => ({
      teamId: membership.team_id,
      teamName: teamNameMap.get(membership.team_id) || "Unknown Team",
      teamRole: membership.team_role as TeamRole,
      capabilities: RoleService.normalizeCapabilities(membership.capabilities),
      isActive: membership.status === "active",
      assignedAt: new Date(membership.assigned_at),
      roleNotes: membership.role_notes || undefined,
    }));
  }

  private static normalizeCapabilities(value: unknown): Capability[] {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value as Capability[];
    }
    if (typeof value === "object") {
      return capabilityListFromFlags(value as Record<string, boolean>);
    }
    return [];
  }

  private static clearExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.roleContextCache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.roleContextCache.delete(key);
      }
    }
  }

  /**
   * Clear role context cache for a specific user or all users
   */
  static clearRoleCache(userId?: string) {
    if (userId) {
      this.roleContextCache.delete(userId);
      debug("RoleService: Cleared cache for user:", userId);
    } else {
      this.roleContextCache.clear();
      debug("RoleService: Cleared all role cache");
    }
  }
  // ============================================================================
  // ROLE CONTEXT MANAGEMENT
  // ============================================================================

  /**
   * Get complete user role context (app role + team memberships)
   */
  static async getUserRoleContext(userId: string): Promise<UserRoleContext> {
    const cachedContext = this.getCachedRoleContext(userId);
    if (cachedContext) return cachedContext;

    debug("RoleService: getUserRoleContext started for user:", userId);
    try {
      // Get user profile and team memberships in parallel using unified ApiClient
      const profileStart = Date.now();

      const [profileResult, membershipsResult] = await Promise.all([
        supabase.from("profiles").select("role").eq("id", userId).maybeSingle(),
        supabase
          .from("team_members")
          .select(
            "team_id, team_role, capabilities, role_notes, assigned_at, status"
          )
          .eq("user_id", userId)
          .eq("status", "active"),
      ]);

      console.log(
        `🔍 RoleService: Queries completed in ${Date.now() - profileStart}ms`
      );
      console.log("🔍 RoleService: profileResult:", profileResult);
      console.log("🔍 RoleService: membershipsResult:", membershipsResult);

      const profile = this.extractProfile(profileResult, userId);
      const memberships = this.extractMemberships(membershipsResult);

      console.log(
        "🔍 RoleService: Found",
        memberships?.length ?? 0,
        "team memberships for user:",
        userId
      );

      // If no profile and no memberships, use fallback
      if (!profile && memberships.length === 0) {
        if (import.meta.env.DEV) {
          debug("RoleService: Using fallback role context for development");
          const fallbackContext = this.buildFallbackContext(userId);
          this.cacheRoleContext(userId, fallbackContext);
          return fallbackContext;
        }
        throw new Error("Failed to fetch user profile and team memberships");
      }

      // Get team names separately using unified ApiClient
      const teamIds = (memberships || []).map((m: any) => m.team_id);

      const teams = await this.fetchTeamsByIds(teamIds);

      const teamNameMap = new Map(teams?.map((t) => [t.id, t.name]) || []);

      // Transform team memberships
      const teamMemberships = this.buildTeamMemberships(
        memberships,
        teamNameMap
      );

      debug("RoleService: Found", teamMemberships.length, "team memberships");

      // Use profile role if available, otherwise default to 'player' but still include team memberships
      const appRole = (profile as any)?.role || "player";

      const roleContext = {
        appRole: appRole as AppRole,
        teamMemberships,
        userId,
        lastUpdated: new Date(),
      };

      // Cache the successful result
      this.cacheRoleContext(userId, roleContext);

      return roleContext;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(
          "⚠️ RoleService: Using fallback role due to database setup issues:",
          error
        );
      }
      // Return safe fallback
      const fallbackContext = this.buildFallbackContext(userId);

      // Cache the fallback context to avoid repeated errors
      this.cacheRoleContext(userId, fallbackContext);

      return fallbackContext;
    }
  }

  /**
   * Get user's role for a specific team
   */
  static async getUserTeamRole(
    userId: string,
    teamId: string
  ): Promise<TeamRole | null> {
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("team_role")
        .eq("user_id", userId)
        .eq("team_id", teamId)
        .eq("status", "active")
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      const role = (data as any).team_role as unknown;
      if (typeof role !== "string") return null;
      if (role in TEAM_ROLE_HIERARCHY) return role as TeamRole;
      return null;
    } catch (error) {
      logError("RoleService.getUserTeamRole error:", error);
      return null;
    }
  }

  // ============================================================================
  // PERMISSION CHECKING
  // ============================================================================

  /**
   * Check if user has specific capability for a team
   */
  static async hasCapability(
    userId: string,
    teamId: string,
    capability: Capability
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("capabilities, team_role")
        .eq("user_id", userId)
        .eq("team_id", teamId)
        .eq("status", "active")
        .maybeSingle();

      if (error || !data) {
        return false;
      }

      // Check explicit capabilities first
      const userCapabilities = RoleService.normalizeCapabilities(
        data.capabilities
      );

      if (userCapabilities.includes(capability)) {
        return true;
      }

      // Fallback to default role capabilities
      const teamRole = data.team_role as TeamRole;
      const defaultCapabilities = DEFAULT_TEAM_ROLE_CAPABILITIES[teamRole];
      return defaultCapabilities.includes(capability);
    } catch (error) {
      logError("RoleService.hasCapability error:", error);
      return false;
    }
  }

  /**
   * Check multiple capabilities at once
   */
  static async hasAnyCapability(
    userId: string,
    teamId: string,
    capabilities: Capability[]
  ): Promise<boolean> {
    const checks = await Promise.all(
      capabilities.map((cap) => this.hasCapability(userId, teamId, cap))
    );
    return checks.some((result) => result);
  }

  /**
   * Check if user has all specified capabilities
   */
  static async hasAllCapabilities(
    userId: string,
    teamId: string,
    capabilities: Capability[]
  ): Promise<boolean> {
    const checks = await Promise.all(
      capabilities.map((cap) => this.hasCapability(userId, teamId, cap))
    );
    return checks.every((result) => result);
  }

  // ============================================================================
  // ROLE HIERARCHY & COMPARISON
  // ============================================================================

  /**
   * Check if user's team role is higher than or equal to minimum role
   */
  static async hasMinimumTeamRole(
    userId: string,
    teamId: string,
    minimumRole: TeamRole
  ): Promise<boolean> {
    const userRole = await this.getUserTeamRole(userId, teamId);
    if (!userRole) return false;

    const userLevel = TEAM_ROLE_HIERARCHY[userRole];
    const requiredLevel = TEAM_ROLE_HIERARCHY[minimumRole];

    return userLevel >= requiredLevel;
  }

  /**
   * Check if user is a coaching role (any level)
   */
  static async isCoach(userId: string, teamId: string): Promise<boolean> {
    const role = await this.getUserTeamRole(userId, teamId);
    return role
      ? ["head_coach", "assistant_coach", "coordinator"].includes(role)
      : false;
  }

  /**
   * Check if user can manage team members
   */
  static async canManageTeamMembers(
    userId: string,
    teamId: string
  ): Promise<boolean> {
    return this.hasCapability(userId, teamId, "team.manage");
  }

  /**
   * Check if user can edit playbook
   */
  static async canEditPlaybook(
    userId: string,
    teamId: string
  ): Promise<boolean> {
    return this.hasAnyCapability(userId, teamId, [
      "playbook.manage",
      "playbook.edit",
    ]);
  }

  // ============================================================================
  // UI PERMISSIONS CALCULATION
  // ============================================================================

  /**
   * Calculate UI permissions for a specific team context
   */
  static async getUIPermissions(
    userId: string,
    teamId?: string
  ): Promise<UIPermissions> {
    try {
      const context = await this.getUserRoleContext(userId);
      const teamMembership = teamId
        ? context.teamMemberships.find((tm) => tm.teamId === teamId)
        : null;

      // Global permissions based on app role
      const isGlobalAdmin = ["super_admin", "admin"].includes(context.appRole);

      // Team-specific permissions
      let teamPermissions = {
        canManageTeam: false,
        canManageRoster: false,
        canManagePlaybook: false,
        canCreatePlays: false,
        canEditPlays: false,
        canViewPlaybook: false,
        canManageCalendar: false,
        canViewCalendar: false,
        canViewAnalytics: false,
        canManageAnalytics: false,
        canManageTeamSettings: false,
      };

      if (teamMembership && teamId) {
        const capabilities = RoleService.normalizeCapabilities(
          teamMembership.capabilities
        );

        teamPermissions = {
          canManageTeam: capabilities.includes("team.manage"),
          canManageRoster: capabilities.includes("roster.manage"),
          canManagePlaybook: capabilities.includes("playbook.manage"),
          canCreatePlays: capabilities.includes("playbook.create"),
          canEditPlays: capabilities.includes("playbook.edit"),
          canViewPlaybook: capabilities.includes("playbook.view"),
          canManageCalendar: capabilities.includes("calendar.manage"),
          canViewCalendar: capabilities.includes("calendar.view"),
          canViewAnalytics: capabilities.includes("analytics.view"),
          canManageAnalytics: capabilities.includes("analytics.manage"),
          canManageTeamSettings: capabilities.includes("settings.manage"),
        };
      }

      return {
        // Global permissions
        canManageGlobalSettings: isGlobalAdmin,
        canAccessAdminPanel: isGlobalAdmin,

        // Team permissions
        ...teamPermissions,

        // Profile permissions
        canEditOwnProfile: true, // Everyone can edit their own profile
        canEditOtherProfiles: isGlobalAdmin || teamPermissions.canManageTeam,
        canViewProfiles: true, // Everyone can view profiles
      };
    } catch (error) {
      logError("RoleService.getUIPermissions error:", error);
      // Return safe fallback permissions
      return {
        canManageGlobalSettings: false,
        canAccessAdminPanel: false,
        canManageTeam: false,
        canManageRoster: false,
        canManagePlaybook: false,
        canCreatePlays: false,
        canEditPlays: false,
        canViewPlaybook: true,
        canManageCalendar: false,
        canViewCalendar: true,
        canViewAnalytics: false,
        canManageAnalytics: false,
        canManageTeamSettings: false,
        canEditOwnProfile: true,
        canEditOtherProfiles: false,
        canViewProfiles: true,
      };
    }
  }

  // ============================================================================
  // ROLE MANAGEMENT
  // ============================================================================

  /**
   * Update user's app role (admin only)
   */
  static async updateUserAppRole(
    userId: string,
    newRole: AppRole,
    adminUserId: string
  ): Promise<boolean> {
    try {
      // Verify admin has permission
      const adminContext = await this.getUserRoleContext(adminUserId);
      if (!["super_admin", "admin"].includes(adminContext.appRole)) {
        throw new Error("Insufficient permissions to update app role");
      }

      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) {
        logError("Error updating app role:", error);
        return false;
      }

      return true;
    } catch (error) {
      logError("RoleService.updateUserAppRole error:", error);
      return false;
    }
  }

  /**
   * Update user's team role and capabilities
   */
  static async updateUserTeamRole(
    userId: string,
    teamId: string,
    newRole: TeamRole,
    customCapabilities?: Capability[],
    adminUserId?: string
  ): Promise<boolean> {
    try {
      // If admin specified, verify they have permission
      if (adminUserId) {
        const canManage = await this.canManageTeamMembers(adminUserId, teamId);
        if (!canManage) {
          throw new Error("Insufficient permissions to update team role");
        }
      }

      // Use custom capabilities or default for the role
      const capabilities =
        customCapabilities || DEFAULT_TEAM_ROLE_CAPABILITIES[newRole];

      const { error } = await supabase
        .from("team_members")
        .update({
          team_role: newRole,
          capabilities,
          assigned_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("team_id", teamId);

      if (error) {
        logError("Error updating team role:", error);
        return false;
      }

      return true;
    } catch (error) {
      logError("RoleService.updateUserTeamRole error:", error);
      return false;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get display name for role
   */
  static getRoleDisplayName(role: AppRole | TeamRole): string {
    const names: Record<AppRole | TeamRole, string> = {
      // App roles
      super_admin: "Super Admin",
      admin: "Administrator",
      coach: "Coach",
      player: "Player",
      family: "Family",

      // Team roles
      head_coach: "Head Coach",
      assistant_coach: "Assistant Coach",
      coordinator: "Coordinator",
      manager: "Manager",
      alumni: "Alumni",
    };

    return names[role] || role;
  }

  /**
   * Get default capabilities for a team role
   */
  static getDefaultCapabilities(teamRole: TeamRole): Capability[] {
    return DEFAULT_TEAM_ROLE_CAPABILITIES[teamRole] || [];
  }
}
