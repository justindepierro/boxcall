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
} from "../types/roles";
import { supabase } from "../lib/supabase";

export class RoleService {
  // ============================================================================
  // ROLE CONTEXT MANAGEMENT
  // ============================================================================

  /**
   * Get complete user role context (app role + team memberships)
   */
  static async getUserRoleContext(userId: string): Promise<UserRoleContext> {
    try {
      // Get user's app-level role from profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        throw new Error("Failed to fetch user role context");
      }

      // Get user's team memberships with new role fields
      const { data: memberships, error: memberError } = await supabase
        .from("team_members")
        .select(
          `
          team_id,
          team_role,
          capabilities,
          role_notes,
          assigned_at,
          status
        `
        )
        .eq("user_id", userId)
        .eq("status", "active");

      if (memberError) {
        console.error("Error fetching team memberships:", memberError);
        throw new Error("Failed to fetch team memberships");
      }

      // Get team names separately for now (can be optimized later)
      const teamIds = (memberships || []).map((m) => m.team_id);
      const { data: teams } = await supabase
        .from("teams")
        .select("id, name")
        .in("id", teamIds);

      const teamNameMap = new Map(teams?.map((t) => [t.id, t.name]) || []);

      // Transform team memberships
      const teamMemberships: TeamMembership[] = (memberships || []).map(
        (membership) => ({
          teamId: membership.team_id,
          teamName: teamNameMap.get(membership.team_id) || "Unknown Team",
          teamRole: membership.team_role as TeamRole,
          capabilities: (membership.capabilities as Capability[]) || [],
          isActive: membership.status === "active",
          assignedAt: new Date(membership.assigned_at),
          roleNotes: membership.role_notes || undefined,
        })
      );
      return {
        appRole: profile.role,
        teamMemberships,
        userId,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error("RoleService.getUserRoleContext error:", error);
      // Return safe fallback
      return {
        appRole: "player",
        teamMemberships: [],
        userId,
        lastUpdated: new Date(),
      };
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
        .single();

      if (error || !data) {
        return null;
      }

      return data.team_role;
    } catch (error) {
      console.error("RoleService.getUserTeamRole error:", error);
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
        .single();

      if (error || !data) {
        return false;
      }

      // Check explicit capabilities first
      if (data.capabilities && data.capabilities.includes(capability)) {
        return true;
      }

      // Fallback to default role capabilities
      const teamRole = data.team_role as TeamRole;
      const defaultCapabilities = DEFAULT_TEAM_ROLE_CAPABILITIES[teamRole];
      return defaultCapabilities.includes(capability);
    } catch (error) {
      console.error("RoleService.hasCapability error:", error);
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
        const capabilities = teamMembership.capabilities;

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
      console.error("RoleService.getUIPermissions error:", error);
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
        console.error("Error updating app role:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("RoleService.updateUserAppRole error:", error);
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
        console.error("Error updating team role:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("RoleService.updateUserTeamRole error:", error);
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
