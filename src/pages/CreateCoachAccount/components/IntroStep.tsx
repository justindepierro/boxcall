/**
 * IntroStep - Welcome screen for coach account creation
 */

import React from 'react';
import { Typography } from '../../../components/design-system';
import { Icon } from '../../../components/ui/Icon/Icon';

export const IntroStep: React.FC = () => {
  return (
    <div className="text-center">
      <Icon name="user" size="xl" color="info" className="mx-auto mb-6" />
      <Typography variant="headline-xl" className="mb-4">
        Create Your Coach Account
      </Typography>
      <Typography
        variant="body-lg"
        color="muted"
        className="mb-8 container-content"
      >
        Join BoxCall as an individual coach! Build your personal playbooks,
        create practice plans, and enhance your coaching toolkit. Later, you
        can easily connect to any team.
      </Typography>

      {/* Value Proposition */}
      <div className="bg-subtle dark:bg-info/20 border border-muted dark:border-text-info rounded-lg p-6 mb-8">
        <Typography
          variant="headline-md"
          className="mb-4 text-info dark:text-info"
        >
          Why Coach Account?
        </Typography>
        <div className="grid-form gap-4 text-left">
          <div className="flex items-start gap-3">
            <Icon name="book" size="sm" color="info" className="mt-1" />
            <div>
              <Typography variant="body-sm" className="font-medium mb-1">
                Personal Playbook Library
              </Typography>
              <Typography variant="body-sm" color="muted">
                Build and save your plays, practice plans, and game strategies
              </Typography>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Icon name="calendar" size="sm" color="info" className="mt-1" />
            <div>
              <Typography variant="body-sm" className="font-medium mb-1">
                Practice Planning Tools
              </Typography>
              <Typography variant="body-sm" color="muted">
                Create detailed practice schedules and drill sequences
              </Typography>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Icon name="bar-chart" size="sm" color="info" className="mt-1" />
            <div>
              <Typography variant="body-sm" className="font-medium mb-1">
                Analytics & Insights
              </Typography>
              <Typography variant="body-sm" color="muted">
                Track your coaching development and methodology
              </Typography>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Icon name="users" size="sm" color="info" className="mt-1" />
            <div>
              <Typography variant="body-sm" className="font-medium mb-1">
                Easy Team Integration
              </Typography>
              <Typography variant="body-sm" color="muted">
                Import your content when you join a team
              </Typography>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-subtle dark:bg-success/20 border border-muted dark:border-text-success rounded-lg p-4">
        <Typography
          variant="body-md"
          className="font-medium text-success dark:text-success"
        >
          One-time purchase: $9.99 • No recurring fees • Lifetime access
        </Typography>
      </div>
    </div>
  );
};
