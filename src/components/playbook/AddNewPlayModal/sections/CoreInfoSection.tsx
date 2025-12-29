/**
 * CoreInfoSection - Essential play information
 *
 * Contains the 4 most important fields:
 * - Formation (with direction toggle)
 * - Play Name (with direction toggle)
 * - Personnel
 * - Play Type
 */

import React from "react";
import { Typography } from "../../../design-system/Typography";
import { Icon } from "../../../ui/Icon/Icon";
import { Button } from "../../../ui/Button/Button";
import { ValidatedInput } from "../../ValidatedInput";
import type { Play } from "../../../../types/play";

// Play type options
const PLAY_TYPE_OPTIONS = [
  { value: "Run", icon: "🏃" },
  { value: "Pass", icon: "🎯" },
  { value: "RPO", icon: "⚡" },
  { value: "Screen", icon: "🛡️" },
  { value: "Special", icon: "✨" },
] as const;

interface CoreInfoSectionProps {
  // Formation
  formation: string;
  formationDir: string;
  onFormationChange: (value: string) => void;
  onFormationDirChange: (value: "left" | "right" | "base" | null) => void;

  // Play Name
  playName: string;
  playDir: string;
  onPlayNameChange: (value: string) => void;
  onPlayDirChange: (value: string) => void;

  // Personnel
  personnel: string;
  onPersonnelChange: (value: string) => void;
  onAddNewPersonnel: () => void;

  // Play Type
  playType: string;
  onPlayTypeChange: (value: string) => void;

  // Validation
  existingPlays: Play[];
}

// Direction Toggle Button
const DirectionToggle: React.FC<{
  value: string;
  onChange: (value: string) => void;
  label: string;
}> = ({ value, onChange, label }) => {
  const options = [
    { value: "", label: "—" },
    { value: "L", label: "←" },
    { value: "R", label: "→" },
  ];

  return (
    <div className="flex items-center gap-xs">
      <Typography variant="caption" className="text-tertiary">
        {label}
      </Typography>
      <div className="flex rounded-lg overflow-hidden border border-secondary">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-xs py-xs text-xs font-medium transition-colors ${
              value === opt.value
                ? "bg-primary text-white"
                : "bg-surface-primary text-secondary hover:bg-surface-muted"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Play Type Chip Selector
const PlayTypeSelector: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-xs">
    {PLAY_TYPE_OPTIONS.map((option) => (
      <button
        key={option.value}
        type="button"
        onClick={() => onChange(value === option.value ? "" : option.value)}
        className={`px-sm py-xs rounded-full text-sm font-medium transition-all ${
          value === option.value
            ? "bg-primary text-white shadow-sm"
            : "bg-surface-muted text-secondary hover:bg-surface-elevated"
        }`}
      >
        <span className="mr-xs">{option.icon}</span>
        {option.value}
      </button>
    ))}
  </div>
);

export const CoreInfoSection: React.FC<CoreInfoSectionProps> = ({
  formation,
  formationDir,
  onFormationChange,
  onFormationDirChange,
  playName,
  playDir,
  onPlayNameChange,
  onPlayDirChange,
  personnel,
  onPersonnelChange,
  onAddNewPersonnel,
  playType,
  onPlayTypeChange,
  existingPlays,
}) => {
  // Extract unique values for validation
  const existingFormations = React.useMemo(
    () => [...new Set(existingPlays.map((p) => p.formation).filter(Boolean) as string[])],
    [existingPlays]
  );
  const existingPlayNames = React.useMemo(
    () => [...new Set(existingPlays.map((p) => p.play_name).filter(Boolean) as string[])],
    [existingPlays]
  );
  const existingPersonnel = React.useMemo(
    () => [...new Set(existingPlays.map((p) => p.personnel).filter(Boolean) as string[])],
    [existingPlays]
  );

  return (
    <div className="space-y-md">
      {/* Section Header */}
      <div className="flex items-center gap-sm">
        <div className="p-xs bg-primary/10 rounded-lg">
          <Icon name="clipboard" className="h-5 w-5 text-primary" />
        </div>
        <Typography variant="label-lg" className="text-primary font-semibold">
          Play Information
        </Typography>
      </div>

      {/* Formation Row */}
      <div className="space-y-xs">
        <div className="flex items-center justify-between">
          <Typography variant="label-md" className="text-secondary">
            Formation <span className="text-danger-default">*</span>
          </Typography>
          <DirectionToggle
            value={(() => {
              if (formationDir === "left") return "L";
              if (formationDir === "right") return "R";
              return "";
            })()}
            onChange={(v) => {
              if (v === "L") {
                onFormationDirChange("left");
              } else if (v === "R") {
                onFormationDirChange("right");
              } else {
                onFormationDirChange(null);
              }
            }}
            label="Dir"
          />
        </div>
        <ValidatedInput
          value={formation}
          onChange={(e) => onFormationChange(e.target.value)}
          placeholder="e.g., Shotgun, I-Form, Trips"
          type="formation"
          existingValues={existingFormations}
          required
        />
      </div>

      {/* Play Name Row */}
      <div className="space-y-xs">
        <div className="flex items-center justify-between">
          <Typography variant="label-md" className="text-secondary">
            Play Name <span className="text-danger-default">*</span>
          </Typography>
          <DirectionToggle
            value={playDir}
            onChange={onPlayDirChange}
            label="Dir"
          />
        </div>
        <ValidatedInput
          value={playName}
          onChange={(e) => onPlayNameChange(e.target.value)}
          placeholder="e.g., Inside Zone, Curl Flat, Stick"
          type="playName"
          existingValues={existingPlayNames}
          required
        />
      </div>

      {/* Personnel Row */}
      <div className="space-y-xs">
        <div className="flex items-center justify-between">
          <Typography variant="label-md" className="text-secondary">
            Personnel
          </Typography>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onAddNewPersonnel}
            className="text-xs"
          >
            <Icon name="plus" className="h-3 w-3 mr-xs" />
            Add New
          </Button>
        </div>
        <ValidatedInput
          value={personnel}
          onChange={(e) => onPersonnelChange(e.target.value)}
          placeholder="e.g., 11, 12, 21, Empty"
          type="personnel"
          existingValues={existingPersonnel}
        />
      </div>

      {/* Play Type Row */}
      <div className="space-y-xs">
        <Typography variant="label-md" className="text-secondary">
          Play Type
        </Typography>
        <PlayTypeSelector value={playType} onChange={onPlayTypeChange} />
      </div>
    </div>
  );
};
