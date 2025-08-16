import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { telemetry } from "../../lib/telemetry";
import {
  Capability,
  getCapabilitiesForRole,
  hasCapability,
} from "../../services/capabilities/capabilityMap";
import { Typography } from "../design-system/Typography";
import { Button } from "../ui";
import { Icon } from "../ui/Icon/Icon";

import type { IconName } from "../ui/Icon/Icon";

interface TeamQuickActionsProps {
  teamId: string;
  userRole: string;
}

interface QuickActionConfig {
  id: string;
  label: string;
  icon: IconName; // limited to known icon set
  variant?: "primary" | "outline" | "ghost";
  to?: string; // navigation target
  onClick?: () => void;
  requires: Capability | Capability[]; // capability gate
}

// Central action registry
const ACTIONS: QuickActionConfig[] = [
  {
    id: "create_post",
    label: "Send Announcement",
    icon: "message",
    variant: "primary",
    onClick: () => console.log("action.create_post"),
    requires: Capability.CREATE_POST,
  },
  {
    id: "award_stickers",
    label: "Award Helmet Stickers",
    icon: "award",
    variant: "outline", // constrained to allowed variants
    onClick: () => console.log("action.award_stickers"),
    requires: Capability.AWARD_STICKERS,
  },
  {
    id: "practice_schedule",
    label: "Practice Schedule",
    icon: "calendar", // better semantic icon
    variant: "outline",
    requires: Capability.VIEW_PRACTICE_SCHEDULE,
    to: "practice",
  },
  {
    id: "upload_film",
    label: "Upload Game Film",
    icon: "upload",
    variant: "outline",
    onClick: () => console.log("action.upload_film"),
    requires: Capability.UPLOAD_FILM,
  },
  {
    id: "manage_roster",
    label: "Manage Roster",
    icon: "users",
    variant: "outline",
    onClick: () => console.log("action.manage_roster"),
    requires: Capability.MANAGE_ROSTER,
  },
  {
    id: "team_settings",
    label: "Team Settings",
    icon: "settings",
    variant: "ghost",
    to: "settings",
    requires: Capability.MANAGE_TEAM_SETTINGS,
  },
  // Player / shared
  {
    id: "view_stats",
    label: "My Team Stats",
    icon: "bar-chart",
    variant: "primary",
    onClick: () => console.log("action.view_stats"),
    requires: Capability.VIEW_STATS,
  },
  {
    id: "study_plays",
    label: "Study Team Plays",
    icon: "book",
    variant: "outline",
    onClick: () => console.log("action.study_plays"),
    requires: Capability.STUDY_PLAYS,
  },
  {
    id: "rsvp_events",
    label: "RSVP to Events",
    icon: "calendar",
    variant: "outline",
    onClick: () => console.log("action.rsvp_events"),
    requires: Capability.RSVP_EVENT,
  },
  {
    id: "team_chat",
    label: "Team Chat",
    icon: "message",
    variant: "ghost",
    onClick: () => console.log("action.team_chat"),
    requires: Capability.TEAM_CHAT,
  },
  // Family
  {
    id: "player_progress",
    label: "Player Progress",
    icon: "trending-up",
    variant: "primary",
    onClick: () => console.log("action.player_progress"),
    requires: Capability.PLAYER_PROGRESS,
  },
  {
    id: "team_photos",
    label: "Team Photos",
    icon: "folder",
    variant: "ghost",
    onClick: () => console.log("action.team_photos"),
    requires: Capability.TEAM_PHOTOS,
  },
];

export const TeamQuickActions: React.FC<TeamQuickActionsProps> = ({
  teamId,
  userRole,
}) => {
  const navigate = useNavigate();

  const capabilities = useMemo(
    () => getCapabilitiesForRole(userRole),
    [userRole]
  );

  const visibleActions = useMemo(
    () =>
      ACTIONS.filter((a) => hasCapability(capabilities, a.requires)).map(
        (a) => ({ ...a })
      ),
    [capabilities]
  );

  if (visibleActions.length === 0) {
    return (
      <div className="text-center py-4">
        <Typography variant="body-sm" color="muted">
          No actions available for your role.
        </Typography>
      </div>
    );
  }

  const handleClick = (action: QuickActionConfig) => {
    telemetry.track("quick_action.click", {
      id: action.id,
      teamId,
      role: userRole,
    });
    if (action.to) {
      navigate(`/team/${teamId}/${action.to}`);
    } else if (action.onClick) {
      action.onClick();
    }
  };

  return (
    <div className="space-y-3">
      {visibleActions.map((a) => (
        <Button
          key={a.id}
          variant={a.variant || "outline"}
          size="sm"
          className="w-full justify-start"
          onClick={() => handleClick(a)}
        >
          <Icon name={a.icon} className="w-5 h-5 mr-2" />
          {a.label}
        </Button>
      ))}
    </div>
  );
};
