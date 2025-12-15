import React from "react";
import { Typography } from "../../../design-system/Typography";
import { Dropdown } from "../../../ui/Dropdown";

interface PreferencesSectionProps {
  prefDown: string;
  prefDistance: string;
  prefHash: string;
  prefCoverage: string;
  prefFront: string;
  prefFieldPos: string;
  prefSituation: string;
  onPrefDownChange: (down: string) => void;
  onPrefDistanceChange: (distance: string) => void;
  onPrefHashChange: (hash: string) => void;
  onPrefCoverageChange: (coverage: string) => void;
  onPrefFrontChange: (front: string) => void;
  onPrefFieldPosChange: (fieldPos: string) => void;
  onPrefSituationChange: (situation: string) => void;
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
  prefFieldPos,
  prefSituation,
  onPrefDownChange,
  onPrefDistanceChange,
  onPrefHashChange,
  onPrefCoverageChange,
  onPrefFrontChange,
  onPrefFieldPosChange,
  onPrefSituationChange,
  downOptions,
  distanceOptions,
  hashOptions,
}) => {
  return (
    <div className="bg-secondary/30 rounded-lg p-md">
      <Typography variant="label-lg" className="block mb-sm text-primary">
        Situational Preferences
      </Typography>
      <Typography variant="body-sm" className="block mb-md text-muted">
        Define when this play works best. The AI will recommend plays that match
        the current game situation.
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
            Field Position
          </Typography>
          <input
            type="text"
            value={prefFieldPos}
            onChange={(e) => onPrefFieldPosChange(e.target.value)}
            placeholder="e.g., Red Zone, Goal Line"
            className="w-full px-sm py-xs text-sm border border-secondary rounded-lg focus:ring-2 focus:ring-text-info focus:border-bg-primary/0"
          />
        </div>
        <div>
          <Typography variant="label-md" className="block mb-xs text-secondary">
            Custom Situation
          </Typography>
          <input
            type="text"
            value={prefSituation}
            onChange={(e) => onPrefSituationChange(e.target.value)}
            placeholder="e.g., 2-Minute, Backed Up"
            className="w-full px-sm py-xs text-sm border border-secondary rounded-lg focus:ring-2 focus:ring-text-info focus:border-bg-primary/0"
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
            placeholder="e.g., Man, Zone, Cover 2"
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
            placeholder="e.g., 4-3, 3-4, Odd"
            className="w-full px-sm py-xs text-sm border border-secondary rounded-lg focus:ring-2 focus:ring-text-info focus:border-bg-primary/0"
          />
        </div>
      </div>
    </div>
  );
};
