import { redirect, type LoaderFunctionArgs } from "react-router-dom";
import { authorize } from "./authorize";
import { ROUTES } from "./paths";
import { supabase } from "../lib/supabase";
import type { AppRole } from "./authorize";
import type { AuthorizeInput } from "./authorize";

/**
 * Generic loader factory for creating authorization-based route loaders
 *
 * @param authorizeOptions - Options to pass to the authorize function
 * @returns A loader function that performs authorization and redirects on failure
 */
export function createAuthLoader(authorizeOptions: Omit<AuthorizeInput, 'profile'>) {
  return async function authLoader({ params }: LoaderFunctionArgs) {
    const current = await getCurrentUserWithRole();
    if (!current) throw redirect(ROUTES.LOGIN);

    const res = await authorize({
      profile: { id: current.id, role: current.role },
      ...authorizeOptions,
      // Merge teamId from params if not explicitly provided
      teamId: authorizeOptions.teamId || params.teamId,
    });

    if (!res.allowed) {
      if (res.reason === "unauthenticated") throw redirect(ROUTES.LOGIN);
      throw redirect(ROUTES.DASHBOARD);
    }

    return null;
  };
}

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
    return authCache.user;
  }

  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user ?? null;
  if (!user) {
    authCache = { user: null, timestamp: Date.now(), ttl: AUTH_CACHE_TTL };
    return null;
  }
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const userWithRole = { id: user.id, role: (profileRow?.role ?? null) as AppRole | null };
  
  // Cache the result
  authCache = { user: userWithRole, timestamp: Date.now(), ttl: AUTH_CACHE_TTL };
  
  return userWithRole;
}

export const requireTeamCoachLoader = createAuthLoader({
  allowedTeamRoles: ["coach", "admin"],
});

/**
 * requireTeamAnalyticsLoader
 *
 * Pre-render gate for premium analytics route restricted to coach/admin roles
 * with an active "team_premium" subscription tier.
 */
export const requireTeamAnalyticsLoader = createAuthLoader({
  allowedTeamRoles: ["coach", "admin"],
  requiredTiers: ["team_premium"],
});

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
export const requireTeamMemberLoader = createAuthLoader({
  allowedTeamRoles: ["coach", "player", "family", "admin"],
});

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
export const requirePlayerLoader = requireRolesLoader(["player"]);
