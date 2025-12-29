/**
 * GameSituationSection - Situational preferences
 *
 * Collapsible section containing Billick-style situational categorization:
 * - Down & Distance
 * - Hash
 * - Coverage/Front
 * - Field Position
 * - Custom Situation
 */

import React from "react";
import { Typography } from "../../../design-system/Typography";
import { Icon } from "../../../ui/Icon/Icon";
import { Button } from "../../../ui/Button/Button";

// Option types
interface SelectOption {
  value: string;
  label: string;
}

interface GameSituationSectionProps {
  isOpen: boolean;
  onToggle: () => void;

  // Preferences
  prefDown: string;
  prefDistance: string;
  prefHash: string;
  prefCoverage: string;
  prefFront: string;
  prefFieldPos: string;
  prefSituation: string;

  // Change handlers
  onPrefDownChange: (value: string) => void;
  onPrefDistanceChange: (value: string) => void;
  onPrefHashChange: (value: string) => void;
  onPrefCoverageChange: (value: string) => void;
  onPrefFrontChange: (value: string) => void;
  onPrefFieldPosChange: (value: string) => void;
  onPrefSituationChange: (value: string) => void;

  // Constants
  downOptions: SelectOption[];
  distanceOptions: SelectOption[];
  hashOptions: SelectOption[];
}

// Chip selector component
const ChipSelector: React.FC<{
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}> = ({ label, value, options, onChange }) => (
  <div className="space-y-xs">
    <Typography
      variant="caption"
      className="text-tertiary uppercase tracking-wide"
    >
      {label}
    </Typography>
    <div className="flex flex-wrap gap-xs">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(value === option.value ? "" : option.value)}
          className={`px-sm py-xs rounded-lg text-xs font-medium transition-all ${
            value === option.value
              ? "bg-primary text-white"
              : "bg-surface-elevated text-secondary hover:bg-surface-muted"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);

// Free text input with label
const TextInput: React.FC<{
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}> = ({ label, value, placeholder, onChange }) => (
  <div className="space-y-xs">
    <Typography
      variant="caption"
      className="text-tertiary uppercase tracking-wide"
    >
      {label}
    </Typography>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-sm py-xs text-sm border border-secondary rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
    />
  </div>
);

export const GameSituationSection: React.FC<GameSituationSectionProps> = ({
  isOpen,
  onToggle,
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
    <div className="border-t border-secondary pt-md">
      {/* Collapsible Header */}
      <Button
        type="button"
        variant="ghost"
        onClick={onToggle}
        className="w-full justify-between p-0 h-auto"
      >
        <div className="flex items-center gap-sm">
          <div className="p-xs bg-success-500/10 rounded-lg">
            <Icon name="target" className="h-5 w-5 text-success-600" />
          </div>
          <Typography variant="label-lg" className="text-primary font-semibold">
            Game Situation Preferences
          </Typography>
        </div>
        <Icon
          name={isOpen ? "chevron-up" : "chevron-down"}
          className="h-5 w-5 text-secondary"
        />
      </Button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="mt-md space-y-md bg-surface-muted rounded-lg p-md">
          {/* Down & Distance Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <ChipSelector
              label="Down"
              value={prefDown}
              options={downOptions}
              onChange={onPrefDownChange}
            />
            <ChipSelector
              label="Distance"
              value={prefDistance}
              options={distanceOptions}
              onChange={onPrefDistanceChange}
            />
          </div>

          {/* Hash */}
          <ChipSelector
            label="Hash"
            value={prefHash}
            options={hashOptions}
            onChange={onPrefHashChange}
          />

          {/* Coverage & Front */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
            <TextInput
              label="vs Coverage"
              value={prefCoverage}
              placeholder="e.g., Cover 2, Cover 3, Man"
              onChange={onPrefCoverageChange}
            />
            <TextInput
              label="vs Front"
              value={prefFront}
              placeholder="e.g., 4-3, 3-4, Nickel"
              onChange={onPrefFrontChange}
            />
          </div>

          {/* Field Position & Situation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
            <TextInput
              label="Field Position"
              value={prefFieldPos}
              placeholder="e.g., Red Zone, Goal Line"
              onChange={onPrefFieldPosChange}
            />
            <TextInput
              label="Situation"
              value={prefSituation}
              placeholder="e.g., 2-Minute, Backed Up"
              onChange={onPrefSituationChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};
