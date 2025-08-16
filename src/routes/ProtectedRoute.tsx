import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuthLoading, useIsAuthenticated } from "../app/auth-store";
import { Layout } from "../components/layout/Layout";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}
/**
 * ProtectedRoute Component
 *
 * Handles route protection based on authentication status.
 * Redirects unauthenticated users to login and preserves intended destination.
 *
 * @param children - The component(s) to render if access is granted
 * @param requireAuth - Whether authentication is required (default: true)
 * @param redirectTo - Where to redirect if access is denied (default: '/login')
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = "/login",
}) => {
  const isAuthenticated = useIsAuthenticated();
  const loading = useAuthLoading();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-jade"></div>
      </div>
    );
  }

  // If route requires auth and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If route requires NO auth (login page) and user IS authenticated
  if (!requireAuth && isAuthenticated) {
    // Get the intended destination from state, or default to dashboard
    const from = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }
  // Access granted, render the protected content with layout
  return <Layout>{children}</Layout>;
};
