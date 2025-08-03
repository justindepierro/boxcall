import React from "react";
import { Typography } from "../components/design-system";
import { Card } from "../components/ui";
import Icon from "../components/ui/Icon/Icon";

/**
 * Playbook - Team plays and strategy management
 * Available to all team members with role-based permissions
 *
 * Features:
 * - Play library and organization
 * - Video tutorials and breakdowns
 * - Interactive play diagrams
 * - Team-specific playbooks
 */
export const Playbook: React.FC = () => {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Typography
            variant="headline-xl"
            className="text-gray-900 dark:text-white"
          >
            Playbook
          </Typography>
          <Typography variant="body-lg" color="muted" className="mt-2">
            Your team's complete play library and strategy guide
          </Typography>
        </div>

        {/* Coming Soon Card */}
        <Card className="text-center py-12">
          <Icon name="book" size="3xl" className="text-navy-600 mb-4 mx-auto" />
          <Typography variant="headline-lg" className="mb-4">
            Digital Playbook
          </Typography>
          <Typography
            variant="body-lg"
            color="muted"
            className="mb-6 max-w-2xl mx-auto"
          >
            Access your team's complete play library with interactive diagrams,
            video breakdowns, and strategic insights. Study plays, learn
            formations, and master your team's game plan.
          </Typography>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 inline-block">
            <div className="flex items-center gap-2 justify-center">
              <Icon
                name="target"
                size="sm"
                className="text-green-700 dark:text-green-300"
              />
              <Typography
                variant="body-sm"
                className="text-green-700 dark:text-green-300"
              >
                Coming Soon - Interactive play diagrams and video analysis
              </Typography>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Playbook;
