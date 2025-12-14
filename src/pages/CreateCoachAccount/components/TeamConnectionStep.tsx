/**
 * TeamConnectionStep - Team connection form for coach account
 */

import React from 'react';
import { Typography } from '../../../components/design-system';
import type { StepProps } from '../types';

export const TeamConnectionStep: React.FC<StepProps> = ({
  formData,
  onFormChange,
}) => {
  return (
    <div>
      <Typography variant="headline-lg" className="mb-2">
        Team Connection
      </Typography>
      <Typography variant="body-md" color="muted" className="mb-6">
        Optionally connect with a team now, or skip and join teams later.
      </Typography>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="hasSchoolCode"
            checked={formData.hasSchoolCode}
            onChange={(e) => onFormChange({ hasSchoolCode: e.target.checked })}
            className="w-4 h-4 text-info bg-subtle border-secondary rounded-lg focus-ring"
          />
          <Typography variant="body-sm" as="label" className="font-medium">
            I have a school/team code
          </Typography>
        </div>

        {formData.hasSchoolCode && (
          <div className="grid-form p-4 bg-subtle dark:bg-info/20 rounded-lg">
            <div>
              <Typography
                variant="body-sm"
                as="label"
                className="block font-medium mb-2"
              >
                School/Team Code
              </Typography>
              <input
                type="text"
                value={formData.schoolCode}
                onChange={(e) => onFormChange({ schoolCode: e.target.value })}
                placeholder="e.g., BCHS-FB-2024"
                className="w-full px-3 py-2 border border-secondary rounded-lg focus-ring"
              />
            </div>
            <div>
              <Typography
                variant="body-sm"
                as="label"
                className="block font-medium mb-2"
              >
                School Name (Auto-filled)
              </Typography>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => onFormChange({ schoolName: e.target.value })}
                placeholder="Will auto-populate"
                className="w-full px-3 py-2 border border-secondary rounded-lg bg-subtle text-muted"
                disabled
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="requestTeamLink"
                checked={formData.requestTeamLink}
                onChange={(e) =>
                  onFormChange({ requestTeamLink: e.target.checked })
                }
                className="w-4 h-4 text-info bg-subtle border-secondary rounded-lg focus-ring"
              />
              <label htmlFor="requestTeamLink" className="text-sm">
                Request to be linked to this team (Head Coach will approve)
              </label>
            </div>
          </div>
        )}

        {!formData.hasSchoolCode && (
          <div className="p-4 bg-subtle dark:bg-secondary rounded-lg">
            <Typography variant="body-sm" color="muted">
              No problem! You can always join teams later from your coach
              dashboard. Your personal playbooks and content will be ready to
              import when you do.
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};
