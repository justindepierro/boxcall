/**
 * UsageStatsSection Component
 *
 * Displays play usage statistics (times called, times successful, last used).
 */

import React from 'react';
import { Typography } from '../../../design-system/Typography';
import Icon from '../../../ui/Icon/Icon';
import { UsageStatsSectionProps } from './types';

export const UsageStatsSection: React.FC<UsageStatsSectionProps> = ({
  play,
}) => {
  return (
    <div className="bg-subtle rounded-lg p-sm">
      <Typography
        variant="label-lg"
        as="h4"
        className="text-primary flex items-center mb-sm"
      >
        <Icon name="clock" className="h-4 w-4 mr-xs" /> Usage & Stats
      </Typography>
      <dl className="space-y-xs text-sm">
        <div className="flex items-center gap-sm">
          <dt className="text-primary font-medium flex-shrink-0 w-20 sm:w-28 text-xs">
            Times Called
          </dt>
          <dd className="text-primary font-mono text-xs">
            {play.times_called}
          </dd>
        </div>
        <div className="flex items-center gap-sm">
          <dt className="text-primary font-medium flex-shrink-0 w-20 sm:w-28 text-xs">
            Times Successful
          </dt>
          <dd className="text-primary font-mono text-xs">
            {play.times_successful}
          </dd>
        </div>
        {play.last_used_at && (
          <div className="flex items-center gap-sm">
            <dt className="text-primary font-medium flex-shrink-0 w-20 sm:w-28 text-xs">
              Last Used
            </dt>
            <dd className="text-primary font-mono text-xs">
              {new Date(play.last_used_at).toLocaleDateString()}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
};
