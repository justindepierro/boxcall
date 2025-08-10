/**
 * TimeSummary Component
 *
 * Displays practice duration summary with:
 * - Total time scheduled vs. allocated
 * - Progress bar visualization
 * - Category breakdown with color coding
 * - Duration formatting (hours:minutes)
 *
 * @component
 * @example
 * <TimeSummary
 *   scheduledDuration={120}
 *   totalDuration={90}
 *   practiceBlocks={blocks}
 *   event={event}
 * />
 */
import React from "react";
import { Typography } from "../../design-system";
import { getCategoryColor, formatDuration } from "../utils";
import type { TimeSummaryProps, PracticeBlock } from "../types";
import Icon from "../../ui/Icon/Icon";
export const TimeSummary: React.FC<TimeSummaryProps> = ({
  scheduledDuration,
  totalDuration,
  practiceBlocks,
  event,
}) => {
  // Calculate category breakdown
  const categoryTotals = practiceBlocks.reduce(
    (acc, block) => {
      const category = block.category;
      acc[category] = (acc[category] || 0) + block.duration;
      return acc;
    },
    {} as Record<string, number>
  );
  const progressPercentage =
    scheduledDuration > 0
      ? Math.min((totalDuration / scheduledDuration) * 100, 100)
      : 0;
  const isOverScheduled = totalDuration > scheduledDuration;
  const remainingTime = scheduledDuration - totalDuration;
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="clock" size="lg" className="text-navy-700" />
        <Typography variant="headline-sm" className="text-navy-900">
          Practice Duration Summary
        </Typography>
      </div>
      {/* Time Overview */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <Typography variant="body-sm" color="muted">
            Scheduled Duration
          </Typography>
          <Typography variant="headline-sm" className="text-navy-900">
            {formatDuration(scheduledDuration)}
          </Typography>
        </div>
        <div className="text-center">
          <Typography variant="body-sm" color="muted">
            Total Allocated
          </Typography>
          <Typography
            variant="headline-sm"
            className={isOverScheduled ? "text-red-600" : "text-green-600"}
          >
            {formatDuration(totalDuration)}
          </Typography>
        </div>
        <div className="text-center">
          <Typography variant="body-sm" color="muted">
            {remainingTime >= 0 ? "Remaining" : "Over by"}
          </Typography>
          <Typography
            variant="headline-sm"
            className={remainingTime >= 0 ? "text-blue-600" : "text-red-600"}
          >
            {formatDuration(Math.abs(remainingTime))}
          </Typography>
        </div>
      </div>
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <Typography variant="body-sm" color="muted">
            Time Allocation Progress
          </Typography>
          <Typography variant="body-sm" color="muted">
            {Math.round(progressPercentage)}%
          </Typography>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${
              isOverScheduled
                ? "bg-red-500"
                : progressPercentage === 100
                  ? "bg-green-500"
                  : "bg-jade-600"
            }`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>
      {/* Category Breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <div>
          <Typography variant="body-sm" color="muted" className="mb-2">
            Category Breakdown
          </Typography>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryTotals).map(([category, duration]) => (
              <div
                key={category}
                className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                  category as PracticeBlock["category"]
                )}`}
              >
                {category.replace("-", " ").toUpperCase()}:{" "}
                {formatDuration(duration)}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Event Details */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <Typography variant="body-sm" color="muted">
          📅 {event.title} • {new Date(event.start).toLocaleDateString()} •
          {new Date(event.start).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {event.end
            ? ` - ${new Date(event.end).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : ""}
        </Typography>
      </div>
    </div>
  );
};
