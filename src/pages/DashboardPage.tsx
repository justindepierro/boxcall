import React from "react";
import { useAuthProfile, useAuthUser } from "../app/auth-store";
import { Typography } from "../components/design-system";
import { Card } from "../components/ui";

/**
 * Dashboard Page
 * 
 * Main dashboard for authenticated users.
 * Shows different content based on user role.
 */
export const DashboardPage: React.FC = () => {
  const user = useAuthUser();
  const profile = useAuthProfile();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Typography variant="headline-xl" className="mb-2">
            🏈 Welcome to BoxCall
          </Typography>
          <Typography variant="body-lg" color="muted">
            Your football team management dashboard
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <Card variant="elevated" className="p-6">
            <Typography variant="headline-md" className="mb-4">
              👤 Your Profile
            </Typography>
            <div className="space-y-2">
              <div>
                <strong>Email:</strong> {user?.email}
              </div>
              {profile && (
                <>
                  <div>
                    <strong>Name:</strong> {profile.display_name || profile.full_name}
                  </div>
                  <div>
                    <strong>Role:</strong> 
                    <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                      {profile.role}
                    </span>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Quick Actions Card */}
          <Card variant="elevated" className="p-6">
            <Typography variant="headline-md" className="mb-4">
              ⚡ Quick Actions
            </Typography>
            <div className="space-y-3">
              <button className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                View Team Roster
              </button>
              <button className="w-full p-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                Create New Play
              </button>
              <button className="w-full p-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                Schedule Practice
              </button>
            </div>
          </Card>

          {/* Recent Activity Card */}
          <Card variant="elevated" className="p-6">
            <Typography variant="headline-md" className="mb-4">
              📊 Recent Activity
            </Typography>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Last login</span>
                <span className="text-gray-500 dark:text-gray-400">Today</span>
              </div>
              <div className="flex justify-between">
                <span>Profile created</span>
                <span className="text-gray-500 dark:text-gray-400">Recent</span>
              </div>
              <div className="flex justify-between">
                <span>Role assigned</span>
                <span className="text-gray-500 dark:text-gray-400">{profile?.role}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Role-specific content */}
        {profile?.role === "coach" && (
          <div className="mt-8">
            <Card variant="outlined" className="p-6">
              <Typography variant="headline-md" className="mb-4">
                🏃‍♂️ Coach Dashboard
              </Typography>
              <Typography variant="body-md">
                Welcome, Coach! Here you can manage your team, create playbooks, and track player progress.
              </Typography>
            </Card>
          </div>
        )}

        {profile?.role === "player" && (
          <div className="mt-8">
            <Card variant="outlined" className="p-6">
              <Typography variant="headline-md" className="mb-4">
                ⭐ Player Dashboard
              </Typography>
              <Typography variant="body-md">
                Welcome, Player! View your stats, study plays, and stay connected with your team.
              </Typography>
            </Card>
          </div>
        )}

        {profile?.role === "admin" && (
          <div className="mt-8">
            <Card variant="outlined" className="p-6 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
              <Typography variant="headline-md" className="mb-4">
                ⚙️ Admin Dashboard
              </Typography>
              <Typography variant="body-md">
                Welcome, Admin! You have full access to manage users, teams, and system settings.
              </Typography>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
