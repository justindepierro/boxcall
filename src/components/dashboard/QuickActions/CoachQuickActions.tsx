import React from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../ui";
import { Icon } from "../../ui/Icon/Icon";
import { getActiveTeamId } from "../../../utils/activeTeam";
import { debug } from "../../../utils/logger";
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
    const teamId = getActiveTeamId();
    if (teamId) {
      navigate(`/team/${teamId}/settings?tab=roster`);
      return;
    }
    navigate("/create-team");
  };

  const handleCreatePlay = () => {
    navigate("/playbook");
  };

  const handlePracticePlans = () => {
    navigate("/practice-plans");
  };

  const handlePlaybook = () => {
    navigate("/playbook");
  };

  const handleAnalytics = () => {
    navigate("/analytics");
  };

  const handleAnnouncement = () => {
    const teamId = getActiveTeamId();
    if (teamId) {
      navigate(`/team/${teamId}/bulletin`);
      return;
    }
    navigate("/create-team");
  };

  return (
    <div className="space-y-tight">
      <Button
        variant="primary"
        size="sm"
        className="w-full justify-start"
        onClick={handleCreatePlay}
      >
        <Icon name="target" size={14} className="mr-2" />
        Create New Play
      </Button>
      <Button
        variant="primary"
        size="sm"
        className="w-full justify-start"
        onClick={handlePracticePlans}
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
        onClick={handlePlaybook}
      >
        <Icon name="book" size={14} className="mr-2" />
        Playbook Editor
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={handleAnalytics}
      >
        <Icon name="bar-chart" size={14} className="mr-2" />
        Team Analytics
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={handleAnnouncement}
      >
        <Icon name="info" size={14} className="mr-2" />
        Send Announcement
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => debug("[CoachQuickActions] Award Helmet Stickers")}
      >
        <Icon name="star" size={14} className="mr-2" />
        Award Helmet Stickers
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => debug("[CoachQuickActions] Upload Game Film")}
      >
        <Icon name="play" size={14} className="mr-2" />
        Upload Game Film
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => debug("[CoachQuickActions] Player Progress")}
      >
        <Icon name="trending-up" size={14} className="mr-2" />
        Player Progress
      </Button>
    </div>
  );
};
