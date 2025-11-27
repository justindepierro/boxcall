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
    <div className="flex items-center justify-between pt-spacing-sm mt-spacing-sm divider-t">
      <Typography variant="label-md" as="h4" className="text-primary">
        QUICK ACTIONS
      </Typography>
      <div className="flex items-center gap-spacing-xs">
        {/* Photo indicator */}
        {play.diagram_image_url && (
          <div className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs font-medium flex items-center gap-1">
            <Icon name="image" size={14} />
            Photo
          </div>
        )}

        {/* Practice Button with Count */}
        <Button
          variant="secondary"
          size="xs"
          onClick={() => onAddToPracticeScript?.(play)}
          title={
            status.practiceCount > 0
              ? `Used in ${status.practiceCount} practice script${status.practiceCount > 1 ? "s" : ""}`
              : "Add this play to a practice script"
          }
          className="surface-subtle hover:bg-surface-info text-info border-surface-primary"
        >
          {status.practiceCount > 0 && (
            <span className="inline-flex items-center justify-center font-bold mr-1 text-info">
              {status.practiceCount}
            </span>
          )}
          <Icon name="calendar" className="h-3 w-3 mr-spacing-xs" /> Practice
        </Button>

        {/* Game Plan Button with Count */}
        <Button
          variant="secondary"
          size="xs"
          onClick={() => onAddToGamePlan?.(play)}
          title={
            status.gamePlanCount > 0
              ? `Used in ${status.gamePlanCount} game plan${status.gamePlanCount > 1 ? "s" : ""}`
              : "Add this play to a game plan"
          }
          className="surface-subtle hover:bg-surface-success text-success border-surface-primary"
        >
          {status.gamePlanCount > 0 && (
            <span className="inline-flex items-center justify-center font-bold mr-1 text-success">
              {status.gamePlanCount}
            </span>
          )}
          <Icon name="gamepad-2" className="h-3 w-3 mr-spacing-xs" /> Game Plan
        </Button>
        {/* Assignments Button with Check */}
        <Button
          variant="secondary"
          size="xs"
          onClick={() => onOpenAssignments?.(play)}
          title={
            status.hasAssignments
              ? "Assignments created - Click to view/edit"
              : "Manage player assignments for this play"
          }
          className="surface-subtle hover:bg-surface-info text-blue-500 border-surface-primary"
        >
          {status.hasAssignments && (
            <Icon
              name="check"
              className="h-3 w-3 mr-1 text-info-500 dark:text-info-400"
            />
          )}
          <Icon name="users" className="h-3 w-3 mr-spacing-xs" /> Assignments
        </Button>

        {/* Post to Team Bulletin */}
        <Button
          variant="secondary"
          size="xs"
          onClick={() => onPostToTeamBulletin?.(play)}
          title="Share this play on the team bulletin"
          className="surface-subtle hover:bg-brand-primary/10 text-brand-primary border-surface-primary"
        >
          <Icon name="message" className="h-3 w-3 mr-spacing-xs" /> Post
        </Button>
      </div>
    </div>
  );
};
