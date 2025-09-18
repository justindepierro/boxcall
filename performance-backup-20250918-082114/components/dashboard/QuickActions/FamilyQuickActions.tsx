import React from "react";

import { Button } from "../../ui";
import { Icon } from "../../ui/Icon";
/**
 * Family Quick Actions - Family member-specific dashboard shortcuts
 *
 * Features:
 * - View player progress and stats
 * - Check schedules and events
 * - Communicate with coaches
 * - Access family-specific resources
 */
export const FamilyQuickActions: React.FC = () => {
  return (
    <div className="space-y-tight">
      <Button
        variant="primary"
        size="sm"
        className="w-full justify-start"
        onClick={() => console.info("Player Progress")}
      >
        <Icon name="trending-up" size={14} className="mr-2" />
        My Player&apos;s Progress
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => console.info("Team Schedule")}
      >
        <Icon name="calendar" size={14} className="mr-2" />
        Team Schedule
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => console.info("Message Coach")}
      >
        <Icon name="message" size={14} className="mr-2" />
        Message Coach
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => console.info("Game Highlights")}
      >
        <Icon name="play" size={14} className="mr-2" />
        Game Highlights
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => console.info("RSVP Events")}
      >
        <Icon name="check" size={14} className="mr-2" />
        RSVP to Events
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => console.info("Team Photos")}
      >
        <Icon name="eye" size={14} className="mr-2" />
        Team Photos
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => console.info("Parent Network")}
      >
        <Icon name="users" size={14} className="mr-2" />
        Parent Network
      </Button>
    </div>
  );
};
