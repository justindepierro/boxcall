import React from "react";
import { Typography } from "../components/design-system";
import { Card } from "../components/ui";
import { Icon } from "../components/ui/Icon/Icon";

/**
 * Playground - Development and testing tools for administrators
 * Available to admins only
 * 
 * Features:
 * - Component testing and preview
 * - API testing tools
 * - Feature flags and experiments
 * - Development utilities
 */
export const Playground: React.FC = () => {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Typography variant="headline-xl" className="text-gray-900 dark:text-white">
            Playground
          </Typography>
          <Typography variant="body-lg" color="muted" className="mt-2">
            Development tools and testing environment for administrators
          </Typography>
        </div>

        {/* Access Restricted Notice */}
                {/* Access Restricted Card */}
        <Card className="text-center py-12">
          <div className="flex justify-center mb-4">
            <Icon name="lock" size="3xl" color="warning" />
          </div>
          <Typography variant="headline-lg" className="mb-4">
            Access Restricted
          </Typography>
          <Typography variant="body-lg" color="muted" className="mb-6 max-w-2xl mx-auto">
            The Playground is a restricted area for platform administrators and 
            developers. It contains development tools, testing utilities, and 
            experimental features.
          </Typography>
        </Card>

        {/* Development Tools Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Component Library */}
          <Card className="p-6">
            <div className="text-4xl mb-4">🧩</div>
            <Typography variant="headline-md" className="mb-3">
              Component Library
            </Typography>
            <Typography variant="body-md" color="muted" className="mb-4">
              Browse and test all UI components with live examples and 
              interactive properties.
            </Typography>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <Typography variant="body-sm" className="text-blue-700 dark:text-blue-300">
                Design System Preview
              </Typography>
            </div>
          </Card>

          {/* API Testing */}
          <Card className="p-6">
            <div className="text-4xl mb-4">🔌</div>
            <Typography variant="headline-md" className="mb-3">
              API Testing
            </Typography>
            <Typography variant="body-md" color="muted" className="mb-4">
              Test API endpoints, view responses, and debug integration 
              issues in a controlled environment.
            </Typography>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <Typography variant="body-sm" className="text-green-700 dark:text-green-300">
                API Debugging Tools
              </Typography>
            </div>
          </Card>

          {/* Feature Flags */}
          <Card className="p-6">
            <div className="text-4xl mb-4">🚩</div>
            <Typography variant="headline-md" className="mb-3">
              Feature Flags
            </Typography>
            <Typography variant="body-md" color="muted" className="mb-4">
              Manage feature rollouts, A/B tests, and experimental 
              functionality across the platform.
            </Typography>
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
              <Typography variant="body-sm" className="text-purple-700 dark:text-purple-300">
                Experiment Control
              </Typography>
            </div>
          </Card>

          {/* Performance Monitor */}
          <Card className="p-6">
            <div className="flex justify-center mb-4">
              <Icon name="bar-chart" size="3xl" color="jade" />
            </div>
            <Typography variant="headline-md" className="mb-3">
              Performance Monitor
            </Typography>
            <Typography variant="body-md" color="muted" className="mb-4">
              Real-time performance metrics, error tracking, and 
              system health monitoring.
            </Typography>
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
              <Typography variant="body-sm" className="text-orange-700 dark:text-orange-300">
                System Analytics
              </Typography>
            </div>
          </Card>

          {/* Database Tools */}
          <Card className="p-6">
            <div className="text-4xl mb-4">🗄️</div>
            <Typography variant="headline-md" className="mb-3">
              Database Tools
            </Typography>
            <Typography variant="body-md" color="muted" className="mb-4">
              Query builder, data inspection, and migration management 
              tools for database administration.
            </Typography>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <Typography variant="body-sm" className="text-red-700 dark:text-red-300">
                Admin Only Access
              </Typography>
            </div>
          </Card>

          {/* User Simulation */}
          <Card className="p-6">
            <div className="text-4xl mb-4">👤</div>
            <Typography variant="headline-md" className="mb-3">
              User Simulation
            </Typography>
            <Typography variant="body-md" color="muted" className="mb-4">
              Test features from different user perspectives and role 
              configurations without switching accounts.
            </Typography>
            <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-3">
              <Typography variant="body-sm" className="text-gray-700 dark:text-gray-300">
                Role Testing Suite
              </Typography>
            </div>
          </Card>
        </div>

        {/* Development Status */}
        <Card className="text-center py-8 mt-8">
          <Typography variant="headline-lg" className="mb-4">
            Development Environment
          </Typography>
          <Typography variant="body-lg" color="muted" className="mb-6 max-w-2xl mx-auto">
            This playground provides essential tools for platform development, 
            testing, and administration. Only authorized administrators have 
            access to these powerful development utilities.
          </Typography>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 inline-block">
            <Typography variant="body-sm" className="text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
              <Icon name="wrench" size="sm" />
              Administrator Development Tools
            </Typography>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Playground;
