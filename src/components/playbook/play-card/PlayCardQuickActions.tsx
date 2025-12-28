import React from "react";
import Icon from "../../ui/Icon/Icon";
import { Button } from "../../ui/Button/Button";
import type { Play as PlayType } from "../../../types/play";
import { useBatchedPlayStatus } from "../../../hooks/useBatchedPlayStatus";

interface PlayCardQuickActionsProps {
  play: PlayType;
  onAddToPracticeScript?: (play: PlayType) => void;
  onAddToGamePlan?: (play: PlayType) => void;
  onOpenAssignments?: (play: PlayType) => void;
  onPostToTeamBulletin?: (play: PlayType) => void;
}

export const PlayCardQuickActions: React.FC<PlayCardQuickActionsProps> = ({
  play,
  onAddToPracticeScript,
  onAddToGamePlan,
  onOpenAssignments,
  onPostToTeamBulletin,
}) => {
  // Fetch play status indicators (batched for performance)
  const status = useBatchedPlayStatus(play.id, play.playbook_id);

  return (
    <div className="pt-3 mt-3 border-t border-neutral-100 dark:border-navy-700">
      {/* 🎯 COMPACT: Horizontal layout with icon + label + count */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Practice Button with Count */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onAddToPracticeScript?.(play)}
          title={
            status.practiceCount > 0
              ? `Used in ${status.practiceCount} practice script${status.practiceCount > 1 ? "s" : ""}`
              : "Add this play to a practice script"
          }
          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 transition-all hover:shadow-sm h-8"
        >
          <Icon name="calendar" className="h-3.5 w-3.5 mr-1.5" />
          <span className="text-xs font-medium">Practice</span>
          {status.practiceCount > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center min-w-4 h-4 px-1 bg-blue-600 text-white rounded-full text-xs font-bold">
              {status.practiceCount}
            </span>
          )}
        </Button>

        {/* Game Plan Button with Count */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onAddToGamePlan?.(play)}
          title={
            status.gamePlanCount > 0
              ? `Used in ${status.gamePlanCount} game plan${status.gamePlanCount > 1 ? "s" : ""}`
              : "Add this play to a game plan"
          }
          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800 transition-all hover:shadow-sm h-8"
        >
          <Icon name="gamepad-2" className="h-3.5 w-3.5 mr-1.5" />
          <span className="text-xs font-medium">Game Plan</span>
          {status.gamePlanCount > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center min-w-4 h-4 px-1 bg-emerald-600 text-white rounded-full text-xs font-bold">
              {status.gamePlanCount}
            </span>
          )}
        </Button>

        {/* Assignments Button with Check */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onOpenAssignments?.(play)}
          title={
            status.hasAssignments
              ? "Assignments created - Click to view/edit"
              : "Manage player assignments for this play"
          }
          className="bg-violet-50 hover:bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800 transition-all hover:shadow-sm h-8"
        >
          <Icon name="users" className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Assign</span>
          {status.hasAssignments && (
            <Icon
              name="check-circle"
              className="h-3.5 w-3.5 text-success-600"
            />
          )}
        </Button>

        {/* Share to Team Button (if handler provided) */}
        {onPostToTeamBulletin && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPostToTeamBulletin(play)}
            title="Share this play on the team bulletin"
            className="bg-jade-50 hover:bg-jade-100 text-jade-700 border-jade-200 transition-all hover:shadow-sm"
          >
            <Icon name="message-circle" className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Share</span>
          </Button>
        )}
      </div>
    </div>
  );
};
