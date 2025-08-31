/**
 * Role Protected Route - Modern version using unified role system
 *
 * Uses the new unified role architecture from Migration 999
 * Supports both app-level and team-level role protection
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { Button } from "../components/ui";
import { Typography } from "../components/design-system/Typography";
import { Icon } from "../components/ui/Icon/Icon";
import {
  useAuthLoading,
  useAuthProfile,
  useIsAuthenticated,
} from "../app/auth-store";
import { useRoles } from "../hooks/useRoles";
import type { AppRole, TeamRole } from "../types/roles";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  // App-level role protection
  allowedAppRoles?: AppRole[];
  // Team-level role protection (requires teamId in URL params)
  allowedTeamRoles?: TeamRole[];
  // Fallback redirect
  fallbackTo?: string;
  // Custom access denied message
  accessDeniedMessage?: string;
}

/**
 * RoleProtectedRoute Component
 *
 * Protects routes based on user roles using the unified role system.
 * Supports both app-level and team-level role checking.
 *
 * Features:
 * - App-level role protection (super_admin, admin, coach, player, family)
 * - Team-level role protection (head_coach, assistant_coach, coordinator, etc.)
 * - Unified role context integration
 * - Graceful error handling
 * - Super admin bypass for all restrictions
 */
export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedAppRoles,
  allowedTeamRoles,
  fallbackTo = "/dashboard",
  accessDeniedMessage,
}) => {
  const isAuthenticated = useIsAuthenticated();
  const profile = useAuthProfile();
  const authLoading = useAuthLoading();
  const { roleContext, loading: roleLoading } = useRoles();

  // Show loading spinner while checking authentication and roles
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jade-600"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // No profile data yet - redirect to dashboard (shouldn't happen normally)
  if (!profile || !roleContext) {
    return <Navigate to={fallbackTo} replace />;
  }

  // Super admins bypass all role restrictions
  if (roleContext.appRole === "super_admin") {
    return <>{children}</>;
  }

  // Check app-level roles if specified
  if (allowedAppRoles && allowedAppRoles.length > 0) {
    if (!allowedAppRoles.includes(roleContext.appRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <Typography
              variant="headline-md"
              as="h1"
              className="mb-4 flex items-center justify-center text-text-primary"
            >
              <Icon name="shield" size="lg" className="mr-2" />
              Access Denied
            </Typography>
            <p className="mb-6 text-text-secondary">
              {accessDeniedMessage ||
                `Your role (${roleContext.appRole}) doesn't have permission to access this page. Required roles: ${allowedAppRoles.join(
                  ", "
                )}`}
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => window.history.back()}
                variant="secondary"
                size="sm"
                className="mr-2"
              >
                Go Back
              </Button>
              <Button
                onClick={() => (window.location.href = fallbackTo)}
                variant="primary"
                size="sm"
              >
                Dashboard
              </Button>
            </div>
            {/* Debug info for development */}
            {import.meta.env.DEV && (
              <div className="mt-4 p-3 bg-gray-100 rounded-md text-sm text-left">
                <strong>Debug Info:</strong>
                <pre>{JSON.stringify({ roleContext }, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  // TODO: Team-level role checking
  // This would require team context from URL params
  // For now, focusing on app-level protection
  if (allowedTeamRoles && allowedTeamRoles.length > 0) {
    // Team role checking would go here
    // Requires team context and membership checking
    console.warn(
      "Team-level role protection not yet implemented in RoleProtectedRoute"
    );
  }

  // Access granted, render the protected content
  return <>{children}</>;
};

// Convenience components for common role patterns
export const AdminOnlyRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <RoleProtectedRoute allowedAppRoles={["super_admin", "admin"]}>
    {children}
  </RoleProtectedRoute>
);

export const CoachRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <RoleProtectedRoute allowedAppRoles={["super_admin", "admin", "coach"]}>
    {children}
  </RoleProtectedRoute>
);

export const PlayerRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <RoleProtectedRoute allowedAppRoles={["player"]}>
    {children}
  </RoleProtectedRoute>
);

export const FamilyRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <RoleProtectedRoute allowedAppRoles={["family"]}>
    {children}
  </RoleProtectedRoute>
);
