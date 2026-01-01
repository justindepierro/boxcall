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
      className="text-tertiary uppercase tracking-wide font-medium"
    >
      {label}
    </Typography>
    <div className="flex flex-wrap gap-xs">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(value === option.value ? "" : option.value)}
          className={`px-sm py-xs rounded-xl text-xs font-medium transition-all duration-150 ${
            value === option.value
              ? "bg-gradient-to-r from-jade-600 to-jade-500 text-white shadow-sm"
              : "bg-white/80 text-secondary border border-neutral-200/80 hover:border-jade-300 hover:bg-jade-50/50"
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
      className="text-tertiary uppercase tracking-wide font-medium"
    >
      {label}
    </Typography>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-sm py-xs text-sm border border-neutral-200 rounded-xl bg-white/80 focus:ring-2 focus:ring-jade-500/30 focus:border-jade-400 transition-all"
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
    <div className="border-t border-neutral-200/60 pt-md">
      {/* Collapsible Header */}
      <Button
        type="button"
        variant="ghost"
        onClick={onToggle}
        className="w-full justify-between p-xs h-auto hover:bg-success-50/50 rounded-xl transition-colors"
      >
        <div className="flex items-center gap-sm">
          <div className="p-xs bg-gradient-to-br from-success-500/20 to-success-600/10 rounded-lg shadow-sm">
            <Icon name="target" className="h-5 w-5 text-success-600" />
          </div>
          <div className="text-left">
            <Typography
              variant="label-lg"
              className="text-primary font-semibold"
            >
              Game Situation Preferences
            </Typography>
            <Typography variant="caption" className="text-tertiary">
              Down, distance, hash & situational settings
            </Typography>
          </div>
        </div>
        <div
          className={`p-xs rounded-full transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <Icon name="chevron-down" className="h-5 w-5 text-secondary" />
        </div>
      </Button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="mt-md space-y-md bg-gradient-to-br from-success-50/30 to-surface-muted rounded-xl p-md border border-success-100/50 animate-in fade-in slide-in-from-top-2 duration-200">
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
