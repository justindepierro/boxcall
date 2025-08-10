import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../app/auth-store";
import { Typography } from "../design-system";
import { Button } from "../ui/Button/Button";
import { Icon } from "../ui/Icon/Icon";
import { supabase } from "../../lib/supabase";

interface TeamOnboardingProps {
  /** Show only on dashboard, not in playbook */
  context?: "dashboard" | "playbook";
}

/**
 * Team Onboarding Component
 *
 * Provides contextual guidance for users:
 * - Dashboard: Encourages team creation/joining for full experience
 * - Playbook: Only shows if user lacks Coach Account AND has no teams
 *
 * Coach Account users can use playbook without teams (personal playbooks)
 * Free users need teams to access most features
 */
export const TeamOnboarding: React.FC<TeamOnboardingProps> = ({
  context = "dashboard",
}) => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [hasTeams, setHasTeams] = useState<boolean | null>(null);
  const [hasCoachAccount, setHasCoachAccount] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!profile?.id) return;

      try {
        // Check if user is a member of any teams
        const { data: teamMemberships, error: teamError } = await supabase
          .from("team_members")
          .select("id")
          .eq("user_id", profile.id)
          .limit(1);

        if (teamError) {
          console.error("Error checking team memberships:", teamError);
        }

        // Check if user has coach account subscription/purchase
        // TODO: Replace with actual subscription check
        // For now, check if user has coach role (simplified)
        const hasCoachRole = profile.role === "coach";

        setHasTeams(teamMemberships && teamMemberships.length > 0);
        setHasCoachAccount(hasCoachRole);
      } catch (error) {
        console.error("Error in user status check:", error);
        setHasTeams(false);
        setHasCoachAccount(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserStatus();
  }, [profile?.id, profile?.role]);

  // Show loading state
  if (loading) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg bc-card-padding">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-200 rounded-full"></div>
          <div className="h-4 bg-blue-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  // User has teams - don't show onboarding
  if (hasTeams) {
    return null;
  }

  // PLAYBOOK CONTEXT: Only show if user doesn't have Coach Account
  if (context === "playbook") {
    if (hasCoachAccount) {
      // Coach Account users can use playbook without teams
      return (
        <div className="bg-jade-50 dark:bg-jade-900/20 border border-jade-200 dark:border-jade-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <Icon name="check-circle" size="md" color="success" />
            <div>
              <Typography
                variant="body-md"
                className="font-medium text-jade-700 dark:text-jade-300"
              >
                Personal Playbook Mode
              </Typography>
              <Typography variant="body-sm" color="muted">
                Build personal playbooks now. When you join a team, your plays
                will sync automatically.
              </Typography>
            </div>
          </div>
        </div>
      );
    } else {
      // Free users need team or coach account for playbook
      return (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg bc-card-padding mb-8">
          <div className="text-center">
            <Icon
              name="lock"
              size="lg"
              color="warning"
              className="mx-auto mb-4"
            />
            <Typography variant="headline-md" className="mb-3">
              Playbook Access Required
            </Typography>
            <Typography variant="body-md" color="muted" className="mb-6">
              To use the PlayBook, you need either a Coach Account or team
              membership.
            </Typography>
            <div className="flex gap-3 justify-center">
              <Button
                size="sm"
                variant="primary"
                onClick={() => navigate("/create-coach-account")}
              >
                Get Coach Account ($19.99)
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/join-team")}
              >
                Join a Team
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }

  // DASHBOARD CONTEXT: Encourage team creation for full experience
  return (
  <div className="surface-card decorative-gradient bg-gradient-to-r from-blue-50 to-jade-50 dark:from-blue-900/20 dark:to-jade-900/20 border border-blue-200 dark:border-blue-800 rounded-xl bc-card-padding mb-8">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-jade-100 dark:bg-jade-900/40 p-4 rounded-full">
            <Icon name="users" size="xl" color="primary" />
          </div>
        </div>

        <Typography variant="headline-lg" className="mb-4">
          {hasCoachAccount
            ? "Ready to Connect with a Team?"
            : "Welcome to BoxCall! 🏈"}
        </Typography>

        <Typography
          variant="body-lg"
          color="muted"
          className="mb-8 max-w-2xl mx-auto"
        >
          {hasCoachAccount
            ? "You have Coach Account access! Create or join a team to apply your playbooks to real programs."
            : "To get the full BoxCall experience, you can create a team, join one, or get a Coach Account for personal use."}
        </Typography>

        <div className="grid grid-cols-1 md:grid-cols-2 bc-grid-gap max-w-2xl mx-auto">
          {/* Create Team Option */}
          <div className="surface-card rounded-lg bc-card-padding border border-gray-200 dark:border-gray-700 hover:border-jade-300 dark:hover:border-jade-600 transition-colors">
            <Icon
              name="plus"
              size="lg"
              color="primary"
              className="mx-auto mb-4"
            />
            <Typography variant="headline-md" className="mb-3">
              Create a Team
            </Typography>
            <Typography variant="body-sm" color="muted" className="mb-4">
              Set up your own program and invite players and coaches
            </Typography>
            <Button
              fullWidth
              size="sm"
              variant="primary"
              onClick={() => navigate("/create-team")}
            >
              Create Team
            </Button>
          </div>

          {/* Join Team Option */}
          <div className="surface-card rounded-lg bc-card-padding border border-gray-200 dark:border-gray-700 hover:border-jade-300 dark:hover:border-jade-600 transition-colors">
            <Icon
              name="user-plus"
              size="lg"
              color="primary"
              className="mx-auto mb-4"
            />
            <Typography variant="headline-md" className="mb-3">
              Join a Team
            </Typography>
            <Typography variant="body-sm" color="muted" className="mb-4">
              Use an invite code or search for your existing team
            </Typography>
            <Button
              fullWidth
              size="sm"
              variant="outline"
              onClick={() => navigate("/join-team")}
            >
              Join Team
            </Button>
          </div>
        </div>

        {!hasCoachAccount && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Typography variant="body-sm" color="muted" className="mb-3">
              <strong>Individual Coaches:</strong> Want to build personal
              playbooks without a team?
            </Typography>
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate("/create-coach-account")}
              className="font-medium"
            >
              Get Coach Account ($19.99 one-time) →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
