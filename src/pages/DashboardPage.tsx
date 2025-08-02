import React from "react";
import { useAuth } from "../app/auth-store";
import { CrossTeamMessages } from "../components/dashboard/CrossTeamMessages";
import { PersonalCalendar } from "../components/dashboard/PersonalCalendar";
import { PersonalProfile } from "../components/dashboard/PersonalProfile";
import { PersonalTrophyShelf } from "../components/dashboard/PersonalTrophyShelf";
import { CoachQuickActions } from "../components/dashboard/QuickActions/CoachQuickActions";
import { FamilyQuickActions } from "../components/dashboard/QuickActions/FamilyQuickActions";
import { PlayerQuickActions } from "../components/dashboard/QuickActions/PlayerQuickActions";
import { Typography } from "../components/design-system";
import { Card } from "../components/ui";
import { useDashboardData } from "../hooks/useDashboard";
import { DashboardService } from "../services/dashboardService";

/**
 * Personal Dashboard - Individual user's personal space
 * Think MySpace profile meets Strava achievements
 *
 * Features:
 * - Personal Trophy Shelf (Helmet Stickers + BoxCall Medals)
 * - Editable Bio & Profile (including GPA, gear showcase)
 * - Cross-team messages and communications
 * - Personal calendar with events from all teams
 * - Role-based quick actions
 */
export const DashboardPage: React.FC = () => {
  const { user, profile } = useAuth();

  // Get dashboard data with real database integration
  const {
    userTeams,
    totalTeams,
    recentActivity,
    loading: dashboardLoading,
    error: dashboardError,
  } = useDashboardData(user?.id);

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Typography variant="headline-lg" color="muted">
            Loading your dashboard...
          </Typography>
        </div>
      </div>
    );
  }

  // Show loading state while fetching dashboard data
  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jade-600 mx-auto mb-4"></div>
          <Typography variant="headline-lg" color="muted">
            Loading your teams and activities...
          </Typography>
        </div>
      </div>
    );
  }

  // Show error state if dashboard data failed to load
  if (dashboardError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Typography variant="headline-lg" className="text-red-600 mb-2">
            Failed to load dashboard
          </Typography>
          <Typography variant="body-lg" color="muted">
            {dashboardError}
          </Typography>
        </div>
      </div>
    );
  }

  // Determine user role for role-based content
  const userRole = profile.role || "player";
  const isPlayer = userRole === "player";
  const isCoach = userRole === "coach";
  const isFamily = userRole === "family";

  const renderQuickActions = () => {
    if (isPlayer) return <PlayerQuickActions />;
    if (isCoach) return <CoachQuickActions />;
    if (isFamily) return <FamilyQuickActions />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography
                variant="headline-xl"
                className="text-gray-900 dark:text-white"
              >
                Welcome back,{" "}
                {profile.full_name?.split(" ")[0] ||
                  profile.display_name ||
                  user.email}
                !
              </Typography>
              <Typography variant="body-lg" color="muted" className="mt-1">
                Your personal football command center
              </Typography>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <Typography variant="body-sm" color="muted">
                  Role: {userRole.replace("_", " ").toUpperCase()}
                </Typography>
                <Typography variant="body-sm" color="muted">
                  Active Teams: {totalTeams}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Trophy Shelf & Profile */}
          <div className="lg:col-span-1 space-y-6">
            {/* Personal Trophy Shelf - Pinned at Top */}
            <PersonalTrophyShelf userId={user.id} userRole={userRole} />

            {/* Personal Profile */}
            <PersonalProfile
              profile={profile}
              isEditable={true}
              showGPA={isPlayer}
              showGearShowcase={isPlayer}
              showCoachingCredentials={isCoach}
            />
          </div>

          {/* Center Column - Communications & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Role-Based Quick Actions */}
            <Card className="p-6">
              <Typography
                variant="headline-md"
                className="mb-4 text-gray-900 dark:text-white"
              >
                Quick Actions
              </Typography>
              {renderQuickActions()}
            </Card>

            {/* Cross-Team Messages */}
            <CrossTeamMessages userId={user.id} />
          </div>

          {/* Right Column - Calendar & Activity */}
          <div className="lg:col-span-1 space-y-6">
            {/* Personal Calendar */}
            <PersonalCalendar userId={user.id} />

            {/* Recent Activity */}
            <Card className="p-6">
              <Typography
                variant="headline-md"
                className="mb-4 text-gray-900 dark:text-white"
              >
                Recent Activity
              </Typography>
              <div className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-3"
                    >
                      <div
                        className={`w-2 h-2 bg-${activity.color}-500 rounded-full`}
                      ></div>
                      <div className="flex-1">
                        <Typography
                          variant="body-sm"
                          className="font-medium text-gray-900 dark:text-white"
                        >
                          {activity.title}
                        </Typography>
                        <Typography variant="body-sm" color="muted">
                          {activity.description}
                          {activity.teamName && ` • ${activity.teamName}`}
                        </Typography>
                      </div>
                    </div>
                  ))
                ) : (
                  <Typography variant="body-sm" color="muted">
                    No recent activity
                  </Typography>
                )}
              </div>
            </Card>

            {/* Teams Overview */}
            <Card className="p-6">
              <Typography
                variant="headline-md"
                className="mb-4 text-gray-900 dark:text-white"
              >
                Your Teams
              </Typography>
              <div className="space-y-3">
                {userTeams.length > 0 ? (
                  userTeams.map((userTeam) => {
                    const status = DashboardService.getTeamStatus();
                    return (
                      <div
                        key={userTeam.team.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div>
                          <Typography
                            variant="body-md"
                            className="font-semibold"
                          >
                            {userTeam.team.name}
                          </Typography>
                          <Typography variant="body-sm" color="muted">
                            {userTeam.membership.role.replace("_", " ")} •{" "}
                            {userTeam.memberCount} members
                          </Typography>
                        </div>
                        <div className="text-right">
                          <Typography
                            variant="body-sm"
                            className={`text-${status.color}-600 dark:text-${status.color}-400`}
                          >
                            {status.status}
                          </Typography>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Typography variant="body-md" color="muted">
                      You're not a member of any teams yet
                    </Typography>
                    <Typography
                      variant="body-sm"
                      color="muted"
                      className="mt-1"
                    >
                      Join a team to get started
                    </Typography>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
