import React from "react";
import { useParams } from "react-router-dom";
import { useAuthProfile } from "../app/auth-store";

/**
 * TeamManagementPage Component
 * 
 * Team-specific management page.
 * Only accessible to team members with appropriate roles.
 */
export const TeamManagementPage: React.FC = () => {
  const { teamId } = useParams();
  const profile = useAuthProfile();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-blue-500 border border-blue-600 rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🏀 Team Management
          </h1>
          <p className="text-blue-100">
            Team ID: {teamId || "Not specified"}
          </p>
        </div>

        {/* User Context */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Access</h2>
          <div className="space-y-2">
            <p><strong>Email:</strong> {profile?.email}</p>
            <p><strong>Team Role:</strong> <span className="text-blue-600">Team Member</span></p>
            <p><strong>Access Level:</strong> Team Management</p>
          </div>
        </div>

        {/* Management Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Team Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-3 text-blue-600">
              📋 Team Overview
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Team information</li>
              <li>• Member list</li>
              <li>• Recent activity</li>
              <li>• Team statistics</li>
            </ul>
            <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
              View Team Details
            </button>
          </div>

          {/* Player Management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-3 text-green-600">
              👤 Player Management
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Add/remove players</li>
              <li>• Update player info</li>
              <li>• Assign positions</li>
              <li>• Player statistics</li>
            </ul>
            <button className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
              Manage Players
            </button>
          </div>

          {/* Schedule Management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-3 text-purple-600">
              📅 Schedule Management
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Create games</li>
              <li>• Update schedule</li>
              <li>• Manage practices</li>
              <li>• Event calendar</li>
            </ul>
            <button className="mt-4 w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700">
              Manage Schedule
            </button>
          </div>

          {/* Stats & Analytics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-3 text-yellow-600">
              📊 Stats & Analytics
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Game statistics</li>
              <li>• Player performance</li>
              <li>• Team trends</li>
              <li>• Reports</li>
            </ul>
            <button className="mt-4 w-full bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700">
              View Analytics
            </button>
          </div>

          {/* Communication */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-3 text-indigo-600">
              💬 Communication
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Team messages</li>
              <li>• Announcements</li>
              <li>• Parent notifications</li>
              <li>• Player updates</li>
            </ul>
            <button className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700">
              Send Messages
            </button>
          </div>

          {/* Team Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-3 text-red-600">
              ⚙️ Team Settings
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Team preferences</li>
              <li>• Role permissions</li>
              <li>• Subscription status</li>
              <li>• Account settings</li>
            </ul>
            <button className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700">
              Team Settings
            </button>
          </div>
        </div>

        {/* Role-Based Actions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
            Role-Based Access
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">👑</div>
              <h4 className="font-semibold">Head Coach</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Full team management access
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">📋</div>
              <h4 className="font-semibold">Coach</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Player and game management
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">👨‍👩‍👧‍👦</div>
              <h4 className="font-semibold">Family</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View-only access to player info
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
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
