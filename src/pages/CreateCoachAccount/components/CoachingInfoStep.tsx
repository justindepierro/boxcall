/**
 * CoachingInfoStep - Coaching background form for coach account
 */

import React from 'react';
import { Typography } from '../../../components/design-system';
import { Dropdown } from '../../../components/ui/Dropdown';
import type { StepProps } from '../types';
import {
  SPORT_OPTIONS,
  EXPERIENCE_OPTIONS,
  COACHING_LEVEL_OPTIONS,
} from '../constants';

export const CoachingInfoStep: React.FC<StepProps> = ({
  formData,
  onFormChange,
}) => {
  return (
    <div>
      <Typography variant="headline-lg" className="mb-6">
        Coaching Background
      </Typography>
      <div className="grid-form">
        <div>
          <Dropdown
            label="Primary Sport *"
            options={SPORT_OPTIONS}
            value={formData.primarySport}
            onChange={(value) => onFormChange({ primarySport: value })}
            fullWidth
            size="md"
          />
        </div>
        <div>
          <Dropdown
            label="Years of Experience *"
            options={EXPERIENCE_OPTIONS}
            value={formData.yearsExperience}
            onChange={(value) => onFormChange({ yearsExperience: value })}
            fullWidth
            size="md"
          />
        </div>
        <div className="md:col-span-2">
          <Dropdown
            label="Coaching Level *"
            options={COACHING_LEVEL_OPTIONS}
            value={formData.coachingLevel}
            onChange={(value) => onFormChange({ coachingLevel: value })}
            fullWidth
            size="md"
          />
        </div>
      </div>
    </div>
  );
};
