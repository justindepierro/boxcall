import React from "react";
import { Icon } from "../../components/ui/Icon/Icon";
import { RoleProtectedRoute } from "../../routes/RoleProtectedRoute";

/**
 * Player Dashboard Page - Only accessible by players
 */
const PlayerDashboardContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Icon name="user" className="mr-3" />
            Player Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track your progress and stay updated with team activities
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3">
                <Icon
                  name="target"
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Practices Attended
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  23/25
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900 rounded-full p-3">
                <Icon
                  name="trophy"
                  className="text-green-600 dark:text-green-400"
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Games Played
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  8
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-3">
                <Icon
                  name="star"
                  className="text-purple-600 dark:text-purple-400"
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Skill Rating
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  8.5
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 dark:bg-orange-900 rounded-full p-3">
                <Icon
                  name="trending-up"
                  className="text-orange-600 dark:text-orange-400"
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Improvement
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  +2.1
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Events */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <Icon name="calendar" className="mr-2" />
                Upcoming Events
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2">
                    <Icon name="calendar" size="sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Practice Session
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Thursday, 3:30 PM - 5:30 PM
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Focus: Offensive Line Drills
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 dark:bg-green-900 rounded-full p-2">
                    <Icon name="flag" size="sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Game vs. Eagles
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Saturday, 7:00 PM
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Away Game - Memorial Stadium
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-2">
                    <Icon name="users" size="sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Team Meeting
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Monday, 4:00 PM - 5:00 PM
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Film Review & Strategy
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <Icon name="bar-chart" className="mr-2" />
                Recent Performance
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Passing Accuracy
                  </span>
                  <div className="flex items-center">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-20 mr-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      85%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Speed & Agility
                  </span>
                  <div className="flex items-center">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-20 mr-2">
                      <div
                        className="bg-jade-600 h-2 rounded-full"
                        style={{ width: "78%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      78%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Team Coordination
                  </span>
                  <div className="flex items-center">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-20 mr-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: "92%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      92%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Leadership
                  </span>
                  <div className="flex items-center">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-20 mr-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{ width: "88%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="bg-jade-600 hover:bg-jade-700 text-white p-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2">
                <Icon name="book" size="sm" />
                <span>View Playbook</span>
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2">
                <Icon name="calendar" size="sm" />
                <span>Check Schedule</span>
              </button>
              <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2">
                <Icon name="message" size="sm" />
                <span>Team Chat</span>
              </button>
              <button className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2">
                <Icon name="user" size="sm" />
                <span>My Profile</span>
              </button>
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
