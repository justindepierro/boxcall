import React from "react";

import { Icon } from "../../../../../components/ui/Icon/Icon";
import { Typography } from "../../../../design-system/Typography";

import type {
  TimelineAllocation,
  SelectedBlock,
  PracticeBlock,
} from "../../types";

interface TimelineContainerProps {
  scheduledDuration: number;
  timelineAllocation: TimelineAllocation;
  selectedBlock: SelectedBlock | null;
  getCategoryColor: (category: PracticeBlock["category"]) => string;
  onTimelineClick: (minute: number) => void;
  onMouseDown: (minute: number) => void;
  onMouseEnter: (minute: number) => void;
  onMouseUp: () => void;
}

export const TimelineContainer: React.FC<TimelineContainerProps> = ({
  scheduledDuration,
  timelineAllocation,
  selectedBlock,
  getCategoryColor,
  onTimelineClick,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <Typography variant="body-md" className="font-medium">
          Practice Timeline ({scheduledDuration} minutes):
        </Typography>
        <Typography
          variant="body-sm"
          color="muted"
          className="flex items-center"
        >
          <Icon name="info" size="xs" className="mr-1" />
          Click and drag to allocate time blocks
        </Typography>
      </div>

      <div
        className="flex border border-secondary rounded-lg overflow-hidden relative cursor-crosshair"
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {Array.from({ length: scheduledDuration }, (_, minute) => {
          const allocation = timelineAllocation[minute];
          const is5MinuteBoundary = minute % 5 === 0;
          const isSelected =
            selectedBlock &&
            minute >= selectedBlock.start &&
            minute < selectedBlock.start + selectedBlock.duration;

          return (
            <div
              key={minute}
              onClick={() => onTimelineClick(minute)}
              onMouseDown={() => onMouseDown(minute)}
              onMouseEnter={() => onMouseEnter(minute)}
              className={`flex-1 h-12 relative border-r border-muted transition-all ${
                allocation
                  ? getCategoryColor(allocation.category)
                      .replace("text-", "border-t-4 border-t-")
                      .split(" ")[0] +
                    " " +
                    getCategoryColor(allocation.category)
                  : isSelected
                    ? "bg-info/20 border-t-4 border-t-text-info"
                    : "bg-subtle hover:bg-muted"
              } ${is5MinuteBoundary ? "border-l-2 border-l-gray-400" : ""}`}
              style={{ minWidth: "3px" }}
              title={`Minute ${minute}${
                allocation
                  ? ` - ${allocation.category} (click to resize)`
                  : " (click to add block)"
              }`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onTimelineClick(minute);
                }
              }}
            >
              {minute % 5 === 0 && minute > 0 && (
                <div className="absolute -top-4 left-0 text-xs text-secondary font-medium">
                  {minute}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
