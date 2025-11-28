import React from "react";
import { Typography } from "../../design-system/Typography";
import Icon from "../../ui/Icon/Icon";
import { Button } from "../../ui/Button/Button";
import type { Play as PlayType } from "../../../types/play";
import { usePlayStatus } from "../../../hooks/usePlayStatus";

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
  // Fetch play status indicators
  const status = usePlayStatus(play.id, play.playbook_id);

  return (
    <div className="pt-4 mt-4 divider-t">
      {/* Header with diagram indicator */}
      <div className="flex items-center justify-between mb-3">
        <Typography
          variant="label-md"
          as="h4"
          className="text-primary font-semibold"
        >
          QUICK ACTIONS
        </Typography>
        {/* Photo indicator */}
        {play.diagram_image_url && (
          <div className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-indigo-200">
            <Icon name="image" size={14} />
            <span>Diagram</span>
          </div>
        )}
      </div>

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
          className="bg-info/10 hover:bg-info/20 text-info border-info/30 transition-all hover:shadow-sm"
        >
          <Icon name="calendar" className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Practice</span>
          {status.practiceCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 bg-info text-white rounded-full text-2xs font-bold">
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
          className="bg-success/10 hover:bg-success/20 text-success border-success/30 transition-all hover:shadow-sm"
        >
          <Icon name="gamepad-2" className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Game Plan</span>
          {status.gamePlanCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 bg-success text-white rounded-full text-2xs font-bold">
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
          className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 transition-all hover:shadow-sm"
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
