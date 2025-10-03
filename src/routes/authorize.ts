import { supabase } from "../lib/supabase";

import type {
  AppUserType,
  TeamRole as PermissionTeamRole,
  Permission,
} from "../types/permissions";
import { canAccessTeamFeature, hasPermission } from "../types/permissions";
import type { AppRole, TeamRole } from "../types/roles";

// Local type that includes legacy team role values for backward compatibility
export type TeamMemberRole = TeamRole | "coach" | "admin";
export function isRoleAllowed(
  userRole: AppRole | null | undefined,
  allowed: NonNullable<AppRole>[]
): boolean {
  if (!userRole) return false;
  return allowed.includes(userRole as NonNullable<AppRole>);
}

// Role validation guards and utilities
export const GLOBAL_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  COACH: "coach",
  PLAYER: "player",
  FAMILY: "family",
} as const;

export const TEAM_ROLES = {
  HEAD_COACH: "head_coach",
  ASSISTANT_COACH: "assistant_coach",
  COORDINATOR: "coordinator",
  MANAGER: "manager",
  COACH: "coach", // Legacy compatibility
  ADMIN: "admin", // Legacy compatibility
  PLAYER: "player",
  FAMILY: "family",
  ALUMNI: "alumni",
} as const;

export type GlobalRole = (typeof GLOBAL_ROLES)[keyof typeof GLOBAL_ROLES];

/**
 * Type guard for valid global roles
 */
export function isValidGlobalRole(role: string | null | undefined): role is GlobalRole {
  if (!role) return false;
  return Object.values(GLOBAL_ROLES).includes(role as GlobalRole);
}

/**
 * Type guard for valid team roles
 */
export function isValidTeamRole(role: string | null | undefined): role is TeamRole {
  if (!role) return false;
  return Object.values(TEAM_ROLES).includes(role as TeamRole);
}

/**
 * Check if a global role has admin privileges
 */
export function isGlobalAdmin(role: AppRole | null | undefined): boolean {
  return role === GLOBAL_ROLES.ADMIN;
}

/**
 * Check if a global role has coach privileges
 */
export function isGlobalCoach(role: AppRole | null | undefined): boolean {
  return role === GLOBAL_ROLES.COACH || role === GLOBAL_ROLES.ADMIN;
}

/**
 * Check if a team role has coach privileges within a team
 */
export function isTeamCoach(role: TeamMemberRole | null | undefined): boolean {
  return role === TEAM_ROLES.HEAD_COACH ||
         role === TEAM_ROLES.ASSISTANT_COACH ||
         role === TEAM_ROLES.COORDINATOR ||
         role === TEAM_ROLES.COACH; // Legacy compatibility
}

/**
 * Check if a team role has management privileges
 */
export function isTeamManager(role: TeamMemberRole | null | undefined): boolean {
  return role === TEAM_ROLES.HEAD_COACH ||
         role === TEAM_ROLES.ASSISTANT_COACH ||
         role === TEAM_ROLES.MANAGER;
}

/**
 * Validate role combination (global + team roles should be consistent)
 */
export function validateRoleCombination(
  globalRole: AppRole | null | undefined,
  teamRole: TeamMemberRole | null | undefined
): { valid: boolean; reason?: string } {
  // If no global role, invalid
  if (!globalRole) {
    return { valid: false, reason: "Missing global role" };
  }

  // If no team role, that's OK (user might not be in a team)
  if (!teamRole) {
    return { valid: true };
  }

  // Validate global role is valid
  if (!isValidGlobalRole(globalRole)) {
    return { valid: false, reason: `Invalid global role: ${globalRole}` };
  }

  // Validate team role is valid
  if (!isValidTeamRole(teamRole)) {
    return { valid: false, reason: `Invalid team role: ${teamRole}` };
  }

  // Business rule: If user is a player globally, they shouldn't have coach team roles
  if (globalRole === GLOBAL_ROLES.PLAYER && isTeamCoach(teamRole)) {
    return {
      valid: false,
      reason: "Player cannot have coach team role"
    };
  }

  // Business rule: If user is a coach globally, they should have appropriate team roles
  if (globalRole === GLOBAL_ROLES.COACH && !isTeamCoach(teamRole) && teamRole !== TEAM_ROLES.PLAYER) {
    return {
      valid: false,
      reason: "Coach should have coach or player team role"
    };
  }

  return { valid: true };
}

export async function fetchTeamMembership(
  userId: string,
  teamId: string
): Promise<{
  role: TeamMemberRole;
  team_role: string; // Unified team role (same as role for consistency)
  status: "active" | "inactive" | "pending" | null;
} | null> {
  const { data, error } = await supabase
    .from("team_members")
    .select("team_role, status")
    .eq("user_id", userId)
    .eq("team_id", teamId)
    .single();
  if (error || !data) return null;
  return {
    role: data.team_role as TeamMemberRole,
    team_role: data.team_role, // For backward compatibility
    status: data.status,
  };
}

// Super admin check helper (developer/admin panel access)
export async function fetchSuperAdminStatus(
  userId: string,
  role: AppRole | null | undefined
): Promise<boolean> {
  if (!userId || role !== "admin") return false;
  const { data, error } = await supabase
    .from("super_admins")
    .select("admin_level")
    .eq("user_id", userId)
    .single();
  if (error || !data) return false;
  return data.admin_level === "super_admin" || data.admin_level === "admin";
}

