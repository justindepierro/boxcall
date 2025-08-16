import React from "react";

import { ProtectedRoute } from "./ProtectedRoute";

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}
/**
 * PublicRoute Component
 *
 * For routes that should only be accessible when NOT authenticated.
 * Useful for login, register, and landing pages.
 * Redirects authenticated users to the dashboard.
 *
 * @param children - The component(s) to render for unauthenticated users
 * @param redirectTo - Where to redirect authenticated users (default: '/dashboard')
 */
export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = "/dashboard",
}) => {
  return (
    <ProtectedRoute requireAuth={false} redirectTo={redirectTo}>
      {children}
    </ProtectedRoute>
  );
};
