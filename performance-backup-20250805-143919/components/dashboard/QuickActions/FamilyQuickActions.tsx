import React from "react";
import { Button } from "../../ui";
import { Icon } from "../../ui/Icon/Icon";
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
        onClick={() => console.log("Player Progress")}
      >
        <Icon name="trending-up" size={14} className="mr-2" />
        My Player&apos;s Progress
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start"
        onClick={() => console.log("Team Schedule")}
      >
        <Icon name="calendar" size={14} className="mr-2" />
        Team Schedule
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start"
        onClick={() => console.log("Message Coach")}
      >
        <Icon name="message" size={14} className="mr-2" />
        Message Coach
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start"
        onClick={() => console.log("Game Highlights")}
      >
        <Icon name="play" size={14} className="mr-2" />
        Game Highlights
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => console.log("RSVP Events")}
      >
        <Icon name="check" size={14} className="mr-2" />
        RSVP to Events
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => console.log("Team Photos")}
      >
        <Icon name="eye" size={14} className="mr-2" />
        Team Photos
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => console.log("Parent Network")}
      >
        <Icon name="users" size={14} className="mr-2" />
        Parent Network
      </Button>
    </div>
  );
};
