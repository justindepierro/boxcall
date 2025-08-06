/**
 * RSVP Header Component
 *
 * Header section with title, deadline info, and analytics toggle
 */

import { Button } from "../../ui";
import { Icon } from "../../ui/Icon";
import type { RSVPHeaderProps } from "./types";

export function RSVPHeader({
  isRequired,
  deadline,
  canViewAnalytics,
  showAnalytics,
  onToggleAnalytics,
}: RSVPHeaderProps) {
  const isDeadlinePassed = deadline && new Date(deadline) < new Date();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Event RSVP {isRequired && <span className="text-red-500">*</span>}
        </h3>
        {deadline && (
          <p
            className={`text-sm ${isDeadlinePassed ? "text-red-600" : "text-gray-600"}`}
          >
            {isDeadlinePassed ? "Deadline passed:" : "Deadline:"}{" "}
            {new Date(deadline).toLocaleDateString()} at{" "}
            {new Date(deadline).toLocaleTimeString()}
          </p>
        )}
      </div>
      {canViewAnalytics && (
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleAnalytics}
          className="flex items-center gap-2"
        >
          <Icon name="bar-chart" size="sm" />
          {showAnalytics ? "Hide Analytics" : "View Analytics"}
        </Button>
      )}
    </div>
  );
}
