import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useAuthProfile } from "../app/auth-store";
import { AccessDenied, LoadingScreen } from "./GuardUI";
import { supabase } from "../lib/supabase";
import { useAuthGate } from "./useAuthGate";
import { ROUTES } from "./paths";
import { authorize } from "./authorize";

import type { Permission } from "../types/permissions";

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
  fallbackTo: _fallbackTo = ROUTES.DASHBOARD,
  accessDeniedMessage,
}) => {
  const profile = useAuthProfile();
  const gate = useAuthGate({ requireAuth: true, redirectTo: ROUTES.LOGIN });
  const params = useParams();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [denyReason, setDenyReason] = useState<string | undefined>();
  // Get team ID from props or URL params
  const currentTeamId = teamId || params.teamId;
  useEffect(() => {
    const checkUserAccess = async () => {
      try {
        // Check super admin status first (bypass)
        let isSuperAdmin = false;
        if (profile?.id && profile.role === "admin") {
          const { data: superAdminData } = await supabase
            .from("super_admins")
            .select("admin_level")
            .eq("user_id", profile.id)
            .single();
          isSuperAdmin =
            superAdminData?.admin_level === "super_admin" ||
            superAdminData?.admin_level === "admin";
        }
        const result = await authorize({
          profile,
          isSuperAdmin,
          teamId: currentTeamId,
          requiredPermissions,
          teamFeature,
        });
        setHasAccess(result.allowed);
        setDenyReason(result.reason);
      } catch (error) {
        console.error("Error checking user access:", error);
        setHasAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    };
    checkUserAccess();
  }, [profile, currentTeamId, requiredPermissions, teamFeature]);
  // Show loading spinner while checking
  if (gate.status === "loading" || checkingAccess) {
    return <LoadingScreen />;
  }
  // Not authenticated - shared redirect element
  if (gate.status === "redirect") return gate.element!;
  // Access denied
  if (!hasAccess) {
    const defaultMessage = mapDenyMessage(denyReason, teamFeature);
    return <AccessDenied message={accessDeniedMessage || defaultMessage} />;
  }
  // Access granted
  return <>{children}</>;
};
function mapDenyMessage(reason: string | undefined, teamFeature?: string): string {
  switch (reason) {
    case "unauthenticated":
      return "Please sign in to continue.";
    case "role_denied":
      return "You don't have permission to access this page.";
    case "no_team":
      return "A team context is required to access this page.";
    case "not_member":
      return "You are not a member of this team.";
    case "inactive_member":
      return "Your team membership is not active.";
    case "subscription_missing":
      return "Unable to verify team subscription status.";
    case "subscription_tier":
      return "This feature requires a higher subscription tier.";
    case "subscription_expired":
      return "Team subscription has expired.";
    case "permission_denied":
    default:
      if (teamFeature === "management") {
        return "Team management requires Head Coach or staff access.";
      }
      if (teamFeature === "dashboard") {
        return "You need to be a team member to access this team dashboard.";
      }
      if (teamFeature === "playbooks") {
        return "Playbook tools require a Coach subscription or team staff access.";
      }
      if (teamFeature === "family_view") {
        return "This area is for family members only.";
      }
      return "You don't have permission to access this feature.";
  }
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
