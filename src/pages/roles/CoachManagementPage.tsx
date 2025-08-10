import React from "react";
import { Icon } from "../../components/ui/Icon/Icon";
import { RoleProtectedRoute } from "../../routes/RoleProtectedRoute";
import { Button } from "../../components/ui/Button/Button";
import { Typography } from "../../components/design-system/Typography";

/**
 * Coach Management Page - Only accessible by coaches and admins
 */
const CoachManagementContent: React.FC = () => {
  return (
    <div className="min-h-screen surface-app">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Typography variant="headline-lg" as="h1" className="flex items-center text-text-primary">
            <Icon name="users" className="mr-3" />
            Coach Management Hub
          </Typography>
          <p className="mt-2 text-text-secondary">
            Manage your team, create plays, and plan practices
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Team Management */}
          <div className="surface-card elevation-card hoverable rounded-lg p-6">
            <Typography variant="headline-sm" as="h3" className="mb-4 flex items-center text-text-primary">
              <Icon name="team" className="mr-2" />
              Team Management
            </Typography>
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
          <div className="surface-card elevation-card hoverable rounded-lg p-6">
            <Typography variant="headline-sm" as="h3" className="mb-4 flex items-center text-text-primary">
              <Icon name="book" className="mr-2" />
              Playbook
            </Typography>
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
          <div className="surface-card elevation-card hoverable rounded-lg p-6">
            <Typography variant="headline-sm" as="h3" className="mb-4 flex items-center text-text-primary">
              <Icon name="calendar" className="mr-2" />
              Practice Planning
            </Typography>
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
        <div className="surface-card elevation-card rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <Typography variant="headline-sm" as="h3" className="text-text-primary">
              Recent Activity
            </Typography>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2">
                  <Icon name="play" size="sm" />
                </div>
                <div>
                  <p className="text-sm text-text-primary">
                    Created new play: "Slant Right Formation"
                  </p>
                  <p className="text-xs text-text-secondary">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 dark:bg-green-900 rounded-full p-2">
                  <Icon name="calendar" size="sm" />
                </div>
                <div>
                  <p className="text-sm text-text-primary">
                    Scheduled practice for Thursday 3:30 PM
                  </p>
                  <p className="text-xs text-text-secondary">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-2">
                  <Icon name="user" size="sm" />
                </div>
                <div>
                  <p className="text-sm text-text-primary">
                    Added new player: John Smith (#23)
                  </p>
                  <p className="text-xs text-text-secondary">1 day ago</p>
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
