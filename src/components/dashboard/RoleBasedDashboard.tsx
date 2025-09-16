import React from "react";

import {
  useAuthProfile,
  useIsCoach,
  useIsPlayer,
  useIsFamily,
  useIsAdmin,
} from "../../app/auth-store";
import { Typography } from "../design-system/Typography";
import { Button } from "../ui/Button/Button";
import { Icon } from "../ui/Icon/Icon";
import { Tag } from "../ui/Tag";

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
          <p className="text-text-secondary">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen surface-app">
      {/* Welcome Header */}
      <div className="surface-header shadow-sm border-b">
        <div className="max-w-7xl mx-auto bc-container-padding">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="headline-md" as="h1" className="">
                  Welcome back, {profile.full_name || "User"}!
                </Typography>
                <Typography variant="body-sm" color="muted" className="mt-1">
                  {isCoach && "Manage your team and create winning game plans"}
                  {isPlayer &&
                    "Track your progress and stay updated with team activities"}
                  {isFamily && "Follow your player's journey and team updates"}
                  {isAdmin && "Oversee system operations and manage all teams"}
                </Typography>
              </div>
              <div className="flex items-center space-x-2">
                <Tag variant="success" size="sm" className="capitalize">
                  {profile.role}
                </Tag>
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
              <Typography
                variant="headline-sm"
                as="h2"
                className="mb-6 flex items-center"
              >
                <Icon name="users" className="mr-3" /> Coach Dashboard
              </Typography>
              <CoachDashboard />
            </div>
          )}

          {isPlayer && (
            <div>
              <Typography
                variant="headline-sm"
                as="h2"
                className="mb-6 flex items-center"
              >
                <Icon name="user" className="mr-3" /> Player Dashboard
              </Typography>
              <PlayerDashboard />
            </div>
          )}

          {isFamily && (
            <div>
              <Typography
                variant="headline-sm"
                as="h2"
                className="mb-6 flex items-center"
              >
                <Icon name="home" className="mr-3" /> Family Dashboard
              </Typography>
              <FamilyDashboard />
            </div>
          )}

          {isAdmin && (
            <div>
              <Typography
                variant="headline-sm"
                as="h2"
                className="mb-6 flex items-center"
              >
                <Icon name="settings" className="mr-3" /> Admin Dashboard
              </Typography>
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
      <div className="surface-card rounded-lg shadow bc-card-padding">
        <Typography
          variant="headline-sm"
          as="h3"
          className="text-text-primary dark:text-text-inverse mb-4 flex items-center"
        >
          <Icon name="database" className="mr-2" />
          System Overview
        </Typography>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-text-secondary">Active Teams</span>
            <span className="font-medium text-text-primary dark:text-text-inverse">
              12
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Total Users</span>
            <span className="font-medium text-text-primary dark:text-text-inverse">
              247
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">System Health</span>
            <span className="text-green-600 font-medium">Excellent</span>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="surface-card rounded-lg shadow bc-card-padding">
        <Typography
          variant="headline-sm"
          as="h3"
          className="text-text-primary dark:text-text-inverse mb-4 flex items-center"
        >
          <Icon name="users" className="mr-2" />
          User Management
        </Typography>
        <div className="space-y-3">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            Manage User Accounts
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            Role Permissions
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            System Analytics
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="surface-card rounded-lg shadow bc-card-padding">
        <Typography
          variant="headline-sm"
          as="h3"
          className="text-text-primary dark:text-text-inverse mb-4 flex items-center"
        >
          <Icon name="zap" className="mr-2" />
          Quick Actions
        </Typography>
        <div className="space-y-3">
          <Button variant="primary" size="sm" className="w-full">
            Run System Backup
          </Button>
          <Button variant="primary" size="sm" className="w-full">
            Generate Reports
          </Button>
          <Button variant="warning" size="sm" className="w-full">
            Maintenance Mode
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleBasedDashboard;
