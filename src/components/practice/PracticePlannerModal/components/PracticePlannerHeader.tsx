import React from "react";

import { Button } from "../../../../components/ui";
import { Icon } from "../../../../components/ui/Icon/Icon";
import { Typography } from "../../../design-system/Typography";

import type { CalendarEvent } from "../../../../domain/calendar/types";

interface PracticePlannerHeaderProps {
  event: CalendarEvent;
  userRole: "head_coach" | "position_coach";
  onClose: () => void;
}

export const PracticePlannerHeader: React.FC<PracticePlannerHeaderProps> = ({
  event,
  userRole,
  onClose,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <Typography
          variant="headline-lg"
          className="text-navy-900 flex items-center"
        >
          <Icon name="file" size="lg" className="mr-2" color="navy" />
          Practice Planner
        </Typography>
        <Typography variant="body-md" color="muted" className="mt-1">
          {event.title} - {new Date(event.start).toLocaleDateString()}
        </Typography>
        <div className="mt-2 flex items-center space-x-4">
          <span
            className={`px-2 py-1 rounded text-xs font-medium flex items-center ${
              userRole === "head_coach"
                ? "bg-surface-info text-text-info"
                : "bg-surface-success text-text-success"
            }`}
          >
            {userRole === "head_coach" ? (
              <>
                <Icon name="crown" size="xs" className="mr-1" />
                Head Coach
              </>
            ) : (
              <>
                <Icon name="user" size="xs" className="mr-1" />
                Position Coach
              </>
            )}
          </span>
          <Typography variant="body-sm" color="muted">
            {userRole === "head_coach"
              ? "Create and organize practice blocks"
              : "Add drills to your assigned blocks"}
          </Typography>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-text-muted hover:text-text-primary"
        >
          <Icon name="close" size="lg" />
        </Button>
      </div>
    </div>
  );
};
