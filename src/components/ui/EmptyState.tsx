import React from "react";
import { Button } from "./Button/Button";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";
import { Typography } from "../design-system/Typography";

/**
 * EmptyState Component System
 *
 * Professional empty states with illustrations, contextual messaging,
 * and clear call-to-actions for better user experience.
 */

export interface EmptyStateProps {
  /** Icon to display (from Lucide React) */
  icon?: IconName;
  /** Main heading text */
  title: string;
  /** Descriptive text */
  description: string;
  /** Primary action button */
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: IconName;
  };
  /** Secondary action button */
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: IconName;
  };
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Custom className */
  className?: string;
}

const sizeStyles = {
  sm: {
    container: "py-8",
    icon: "w-12 h-12",
    title: "headline-sm",
    description: "body-sm",
    button: "sm",
  },
  md: {
    container: "py-12",
    icon: "w-16 h-16",
    title: "headline-md",
    description: "body-md",
    button: "md",
  },
  lg: {
    container: "py-16",
    icon: "w-20 h-20",
    title: "headline-lg",
    description: "body-lg",
    button: "lg",
  },
} as const;

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "inbox",
  title,
  description,
  primaryAction,
  secondaryAction,
  size = "md",
  className = "",
}) => {
  const styles = sizeStyles[size];

  return (
    <div className={`text-center ${styles.container} ${className}`}>
      {/* Icon */}
      <div className="mx-auto w-fit mb-6">
        <div
          className={`bg-secondary rounded-full flex items-center justify-center ${styles.icon}`}
        >
          <Icon name={icon} className={`${styles.icon} text-muted`} />
        </div>
      </div>

      {/* Content */}
      <Typography variant={styles.title as any} className="text-primary mb-2">
        {title}
      </Typography>
      <Typography
        variant={styles.description as any}
        className="text-secondary mb-8 content-narrow"
      >
        {description}
      </Typography>

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              variant="primary"
              size={styles.button as any}
            >
              {primaryAction.icon && (
                <Icon name={primaryAction.icon} className="h-5 w-5 mr-2" />
              )}
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="secondary"
              size={styles.button as any}
            >
              {secondaryAction.icon && (
                <Icon name={secondaryAction.icon} className="h-5 w-5 mr-2" />
              )}
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Pre-configured EmptyState variants for common use cases
 */

export const EmptyPlaybookState: React.FC<{
  onCreatePlay?: () => void;
  onBrowseTemplates?: () => void;
}> = ({ onCreatePlay, onBrowseTemplates }) => (
  <EmptyState
    icon="book"
    title="No Plays Yet"
    description="Start building your playbook by creating your first play. Add formations, assignments, and strategies to organize your team's offensive and defensive schemes."
    primaryAction={
      onCreatePlay
        ? {
            label: "Create First Play",
            onClick: onCreatePlay,
            icon: "plus",
          }
        : undefined
    }
    secondaryAction={
      onBrowseTemplates
        ? {
            label: "Browse Templates",
            onClick: onBrowseTemplates,
            icon: "search",
          }
        : undefined
    }
    size="lg"
  />
);

export const EmptyGamePlansState: React.FC<{
  onCreatePlan?: () => void;
  onBrowsePlaybook?: () => void;
}> = ({ onCreatePlan, onBrowsePlaybook }) => (
  <EmptyState
    icon="target"
    title="No Game Plans Yet"
    description="Create your first game plan to strategize plays and formations for upcoming matches. Organize your team's strategy for victory."
    primaryAction={
      onCreatePlan
        ? {
            label: "Create New Plan",
            onClick: onCreatePlan,
            icon: "plus",
          }
        : undefined
    }
    secondaryAction={
      onBrowsePlaybook
        ? {
            label: "Browse Playbook",
            onClick: onBrowsePlaybook,
            icon: "book",
          }
        : undefined
    }
    size="lg"
  />
);

export const EmptyRosterState: React.FC<{
  onAddPlayer?: () => void;
  onImportRoster?: () => void;
}> = ({ onAddPlayer, onImportRoster }) => (
  <EmptyState
    icon="users"
    title="No Players Yet"
    description="Build your team roster by adding players and their positions. Track performance, manage assignments, and organize your squad."
    primaryAction={
      onAddPlayer
        ? {
            label: "Add First Player",
            onClick: onAddPlayer,
            icon: "user-plus",
          }
        : undefined
    }
    secondaryAction={
      onImportRoster
        ? {
            label: "Import Roster",
            onClick: onImportRoster,
            icon: "upload",
          }
        : undefined
    }
    size="lg"
  />
);

export const EmptyCalendarState: React.FC<{
  onCreateEvent?: () => void;
  onViewSchedule?: () => void;
}> = ({ onCreateEvent, onViewSchedule }) => (
  <EmptyState
    icon="calendar"
    title="No Events Scheduled"
    description="Plan practices, games, and team meetings. Keep your team organized and on schedule with comprehensive calendar management."
    primaryAction={
      onCreateEvent
        ? {
            label: "Schedule Event",
            onClick: onCreateEvent,
            icon: "plus",
          }
        : undefined
    }
    secondaryAction={
      onViewSchedule
        ? {
            label: "View Schedule",
            onClick: onViewSchedule,
            icon: "eye",
          }
        : undefined
    }
    size="lg"
  />
);

export default EmptyState;
