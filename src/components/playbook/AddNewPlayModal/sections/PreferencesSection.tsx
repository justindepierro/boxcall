import React from "react";
import { Typography } from "../../../design-system/Typography";
import { Dropdown } from "../../../ui/Dropdown";
import { AutocompleteInput } from "../../../ui/AutocompleteInput";
import { usePlayFieldSuggestions } from "../../../../hooks/usePlayFieldSuggestions";

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
  // Fetch existing values from database for autocomplete
  const suggestions = usePlayFieldSuggestions();

  return (
    <div className="bg-secondary/30 rounded-lg p-md">
      <Typography variant="label-lg" className="block mb-sm text-primary">
        Situational Preferences
      </Typography>
      <Typography variant="body-sm" className="block mb-md text-muted">
        Define when this play works best. Select from existing values or type new ones.
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
        <AutocompleteInput
          label="Field Position"
          value={prefFieldPos}
          onChange={onPrefFieldPosChange}
          suggestions={suggestions.fieldPositions}
          placeholder="e.g., Red Zone, Goal Line"
        />
        <AutocompleteInput
          label="Custom Situation"
          value={prefSituation}
          onChange={onPrefSituationChange}
          suggestions={suggestions.situations}
          placeholder="e.g., 2-Minute, Backed Up"
        />
        <AutocompleteInput
          label="Coverage"
          value={prefCoverage}
          onChange={onPrefCoverageChange}
          suggestions={suggestions.coverages}
          placeholder="e.g., Man, Zone, Cover 2"
        />
        <AutocompleteInput
          label="Defensive Front"
          value={prefFront}
          onChange={onPrefFrontChange}
          suggestions={suggestions.fronts}
          placeholder="e.g., 4-3, 3-4, Odd"
        />
      </div>
    </div>
  );
};
