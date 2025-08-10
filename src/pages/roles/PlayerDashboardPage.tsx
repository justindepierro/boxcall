import React from "react";
import { Icon } from "../../components/ui/Icon/Icon";
import { Typography } from "../../components/design-system/Typography";
import { RoleProtectedRoute } from "../../routes/RoleProtectedRoute";
import { Button } from "../../components/ui/Button";

/**
 * Player Dashboard Page - Only accessible by players
 */
const PlayerDashboardContent: React.FC = () => {
  return (
    <div className="min-h-screen surface-app">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Typography
            variant="headline-lg"
            as="h1"
            className="flex items-center"
          >
            <Icon name="user" className="mr-3" /> Player Dashboard
          </Typography>
          <Typography variant="body-md" color="muted" className="mt-2">
            Track your progress and stay updated with team activities
          </Typography>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="surface-card elevation-card hoverable rounded-lg p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3">
                <Icon
                  name="target"
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">
                  Practices Attended
                </p>
                <p className="text-2xl font-bold text-text-primary">23/25</p>
              </div>
            </div>
          </div>
          <div className="surface-card elevation-card hoverable rounded-lg p-6">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900 rounded-full p-3">
                <Icon
                  name="trophy"
                  className="text-green-600 dark:text-green-400"
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">
                  Games Played
                </p>
                <p className="text-2xl font-bold text-text-primary">8</p>
              </div>
            </div>
          </div>
          <div className="surface-card elevation-card hoverable rounded-lg p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-3">
                <Icon
                  name="star"
                  className="text-purple-600 dark:text-purple-400"
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">
                  Skill Rating
                </p>
                <p className="text-2xl font-bold text-text-primary">8.5</p>
              </div>
            </div>
          </div>
          <div className="surface-card elevation-card hoverable rounded-lg p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 dark:bg-orange-900 rounded-full p-3">
                <Icon
                  name="trending-up"
                  className="text-orange-600 dark:text-orange-400"
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">
                  Improvement
                </p>
                <p className="text-2xl font-bold text-text-primary">+2.1</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Events */}
          <div className="surface-card elevation-card rounded-lg">
            <div className="px-6 py-4 border-b border-subtle dark:border-gray-700">
              <Typography
                variant="headline-sm"
                as="h3"
                className="flex items-center"
              >
                <Icon name="calendar" className="mr-2" /> Upcoming Events
              </Typography>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2">
                    <Icon name="calendar" size="sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      Practice Session
                    </p>
                    <p className="text-sm text-text-secondary">
                      Thursday, 3:30 PM - 5:30 PM
                    </p>
                    <p className="text-xs text-text-secondary">
                      Focus: Offensive Line Drills
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 dark:bg-green-900 rounded-full p-2">
                    <Icon name="flag" size="sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      Game vs. Eagles
                    </p>
                    <p className="text-sm text-text-secondary">
                      Saturday, 7:00 PM
                    </p>
                    <p className="text-xs text-text-secondary">
                      Away Game - Memorial Stadium
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-2">
                    <Icon name="users" size="sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      Team Meeting
                    </p>
                    <p className="text-sm text-text-secondary">
                      Monday, 4:00 PM - 5:00 PM
                    </p>
                    <p className="text-xs text-text-secondary">
                      Film Review & Strategy
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Performance */}
          <div className="surface-card elevation-card rounded-lg">
            <div className="px-6 py-4 border-b border-subtle dark:border-gray-700">
              <Typography
                variant="headline-sm"
                as="h3"
                className="flex items-center text-text-primary"
              >
                <Icon name="bar-chart" className="mr-2" />
                Recent Performance
              </Typography>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    Passing Accuracy
                  </span>
                  <div className="flex items-center">
                    <div className="surface-subtle dark:bg-gray-700 rounded-full h-2 w-20 mr-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-text-primary">
                      85%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    Speed & Agility
                  </span>
                  <div className="flex items-center">
                    <div className="surface-subtle dark:bg-gray-700 rounded-full h-2 w-20 mr-2">
                      <div
                        className="bg-jade-600 h-2 rounded-full"
                        style={{ width: "78%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-text-primary">
                      78%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    Team Coordination
                  </span>
                  <div className="flex items-center">
                    <div className="surface-subtle dark:bg-gray-700 rounded-full h-2 w-20 mr-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: "92%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-text-primary">
                      92%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    Leadership
                  </span>
                  <div className="flex items-center">
                    <div className="surface-subtle dark:bg-gray-700 rounded-full h-2 w-20 mr-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{ width: "88%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-text-primary">
                      88%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="surface-card elevation-card rounded-lg p-6">
            <Typography
              variant="headline-sm"
              as="h3"
              className="mb-4 text-text-primary"
            >
              Quick Actions
            </Typography>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="primary"
                size="sm"
                className="p-4 flex flex-col items-center justify-center space-y-2"
                icon={<Icon name="book" size="sm" />}
                iconPosition="left"
              >
                View Playbook
              </Button>
              <Button
                variant="success"
                size="sm"
                className="p-4 flex flex-col items-center justify-center space-y-2"
                icon={<Icon name="calendar" size="sm" />}
                iconPosition="left"
              >
                Check Schedule
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="p-4 flex flex-col items-center justify-center space-y-2"
                icon={<Icon name="message" size="sm" />}
                iconPosition="left"
              >
                Team Chat
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-4 flex flex-col items-center justify-center space-y-2"
                icon={<Icon name="user" size="sm" />}
                iconPosition="left"
              >
                My Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PlayerDashboardPage: React.FC = () => {
  return (
    <RoleProtectedRoute allowedRoles={["player"]}>
      <PlayerDashboardContent />
    </RoleProtectedRoute>
  );
};

export default PlayerDashboardPage;
