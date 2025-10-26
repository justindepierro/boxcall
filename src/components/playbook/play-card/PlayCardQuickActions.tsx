import React from "react";
import { Typography } from "../../design-system/Typography";
import Icon from "../../ui/Icon/Icon";
import { Button } from "../../ui/Button/Button";
import type { Play as PlayType } from "../../../types/play";
import {
  getDiagramButtonIcon,
  getDiagramButtonText,
} from "../../../utils/diagramHelpers";
import { usePlayStatus } from "../../../hooks/usePlayStatus";

interface PlayCardQuickActionsProps {
  play: PlayType;
  onCreateDiagram?: (play: PlayType) => void;
  onAddToPracticeScript?: (play: PlayType) => void;
  onAddToGamePlan?: (play: PlayType) => void;
  onOpenAssignments?: (play: PlayType) => void;
  onPostToTeamBulletin?: (play: PlayType) => void;
}

export const PlayCardQuickActions: React.FC<PlayCardQuickActionsProps> = ({
  play,
  onCreateDiagram,
  onAddToPracticeScript,
  onAddToGamePlan,
  onOpenAssignments,
  onPostToTeamBulletin,
}) => {
  // Fetch play status indicators
  const status = usePlayStatus(play.id, play.playbook_id);

  return (
    <div className="flex items-center justify-between pt-spacing-sm mt-spacing-sm divider-t">
      <Typography variant="label-md" as="h4" className="text-text-primary">
        QUICK ACTIONS
      </Typography>
      <div className="flex items-center gap-spacing-xs">
        {/* Diagram Button with Check */}
        <Button
          variant={play.diagram_url ? "primary" : "secondary"}
          size="xs"
          onClick={() => onCreateDiagram?.(play)}
          title={getDiagramButtonText(Boolean(play.diagram_data))}
          className={
            play.diagram_url
              ? ""
              : "surface-subtle hover:bg-surface-warning text-text-warning border-surface-primary"
          }
        >
          {play.diagram_url && (
            <Icon
              name="check"
              className="h-3 w-3 mr-1 text-success-500 dark:text-success-400"
            />
          )}
          <Icon
            name={getDiagramButtonIcon(Boolean(play.diagram_data))}
            className="h-3 w-3 mr-spacing-xs"
          />{" "}
          {getDiagramButtonText(Boolean(play.diagram_data))}
        </Button>

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
          className="surface-subtle hover:bg-surface-info text-text-info border-surface-primary"
        >
          {status.practiceCount > 0 && (
            <span className="inline-flex items-center justify-center font-bold mr-1 text-text-info">
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
          className="surface-subtle hover:bg-surface-success text-text-success border-surface-primary"
        >
          {status.gamePlanCount > 0 && (
            <span className="inline-flex items-center justify-center font-bold mr-1 text-text-success">
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
