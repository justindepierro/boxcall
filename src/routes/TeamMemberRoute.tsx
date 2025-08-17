import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { ROUTES } from "./paths";

import { useAuthProfile } from "../app/auth-store";
import { LoadingScreen, AccessDenied } from "./GuardUI";
import type { IconName } from "../components/ui/Icon/Icon";
import { useAuthGate } from "./useAuthGate";
import { authorize } from "./authorize";

import type { Database } from "../types/database";

// Team member role type
type TeamMemberRole =
  Database["public"]["Tables"]["team_members"]["Row"]["role"];

interface TeamMemberRouteProps {
  children: React.ReactNode;
  allowedTeamRoles: TeamMemberRole[];
  teamId?: string; // Optional, can be passed from URL params
  fallbackTo?: string;
}

/**
 * TeamMemberRoute Component
 *
 * Protects routes based on team membership and roles using centralized authorize().
 */
export const TeamMemberRoute: React.FC<TeamMemberRouteProps> = ({
  children,
  allowedTeamRoles,
  teamId,
  fallbackTo = ROUTES.DASHBOARD,
}) => {
  const profile = useAuthProfile();
  const params = useParams();
  const gate = useAuthGate({ requireAuth: true, redirectTo: ROUTES.LOGIN });

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [denyReason, setDenyReason] = useState<string | undefined>();

  // Get team ID from props or URL params
  const currentTeamId = teamId || params.teamId;
  // IMMEDIATE ADMIN BYPASS - Don't even check membership for admins
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    if (isAdmin) {
      setHasAccess(true);
      setCheckingAccess(false);
      return;
    }
    const run = async () => {
      try {
        const res = await authorize({
          profile,
          teamId: currentTeamId,
          allowedTeamRoles,
        });
        setHasAccess(res.allowed);
        setDenyReason(res.reason);
      } catch (e) {
        console.error("Error checking team access:", e);
        setHasAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    };
    setCheckingAccess(true);
    run();
  }, [profile, profile?.id, profile?.role, currentTeamId, isAdmin, allowedTeamRoles]);

  // Show loading spinner while checking authentication and membership (but not for admins)
  if (gate.status === "loading" || (!isAdmin && checkingAccess)) {
    return <LoadingScreen />;
  }
  // Not authenticated - redirect to login
  if (gate.status === "redirect") return gate.element!;
  // No team ID provided
  if (!currentTeamId) {
    return <Navigate to={fallbackTo || ROUTES.DASHBOARD} replace />;
  }
  // Access denial for non-admins
  if (!isAdmin && !hasAccess) {
    const { title, message, icon } = mapDeny(denyReason);
    return (
      <AccessDenied title={title} iconName={icon as IconName} message={message} />
    );
  }
  // Access granted, render the protected content
  return <>{children}</>;
};

function mapDeny(reason?: string): { title: string; message: string; icon: IconName } {
  switch (reason) {
    case "no_team":
      return {
        title: "Team Required",
        message: "A team context is required to access this page.",
  icon: "users",
      };
    case "not_member":
      return {
        title: "Team Access Required",
        message: "You are not a member of this team.",
  icon: "users",
      };
    case "inactive_member":
      return {
        title: "Membership Inactive",
        message: "Your team membership is not active.",
  icon: "clock",
      };
    case "permission_denied":
    default:
      return {
        title: "Insufficient Team Permissions",
        message: "Your role doesn't have access to this feature.",
  icon: "shield",
      };
  }
}
