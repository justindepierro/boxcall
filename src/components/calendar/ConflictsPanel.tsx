import React from "react";

import { Card } from "../ui";
import Icon from "../ui/Icon/Icon";
import { Typography } from "../design-system/Typography";

import type { ConflictInfo } from "./hooks/useConflictDetection";

interface ConflictsPanelProps {
  conflicts: ConflictInfo[];
  className?: string;
}

export const ConflictsPanel: React.FC<ConflictsPanelProps> = ({
  conflicts,
  className,
}) => {
  if (!conflicts.length) return null;

  return (
    <Card className={`calendar-card ${className || ""}`.trim()}>
      <div className="flex items-center gap-spacing-xs mb-spacing-md">
        <Icon name="alert-triangle" size="lg" className="text-text-error" />
        <Typography variant="label-lg" className="text-text-primary">
          Scheduling Conflicts ({conflicts.length})
        </Typography>
      </div>

      <div className="space-y-spacing-sm">
        {conflicts.map((conflict) => (
          <ConflictCard key={conflict.eventId} conflict={conflict} />
        ))}
      </div>
    </Card>
  );
};

interface ConflictCardProps {
  conflict: ConflictInfo;
}

const ConflictCard: React.FC<ConflictCardProps> = ({ conflict }) => {
  const getSeverityIcon = () => {
    return "alert-triangle" as const;
  };

  const getSeverityColor = (severity: string) => {
    return severity === "error"
      ? "text-text-error border-text-error bg-surface-error"
      : "text-text-warning border-text-warning bg-surface-warning";
  };

  return (
    <div
      className={`border rounded-lg p-spacing-sm ${getSeverityColor(conflict.severity)}`}
    >
      <div className="flex items-start gap-spacing-xs mb-spacing-xs">
        <Icon name={getSeverityIcon()} size="sm" />
        <div className="flex-1">
          <Typography
            variant="body-sm"
            className="font-medium text-text-primary mb-1"
          >
            {conflict.message}
          </Typography>
          <Typography variant="caption" color="muted">
            {conflict.conflictingEvents.length} overlapping event
            {conflict.conflictingEvents.length !== 1 ? "s" : ""}
          </Typography>
        </div>
      </div>

      <div className="space-y-1">
        {conflict.conflictingEvents.slice(0, 3).map((event, index) => (
          <div
            key={index}
            className="bg-surface-primary/50 rounded-lg px-spacing-xs py-1"
          >
            <Typography variant="caption" as="span" className="font-medium">
              {event.title}
            </Typography>
            <Typography
              variant="caption"
              color="muted"
              as="span"
              className="ml-1"
            >
              ({event.type})
            </Typography>
          </div>
        ))}
        {conflict.conflictingEvents.length > 3 && (
          <Typography variant="caption" color="muted" className="italic">
            +{conflict.conflictingEvents.length - 3} more conflicts
          </Typography>
        )}
      </div>
    </div>
  );
};