// Consolidated authorization decision helper
export type AuthorizeInput = {
  profile: { id?: string | null; role?: AppRole | null } | null;
  isSuperAdmin?: boolean;
  teamId?: string;
  requiredRoles?: NonNullable<AppRole>[];
  allowedTeamRoles?: TeamMemberRole[];
  requiredPermissions?: Permission[];
  teamFeature?: "management" | "dashboard" | "playbooks" | "family_view";
};

export type AuthorizeResult = {
  allowed: boolean;
  reason?: DenyReason;
  membership?: Awaited<ReturnType<typeof fetchTeamMembership>>;
};

// Public union of deny reasons for guard UIs to reuse in type-safe switches
export type DenyReason =
  | "unauthenticated"
  | "role_denied"
  | "no_team"
  | "not_member"
  | "inactive_member"
  | "permission_denied";

export async function authorize(
  input: AuthorizeInput
): Promise<AuthorizeResult> {
  const {
    profile,
    isSuperAdmin = false,
    teamId,
    requiredRoles,
    allowedTeamRoles,
    requiredPermissions,
    teamFeature,
  } = input;

  // Step 1: Check authentication
  if (!profile?.id) {
    return { allowed: false, reason: "unauthenticated" };
  }

  // Step 2: Check global role requirements (non-team features)
  if (requiredRoles && requiredRoles.length > 0) {
    if (!isRoleAllowed(profile.role, requiredRoles)) {
      return { allowed: false, reason: "role_denied" };
    }
  }

  // Step 3: Handle team-related requirements
  const teamResult = await checkTeamRequirements({
    profile: { id: profile.id!, role: profile.role }, // We already checked profile.id exists
    isSuperAdmin,
    teamId,
    allowedTeamRoles,
    requiredPermissions,
    teamFeature,
  });

  if (!teamResult.allowed) {
    return teamResult;
  }

  return { allowed: true, membership: teamResult.membership };
}

/**
 * Check all team-related authorization requirements
 */
async function checkTeamRequirements({
  profile,
  isSuperAdmin,
  teamId,
  allowedTeamRoles,

  requiredPermissions,
  teamFeature,
}: {
  profile: { id: string; role?: AppRole | null };
  isSuperAdmin: boolean;
  teamId?: string;
  allowedTeamRoles?: TeamMemberRole[];
  requiredPermissions?: Permission[];
  teamFeature?: "management" | "dashboard" | "playbooks" | "family_view";
}): Promise<AuthorizeResult> {
  // Check if any team constraints apply
  const needsTeam = Boolean(
    teamFeature || allowedTeamRoles?.length || requiredPermissions?.length
  );

  if (!needsTeam) {
    return { allowed: true };
  }

  // Must have teamId for team-related checks
  if (!teamId) {
    return { allowed: false, reason: "no_team" };
  }

  // Get team membership (skip for super admins)
  let membership: Awaited<ReturnType<typeof fetchTeamMembership>> | undefined;
  if (!isSuperAdmin) {
    membership = await fetchTeamMembership(profile.id, teamId);
    if (!membership) {
      return { allowed: false, reason: "not_member" };
    }
    if (membership.status !== "active") {
      return { allowed: false, reason: "inactive_member" };
    }

    // Check team role requirements
    if (allowedTeamRoles && allowedTeamRoles.length > 0) {
      if (!allowedTeamRoles.includes(membership.role)) {
        return { allowed: false, reason: "permission_denied", membership };
      }
    }
  }

  // Check subscription requirements
  // Check permission/feature requirements
  const permissionResult = checkPermissionRequirements({
    profile,
    isSuperAdmin,
    membership,
    requiredPermissions,
    teamFeature,
  });

  if (!permissionResult.allowed) {
    return { ...permissionResult, membership };
  }

  return { allowed: true, membership };
}

/**
 * Check permission and feature requirements
 */
function checkPermissionRequirements({
  profile,
  isSuperAdmin,
  membership,
  requiredPermissions,
  teamFeature,
}: {
  profile: { role?: AppRole | null };
  isSuperAdmin: boolean;
  membership?: Awaited<ReturnType<typeof fetchTeamMembership>>;
  requiredPermissions?: Permission[];
  teamFeature?: "management" | "dashboard" | "playbooks" | "family_view";
}): { allowed: boolean; reason?: DenyReason } {
  const hasPermissionChecks = (requiredPermissions && requiredPermissions.length > 0) || teamFeature;

  if (!hasPermissionChecks) {
    return { allowed: true };
  }

  // Convert AppRole to AppUserType for legacy permissions system
  // TODO: Replace this mapping when permissions system is updated to use AppRole directly
  const roleToAppUserType = (role: AppRole | null): AppUserType => {
    if (!role) return "player";
    switch (role) {
      case "super_admin": return "super_admin";
      case "admin": return "admin";
      case "coach": return "coach";
      case "player": return "player";
      case "family": return "family";
      default: return "player";
    }
  };

  const appUserType: AppUserType = isSuperAdmin
    ? "super_admin"
    : roleToAppUserType(profile.role ?? null);
  const teamRole: PermissionTeamRole | undefined =
    (membership?.role as unknown as PermissionTeamRole) || undefined;
  const subscriptionTier: "free" = "free";

  // Check team feature access
  if (teamFeature) {
    const ok = canAccessTeamFeature(appUserType, teamRole, subscriptionTier, teamFeature);
    if (!ok) {
      return { allowed: false, reason: "permission_denied" };
    }
  }

  // Check granular permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    const ok = requiredPermissions.every((perm) =>
      hasPermission(appUserType, teamRole, subscriptionTier, perm)
    );
    if (!ok) {
      return { allowed: false, reason: "permission_denied" };
    }
  }

  return { allowed: true };
}
