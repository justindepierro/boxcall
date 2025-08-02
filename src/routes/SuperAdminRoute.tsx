import React from "react";
import { Navigate } from "react-router-dom";
import { useIsAuthenticated, useAuthProfile, useAuthLoading } from "../app/auth-store";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";

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
      if (!profile?.id || profile.role !== "admin") {
        setIsSuperAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("super_admins")
          .select("admin_level")
          .eq("user_id", profile.id)
          .single();

        if (error || !data) {
          setIsSuperAdmin(false);
          return;
        }

        // Check if user has super_admin or admin level
        setIsSuperAdmin(data.admin_level === "super_admin" || data.admin_level === "admin");
      } catch (error) {
        console.error("Error checking super admin status:", error);
        setIsSuperAdmin(false);
      }
    };

    if (profile) {
      checkSuperAdminStatus();
    }
  }, [profile]);

  // Show loading spinner while checking authentication and super admin status
  if (loading || isSuperAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Not a super admin - show access denied
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            🚨 Developer Access Only
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This area is restricted to super administrators and developers.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
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
