/**
 * PracticePlansStates Components
 *
 * Loading and empty state components for Practice Plans page
 */

import React from "react";
import { Icon } from "../../components/ui/Icon";
import { Button } from "../../components/ui/Button/Button";
import { Typography } from "../../components/design-system/Typography";

interface LoadingStateProps {}

export const LoadingState: React.FC<LoadingStateProps> = () => {
  return (
    <div className="space-y-4 py-10" aria-busy="true">
      <div className="h-32 rounded-xl bg-secondary animate-pulse" />
      <div className="h-32 rounded-xl bg-secondary animate-pulse" />
      <div className="h-32 rounded-xl bg-secondary animate-pulse" />
    </div>
  );
};

LoadingState.displayName = "LoadingState";

interface EmptyStateProps {
  onCreateScript: () => void;
  onNavigateToPlaybook: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onCreateScript,
  onNavigateToPlaybook,
}) => {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
        <Icon name="file" className="h-12 w-12 text-muted" />
      </div>
      <Typography variant="headline-md" className="mb-2 text-primary">
        No Practice Scripts Yet
      </Typography>
      <Typography
        variant="body-lg"
        className="mx-auto mb-8 max-w-md text-secondary"
      >
        Create your first practice script to organize plays for your team's
        training sessions.
      </Typography>
      <div className="flex flex-col gap-4 justify-center sm:flex-row">
        <Button onClick={onCreateScript} variant="primary" size="lg">
          <Icon name="plus" className="mr-2 h-5 w-5" />
          Create New Script
        </Button>
        <Button onClick={onNavigateToPlaybook} variant="secondary" size="lg">
          <Icon name="book" className="mr-2 h-5 w-5" />
          Browse Playbook
        </Button>
      </div>
    </div>
  );
};

EmptyState.displayName = "EmptyState";
