import React from "react";

import { Button } from "../../ui";
import { Icon } from "../../ui/Icon/Icon";
/**
 * Player Quick Actions - Player-specific dashboard shortcuts
 *
 * Features:
 * - View personal stats and progress
 * - Study plays and formations
 * - Check assignments and schedules
 * - Connect with teammates
 */
export const PlayerQuickActions: React.FC = () => {
  return (
    <div className="space-y-tight">
      <Button
        variant="primary"
        size="sm"
        className="w-full justify-start"
        onClick={() => console.info("View Stats")}
      >
        <Icon name="bar-chart" size={14} className="mr-2" />
        View My Stats
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => console.info("Study Playbook")}
      >
        <Icon name="book" size={14} className="mr-2" />
        Study Playbook
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => console.info("Check Assignments")}
      >
        <Icon name="file" size={14} className="mr-2" />
        Check Assignments
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => console.info("Team Chat")}
      >
        <Icon name="message" size={14} className="mr-2" />
        Team Chat
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => console.info("Update Gear")}
      >
        <Icon name="shield" size={14} className="mr-2" />
        Update My Gear
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => console.info("Training Log")}
      >
        <Icon name="activity" size={14} className="mr-2" />
        Training Log
      </Button>
    </div>
  );
};
