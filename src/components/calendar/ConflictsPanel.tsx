import React from "react";

import { Card } from "../ui";
import Icon from "../ui/Icon/Icon";

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
      <div className="flex items-center gap-2 mb-4">
        <Icon name="alert-triangle" size="lg" className="text-red-600" />
        <span className="Typography typography-label-lg text-text-primary">
          Scheduling Conflicts ({conflicts.length})
        </span>
      </div>

      <div className="space-y-3">
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
      ? "text-red-600 border-red-200 bg-red-50"
      : "text-amber-600 border-amber-200 bg-amber-50";
  };

  return (
    <div
      className={`border rounded-lg p-3 ${getSeverityColor(conflict.severity)}`}
    >
      <div className="flex items-start gap-2 mb-2">
        <Icon name={getSeverityIcon()} size="sm" />
        <div className="flex-1">
          <div className="text-sm font-medium text-text-primary mb-1">
            {conflict.message}
          </div>
          <div className="text-xs text-text-muted">
            {conflict.conflictingEvents.length} overlapping event
            {conflict.conflictingEvents.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        {conflict.conflictingEvents.slice(0, 3).map((event, index) => (
          <div key={index} className="text-xs bg-white/50 rounded px-2 py-1">
            <span className="font-medium">{event.title}</span>
            <span className="text-text-muted ml-1">({event.type})</span>
          </div>
        ))}
        {conflict.conflictingEvents.length > 3 && (
          <div className="text-xs text-text-muted italic">
            +{conflict.conflictingEvents.length - 3} more conflicts
          </div>
        )}
      </div>
    </div>
  );
};
