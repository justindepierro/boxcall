import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button/Button";
import { Icon } from "../../../components/ui/Icon";
import { Typography } from "../../../components/design-system/Typography";

interface GamePlansEmptyStateProps {
  onCreatePlan: () => void;
}

export const GamePlansEmptyState: React.FC<GamePlansEmptyStateProps> = ({
  onCreatePlan,
}) => {
  const navigate = useNavigate();

  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
        <Icon name="target" className="h-12 w-12 text-muted" />
      </div>
      <Typography variant="headline-md" className="mb-2 text-primary">
        No Game Plans Yet
      </Typography>
      <Typography
        variant="body-lg"
        className="mx-auto mb-8 max-w-md text-secondary"
      >
        Create your first game plan to strategize plays and formations for
        upcoming matches.
      </Typography>
      <div className="flex flex-col gap-4 justify-center sm:flex-row">
        <Button onClick={onCreatePlan} variant="primary" size="lg">
          <Icon name="plus" className="mr-2 h-5 w-5" />
          Create New Plan
        </Button>
        <Button
          onClick={() => navigate("/playbook")}
          variant="secondary"
          size="lg"
        >
          <Icon name="book" className="mr-2 h-5 w-5" />
          Browse Playbook
        </Button>
      </div>
    </div>
  );
};

export const GamePlansLoadingState: React.FC = () => (
  <div className="space-y-4 py-10" aria-busy="true">
    <div className="h-32 rounded-xl bg-secondary animate-pulse" />
    <div className="h-32 rounded-xl bg-secondary animate-pulse" />
    <div className="h-32 rounded-xl bg-secondary animate-pulse" />
  </div>
);

GamePlansEmptyState.displayName = "GamePlansEmptyState";
GamePlansLoadingState.displayName = "GamePlansLoadingState";
