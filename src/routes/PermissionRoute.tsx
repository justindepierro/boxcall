import React, { useEffect, useState } from "react";
import { Button } from "../components/ui";
import { Navigate, useParams } from "react-router-dom";
import { Typography } from "../components/design-system/Typography";
import {
  useAuthLoading,
  useAuthProfile,
  useIsAuthenticated,
} from "../app/auth-store";
import { Icon } from "../components/ui/Icon/Icon";
import { supabase } from "../lib/supabase";
import type {
  AppUserType,
  Permission,
  SubscriptionTier,
  TeamRole,
} from "../types/permissions";
import { canAccessTeamFeature, hasPermission } from "../types/permissions";
interface PermissionRouteProps {
  children: React.ReactNode;
  // Required permissions (user must have ALL of these)
  requiredPermissions?: Permission[];
  // Alternative: Check if user can access a specific team feature
  teamFeature?: "management" | "dashboard" | "playbooks" | "family_view";
  // Team ID (optional, will try to get from URL params)
  teamId?: string;
  // Fallback redirect
  fallbackTo?: string;
  // Custom access denied message
  accessDeniedMessage?: string;
}
interface UserAccessData {
  appUserType: AppUserType;
  teamRole?: TeamRole;
  subscriptionTier: SubscriptionTier;
  isSuperAdmin: boolean;
  teamMemberStatus?: "active" | "inactive" | "pending";
}
/**
 * PermissionRoute Component
 *
 * Advanced permission-based route protection using the BoxCall hierarchy system.
 * Handles both app-level permissions and team-level access control.
 */
export const PermissionRoute: React.FC<PermissionRouteProps> = ({
  children,
  requiredPermissions = [],
  teamFeature,
  teamId,
  fallbackTo = "/dashboard",
  accessDeniedMessage,
}) => {
  const isAuthenticated = useIsAuthenticated();
  const profile = useAuthProfile();
  const loading = useAuthLoading();
  const params = useParams();
  const [accessData, setAccessData] = useState<UserAccessData | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  // Get team ID from props or URL params
  const currentTeamId = teamId || params.teamId;
  useEffect(() => {
    const checkUserAccess = async () => {
      if (!profile?.id) {
        setAccessData(null);
        setCheckingAccess(false);
        return;
      }
      try {
        // Check super admin status
        let isSuperAdmin = false;
        if (profile.role === "admin") {
          const { data: superAdminData } = await supabase
            .from("super_admins")
            .select("admin_level")
            .eq("user_id", profile.id)
            .single();
          isSuperAdmin =
            superAdminData?.admin_level === "super_admin" ||
            superAdminData?.admin_level === "admin";
        }
        // Get user's app-level subscription/type
        let appUserType: AppUserType = "player"; // Default
        const subscriptionTier: SubscriptionTier = "free"; // Default - TODO: Get from subscription table
        if (isSuperAdmin) {
          appUserType = "super_admin";
        } else if (profile.role === "admin") {
          appUserType = "admin";
        } else {
          // TODO: Get from user's subscription data
          // For now, infer from profile role or subscription table
          appUserType = (profile.role as AppUserType) || "player";
        }
        // Get team-level role if team ID is provided
        let teamRole: TeamRole | undefined;
        let teamMemberStatus: "active" | "inactive" | "pending" | undefined;
        if (currentTeamId) {
          const { data: teamMemberData } = await supabase
            .from("team_members")
            .select("role, status")
            .eq("user_id", profile.id)
            .eq("team_id", currentTeamId)
            .single();
          if (teamMemberData) {
            teamRole = teamMemberData.role as TeamRole;
            teamMemberStatus = teamMemberData.status;
          }
        }
        const userData: UserAccessData = {
          appUserType,
          teamRole,
          subscriptionTier,
          isSuperAdmin,
          teamMemberStatus,
        };
        setAccessData(userData);
        // Check access permissions
        let access = false;
        // Super admins always have access
        if (isSuperAdmin) {
          access = true;
        } else if (teamFeature) {
          // Check team feature access
          access = canAccessTeamFeature(
            appUserType,
            teamRole,
            subscriptionTier,
            teamFeature
          );
        } else if (requiredPermissions.length > 0) {
          // Check specific permissions
          access = requiredPermissions.every((permission) =>
            hasPermission(appUserType, teamRole, subscriptionTier, permission)
          );
        } else {
          // No specific requirements, just need to be authenticated
          access = true;
        }
        // For team-based features, also check team membership status
        if (access && currentTeamId && teamRole && !isSuperAdmin) {
          access = teamMemberStatus === "active";
        }
        setHasAccess(access);
      } catch (error) {
        console.error("Error checking user access:", error);
        setAccessData(null);
        setHasAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    };
    if (profile) {
      checkUserAccess();
    } else {
      setCheckingAccess(false);
    }
  }, [profile, currentTeamId, requiredPermissions, teamFeature]);
  // Show loading spinner while checking
  if (loading || checkingAccess) {
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
  // Access denied
  if (!hasAccess) {
    const defaultMessage = getAccessDeniedMessage(
      accessData,
      teamFeature,
      requiredPermissions
    );
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
            {accessDeniedMessage || defaultMessage}
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
          {/* Debug info for super admins */}
          {accessData?.isSuperAdmin && (
            <div className="mt-4 p-3 surface-subtle dark:bg-yellow-900 rounded-md text-sm">
              <strong>Debug Info:</strong> {JSON.stringify(accessData, null, 2)}
            </div>
          )}
        </div>
      </div>
    );
  }
  // Access granted
  return <>{children}</>;
};
function getAccessDeniedMessage(
  accessData: UserAccessData | null,
  teamFeature?: string,
  requiredPermissions?: Permission[]
): string {
  if (!accessData) {
    return "Unable to verify your permissions. Please try again.";
  }
  if (teamFeature === "management") {
    return `Team management requires a Head Coach subscription ($199) or coaching staff access. Your current access level: ${accessData.appUserType}`;
  }
  if (teamFeature === "dashboard") {
    return "You need to be a team member to access this team dashboard.";
  }
  if (teamFeature === "playbooks") {
    return "Playbook tools require a Coach subscription ($9.99) or team staff access.";
  }
  if (teamFeature === "family_view") {
    return "This area is for family members only.";
  }
  if (requiredPermissions?.length) {
    return `This feature requires specific permissions that your account doesn't have. Contact your team administrator.`;
  }
  return "You don't have permission to access this feature.";
}
// Convenience components for common use cases
export const TeamManagementRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <PermissionRoute teamFeature="management">{children}</PermissionRoute>;
export const TeamDashboardRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <PermissionRoute teamFeature="dashboard">{children}</PermissionRoute>;
export const PlaybookRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <PermissionRoute teamFeature="playbooks">{children}</PermissionRoute>;
export const FamilyRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <PermissionRoute teamFeature="family_view">{children}</PermissionRoute>;
