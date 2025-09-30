import React from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../ui";
import { Icon } from "../../ui/Icon/Icon";
/**
 * Coach Quick Actions - Coach-specific dashboard shortcuts
 *
 * Features:
 * - Quick access to playbook editor
 * - Practice script creation
 * - Team management tools
 * - Analytics and performance tracking
 */
export const CoachQuickActions: React.FC = () => {
  const navigate = useNavigate();

  const handleManageRoster = () => {
    navigate("/team/settings?tab=roster");
  };

  return (
    <div className="space-y-tight">
      <Button
        variant="primary"
        size="sm"
        className="w-full justify-start"
        onClick={() => console.info("Create Play")}
      >
        <Icon name="target" size={14} className="mr-2" />
        Create New Play
      </Button>
      <Button
        variant="primary"
        size="sm"
        className="w-full justify-start"
        onClick={() => console.info("Practice Script")}
      >
        <Icon name="file" size={14} className="mr-2" />
        Build Practice Script
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className="w-full justify-start"
        onClick={handleManageRoster}
      >
        <Icon name="users" size={14} className="mr-2" />
        Manage Roster
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => console.info("Playbook Editor")}
      >
        <Icon name="book" size={14} className="mr-2" />
        Playbook Editor
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => console.info("Team Analytics")}
      >
        <Icon name="bar-chart" size={14} className="mr-2" />
        Team Analytics
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => console.info("Send Announcement")}
      >
        <Icon name="info" size={14} className="mr-2" />
        Send Announcement
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => console.info("Award Stickers")}
      >
        <Icon name="star" size={14} className="mr-2" />
        Award Helmet Stickers
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => console.info("Game Film")}
      >
        <Icon name="play" size={14} className="mr-2" />
        Upload Game Film
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => console.info("Player Progress")}
      >
        <Icon name="trending-up" size={14} className="mr-2" />
        Player Progress
      </Button>
    </div>
  );
};
