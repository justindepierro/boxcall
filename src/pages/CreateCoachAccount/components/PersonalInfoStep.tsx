/**
 * PersonalInfoStep - Personal information form for coach account
 */

import React from 'react';
import { Typography } from '../../../components/design-system';
import type { StepProps } from '../types';

export const PersonalInfoStep: React.FC<StepProps> = ({
  formData,
  onFormChange,
}) => {
  return (
    <div>
      <Typography variant="headline-lg" className="mb-6">
        Personal Information
      </Typography>
      <div className="grid-form">
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium mb-2"
          >
            First Name *
          </Typography>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => onFormChange({ firstName: e.target.value })}
            placeholder="John"
            className="w-full px-3 py-2 border border-secondary rounded-lg focus-ring"
            required
          />
        </div>
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium mb-2"
          >
            Last Name *
          </Typography>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => onFormChange({ lastName: e.target.value })}
            placeholder="Smith"
            className="w-full px-3 py-2 border border-secondary rounded-lg focus-ring"
            required
          />
        </div>
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium mb-2"
          >
            Email Address *
          </Typography>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onFormChange({ email: e.target.value })}
            placeholder="john.smith@example.com"
            className="w-full px-3 py-2 border border-secondary rounded-lg focus-ring"
            required
          />
        </div>
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium mb-2"
          >
            Phone Number *
          </Typography>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => onFormChange({ phone: e.target.value })}
            placeholder="(555) 123-4567"
            className="w-full px-3 py-2 border border-secondary rounded-lg focus-ring"
            required
          />
        </div>
      </div>
    </div>
  );
};
