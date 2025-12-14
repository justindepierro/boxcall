/**
 * CompleteStep - Completion screen for coach account
 */

import React from 'react';
import { Typography } from '../../../components/design-system';
import { Button } from '../../../components/ui/Button/Button';
import { Icon } from '../../../components/ui/Icon/Icon';
import type { CompleteStepProps } from '../types';

export const CompleteStep: React.FC<CompleteStepProps> = ({
  firstName,
  onNavigateDashboard,
  onNavigatePlaybook,
}) => {
  return (
    <div className="text-center">
      <Icon
        name="check-circle"
        size="xl"
        color="success"
        className="mx-auto mb-6"
      />
      <Typography variant="headline-xl" className="mb-4">
        Coach Account Created!
      </Typography>
      <Typography
        variant="body-lg"
        color="muted"
        className="mb-8 container-content"
      >
        Welcome to BoxCall, Coach {firstName}! Your personal coaching account
        is ready to use. Start building your playbooks and planning your
        practices.
      </Typography>
      <div className="flex gap-3 justify-center">
        <Button onClick={onNavigateDashboard} variant="primary" size="sm">
          Go to Coach Dashboard
        </Button>
        <Button onClick={onNavigatePlaybook} variant="ghost" size="sm">
          Start Building Playbooks
        </Button>
      </div>
    </div>
  );
};
