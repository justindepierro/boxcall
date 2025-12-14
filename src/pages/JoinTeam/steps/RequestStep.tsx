/**
 * RequestStep Component
 *
 * Confirmation step after sending a join request
 */

import React from "react";
import { Typography } from "../../components/design-system";
import { Icon } from "../../components/ui/Icon/Icon";
import { Button } from "../../components/ui/Button/Button";
import type { RequestStepProps } from "./types";

export const RequestStep: React.FC<RequestStepProps> = ({
  selectedTeam,
  onGoToDashboard,
  onJoinAnother,
}) => {
  return (
    <div className="max-w-md mx-auto text-center">
      <Icon name="mail" size="xl" color="primary" className="mx-auto mb-6" />
      <Typography variant="headline-lg" className="mb-4">
        Request Sent!
      </Typography>
      <Typography variant="body-md" color="muted" className="mb-8">
        Your request to join "{selectedTeam?.name}" has been sent to the
        coaching staff. You'll receive an email notification when your request
        is approved.
      </Typography>

      <div className="bg-subtle dark:bg-info/20 border border-muted dark:border-text-info rounded-lg p-4 mb-6">
        <Typography variant="body-sm" className="text-info">
          <strong>What's next?</strong>
          <br />
          The team's coaching staff will review your request and either approve
          or contact you for more information. This usually takes 1-2 business
          days.
        </Typography>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="primary"
          className="flex-1"
          onClick={onGoToDashboard}
        >
          Go to Dashboard
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="flex-1"
          onClick={onJoinAnother}
        >
          Join Another Team
        </Button>
      </div>
    </div>
  );
};

RequestStep.displayName = "RequestStep";
