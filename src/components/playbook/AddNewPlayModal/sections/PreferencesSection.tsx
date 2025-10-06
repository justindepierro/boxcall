import React from "react";
import { Typography } from "../../../design-system/Typography";

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
    <div className="bg-surface-secondary/30 rounded-lg p-spacing-md">
      <Typography
        variant="label-lg"
        className="block mb-spacing-sm text-text-primary"
      >
        Situational Preferences
      </Typography>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-spacing-sm">
        <div>
          <Typography
            variant="label-md"
            className="block mb-spacing-xs text-text-secondary"
          >
            Down
          </Typography>
          <select
            value={prefDown}
            onChange={(e) => onPrefDownChange(e.target.value)}
            className="w-full px-spacing-sm py-spacing-xs text-sm border border-border-medium rounded-lg focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
          >
            <option value="">Any</option>
            {downOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Typography
            variant="label-md"
            className="block mb-spacing-xs text-text-secondary"
          >
            Distance
          </Typography>
          <select
            value={prefDistance}
            onChange={(e) => onPrefDistanceChange(e.target.value)}
            className="w-full px-spacing-sm py-spacing-xs text-sm border border-border-medium rounded-lg focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
          >
            <option value="">Any</option>
            {distanceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Typography
            variant="label-md"
            className="block mb-spacing-xs text-text-secondary"
          >
            Hash
          </Typography>
          <select
            value={prefHash}
            onChange={(e) => onPrefHashChange(e.target.value)}
            className="w-full px-spacing-sm py-spacing-xs text-sm border border-border-medium rounded-lg focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
          >
            <option value="">Any</option>
            {hashOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Typography
            variant="label-md"
            className="block mb-spacing-xs text-text-secondary"
          >
            Coverage
          </Typography>
          <input
            type="text"
            value={prefCoverage}
            onChange={(e) => onPrefCoverageChange(e.target.value)}
            placeholder="e.g., Man, Zone"
            className="w-full px-spacing-sm py-spacing-xs text-sm border border-border-medium rounded-lg focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
          />
        </div>
        <div>
          <Typography
            variant="label-md"
            className="block mb-spacing-xs text-text-secondary"
          >
            Defensive Front
          </Typography>
          <input
            type="text"
            value={prefFront}
            onChange={(e) => onPrefFrontChange(e.target.value)}
            placeholder="e.g., 4-3, 3-4"
            className="w-full px-spacing-sm py-spacing-xs text-sm border border-border-medium rounded-lg focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
          />
        </div>
      </div>
    </div>
  );
};
