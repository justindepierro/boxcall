import React from "react";
import { Typography } from "../../../components/design-system/Typography";
import { Button } from "../../../components/ui/Button/Button";
import { Icon } from "../../../components/ui/Icon/Icon";

interface CompleteStepProps {
  schoolName: string;
  teamName: string;
  onShowWelcome: () => void;
}

export const CompleteStep: React.FC<CompleteStepProps> = ({
  schoolName,
  teamName,
  onShowWelcome,
}) => {
  return (
    <div className="text-center space-y-lg">
      <Icon name="check-circle" size="xl" color="success" className="mx-auto" />
      <Typography variant="headline-lg">Team Created Successfully!</Typography>
      <Typography variant="body-md" color="muted">
        Congratulations! Your team "{schoolName} {teamName}" has been created.
      </Typography>
      <Button
        onClick={onShowWelcome}
        variant="primary"
        size="lg"
        icon={<Icon name="arrow-right" size="sm" />}
        iconPosition="right"
      >
        Continue to Team
      </Button>
    </div>
  );
};

CompleteStep.displayName = "CompleteStep";
