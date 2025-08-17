import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { ROUTES } from "./paths";

import { useAuthProfile } from "../app/auth-store";
import { LoadingScreen, AccessDenied } from "./GuardUI";
import { useAuthGate } from "./useAuthGate";
import { fetchTeamMembership } from "./authorize";

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
interface TeamMemberData {
  role: TeamMemberRole;
  status: "active" | "inactive" | "pending" | null;
}
/**
 * TeamMemberRoute Component
 *
 * Protects routes based on team membership and roles.
 * Checks if user is a member of the team with appropriate permissions.
 *
 * @param children - The component(s) to render if team access is granted
 * @param allowedTeamRoles - Array of team roles that can access this route
 * @param teamId - Team ID (optional, will try to get from URL params)
 * @param fallbackTo - Where to redirect if access is denied (default: '/dashboard')
 */
export const TeamMemberRoute: React.FC<TeamMemberRouteProps> = ({
  children,
  allowedTeamRoles,
  teamId,
  fallbackTo = ROUTES.DASHBOARD,
}) => {
  const profile = useAuthProfile();
  // auth loading handled by gate
  const params = useParams();
  const gate = useAuthGate({ requireAuth: true, redirectTo: ROUTES.LOGIN });
  const [teamMember, setTeamMember] = useState<TeamMemberData | null>(null);
  const [checkingMembership, setCheckingMembership] = useState(true);
  // Get team ID from props or URL params
  const currentTeamId = teamId || params.teamId;
  // IMMEDIATE ADMIN BYPASS - Don't even check membership for admins
  const isAdmin = profile?.role === "admin";
  useEffect(() => {
    // Skip all checks for admin users
    if (isAdmin) {
      setCheckingMembership(false);
      return;
    }
  const checkTeamMembership = async () => {
      if (!profile?.id || !currentTeamId) {
        setTeamMember(null);
        setCheckingMembership(false);
        return;
      }
      try {
    const data = await fetchTeamMembership(profile.id, currentTeamId);
    setTeamMember(data);
      } catch (error) {
        console.error("Error checking team membership:", error);
        setTeamMember(null);
      } finally {
        setCheckingMembership(false);
      }
    };
    // Reset checking state and run the membership check for non-admin users
    setCheckingMembership(true);
    checkTeamMembership();
  }, [profile?.id, profile?.role, currentTeamId, isAdmin]);
  // Show loading spinner while checking authentication and membership (but not for admins)
  if (gate.status === "loading" || (!isAdmin && checkingMembership)) {
    return <LoadingScreen />;
  }
  // Not authenticated - redirect to login
  if (gate.status === "redirect") return gate.element!;
  // No team ID provided
  if (!currentTeamId) {
    return <Navigate to={fallbackTo || ROUTES.DASHBOARD} replace />;
  }
  // Not a team member or inactive (admins bypass this check completely)
  if (!isAdmin && (!teamMember || teamMember.status !== "active")) {
    return (
      <AccessDenied
        title="Team Access Required"
        iconName="users"
        message={
          !teamMember
            ? "You are not a member of this team."
            : "Your team membership is not active."
        }
      />
    );
  }
  // Check if user's team role is allowed (admins bypass this check completely)
  if (!isAdmin && teamMember && !allowedTeamRoles.includes(teamMember.role)) {
    return (
      <AccessDenied
        title="Insufficient Team Permissions"
        iconName="shield"
        message={`Your role (${teamMember.role}) doesn't have access to this feature.`}
      />
    );
  }
  // Access granted, render the protected content
  return <>{children}</>;
};
