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
        <Typography variant="label-md" as="h4" className="text-primary font-semibold">
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

      {/* 🎯 IMPROVED: Larger, more prominent action buttons with labels */}
      <div className="grid grid-cols-3 gap-2">
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
          className="bg-info/10 hover:bg-info/20 text-info border-info/30 transition-all hover:shadow-md hover:scale-105 active:scale-95"
        >
          <div className="flex flex-col items-center gap-1 py-1">
            <div className="flex items-center gap-1">
              <Icon name="calendar" className="h-4 w-4" />
              {status.practiceCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 bg-info text-white rounded-full text-xs font-bold">
                  {status.practiceCount}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">Practice</span>
          </div>
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
          className="bg-success/10 hover:bg-success/20 text-success border-success/30 transition-all hover:shadow-md hover:scale-105 active:scale-95"
        >
          <div className="flex flex-col items-center gap-1 py-1">
            <div className="flex items-center gap-1">
              <Icon name="gamepad-2" className="h-4 w-4" />
              {status.gamePlanCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 bg-success text-white rounded-full text-xs font-bold">
                  {status.gamePlanCount}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">Game Plan</span>
          </div>
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
          className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 transition-all hover:shadow-md hover:scale-105 active:scale-95"
        >
          <div className="flex flex-col items-center gap-1 py-1">
            <div className="flex items-center gap-1">
              <Icon name="users" className="h-4 w-4" />
              {status.hasAssignments && (
                <Icon
                  name="check-circle"
                  className="h-3.5 w-3.5 text-success-600"
                />
              )}
            </div>
            <span className="text-xs font-medium">Assign</span>
          </div>
        </Button>
      </div>

      {/* Secondary action - Post to Bulletin (if handler provided) */}
      {onPostToTeamBulletin && (
        <div className="mt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPostToTeamBulletin(play)}
            title="Share this play on the team bulletin"
            className="w-full bg-jade-50 hover:bg-jade-100 text-jade-700 border-jade-200 transition-all"
          >
            <Icon name="message-circle" className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Share to Team</span>
          </Button>
        </div>
      )}
    </div>
  );
};
