import React from "react";
import { Navigate } from "react-router-dom";
import { Button } from "../components/ui";
import { Typography } from "../components/design-system/Typography";
import {
  useAuthLoading,
  useAuthProfile,
  useIsAuthenticated,
} from "../app/auth-store";
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
  fallbackTo = "/dashboard",
}) => {
  const isAuthenticated = useIsAuthenticated();
  const profile = useAuthProfile();
  const loading = useAuthLoading();
  // Show loading spinner while checking authentication and profile
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-jade"></div>
      </div>
    );
  }
  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  // No profile data yet - redirect to dashboard (shouldn't happen normally)
  if (!profile) {
    return <Navigate to={fallbackTo} replace />;
  }
  // Check if user's role is in the allowed roles
  if (!profile.role || !allowedRoles.includes(profile.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <Typography
            variant="headline-md"
            as="h1"
            className="mb-4 text-text-primary"
          >
            Access Denied
          </Typography>
          <p className="mb-6 text-text-secondary">
            You don't have permission to access this page.
          </p>
          <Button
            onClick={() => window.history.back()}
            variant="primary"
            size="sm"
            className="px-4 py-2"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }
  // Access granted, render the protected content
  return <>{children}</>;
};
