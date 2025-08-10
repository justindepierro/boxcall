import React from "react";
import {
  useAuthProfile,
  useIsCoach,
  useIsPlayer,
  useIsFamily,
  useIsAdmin,
} from "../../app/auth-store";
import { Icon } from "../ui/Icon/Icon";

// Import the existing dashboard components
const CoachDashboard = React.lazy(() =>
  import("./QuickActions/CoachQuickActions").then((m) => ({
    default: m.CoachQuickActions,
  }))
);
const PlayerDashboard = React.lazy(() =>
  import("./QuickActions/PlayerQuickActions").then((m) => ({
    default: m.PlayerQuickActions,
  }))
);
const FamilyDashboard = React.lazy(() =>
  import("./QuickActions/FamilyQuickActions").then((m) => ({
    default: m.FamilyQuickActions,
  }))
);

interface RoleBasedContentProps {
  children?: React.ReactNode;
}

/**
 * RoleBasedDashboard - Smart dashboard that shows content based on user role
 */
export const RoleBasedDashboard: React.FC<RoleBasedContentProps> = () => {
  const profile = useAuthProfile();
  const isCoach = useIsCoach();
  const isPlayer = useIsPlayer();
  const isFamily = useIsFamily();
  const isAdmin = useIsAdmin();

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jade-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Welcome Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto bc-container-padding">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {profile.full_name || "User"}!
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {isCoach && "Manage your team and create winning game plans"}
                  {isPlayer &&
                    "Track your progress and stay updated with team activities"}
                  {isFamily && "Follow your player's journey and team updates"}
                  {isAdmin && "Oversee system operations and manage all teams"}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-jade-100 dark:bg-jade-900 text-jade-800 dark:text-jade-200 px-3 py-1 rounded-full text-sm font-medium capitalize">
                  {profile.role}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role-Specific Content */}
      <div className="max-w-7xl mx-auto bc-container-padding py-8">
        <React.Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jade-600"></div>
            </div>
          }
        >
          {isCoach && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Icon name="users" className="mr-3" />
                Coach Dashboard
              </h2>
              <CoachDashboard />
            </div>
          )}

          {isPlayer && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Icon name="user" className="mr-3" />
                Player Dashboard
              </h2>
              <PlayerDashboard />
            </div>
          )}

          {isFamily && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Icon name="home" className="mr-3" />
                Family Dashboard
              </h2>
              <FamilyDashboard />
            </div>
          )}

          {isAdmin && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Icon name="settings" className="mr-3" />
                Admin Dashboard
              </h2>
              <AdminDashboard />
            </div>
          )}
        </React.Suspense>
      </div>
    </div>
  );
};

/**
 * Admin Dashboard Component - Full system control
 */
const AdminDashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 bc-grid-gap">
      {/* System Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow bc-card-padding">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <Icon name="database" className="mr-2" />
          System Overview
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Active Teams
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              12
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Total Users
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              247
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              System Health
            </span>
            <span className="text-green-600 font-medium">Excellent</span>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow bc-card-padding">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <Icon name="users" className="mr-2" />
          User Management
        </h3>
        <div className="space-y-3">
          <button className="w-full text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 p-3 rounded-md text-sm transition-colors">
            Manage User Accounts
          </button>
          <button className="w-full text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 p-3 rounded-md text-sm transition-colors">
            Role Permissions
          </button>
          <button className="w-full text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 p-3 rounded-md text-sm transition-colors">
            System Analytics
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow bc-card-padding">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <Icon name="zap" className="mr-2" />
          Quick Actions
        </h3>
        <div className="space-y-3">
          <button className="w-full bg-jade-600 hover:bg-jade-700 text-white p-3 rounded-md text-sm font-medium transition-colors">
            Run System Backup
          </button>
          <button className="w-full bg-jade-600 hover:bg-jade-700 text-white p-3 rounded-md text-sm font-medium transition-colors">
            Generate Reports
          </button>
          <button className="w-full bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-md text-sm font-medium transition-colors">
            Maintenance Mode
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleBasedDashboard;
