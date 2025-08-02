import React from "react";
import { useAuthProfile } from "../app/auth-store";

/**
 * SuperAdminPage Component
 * 
 * Developer tools and system administration page.
 * Only accessible to users in the super_admins table.
 */
export const SuperAdminPage: React.FC = () => {
  const profile = useAuthProfile();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-red-500 border border-red-600 rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🔧 Super Admin Panel
          </h1>
          <p className="text-red-100">
            Developer tools and system administration - Handle with care!
          </p>
        </div>

        {/* User Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Current User</h2>
          <div className="space-y-2">
            <p><strong>Email:</strong> {profile?.email}</p>
            <p><strong>User ID:</strong> {profile?.id}</p>
            <p><strong>Access Level:</strong> Super Administrator</p>
          </div>
        </div>

        {/* Admin Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Database Management */}
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-6">
            <h3 className="text-lg font-display font-semibold mb-3 text-jade-600">
              🗄️ Database Management
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 font-sans">
              <li>• View all tables</li>
              <li>• Execute raw queries</li>
              <li>• Database migrations</li>
              <li>• Backup/restore</li>
            </ul>
            <button className="mt-4 w-full bg-jade-500 text-white py-2 px-4 rounded-sm hover:bg-jade-600 font-sans font-semibold">
              Open Database Console
            </button>
          </div>

          {/* User Management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-3 text-green-600">
              👥 User Management
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• View all users</li>
              <li>• Suspend accounts</li>
              <li>• Reset passwords</li>
              <li>• Manage permissions</li>
            </ul>
            <button className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
              User Admin Panel
            </button>
          </div>

          {/* Team Management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-3 text-purple-600">
              🏀 Team Management
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• View all teams</li>
              <li>• Manage subscriptions</li>
              <li>• Override limits</li>
              <li>• Team analytics</li>
            </ul>
            <button className="mt-4 w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700">
              Team Admin Panel
            </button>
          </div>

          {/* System Monitoring */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-3 text-yellow-600">
              📊 System Monitoring
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Server performance</li>
              <li>• Error logs</li>
              <li>• Usage analytics</li>
              <li>• Health checks</li>
            </ul>
            <button className="mt-4 w-full bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700">
              Monitoring Dashboard
            </button>
          </div>

          {/* Feature Flags */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-3 text-indigo-600">
              🚩 Feature Flags
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Toggle features</li>
              <li>• A/B testing</li>
              <li>• Rollout control</li>
              <li>• Emergency switches</li>
            </ul>
            <button className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700">
              Feature Management
            </button>
          </div>

          {/* System Configuration */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-3 text-red-600">
              ⚙️ System Configuration
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Environment variables</li>
              <li>• API limits</li>
              <li>• Security settings</li>
              <li>• Integration configs</li>
            </ul>
            <button className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700">
              System Settings
            </button>
          </div>
        </div>

        {/* Warning Notice */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mt-8">
          <div className="flex items-start">
            <div className="text-yellow-600 dark:text-yellow-400 text-xl mr-3">
              ⚠️
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Super Admin Access Warning
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300">
                You have developer-level access to BoxCall. Actions performed here can affect all users and teams.
                Always follow proper procedures and document any system changes.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => window.history.back()}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
          >
            Go Back
          </button>
          <button
            onClick={() => window.location.href = "/dashboard"}
            className="bg-jade-500 text-white px-6 py-2 rounded-sm hover:bg-jade-600 font-sans font-semibold"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
