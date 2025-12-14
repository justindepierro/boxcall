/**
 * CompleteStep Component
 *
 * Final step showing successful team join
 */

import React from "react";
import { Typography } from "../../../components/design-system";
import { Icon } from "../../../components/ui/Icon/Icon";
import { Button } from "../../../components/ui/Button/Button";
import { Tag } from "../../../components/ui/Tag";
import type { CompleteStepProps } from "../types";

export const CompleteStep: React.FC<CompleteStepProps> = ({
  selectedRole,
  onGoToTeam,
  onGoToDashboard,
}) => {
  return (
    <div className="max-w-md mx-auto text-center">
      <Icon
        name="check-circle"
        size="xl"
        color="success"
        className="mx-auto mb-6"
      />
      <Typography variant="headline-lg" className="mb-4">
        Welcome to the Team!
      </Typography>
      <Typography variant="body-md" color="muted" className="mb-8">
        You've successfully joined your team. You can now access team schedules,
        announcements, and participate in all team activities.
      </Typography>

      <div className="mb-6">
        <Typography
          variant="body-sm"
          className="font-medium mb-2 flex items-center gap-2"
        >
          Your Role:
          <Tag variant="success" size="sm" className="capitalize">
            {selectedRole}
          </Tag>
        </Typography>
        <Typography variant="body-sm" color="muted">
          If this isn't correct, contact your coach to update your role.
        </Typography>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="primary"
          className="flex-1"
          onClick={onGoToTeam}
        >
          Go to Team
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="flex-1"
          onClick={onGoToDashboard}
        >
          Dashboard
        </Button>
      </div>
    </div>
  );
};

CompleteStep.displayName = "CompleteStep";
