/**
 * Dashboard Page - Phase 4 Implementation
 *
 * Updated dashboard using the new DataResolutionService for clean data loading.
 * Replaces direct auth dependencies with the new data resolution hooks.
 *
 * @version 4.0.0 - Phase 4 Data Resolution Integration
 * @author BoxCall Development Team
 */

import React from "react";
import { Icon } from "../components/ui/Icon/Icon";
import { useDashboardData } from "../hooks/useDataResolution";
import { Typography } from "../components/design-system";
import { CleanDataIndicator } from "../components/dev/CleanDataIndicator";

/**
 * Personal Dashboard - Phase 4 with Clean Data Resolution
 *
 * Features:
 * - Profile Card (left column) - modal-viewable
 * - Trophy Shelf (spanning top middle & right)
 * - Team Feeds (middle column, under trophy shelf)
 * - Calendar (right column, under trophy shelf)
 * - Clean dev mode data indicators
 */
export const DashboardPageV4: React.FC = () => {
  const {
    userProfile,
    teams,
    // achievements, // Removed since we're not using it yet
    recentActivity,
    isLoading,
    error,
    context,
    isSystemOwner,
    hasTeams,
    isRealData,
    isDevData,
    isEmptyState,
  } = useDashboardData();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-jade mx-auto mb-4"></div>
          <Typography variant="body-lg" color="muted">
            Loading dashboard data...
          </Typography>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Typography variant="headline-lg" className="text-red-600 mb-2">
            Data Loading Error
          </Typography>
          <Typography variant="body-lg" color="muted">
            {error}
          </Typography>
          <CleanDataIndicator />
        </div>
      </div>
    );
  }

  // Empty state for new users
  if (isEmptyState) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <CleanDataIndicator />

        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <div className="w-16 h-16 bg-surface-jade rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="trophy" className="w-5 h-5" />
              </div>
            </div>
            <Typography variant="headline-lg" className="mb-4">
              Welcome to BoxCall!
            </Typography>
            <Typography variant="body-lg" color="muted" className="mb-6">
              Ready to get started? Create or join a team to begin your journey.
            </Typography>
            <div className="space-x-4">
              <button className="px-6 py-3 bg-interaction-jade text-white rounded-lg hover:bg-brand-jade-dark transition-colors">
                Create Team
              </button>
              <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Join Team
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // const userRole = userProfile?.role || "player"; // Removed since we're not using it in simplified version
  const displayName =
    userProfile?.first_name ||
    userProfile?.display_name ||
    userProfile?.email?.split("@")[0] ||
    "User";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Clean Data Indicator for development */}
      <CleanDataIndicator />

      {/* Welcome Section - Enhanced with data awareness */}
      <div className="bg-gradient-to-r from-surface-jade to-surface-jade dark:from-surface-jade-dark dark:to-surface-jade-dark border-b border-surface-jade-dark dark:border-brand-jade-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-left">
          <div className="flex items-center justify-between">
            <div>
              <Typography
                variant="headline-md"
                className="text-brand-jade-dark dark:text-brand-jade-light"
              >
                {React.createElement(
                  "span",
                  {},
                  `Welcome back, ${displayName}!`
                )}
                {isSystemOwner && (
                  <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    System Owner
                  </span>
                )}
              </Typography>
              <Typography variant="body-sm" color="muted" className="mt-1">
                {hasTeams
                  ? `Managing ${teams.length} team${teams.length !== 1 ? "s" : ""} • ${recentActivity.length} recent activities`
                  : "Your command center awaits • Ready to create or join a team?"}
              </Typography>
            </div>

            {/* Data Source Indicator */}
            <div className="hidden md:block">
              <div className="text-xs text-gray-500 bg-white/50 px-2 py-1 rounded">
                {isRealData && (
                  <>
                    <Icon name="bar-chart" className="w-4 h-4 inline mr-1" />
                    Live Data
                  </>
                )}
                {isDevData && "🧪 Dev Data"}
                {context?.dataSource === "legacy_mock" && "🔧 Legacy Mock"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content - Phase 4 with Clean Data */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {hasTeams ? (
          // Full dashboard layout for users with teams - simplified for Phase 4 demo
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <Typography variant="headline-md" className="mb-4">
                Profile Summary
              </Typography>
              <div className="space-y-3">
                <div>
                  <Typography variant="body-sm" color="muted">
                    Name:
                  </Typography>
                  <Typography variant="body-md">
                    {userProfile?.first_name} {userProfile?.last_name}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body-sm" color="muted">
                    Email:
                  </Typography>
                  <Typography variant="body-md">
                    {userProfile?.email}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body-sm" color="muted">
                    Role:
                  </Typography>
                  <Typography variant="body-md">{userProfile?.role}</Typography>
                </div>
                {userProfile?.phone && (
                  <div>
                    <Typography variant="body-sm" color="muted">
                      Phone:
                    </Typography>
                    <Typography variant="body-md">
                      {userProfile.phone}
                    </Typography>
                  </div>
                )}
              </div>
            </div>

            {/* Teams Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <Typography variant="headline-md" className="mb-4">
                Teams ({teams.length})
              </Typography>
              {teams.length > 0 ? (
                <div className="space-y-4">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className="border-l-4 border-surface-jade-dark pl-4"
                    >
                      <Typography variant="headline-sm" className="mb-1">
                        {team.name}
                      </Typography>
                      <Typography variant="body-sm" color="muted">
                        {team.description || "No description"}
                      </Typography>
                      <div className="text-xs text-gray-500 mt-1">
                        Code: {team.team_code || "N/A"} • School:{" "}
                        {team.school || "N/A"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Typography variant="body-md" color="muted">
                  No teams found
                </Typography>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border p-6 lg:col-span-2">
              <Typography variant="headline-md" className="mb-4">
                Recent Activity ({recentActivity.length})
              </Typography>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-surface-jade rounded-full flex items-center justify-center">
                        <Icon name="trophy" className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <Typography variant="body-md" className="font-medium">
                          {activity.title}
                        </Typography>
                        <Typography variant="body-sm" color="muted">
                          {activity.description}
                        </Typography>
                        <Typography
                          variant="body-sm"
                          color="muted"
                          className="text-xs"
                        >
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </Typography>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Typography variant="body-md" color="muted">
                  No recent activity
                </Typography>
              )}
            </div>
          </div>
        ) : (
          // Simplified layout for users without teams
          <div className="max-w-2xl mx-auto text-center py-12">
            <Typography variant="headline-lg" className="mb-6">
              Get Started with BoxCall
            </Typography>
            <Typography variant="body-lg" color="muted" className="mb-8">
              Create a team to manage your players, or join an existing team to
              get started.
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="w-12 h-12 bg-surface-jade rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon name="trophy" className="w-5 h-5" />
                </div>
                <Typography variant="headline-sm" className="mb-3">
                  Create Team
                </Typography>
                <Typography variant="body-sm" color="muted" className="mb-4">
                  Start your own team and invite players, coaches, and families.
                </Typography>
                <button className="w-full px-4 py-2 bg-interaction-jade text-white rounded-lg hover:bg-brand-jade-dark transition-colors">
                  Create Team
                </button>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">🤝</span>
                </div>
                <Typography variant="headline-sm" className="mb-3">
                  Join Team
                </Typography>
                <Typography variant="body-sm" color="muted" className="mb-4">
                  Enter a team code to join an existing team.
                </Typography>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Join Team
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPageV4;
