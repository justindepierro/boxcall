import React from "react";
import { Typography } from "../components/design-system";
import { Card } from "../components/ui";

/**
 * Admin Page
 * 
 * Admin-only dashboard for system management.
 * Protected by RoleProtectedRoute.
 */
export const AdminPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Typography variant="headline-xl" className="mb-2">
            ⚙️ Admin Dashboard
          </Typography>
          <Typography variant="body-lg" color="muted">
            System administration and user management
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="elevated" className="p-6">
            <Typography variant="headline-md" className="mb-4">
              👥 User Management
            </Typography>
            <Typography variant="body-md" className="mb-4">
              Manage user accounts, roles, and permissions.
            </Typography>
            <button className="w-full p-3 bg-jade-500 text-white rounded-sm hover:bg-jade-600 transition-colors font-sans font-semibold">
              View Users
            </button>
          </Card>

          <Card variant="elevated" className="p-6">
            <Typography variant="headline-md" className="mb-4">
              🏈 Team Management
            </Typography>
            <Typography variant="body-md" className="mb-4">
              Oversee all teams and organizational structure.
            </Typography>
            <button className="w-full p-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              View Teams
            </button>
          </Card>

          <Card variant="elevated" className="p-6">
            <Typography variant="headline-md" className="mb-4">
              📊 System Analytics
            </Typography>
            <Typography variant="body-md" className="mb-4">
              Platform usage statistics and performance metrics.
            </Typography>
            <button className="w-full p-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
              View Analytics
            </button>
          </Card>
        </div>

        <div className="mt-8">
          <Card variant="outlined" className="p-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
            <Typography variant="headline-md" className="mb-4">
              🚨 Admin Notice
            </Typography>
            <Typography variant="body-md">
              This page is only accessible to users with admin privileges. All actions are logged for security.
            </Typography>
          </Card>
        </div>
      </div>
    </div>
  );
};
