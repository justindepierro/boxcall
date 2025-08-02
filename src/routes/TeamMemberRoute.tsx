import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import {
  useAuthLoading,
  useAuthProfile,
  useIsAuthenticated,
} from "../app/auth-store";
import { supabase } from "../lib/supabase";
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
  fallbackTo = "/dashboard",
}) => {
  const isAuthenticated = useIsAuthenticated();
  const profile = useAuthProfile();
  const loading = useAuthLoading();
  const params = useParams();
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
        const { data, error } = await supabase
          .from("team_members")
          .select("role, status")
          .eq("user_id", profile.id)
          .eq("team_id", currentTeamId)
          .single();

        if (error || !data) {
          setTeamMember(null);
        } else {
          setTeamMember(data);
        }
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
  if (loading || (!isAdmin && checkingMembership)) {
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

  // No team ID provided
  if (!currentTeamId) {
    return <Navigate to={fallbackTo} replace />;
  }

  // Not a team member or inactive (admins bypass this check completely)
  if (!isAdmin && (!teamMember || teamMember.status !== "active")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🏈 Team Access Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {!teamMember
              ? "You are not a member of this team."
              : "Your team membership is not active."}
          </p>
          <button
            onClick={() => (window.location.href = fallbackTo)}
            className="bg-jade-500 text-white px-4 py-2 rounded-sm hover:bg-jade-600 font-sans font-semibold"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Check if user's team role is allowed (admins bypass this check completely)
  if (!isAdmin && teamMember && !allowedTeamRoles.includes(teamMember.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🚫 Insufficient Team Permissions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your role ({teamMember.role}) doesn't have access to this feature.
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
