import React from "react";
import { Navigate } from "react-router-dom";
import { ROUTES } from "./paths";

import { useAuthProfile } from "../app/auth-store";
import { } from "./authorize";
// UI handled via GuardUI
import { LoadingScreen, AccessDenied } from "./GuardUI";
import { useAuthGate } from "./useAuthGate";

import type { Database } from "../types/database";
// User role type from database
type UserRole = Database["public"]["Tables"]["profiles"]["Row"]["role"];
interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: NonNullable<UserRole>[];
  fallbackTo?: string;
}
/**
 * RoleProtectedRoute Component
 *
 * Protects routes based on user roles in addition to authentication.
 * Useful for admin panels, coach-only features, etc.
 *
 * @param children - The component(s) to render if role access is granted
 * @param allowedRoles - Array of roles that can access this route
 * @param fallbackTo - Where to redirect if role access is denied (default: '/dashboard')
 */
export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles,
  fallbackTo = ROUTES.DASHBOARD,
}) => {
  const profile = useAuthProfile();
  const gate = useAuthGate({ requireAuth: true, redirectTo: ROUTES.LOGIN });
  if (gate.status === "loading") return <LoadingScreen />;
  if (gate.status === "redirect") return gate.element!;
  // No profile data yet - redirect to dashboard (shouldn't happen normally)
  if (!profile) {
    return <Navigate to={fallbackTo || ROUTES.DASHBOARD} replace />;
  }
  // Check via centralized authorize()
  // Note: This only checks app-level role; no team context here
  const role = profile.role as NonNullable<typeof profile.role>;
  const allowed = role ? allowedRoles.includes(role) : false;
  if (!allowed) {
    return <AccessDenied message={"You don't have permission to access this page."} />;
  }
  // Access granted, render the protected content
  return <>{children}</>;
};
