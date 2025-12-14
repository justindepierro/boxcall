import React from "react";
import { Typography } from "../../../components/design-system/Typography";
import { Button } from "../../../components/ui/Button/Button";
import { Icon } from "../../../components/ui/Icon/Icon";
import { EnhancedInput } from "../../../components/forms/EnhancedFormFields";
import type { TeamCreationInput } from "../../../services/teamService";
import type { AddressSuggestion } from "../../../services/locationFinderService";

interface SchoolInfoStepProps {
  formData: TeamCreationInput;
  onUpdateFormData: (updates: Partial<TeamCreationInput>) => void;
  onUseCurrentLocation: () => void;
  onAddressSearch: (query: string) => void;
  onSelectAddress: (address: AddressSuggestion) => void;
  locationLoading: boolean;
  addressSuggestions: AddressSuggestion[];
}

export const SchoolInfoStep: React.FC<SchoolInfoStepProps> = ({
  formData,
  onUpdateFormData,
  onUseCurrentLocation,
  onAddressSearch,
  onSelectAddress,
  locationLoading,
  addressSuggestions,
}) => {
  return (
    <div className="space-y-md">
      <Typography variant="headline-md" className="mb-md">
        School Details (Optional)
      </Typography>

      {/* Location Helper */}
      <div className="bg-status-info-bg border border-blue-200 rounded-lg p-md">
        <div className="flex items-start gap-sm">
          <Icon name="map-pin" size="sm" color="primary" className="mt-0.5" />
          <div className="flex-1">
            <Typography variant="body-sm" className="font-medium mb-xs">
              Quick Location Setup
            </Typography>
            <Typography variant="body-sm" color="muted" className="mb-sm">
              We can help fill in your school's location automatically.
            </Typography>
            <Button
              variant="secondary"
              size="sm"
              onClick={onUseCurrentLocation}
              loading={locationLoading}
              icon={<Icon name="map-pin" size="xs" />}
            >
              Use My Current Location
            </Button>
          </div>
        </div>
      </div>

      <EnhancedInput
        label="School District"
        placeholder="e.g., Goshen Central School District"
        value={formData.schoolDistrict || ""}
        onChange={(value) => onUpdateFormData({ schoolDistrict: value })}
      />

      <div className="relative">
        <EnhancedInput
          label="School Address"
          placeholder="e.g., 545 Goshen Avenue"
          value={formData.schoolAddress || ""}
          onChange={(value) => {
            onUpdateFormData({ schoolAddress: value });
            onAddressSearch(value);
          }}
        />

        {/* Address Suggestions */}
        {addressSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-xs bg-white dark:bg-navy-800 rounded-lg shadow-xl max-h-48 overflow-y-auto border border-neutral-200 dark:border-navy-600">
            {addressSuggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                className="w-full px-md py-xs text-left hover:bg-neutral-50 dark:hover:bg-navy-700 border-b border-neutral-100 dark:border-navy-700 last:border-b-0"
                onClick={() => onSelectAddress(suggestion)}
              >
                <div className="font-medium">{suggestion.streetAddress}</div>
                <div className="text-sm text-secondary">
                  {suggestion.city}, {suggestion.state} {suggestion.zipCode}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-md">
        <EnhancedInput
          label="City"
          placeholder="e.g., Goshen"
          value={formData.schoolCity || ""}
          onChange={(value) => onUpdateFormData({ schoolCity: value })}
        />
        <EnhancedInput
          label="State"
          placeholder="e.g., NY"
          value={formData.schoolState || ""}
          onChange={(value) => onUpdateFormData({ schoolState: value })}
        />
      </div>

      <EnhancedInput
        label="ZIP Code"
        placeholder="e.g., 10924"
        value={formData.schoolZip || ""}
        onChange={(value) => onUpdateFormData({ schoolZip: value })}
      />
    </div>
  );
};

SchoolInfoStep.displayName = "SchoolInfoStep";
