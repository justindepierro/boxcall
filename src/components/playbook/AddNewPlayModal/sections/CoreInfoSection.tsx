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
import { PLAY_TYPE_OPTIONS } from "../../../../types/play";

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
      <Typography variant="caption" className="text-tertiary font-medium">
        {label}
      </Typography>
      <div className="flex rounded-xl overflow-hidden border border-neutral-200/80 shadow-sm">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-xs py-xs text-xs font-medium transition-all duration-150 ${
              value === opt.value
                ? "bg-gradient-to-r from-jade-600 to-jade-500 text-white"
                : "bg-white text-secondary hover:bg-jade-50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Play Type Chip Selector with custom input option
const PlayTypeSelector: React.FC<{
  value: string;
  onChange: (value: string) => void;
  existingPlayTypes?: string[];
}> = ({ value, onChange, existingPlayTypes = [] }) => {
  const [showCustomInput, setShowCustomInput] = React.useState(false);
  const [customValue, setCustomValue] = React.useState("");

  // Check if current value is a custom type (not in predefined options)
  const isCustomType =
    value && !PLAY_TYPE_OPTIONS.some((opt) => opt.value === value);

  // Get unique custom types from existing plays (not in predefined options)
  const customTypesFromPlays = React.useMemo(() => {
    const predefinedValues = new Set(
      PLAY_TYPE_OPTIONS.map((opt) => opt.value.toLowerCase())
    );
    return [...new Set(existingPlayTypes)]
      .filter((t) => t && !predefinedValues.has(t.toLowerCase()))
      .slice(0, 3); // Show max 3 custom types
  }, [existingPlayTypes]);

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onChange(customValue.trim());
      setCustomValue("");
      setShowCustomInput(false);
    }
  };

  return (
    <div className="space-y-xs">
      {/* Predefined play types */}
      <div className="flex flex-wrap gap-xs">
        {PLAY_TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(value === option.value ? "" : option.value)}
            title={option.description}
            className={`px-sm py-xs rounded-xl text-sm font-medium transition-all duration-150 ${
              value === option.value
                ? "bg-gradient-to-r from-jade-600 to-jade-500 text-white shadow-sm"
                : "bg-white border border-neutral-200/80 text-secondary hover:border-jade-300 hover:bg-jade-50/50"
            }`}
          >
            <span className="mr-xs">{option.icon}</span>
            {option.value}
          </button>
        ))}

        {/* Custom type button */}
        <button
          type="button"
          onClick={() => setShowCustomInput(!showCustomInput)}
          className={`px-sm py-xs rounded-xl text-sm font-medium transition-all duration-150 ${
            showCustomInput || isCustomType
              ? "bg-jade-100 text-jade-700 border border-jade-300"
              : "bg-white border border-neutral-200/80 text-secondary hover:border-jade-300 hover:bg-jade-50/50"
          }`}
        >
          <Icon name="plus" className="h-3 w-3 mr-xs inline" />
          Custom
        </button>
      </div>

      {/* Custom types from existing plays */}
      {customTypesFromPlays.length > 0 && !showCustomInput && (
        <div className="flex flex-wrap gap-xs">
          <Typography variant="caption" className="text-tertiary mr-xs">
            Your types:
          </Typography>
          {customTypesFromPlays.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange(value === type ? "" : type)}
              className={`px-sm py-xs rounded-xl text-xs font-medium transition-all duration-150 ${
                value === type
                  ? "bg-gradient-to-r from-jade-600 to-jade-500 text-white shadow-sm"
                  : "bg-white border border-neutral-200/80 text-secondary hover:border-jade-300 hover:bg-jade-50/50"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {/* Custom input field */}
      {showCustomInput && (
        <div className="flex gap-xs items-center">
          <input
            type="text"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
            placeholder="Type custom play type..."
            className="flex-1 px-sm py-xs text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-jade-500/30 focus:border-jade-400 transition-all"
            autoFocus
          />
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleCustomSubmit}
          >
            Add
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowCustomInput(false);
              setCustomValue("");
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Show current custom type if selected */}
      {isCustomType && !showCustomInput && (
        <div className="flex items-center gap-xs">
          <Typography variant="caption" className="text-tertiary">
            Selected:
          </Typography>
          <span className="px-sm py-xs rounded-full text-sm font-medium bg-primary text-white">
            {value}
          </span>
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-tertiary hover:text-primary"
          >
            <Icon name="close" className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
};

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
    () => [
      ...new Set(
        existingPlays.map((p) => p.formation).filter(Boolean) as string[]
      ),
    ],
    [existingPlays]
  );
  const existingPlayNames = React.useMemo(
    () => [
      ...new Set(
        existingPlays.map((p) => p.play_name).filter(Boolean) as string[]
      ),
    ],
    [existingPlays]
  );
  const existingPersonnel = React.useMemo(
    () => [
      ...new Set(
        existingPlays.map((p) => p.personnel).filter(Boolean) as string[]
      ),
    ],
    [existingPlays]
  );
  const existingPlayTypes = React.useMemo(
    () => [
      ...new Set(
        existingPlays.map((p) => p.p_type).filter(Boolean) as string[]
      ),
    ],
    [existingPlays]
  );

  return (
    <div className="space-y-md">
      {/* Section Header */}
      <div className="flex items-center gap-sm">
        <div className="p-xs bg-gradient-to-br from-jade-500/20 to-jade-600/10 rounded-lg shadow-sm">
          <Icon name="clipboard" className="h-5 w-5 text-jade-600" />
        </div>
        <div>
          <Typography variant="label-lg" className="text-primary font-semibold">
            Play Information
          </Typography>
          <Typography variant="caption" className="text-tertiary">
            Formation, name, personnel & play type
          </Typography>
        </div>
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
        <PlayTypeSelector
          value={playType}
          onChange={onPlayTypeChange}
          existingPlayTypes={existingPlayTypes}
        />
      </div>
    </div>
  );
};
