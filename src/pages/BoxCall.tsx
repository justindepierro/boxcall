import React from "react";
import { Typography } from "../components/design-system";
import { Card } from "../components/ui";

/**
 * BoxCall - Game management and communication platform
 * Available to coaches only
 * 
 * Features:
 * - Live game communication
 * - Play calling interface
 * - Real-time team coordination
 * - Game strategy tools
 */
export const BoxCall: React.FC = () => {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Typography variant="headline-xl" className="text-gray-900 dark:text-white">
            BoxCall
          </Typography>
          <Typography variant="body-lg" color="muted" className="mt-2">
            Game management and live communication platform
          </Typography>
        </div>

        {/* Coming Soon Card */}
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">📱</div>
          <Typography variant="headline-lg" className="mb-4">
            BoxCall Platform
          </Typography>
          <Typography variant="body-lg" color="muted" className="mb-6 max-w-2xl mx-auto">
            The ultimate game management platform for coaches. Coordinate plays, 
            communicate with your team, and manage game strategy in real-time.
          </Typography>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 inline-block">
            <Typography variant="body-sm" className="text-blue-700 dark:text-blue-300">
              🚀 Coming Soon - Advanced coaching tools for game day
            </Typography>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BoxCall;
