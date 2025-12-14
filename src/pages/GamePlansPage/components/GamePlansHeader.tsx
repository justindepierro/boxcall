import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button/Button";
import { Icon } from "../../../components/ui/Icon";
import { Typography } from "../../../components/design-system/Typography";

interface GamePlansHeaderProps {
  onCreatePlan: () => void;
}

export const GamePlansHeader: React.FC<GamePlansHeaderProps> = ({
  onCreatePlan,
}) => {
  const navigate = useNavigate();

  return (
    <header className="mb-6">
      <Typography variant="headline-lg" className="text-primary mb-1">
        Game Plans
      </Typography>
      <Typography variant="body" className="text-secondary">
        Create and manage strategic game plans for upcoming matches
      </Typography>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center mt-4">
        <Button
          onClick={() => navigate("/playbook")}
          variant="secondary"
          size="sm"
          className="w-full sm:w-auto"
        >
          <Icon name="arrow-left" className="h-4 w-4 mr-2" />
          Back to Playbook
        </Button>
        <Button
          onClick={onCreatePlan}
          variant="primary"
          size="sm"
          className="w-full sm:w-auto"
        >
          <Icon name="plus" className="h-4 w-4 mr-2" />
          New Plan
        </Button>
      </div>
    </header>
  );
};

GamePlansHeader.displayName = "GamePlansHeader";
