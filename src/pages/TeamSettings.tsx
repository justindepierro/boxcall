import React from "react";
import { Typography } from "../components/design-system";
import { Card } from "../components/ui";

/**
 * TeamSettings - Team configuration and management
 * Available to coaches and managers only
 * 
 * Features:
 * - Team profile and information
 * - Member management and roles
 * - Team preferences and settings
 * - Integration configurations
 */
export const TeamSettings: React.FC = () => {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Typography variant="headline-xl" className="text-gray-900 dark:text-white">
            Team Settings
          </Typography>
          <Typography variant="body-lg" color="muted" className="mt-2">
            Configure your team's profile, members, and preferences
          </Typography>
        </div>

        {/* Coming Soon Card */}
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">⚙️</div>
          <Typography variant="headline-lg" className="mb-4">
            Team Configuration
          </Typography>
          <Typography variant="body-lg" color="muted" className="mb-6 max-w-2xl mx-auto">
            Comprehensive team management tools for coaches and administrators. 
            Configure team settings, manage member roles, and customize your 
            team's BoxCall experience.
          </Typography>
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 inline-block">
            <Typography variant="body-sm" className="text-purple-700 dark:text-purple-300">
              🔧 Coming Soon - Advanced team management and configuration tools
            </Typography>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TeamSettings;
