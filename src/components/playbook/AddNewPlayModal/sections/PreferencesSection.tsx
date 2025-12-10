import React from "react";
import { Typography } from "../../../design-system/Typography";
import { Dropdown } from "../../../ui/Dropdown";

interface PreferencesSectionProps {
  prefDown: string;
  prefDistance: string;
  prefHash: string;
  prefCoverage: string;
  prefFront: string;
  onPrefDownChange: (down: string) => void;
  onPrefDistanceChange: (distance: string) => void;
  onPrefHashChange: (hash: string) => void;
  onPrefCoverageChange: (coverage: string) => void;
  onPrefFrontChange: (front: string) => void;
  downOptions: Array<{ value: string; label: string }>;
  distanceOptions: Array<{ value: string; label: string }>;
  hashOptions: Array<{ value: string; label: string }>;
}

export const PreferencesSection: React.FC<PreferencesSectionProps> = ({
  prefDown,
  prefDistance,
  prefHash,
  prefCoverage,
  prefFront,
  onPrefDownChange,
  onPrefDistanceChange,
  onPrefHashChange,
  onPrefCoverageChange,
  onPrefFrontChange,
  downOptions,
  distanceOptions,
  hashOptions,
}) => {
  return (
    <div className="bg-secondary/30 rounded-lg p-md">
      <Typography variant="label-lg" className="block mb-sm text-primary">
        Situational Preferences
      </Typography>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-sm">
        <div>
          <Dropdown
            label="Down"
            value={prefDown}
            onChange={onPrefDownChange}
            options={downOptions}
            placeholder="Any"
            clearable
            size="sm"
          />
        </div>
        <div>
          <Dropdown
            label="Distance"
            value={prefDistance}
            onChange={onPrefDistanceChange}
            options={distanceOptions}
            placeholder="Any"
            clearable
            size="sm"
          />
        </div>
        <div>
          <Dropdown
            label="Hash"
            value={prefHash}
            onChange={onPrefHashChange}
            options={hashOptions}
            placeholder="Any"
            clearable
            size="sm"
          />
        </div>
        <div>
          <Typography variant="label-md" className="block mb-xs text-secondary">
            Coverage
          </Typography>
          <input
            type="text"
            value={prefCoverage}
            onChange={(e) => onPrefCoverageChange(e.target.value)}
            placeholder="e.g., Man, Zone"
            className="w-full px-sm py-xs text-sm border border-secondary rounded-lg focus:ring-2 focus:ring-text-info focus:border-bg-primary/0"
          />
        </div>
        <div>
          <Typography variant="label-md" className="block mb-xs text-secondary">
            Defensive Front
          </Typography>
          <input
            type="text"
            value={prefFront}
            onChange={(e) => onPrefFrontChange(e.target.value)}
            placeholder="e.g., 4-3, 3-4"
            className="w-full px-sm py-xs text-sm border border-secondary rounded-lg focus:ring-2 focus:ring-text-info focus:border-bg-primary/0"
          />
        </div>
      </div>
    </div>
  );
};
