import React from "react";
import { Typography } from "../../components/design-system/Typography";
// ...existing code...
import { Icon } from "../../components/ui/Icon/Icon";

const PlayerDashboardContent: React.FC = () => {
  return (
    <div className="min-h-screen surface-app">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Typography
            variant="headline-lg"
            as="h1"
            className="flex items-center"
          >
            <Icon name="user" className="mr-3" /> Player Dashboard
          </Typography>
          <Typography variant="body-md" color="muted" className="mt-2">
            Track your progress and stay updated with team activities
          </Typography>
        </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* ...existing code for stats... */}
        </div>
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ...existing code for events and performance... */}
        </div>
        {/* Quick Actions */}
        <div className="mt-8">
          {/* ...existing code for quick actions... */}
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboardContent;
