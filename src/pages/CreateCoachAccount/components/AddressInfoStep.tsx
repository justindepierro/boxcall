/**
 * AddressInfoStep - Address information form for coach account
 */

import React from "react";
import { Typography } from "../../../components/design-system";
import type { StepProps } from "../types";

export const AddressInfoStep: React.FC<StepProps> = ({
  formData,
  onFormChange,
}) => {
  return (
    <div>
      <Typography variant="headline-lg" className="mb-6">
        Address Information
      </Typography>
      <div className="grid-form">
        <div className="md:col-span-2">
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium mb-2"
          >
            Street Address *
          </Typography>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => onFormChange({ address: e.target.value })}
            placeholder="123 Main Street"
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
            City *
          </Typography>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => onFormChange({ city: e.target.value })}
            placeholder="New York"
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
            State *
          </Typography>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => onFormChange({ state: e.target.value })}
            placeholder="NY"
            className="w-full px-3 py-2 border border-secondary rounded-lg focus-ring"
            required
          />
        </div>
        <div className="md:col-span-2">
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium mb-2"
          >
            Zip Code *
          </Typography>
          <input
            type="text"
            value={formData.zipCode}
            onChange={(e) => onFormChange({ zipCode: e.target.value })}
            placeholder="10001"
            className="w-full px-3 py-2 border border-secondary rounded-lg focus-ring"
            required
          />
        </div>
      </div>
    </div>
  );
};
