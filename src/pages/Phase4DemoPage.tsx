/**
 * Phase 4 Demo Page - Data Resolution Testing
 *
 * Simple demo page to test the new DataResolutionService and clean data hooks.
 * Shows the resolved data in a clean format for testing purposes.
 *
 * @version 4.0.0 - Phase 4 Data Resolution Demo
 * @author BoxCall Development Team
 */

import React from "react";
import { useDataResolution } from "../hooks/useDataResolution";
import { CleanDataIndicator } from "../components/dev/CleanDataIndicator";
import { Typography } from "../components/design-system";

export const Phase4DemoPage: React.FC = () => {
  const {
    userProfile,
    teams,
    achievements,
    calendarEvents,
    isLoading,
    error,
    context,
    isSystemOwner,
    hasTeams,
    isRealData,
    isDevData,
    isMockData,
    isEmptyState,
    refresh,
  } = useDataResolution();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jade-600 mx-auto mb-4"></div>
          <Typography variant="body-lg">Loading Phase 4 data...</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="headline-lg" className="mb-2">
                Phase 4: Data Resolution Service Demo
              </Typography>
              <Typography variant="body-lg" color="muted">
                Testing the new clean data resolution system
              </Typography>
            </div>
            <button
              onClick={refresh}
              className="px-4 py-2 bg-jade-600 text-white rounded-lg hover:bg-jade-700 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Clean Data Indicator */}
        <div className="mb-6">
          <CleanDataIndicator />
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <Typography variant="headline-sm" className="text-red-800 mb-2">
              Error Loading Data
            </Typography>
            <Typography variant="body-md" className="text-red-700">
              {error}
            </Typography>
          </div>
        )}

        {/* Data Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <Typography variant="headline-sm" className="mb-2">
              Data Source
            </Typography>
            <div className="space-y-1">
              <div className="text-sm">
                <span className="font-medium">Source:</span>{" "}
                {context?.dataSource || "unknown"}
              </div>
              <div className="text-sm">
                <span className="font-medium">Permission:</span>{" "}
                {context?.permissionContext || "unknown"}
              </div>
              <div className="text-sm">
                <span className="font-medium">UI Mode:</span>{" "}
                {context?.uiMode || "unknown"}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <Typography variant="headline-sm" className="mb-2">
              User Profile
            </Typography>
            <div className="space-y-1">
              <div className="text-sm">
                <span className="font-medium">Name:</span>{" "}
                {userProfile?.first_name || "N/A"}{" "}
                {userProfile?.last_name || ""}
              </div>
              <div className="text-sm">
                <span className="font-medium">Email:</span>{" "}
                {userProfile?.email || "N/A"}
              </div>
              <div className="text-sm">
                <span className="font-medium">Role:</span>{" "}
                {userProfile?.role || "N/A"}
              </div>
              {isSystemOwner && (
                <div className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded mt-2">
                  System Owner
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <Typography variant="headline-sm" className="mb-2">
              Teams
            </Typography>
            <div className="space-y-1">
              <div className="text-sm">
                <span className="font-medium">Count:</span> {teams.length}
              </div>
              <div className="text-sm">
                <span className="font-medium">Has Teams:</span>{" "}
                {hasTeams ? "Yes" : "No"}
              </div>
              {teams.length > 0 && (
                <div className="text-xs text-gray-600 mt-2">
                  {teams.map((team) => team.name).join(", ")}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <Typography variant="headline-sm" className="mb-2">
              Data Type
            </Typography>
            <div className="space-y-1">
              <div className="text-sm">
                <span className="font-medium">Real Data:</span>{" "}
                {isRealData ? "Yes" : "No"}
              </div>
              <div className="text-sm">
                <span className="font-medium">Dev Data:</span>{" "}
                {isDevData ? "Yes" : "No"}
              </div>
              <div className="text-sm">
                <span className="font-medium">Mock Data:</span>{" "}
                {isMockData ? "Yes" : "No"}
              </div>
              <div className="text-sm">
                <span className="font-medium">Empty State:</span>{" "}
                {isEmptyState ? "Yes" : "No"}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Data Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Teams Detail */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <Typography variant="headline-md" className="mb-4">
              Teams ({teams.length})
            </Typography>
            {teams.length > 0 ? (
              <div className="space-y-4">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="border-l-4 border-jade-200 pl-4"
                  >
                    <Typography variant="headline-sm" className="mb-1">
                      {team.name}
                    </Typography>
                    <Typography
                      variant="body-sm"
                      color="muted"
                      className="mb-2"
                    >
                      {team.description || "No description"}
                    </Typography>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>ID: {team.id}</div>
                      <div>Code: {team.team_code || "N/A"}</div>
                      <div>School: {team.school || "N/A"}</div>
                      <div>Mascot: {team.mascot || "N/A"}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Typography variant="body-md" color="muted">
                No teams available
              </Typography>
            )}
          </div>

          {/* Achievements Detail */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <Typography variant="headline-md" className="mb-4">
              Achievements ({achievements.length})
            </Typography>
            {achievements.length > 0 ? (
              <div className="space-y-4">
                {achievements.slice(0, 5).map((achievement) => (
                  <div
                    key={achievement.id}
                    className="border-l-4 border-jade-200 pl-4"
                  >
                    <Typography variant="headline-sm" className="mb-1">
                      {achievement.title}
                    </Typography>
                    <Typography
                      variant="body-sm"
                      color="muted"
                      className="mb-2"
                    >
                      {achievement.description || "No description"}
                    </Typography>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Date: {achievement.date}</div>
                      <div>Type: {achievement.type || "N/A"}</div>
                      <div>ID: {achievement.id}</div>
                    </div>
                  </div>
                ))}
                {achievements.length > 5 && (
                  <Typography variant="body-sm" color="muted">
                    ...and {achievements.length - 5} more
                  </Typography>
                )}
              </div>
            ) : (
              <Typography variant="body-md" color="muted">
                No achievements available
              </Typography>
            )}
          </div>

          {/* Calendar Events Detail */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <Typography variant="headline-md" className="mb-4">
              Calendar Events ({calendarEvents.length})
            </Typography>
            {calendarEvents.length > 0 ? (
              <div className="space-y-4">
                {calendarEvents.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="border-l-4 border-blue-200 pl-4"
                  >
                    <Typography variant="headline-sm" className="mb-1">
                      {event.title}
                    </Typography>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Date: {event.date}</div>
                      <div>Time: {event.time || "N/A"}</div>
                      <div>Type: {event.type}</div>
                      <div>Location: {event.location || "N/A"}</div>
                    </div>
                  </div>
                ))}
                {calendarEvents.length > 5 && (
                  <Typography variant="body-sm" color="muted">
                    ...and {calendarEvents.length - 5} more
                  </Typography>
                )}
              </div>
            ) : (
              <Typography variant="body-md" color="muted">
                No calendar events available
              </Typography>
            )}
          </div>

          {/* Context Detail */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <Typography variant="headline-md" className="mb-4">
              Resolution Context
            </Typography>
            {context ? (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Data Source:</span>{" "}
                  {context.dataSource}
                </div>
                <div>
                  <span className="font-medium">Permission Context:</span>{" "}
                  {context.permissionContext}
                </div>
                <div>
                  <span className="font-medium">UI Mode:</span> {context.uiMode}
                </div>
                <div>
                  <span className="font-medium">User ID:</span>{" "}
                  {context.userId || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Team IDs:</span>{" "}
                  {context.teamIds?.join(", ") || "None"}
                </div>
                <div>
                  <span className="font-medium">Show Dev Tools:</span>{" "}
                  {context.shouldShowDevTools ? "Yes" : "No"}
                </div>
                <div>
                  <span className="font-medium">Use Mock Data:</span>{" "}
                  {context.shouldUseMockData ? "Yes" : "No"}
                </div>
                <div>
                  <span className="font-medium">Use Blank Slate:</span>{" "}
                  {context.shouldUseBlankSlate ? "Yes" : "No"}
                </div>
              </div>
            ) : (
              <Typography variant="body-md" color="muted">
                No context available
              </Typography>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Phase4DemoPage;
