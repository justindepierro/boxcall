import React from "react";
import { useNavigate } from "react-router-dom";
import { Typography } from "../design-system";
import { Button } from "../ui";

interface TeamQuickActionsProps {
  teamId: string;
  userRole: string;
}

/**
 * Team Quick Actions - Role-based team management shortcuts
 *
 * Features:
 * - Role-specific action buttons
 * - Team management shortcuts
 * - Quick access to team features
 * - Context-aware functionality
 */
export const TeamQuickActions: React.FC<TeamQuickActionsProps> = ({
  teamId,
  userRole,
}) => {
  const navigate = useNavigate();

  const isCoach = userRole === "coach" || userRole === "head_coach";
  const isPlayer = userRole === "player";
  const isFamily = userRole === "family";

  if (isCoach) {
    return (
      <div className="space-y-3">
        <Button
          variant="primary"
          size="sm"
          className="w-full justify-start"
          onClick={() => console.log("Send Announcement")}
        >
          <span className="mr-2">📢</span>
          Send Announcement
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => console.log("Award Stickers")}
        >
          <span className="mr-2">⭐</span>
          Award Helmet Stickers
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => navigate(`/team/${teamId}/practice`)}
        >
          <span className="mr-2">🏈</span>
          Practice Schedule
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => console.log("Upload Film")}
        >
          <span className="mr-2">🎬</span>
          Upload Game Film
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => console.log("Manage Roster")}
        >
          <span className="mr-2">👥</span>
          Manage Roster
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => console.log("Team Settings")}
        >
          <span className="mr-2">⚙️</span>
          Team Settings
        </Button>
      </div>
    );
  }

  if (isPlayer) {
    return (
      <div className="space-y-3">
        <Button
          variant="primary"
          size="sm"
          className="w-full justify-start"
          onClick={() => console.log("View Stats")}
        >
          <span className="mr-2">📊</span>
          My Team Stats
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => console.log("Study Plays")}
        >
          <span className="mr-2">📋</span>
          Study Team Plays
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => console.log("RSVP Events")}
        >
          <span className="mr-2">✅</span>
          RSVP to Events
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => console.log("Team Chat")}
        >
          <span className="mr-2">💬</span>
          Team Chat
        </Button>
      </div>
    );
  }

  if (isFamily) {
    return (
      <div className="space-y-3">
        <Button
          variant="primary"
          size="sm"
          className="w-full justify-start"
          onClick={() => console.log("Player Progress")}
        >
          <span className="mr-2">📈</span>
          Player Progress
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => console.log("RSVP Events")}
        >
          <span className="mr-2">✅</span>
          RSVP to Events
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => console.log("Message Coach")}
        >
          <span className="mr-2">💬</span>
          Message Coach
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => console.log("Team Photos")}
        >
          <span className="mr-2">📸</span>
          Team Photos
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-4">
      <Typography variant="body-sm" color="muted">
        No actions available for your role.
      </Typography>
    </div>
  );
};
