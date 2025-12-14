import React from "react";
import type { DraggableProvided, DraggableStateSnapshot } from "@hello-pangea/dnd";
import { Typography } from "../../../components/design-system/Typography";
import { Button } from "../../../components/ui/Button/Button";
import Icon from "../../../components/ui/Icon/Icon";
import type { PracticeBlock } from "../../../types/practice";

interface PracticeBlockItemProps {
  block: PracticeBlock;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  lockedSchedule: boolean;
  practiceStarted: boolean;
  formatTime: (seconds: number) => string;
  getTimeRemaining: (endTime: Date | string) => number;
  onDelete: () => void;
}

export const PracticeBlockItem: React.FC<PracticeBlockItemProps> = ({
  block,
  provided,
  snapshot,
  lockedSchedule,
  practiceStarted,
  formatTime,
  getTimeRemaining,
  onDelete,
}) => {
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={`bg-primary border-muted rounded-lg p-4 shadow-sm transition-shadow ${
        snapshot.isDragging ? "shadow-lg" : "hover:shadow-md"
      } ${lockedSchedule ? "opacity-75" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            {...provided.dragHandleProps}
            className={`cursor-grab active:cursor-grabbing p-1 rounded-lg ${
              lockedSchedule ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            ⋮⋮
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <Typography
                variant="body-lg"
                className="font-semibold text-primary"
              >
                {block.title}
              </Typography>
              {block.isLocked && (
                <Icon name="lock" size="sm" className="text-warning" />
              )}
              <span className="px-2 py-1 bg-subtle text-secondary rounded-lg text-sm font-mono">
                {block.duration}min
              </span>
              {practiceStarted && (
                <span className="px-2 py-1 bg-jade-100 text-jade-800 rounded-lg text-sm font-mono">
                  {formatTime(getTimeRemaining(block.endTime))} left
                </span>
              )}
            </div>
            {block.description && (
              <Typography variant="body-sm" className="text-secondary mt-1">
                {block.description}
              </Typography>
            )}
            {block.practiceScriptId && (
              <div className="mt-2">
                <Button
                  variant="brandLink"
                  size="sm"
                  className="p-0 h-auto flex items-center"
                >
                  <Icon name="file" size="sm" className="mr-1" />
                  Practice Script Attached
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Open edit modal - TODO
            }}
            disabled={lockedSchedule}
          >
            <Icon name="edit" size="sm" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={lockedSchedule}
            className="text-error hover:text-error hover:bg-subtle"
          >
            <Icon name="delete" size="sm" />
          </Button>
        </div>
      </div>
    </div>
  );
};

PracticeBlockItem.displayName = "PracticeBlockItem";
