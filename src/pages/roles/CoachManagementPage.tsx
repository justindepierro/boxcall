import React from "react";
import { Icon } from "../../components/ui/Icon/Icon";
import { RoleProtectedRoute } from "../../routes/RoleProtectedRoute";
import { Button } from "../../components/ui/Button/Button";

/**
 * Coach Management Page - Only accessible by coaches and admins
 */
const CoachManagementContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Icon name="users" className="mr-3" />
            Coach Management Hub
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your team, create plays, and plan practices
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Team Management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Icon name="team" className="mr-2" />
              Team Management
            </h3>
            <div className="space-y-3">
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                className="justify-start"
              >
                View Team Roster
              </Button>
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                className="justify-start"
              >
                Add New Player
              </Button>
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                className="justify-start"
              >
                Update Player Stats
              </Button>
            </div>
          </div>

          {/* Playbook */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Icon name="book" className="mr-2" />
              Playbook
            </h3>
            <div className="space-y-3">
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                className="justify-start"
              >
                Create New Play
              </Button>
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                className="justify-start"
              >
                Edit Existing Plays
              </Button>
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                className="justify-start"
              >
                Export Playbook
              </Button>
            </div>
          </div>

          {/* Practice Planning */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Icon name="calendar" className="mr-2" />
              Practice Planning
            </h3>
            <div className="space-y-3">
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                className="justify-start"
              >
                Schedule Practice
              </Button>
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                className="justify-start"
              >
                Create Practice Script
              </Button>
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                className="justify-start"
              >
                View Practice History
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Activity
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2">
                  <Icon name="play" size="sm" />
                </div>
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">
                    Created new play: "Slant Right Formation"
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    2 hours ago
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 dark:bg-green-900 rounded-full p-2">
                  <Icon name="calendar" size="sm" />
                </div>
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">
                    Scheduled practice for Thursday 3:30 PM
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    5 hours ago
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-2">
                  <Icon name="user" size="sm" />
                </div>
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">
                    Added new player: John Smith (#23)
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    1 day ago
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CoachManagementPage: React.FC = () => {
  return (
    <RoleProtectedRoute allowedRoles={["coach", "admin"]}>
      <CoachManagementContent />
    </RoleProtectedRoute>
  );
};

export default CoachManagementPage;
