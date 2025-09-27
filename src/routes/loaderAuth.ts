import { redirect, type LoaderFunctionArgs } from "react-router-dom";
import { authorize } from "./authorize";
import { ROUTES } from "./paths";
import { supabase } from "../lib/supabase";
import type { AppRole } from "./authorize";

// Simple cache for auth checks to reduce database calls
interface AuthCache {
  user: { id: string; role: AppRole | null } | null;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

let authCache: AuthCache | null = null;
const AUTH_CACHE_TTL = 30000; // 30 seconds

/**
 * requireTeamCoachLoader
 *
 * Pre-render gate for team routes restricted to coach/admin roles.
 * Redirects before component render to avoid UI flashes.
 */
// Shared helper to resolve current user id and app role
export async function getCurrentUserWithRole(): Promise<{
  id: string;
  role: AppRole | null;
} | null> {
  // Check cache first
  if (authCache && (Date.now() - authCache.timestamp) < authCache.ttl) {
    console.log("getCurrentUserWithRole: Using cached result", authCache.user);
    return authCache.user;
  }

  console.log("getCurrentUserWithRole: Fetching fresh user data");
  const { data: authData, error: authError } = await supabase.auth.getUser();
  const user = authData?.user ?? null;
  console.log("getCurrentUserWithRole: Supabase auth result", { userId: user?.id, authError });
  
  if (!user) {
    console.log("getCurrentUserWithRole: No user found");
    authCache = { user: null, timestamp: Date.now(), ttl: AUTH_CACHE_TTL };
    return null;
  }
  
  console.log("getCurrentUserWithRole: Fetching profile for user", user.id);
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  
  console.log("getCurrentUserWithRole: Profile result", { profileRow, error: profileRow ? null : "No profile found" });
  
  const userWithRole = { id: user.id, role: (profileRow?.role ?? null) as AppRole | null };
  
  // Cache the result
  authCache = { user: userWithRole, timestamp: Date.now(), ttl: AUTH_CACHE_TTL };
  console.log("getCurrentUserWithRole: Returning", userWithRole);
  
  return userWithRole;
}

export async function requireTeamCoachLoader({ params }: LoaderFunctionArgs) {
  const teamId = params.teamId as string | undefined;

  const current = await getCurrentUserWithRole();
  if (!current) throw redirect(ROUTES.LOGIN);

  const res = await authorize({
    profile: { id: current.id, role: current.role },
    teamId,
    allowedTeamRoles: ["coach", "admin"],
  });

  if (!res.allowed) {
    if (res.reason === "unauthenticated") throw redirect(ROUTES.LOGIN);
    throw redirect(ROUTES.DASHBOARD);
  }

  return null;
}

/**
 * requireTeamAnalyticsLoader
 *
 * Pre-render gate for premium analytics route restricted to coach/admin roles
 * with an active "team_premium" subscription tier.
 */
export async function requireTeamAnalyticsLoader({
  params,
}: LoaderFunctionArgs) {
  const teamId = params.teamId as string | undefined;

  const current = await getCurrentUserWithRole();
  if (!current) throw redirect(ROUTES.LOGIN);

  const res = await authorize({
    profile: { id: current.id, role: current.role },
    teamId,
    allowedTeamRoles: ["coach", "admin"],
    requiredTiers: ["team_premium"],
  });

  if (!res.allowed) {
    if (res.reason === "unauthenticated") throw redirect(ROUTES.LOGIN);
    throw redirect(ROUTES.DASHBOARD);
  }

  return null;
}

/**
 * requireAuthenticatedLoader
 * Basic auth gate for non-team routes (e.g., dashboard). Redirects to login when unauthenticated.
 */
export async function requireAuthenticatedLoader() {
  const current = await getCurrentUserWithRole();
  if (!current) throw redirect(ROUTES.LOGIN);
  return null;
}

/**
 * requireTeamMemberLoader
 * Pre-render gate for any team member (coach, player, family, admin) to avoid flashes on team pages.
 */
export async function requireTeamMemberLoader({ params }: LoaderFunctionArgs) {
  const teamId = params.teamId as string | undefined;
  const current = await getCurrentUserWithRole();
  if (!current) throw redirect(ROUTES.LOGIN);

  const res = await authorize({
    profile: { id: current.id, role: current.role },
    teamId,
    allowedTeamRoles: ["coach", "player", "family", "admin"],
  });

  if (!res.allowed) {
    if (res.reason === "unauthenticated") throw redirect(ROUTES.LOGIN);
    throw redirect(ROUTES.DASHBOARD);
  }
  return null;
}

/**
 * requireRolesLoader
 * Factory to pre-render gate non-team routes by app role (e.g., coach/admin only pages).
 */
export function requireRolesLoader(allowedRoles: NonNullable<AppRole>[]) {
  return async function roleLoader() {
    const current = await getCurrentUserWithRole();
    if (!current) throw redirect(ROUTES.LOGIN);

    const res = await authorize({
      profile: { id: current.id, role: current.role },
      requiredRoles: allowedRoles,
    });

    if (!res.allowed) {
      if (res.reason === "unauthenticated") throw redirect(ROUTES.LOGIN);
      throw redirect(ROUTES.DASHBOARD);
    }

    return null;
  };
}

// Common role-gated loaders
export const requireCoachOrAdminLoader = requireRolesLoader(["coach", "admin"]);
