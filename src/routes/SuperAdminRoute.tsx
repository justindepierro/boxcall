import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { ROUTES } from "./paths";

import {
  useAuthLoading,
  useAuthProfile,
  useIsAuthenticated,
} from "../app/auth-store";
import { LoadingScreen, AccessDenied } from "./GuardUI";
import { fetchSuperAdminStatus } from "./authorize";

interface SuperAdminRouteProps {
  children: React.ReactNode;
  fallbackTo?: string;
}
/**
 * SuperAdminRoute Component
 *
 * Protects routes that require super admin (developer) access.
 * Checks both profile admin role AND super_admins table entry.
 *
 * @param children - The component(s) to render if super admin access is granted
 * @param fallbackTo - Where to redirect if access is denied (default: '/dashboard')
 */
export const SuperAdminRoute: React.FC<SuperAdminRouteProps> = ({
  children,
}) => {
  const isAuthenticated = useIsAuthenticated();
  const profile = useAuthProfile();
  const loading = useAuthLoading();
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  useEffect(() => {
    const checkSuperAdminStatus = async () => {
      const ok = await fetchSuperAdminStatus(profile?.id as string, profile?.role ?? null);
      setIsSuperAdmin(ok);
    };
    if (profile) {
      checkSuperAdminStatus();
    }
  }, [profile]);
  // Show loading spinner while checking authentication and super admin status
  if (loading || isSuperAdmin === null) {
    return <LoadingScreen />;
  }
  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  // Not a super admin - show access denied
  if (!isSuperAdmin) {
    return (
      <AccessDenied
        title="Developer Access Only"
        iconName="shield"
        message="This area is restricted to super administrators and developers."
      />
    );
  }
  // Access granted, render the protected content
  return <>{children}</>;
};
