import React from "react";
import { Navigate } from "react-router-dom";
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jade-600"></div>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-jade-500 text-white px-4 py-2 rounded-sm hover:bg-jade-600 font-sans font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Access granted, render the protected content
  return <>{children}</>;
};
