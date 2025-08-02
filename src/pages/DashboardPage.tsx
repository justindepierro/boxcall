import React from "react";
import { useAuthProfile, useAuthUser } from "../app/auth-store";
import { Typography } from "../components/design-system";
import { Card } from "../components/ui";
import { StatsDashboard } from "../components/football/StatsDashboard";
import { FormationDiagram } from "../components/football/FormationDiagram";

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
                    <span className="ml-2 px-2 py-1 bg-jade-100 dark:bg-jade-900 text-jade-800 dark:text-jade-200 rounded-sm text-sm font-sans font-medium">
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
              <button className="w-full p-3 bg-jade-500 text-white rounded-sm hover:bg-jade-600 transition-colors font-sans font-semibold">
                🏈 View Team Roster
              </button>
              <button className="w-full p-3 bg-navy-500 text-white rounded-sm hover:bg-navy-600 transition-colors font-sans font-semibold">
                📋 Create Formation
              </button>
              <button className="w-full p-3 bg-gray-600 text-white rounded-sm hover:bg-gray-700 transition-colors font-sans font-semibold">
                📊 View Statistics
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
          <div className="mt-8 space-y-8">
            <Card variant="outlined" className="p-6">
              <Typography variant="headline-md" className="mb-4">
                🏃‍♂️ Coach Dashboard
              </Typography>
              <Typography variant="body-md" className="mb-6">
                Welcome, Coach! Here you can manage your team, create playbooks, and track player progress.
              </Typography>
              
              {/* Football Components Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Typography variant="headline-sm" className="font-display">
                    📊 Team Statistics
                  </Typography>
                  <div className="h-64 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                    <StatsDashboard />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Typography variant="headline-sm" className="font-display">
                    📋 Formation Diagrams
                  </Typography>
                  <div className="h-64 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                    <FormationDiagram />
                  </div>
                </div>
              </div>
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
