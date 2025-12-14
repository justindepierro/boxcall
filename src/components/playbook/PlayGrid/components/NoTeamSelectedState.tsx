/**
 * NoTeamSelectedState Component
 * Renders when no team is selected
 */

import React from "react";
import { Icon } from "../../../ui/Icon/Icon";
import { Typography } from "../../../design-system/Typography";

export const NoTeamSelectedState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-2xl bg-surface-muted flex items-center justify-center mb-6">
        <Icon name="users" className="w-10 h-10 text-secondary" />
      </div>
      <Typography
        variant="headline-md"
        className="text-primary mb-2 text-center"
      >
        No Team Selected
      </Typography>
      <Typography
        variant="body"
        className="text-secondary mb-6 text-center max-w-md"
      >
        Select a team from the team switcher in the sidebar to view your
        playbook.
      </Typography>
    </div>
  );
};
