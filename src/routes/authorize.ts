import { supabase } from "../lib/supabase";
import type { Database } from "../types/database";
import type {
  AppUserType,
  TeamRole as PermissionTeamRole,
  SubscriptionTier as PermissionSubscriptionTier,
  Permission,
} from "../types/permissions";
import { canAccessTeamFeature, hasPermission } from "../types/permissions";

// Types
export type AppRole = Database["public"]["Tables"]["profiles"]["Row"]["role"];
export type TeamMemberRole =
  Database["public"]["Tables"]["team_members"]["Row"]["role"];
export type SubscriptionTier =
  Database["public"]["Tables"]["teams"]["Row"]["subscription_tier"];

export function isRoleAllowed(
  userRole: AppRole | null | undefined,
  allowed: NonNullable<AppRole>[]
): boolean {
  if (!userRole) return false;
  return allowed.includes(userRole as NonNullable<AppRole>);
}

export async function fetchTeamMembership(
  userId: string,
  teamId: string
): Promise<{
  role: TeamMemberRole;
  status: "active" | "inactive" | "pending" | null;
} | null> {
  const { data, error } = await supabase
    .from("team_members")
    .select("role, status")
    .eq("user_id", userId)
    .eq("team_id", teamId)
    .single();
  if (error || !data) return null;
  return { role: data.role as TeamMemberRole, status: data.status };
}

export async function fetchTeamSubscription(teamId: string): Promise<{
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
} | null> {
  const { data, error } = await supabase
    .from("teams")
    .select("subscription_tier, subscription_expires_at")
    .eq("id", teamId)
    .single();
  if (error || !data) return null;
  return data;
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
  requiredTiers?: NonNullable<SubscriptionTier>[];
  requiredPermissions?: Permission[];
  teamFeature?: "management" | "dashboard" | "playbooks" | "family_view";
};

export type AuthorizeResult = {
  allowed: boolean;
  reason?: DenyReason;
  membership?: Awaited<ReturnType<typeof fetchTeamMembership>>;
  subscription?: Awaited<ReturnType<typeof fetchTeamSubscription>>;
};

// Public union of deny reasons for guard UIs to reuse in type-safe switches
export type DenyReason =
  | "unauthenticated"
  | "role_denied"
  | "no_team"
  | "not_member"
  | "inactive_member"
  | "subscription_missing"
  | "subscription_tier"
  | "subscription_expired"
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
    requiredTiers,
    requiredPermissions,
    teamFeature,
  } = input;

  // Must be authenticated upstream; if not, block here too
  if (!profile?.id) return { allowed: false, reason: "unauthenticated" };

  // Role gate
  if (requiredRoles && requiredRoles.length > 0) {
    if (!isRoleAllowed(profile.role, requiredRoles)) {
      return { allowed: false, reason: "role_denied" };
    }
  }

  // If any team context constraints apply, ensure membership is valid
  let membership: Awaited<ReturnType<typeof fetchTeamMembership>> | undefined;
  const needsTeam = Boolean(
    teamFeature ||
      allowedTeamRoles?.length ||
      requiredTiers?.length ||
      requiredPermissions?.length
  );
  if (needsTeam) {
    if (!teamId) return { allowed: false, reason: "no_team" };
    if (!isSuperAdmin) {
      membership = await fetchTeamMembership(profile.id!, teamId);
      if (!membership) return { allowed: false, reason: "not_member" };
      if (membership.status !== "active")
        return { allowed: false, reason: "inactive_member" };
      if (allowedTeamRoles && allowedTeamRoles.length > 0) {
        if (!allowedTeamRoles.includes(membership.role)) {
          return { allowed: false, reason: "permission_denied", membership };
        }
      }
    }
  }

  // Subscription constraints
  let subscription:
    | Awaited<ReturnType<typeof fetchTeamSubscription>>
    | undefined;
  if (requiredTiers && requiredTiers.length > 0) {
    if (!teamId) return { allowed: false, reason: "no_team" };
    subscription = await fetchTeamSubscription(teamId);
    if (!subscription)
      return { allowed: false, reason: "subscription_missing" };
    if (
      !subscription.subscription_tier ||
      !requiredTiers.includes(
        subscription.subscription_tier as NonNullable<SubscriptionTier>
      )
    ) {
      return { allowed: false, reason: "subscription_tier", subscription };
    }
    if (subscription.subscription_expires_at) {
      const expirationDate = new Date(subscription.subscription_expires_at);
      if (expirationDate < new Date()) {
        return { allowed: false, reason: "subscription_expired", subscription };
      }
    }
  }

  // Permission matrix checks
  if ((requiredPermissions && requiredPermissions.length > 0) || teamFeature) {
    const appUserType: AppUserType = isSuperAdmin
      ? "super_admin"
      : (profile.role as unknown as AppUserType) || "player";
    const teamRole: PermissionTeamRole | undefined =
      (membership?.role as unknown as PermissionTeamRole) || undefined;
    const subscriptionTier: PermissionSubscriptionTier =
      (subscription?.subscription_tier as PermissionSubscriptionTier) || "free";
    if (teamFeature) {
      const ok = canAccessTeamFeature(
        appUserType,
        teamRole,
        subscriptionTier,
        teamFeature
      );
      if (!ok)
        return {
          allowed: false,
          reason: "permission_denied",
          membership,
          subscription,
        };
    }
    if (requiredPermissions && requiredPermissions.length > 0) {
      const ok = requiredPermissions.every((perm) =>
        hasPermission(appUserType, teamRole, subscriptionTier, perm)
      );
      if (!ok)
        return {
          allowed: false,
          reason: "permission_denied",
          membership,
          subscription,
        };
    }
  }

  return { allowed: true, membership, subscription };
}
