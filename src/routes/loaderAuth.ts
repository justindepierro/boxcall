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
const SUPER_ADMIN_EMAIL = "justindepierro@gmail.com";

export function createAuthLoader(authorizeOptions: Omit<AuthorizeInput, 'profile'>) {
  return async function authLoader({ params }: LoaderFunctionArgs) {
    const current = await getCurrentUserWithRole();
    if (!current) throw redirect(ROUTES.LOGIN);

    const res = await authorize({
      profile: { id: current.id, role: current.role },
      isSuperAdmin: current.email === SUPER_ADMIN_EMAIL,
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
  email: string | null;
} | null> {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user ?? null;
  if (!user) {
    return null;
  }
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .single();
  const userWithRole = {
    id: user.id,
    role: (profileRow?.role ?? null) as AppRole | null,
    email: profileRow?.email ?? user.email ?? null,
  };
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
      isSuperAdmin: current.email === SUPER_ADMIN_EMAIL,
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
