import React from "react";
import { Button } from "../../../ui/Button/Button";
import { Icon } from "../../../ui/Icon/Icon";
import { Typography } from "../../../design-system/Typography";

interface AdvancedOptionsSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  // Formation details
  formationType: string;
  formationDir: string;
  backAlign: string;
  shift: string;
  motion: string;
  formationTags: string;
  runStrength: string;
  passStrength: string;
  onFormationTypeChange: (value: string) => void;
  onFormationDirChange: (value: string) => void;
  onBackAlignChange: (value: string) => void;
  onShiftChange: (value: string) => void;
  onMotionChange: (value: string) => void;
  onFormationTagsChange: (value: string) => void;
  onRunStrengthChange: (value: string) => void;
  onPassStrengthChange: (value: string) => void;
  // Play details
  playDir: string;
  protection: string;
  playTags: string;
  onPlayDirChange: (value: string) => void;
  onProtectionChange: (value: string) => void;
  onPlayTagsChange: (value: string) => void;
  // Confidence
  confidence: number;
  onConfidenceChange: (value: number) => void;
  // Tags & Roles
  positions: string[];
  players: string[];
  flags: string[];
  newPosition: string;
  newPlayer: string;
  newFlag: string;
  onNewPositionChange: (value: string) => void;
  onNewPlayerChange: (value: string) => void;
  onNewFlagChange: (value: string) => void;
  onAddPosition: () => void;
  onAddPlayer: () => void;
  onAddFlag: () => void;
  // Additional info
  oneWordPlay: string;
  description: string;
  onOneWordPlayChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  // Constants
  directionOptions: Array<{ value: string; label: string }>;
  positionOptions: string[];
}

export const AdvancedOptionsSection: React.FC<AdvancedOptionsSectionProps> = ({
  isOpen,
  onToggle,
  formationType,
  formationDir,
  backAlign,
  shift,
  motion,
  formationTags,
  runStrength,
  passStrength,
  onFormationTypeChange,
  onFormationDirChange,
  onBackAlignChange,
  onShiftChange,
  onMotionChange,
  onFormationTagsChange,
  onRunStrengthChange,
  onPassStrengthChange,
  playDir,
  protection,
  playTags,
  onPlayDirChange,
  onProtectionChange,
  onPlayTagsChange,
  confidence,
  onConfidenceChange,
  positions,
  players,
  flags,
  newPosition,
  newPlayer,
  newFlag,
  onNewPositionChange,
  onNewPlayerChange,
  onNewFlagChange,
  onAddPosition,
  onAddPlayer,
  onAddFlag,
  oneWordPlay,
  description,
  onOneWordPlayChange,
  onDescriptionChange,
  directionOptions,
  positionOptions,
}) => {
  const handlePositionKeyDown = (e: React.KeyboardEvent<HTMLSelectElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onAddPosition();
    } else if (e.key === "Escape") {
      onNewPositionChange("");
    }
  };

  const handlePlayerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onAddPlayer();
    } else if (e.key === "Escape") {
      onNewPlayerChange("");
    }
  };

  const handleFlagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onAddFlag();
    } else if (e.key === "Escape") {
      onNewFlagChange("");
    }
  };

  return (
    <div className="border-t border-border-medium pt-spacing-lg">
      <Button
        type="button"
        variant="ghost"
        onClick={onToggle}
        className="w-full justify-between p-0 h-auto"
      >
        <Typography variant="label-md">Advanced Options</Typography>
        <Icon
          name={isOpen ? "chevron-up" : "chevron-down"}
          className="h-5 w-5"
        />
      </Button>

      {isOpen && (
        <div className="space-y-spacing-lg mt-spacing-lg">
          {/* Formation Details */}
          <div className="bg-surface-secondary/30 rounded-lg p-spacing-md">
            <Typography
              variant="label-lg"
              className="flex items-center mb-spacing-sm text-text-primary"
            >
              <Icon name="target" className="h-4 w-4 mr-spacing-xs" />
              Formation Details
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-spacing-sm">
              <div>
                <Typography
                  variant="label-md"
                  className="block mb-spacing-xs text-text-secondary"
                >
                  Formation Type
                </Typography>
                <input
                  type="text"
                  value={formationType}
                  onChange={(e) => onFormationTypeChange(e.target.value)}
                  placeholder="e.g., Spread, Tight"
                  className="w-full px-spacing-sm py-spacing-xs text-sm border border-border-medium rounded-lg focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                />
              </div>
              <div>
                <Typography
                  variant="label-md"
                  className="block mb-spacing-xs text-text-secondary"
                >
                  Direction
                </Typography>
                <select
                  value={formationDir}
                  onChange={(e) => onFormationDirChange(e.target.value)}
                  className="w-full px-spacing-sm py-spacing-xs text-sm border border-border-medium rounded-lg focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                >
                  <option value="">None</option>
                  {directionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <Typography
                  variant="label-md"
                  className="block mb-spacing-xs text-text-secondary"
                >
                  Backfield & Motion
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-spacing-xs">
                  <input
                    type="text"
                    value={backAlign}
                    onChange={(e) => onBackAlignChange(e.target.value)}
                    placeholder="Backfield alignment"
                    className="px-spacing-sm py-spacing-xs text-sm border border-border-medium rounded-lg focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                  />
                  <input
                    type="text"
                    value={shift}
                    onChange={(e) => onShiftChange(e.target.value)}
                    placeholder="Pre-snap shift"
                    className="px-spacing-sm py-spacing-xs text-sm border border-border-medium rounded-lg focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                  />
                  <input
                    type="text"
                    value={motion}
                    onChange={(e) => onMotionChange(e.target.value)}
                    placeholder="Pre-snap motion"
                    className="px-spacing-sm py-spacing-xs text-sm border border-border-medium rounded-lg focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                  />
                </div>
              </div>
              <div>
                <Typography
                  variant="label-md"
                  className="block mb-spacing-xs text-text-secondary"
                >
                  Formation Tags
                </Typography>
                <input
                  type="text"
                  value={formationTags}
                  onChange={(e) => onFormationTagsChange(e.target.value)}
                  placeholder="e.g., Nickel, Dime"
                  className="w-full px-spacing-sm py-spacing-xs text-sm border border-border-medium rounded-lg focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                />
              </div>
              <div>
                <Typography
                  variant="label-md"
                  className="block mb-spacing-xs text-text-secondary"
                >
                  Strength
                </Typography>
                <div className="grid grid-cols-2 gap-spacing-xs">
                  <input
                    type="text"
                    value={runStrength}
                    onChange={(e) => onRunStrengthChange(e.target.value)}
                    placeholder="Run strength"
                    className="px-spacing-sm py-spacing-xs text-sm border border-border-medium rounded-lg focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                  />
                  <input
                    type="text"
                    value={passStrength}
                    onChange={(e) => onPassStrengthChange(e.target.value)}
                    placeholder="Pass strength"
                    className="px-spacing-sm py-spacing-xs text-sm border border-border-medium rounded-lg focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Play Details */}
          <div className="bg-surface-secondary/30 rounded-lg p-spacing-md">
            <Typography
              variant="label-lg"
              className="flex items-center mb-spacing-sm text-text-primary"
            >
              <Icon name="hash" className="h-4 w-4 mr-spacing-xs" />
              Play Details
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-spacing-sm">
              <div>
                <Typography
                  variant="label-md"
                  className="block mb-spacing-xs text-text-secondary"
                >
                  Direction
                </Typography>
                <select
                  value={playDir}
                  onChange={(e) => onPlayDirChange(e.target.value)}
                  className="w-full px-spacing-sm py-spacing-xs text-sm border border-border-medium rounded-lg focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                >
                  <option value="">None</option>
                  {directionOptions.map((opt) => (
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
                  Pass Protection
                </Typography>
                <input
                  type="text"
                  value={protection}
                  onChange={(e) => onProtectionChange(e.target.value)}
                  placeholder="e.g., 5-man, Slide"
                  className="w-full px-spacing-sm py-spacing-xs text-sm border border-border-medium rounded-lg focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                />
              </div>
              <div className="md:col-span-2">
                <Typography
                  variant="label-md"
                  className="block mb-spacing-xs text-text-secondary"
                >
                  Play Tags
                </Typography>
                <input
                  type="text"
                  value={playTags}
                  onChange={(e) => onPlayTagsChange(e.target.value)}
                  placeholder="e.g., Red Zone, 3rd&Short"
                  className="w-full px-spacing-sm py-spacing-xs text-sm border border-border-medium rounded-lg focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                />
              </div>
            </div>
          </div>

          {/* Confidence */}
          <div className="bg-surface-secondary/30 rounded-lg p-spacing-md">
            <Typography
              variant="label-lg"
              className="block mb-spacing-sm text-text-primary"
            >
              Confidence Level
            </Typography>
            <div className="space-y-spacing-sm">
              <div className="flex items-center justify-between">
                <Typography variant="body-sm" className="text-text-secondary">
                  How confident are you in this play?
                </Typography>
                <span className="text-sm font-medium text-text-primary bg-surface-primary px-spacing-xs py-spacing-xs rounded-lg">
                  {confidence}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={confidence}
                onChange={(e) => onConfidenceChange(Number(e.target.value))}
                className="w-full h-2 bg-surface-muted rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-text-muted">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>
          </div>

          {/* Tags & Roles */}
          <div className="bg-surface-secondary/30 rounded-lg p-spacing-md">
            <Typography
              variant="label-lg"
              className="flex items-center mb-spacing-sm text-text-primary"
            >
              <Icon name="tag" className="h-4 w-4 mr-spacing-xs" />
              Tags & Roles
            </Typography>
            <div className="space-y-spacing-md">
              {/* Positions */}
              <div>
                <Typography
                  variant="label-md"
                  className="block mb-spacing-xs text-text-secondary"
                >
                  Key Positions
                </Typography>
                <div className="flex flex-wrap gap-spacing-xs mb-spacing-xs">
                  {positions.map((pos: string) => (
                    <span
                      key={pos}
                      className="inline-flex items-center gap-spacing-xs px-spacing-xs py-spacing-xs text-xs bg-text-info/10 text-text-info rounded-full"
                    >
                      {pos}
                    </span>
                  ))}
                </div>
                <div className="flex gap-spacing-xs">
                  <select
                    value={newPosition}
                    onChange={(e) => onNewPositionChange(e.target.value)}
                    onKeyDown={handlePositionKeyDown}
                    className="flex-1 px-spacing-sm py-spacing-xs text-sm border border-border-medium rounded-lg focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                  >
                    <option value="">Add position...</option>
                    {positionOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onAddPosition}
                    disabled={!newPosition}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Players */}
              <div>
                <Typography
                  variant="label-md"
                  className="block mb-spacing-xs text-text-secondary"
                >
                  Key Players
                </Typography>
                <div className="flex flex-wrap gap-spacing-xs mb-spacing-xs">
                  {players.map((pl: string) => (
                    <span
                      key={pl}
                      className="inline-flex items-center gap-spacing-xs px-spacing-xs py-spacing-xs text-xs bg-text-success/10 text-text-success rounded-full"
                    >
                      {pl}
                    </span>
                  ))}
                </div>
                <div className="flex gap-spacing-xs">
                  <input
                    value={newPlayer}
                    onChange={(e) => onNewPlayerChange(e.target.value)}
                    onKeyDown={handlePlayerKeyDown}
                    placeholder="Add player (e.g., Z, WR1)"
                    className="flex-1 px-spacing-sm py-spacing-xs text-sm border border-border-medium rounded-lg focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onAddPlayer}
                    disabled={!newPlayer.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Flags */}
              <div>
                <Typography
                  variant="label-md"
                  className="block mb-spacing-xs text-text-secondary"
                >
                  Special Tags
                </Typography>
                <div className="flex flex-wrap gap-spacing-xs mb-spacing-xs">
                  {flags.map((fl: string) => (
                    <span
                      key={fl}
                      className="inline-flex items-center gap-spacing-xs px-spacing-xs py-spacing-xs text-xs bg-text-warning/10 text-text-warning rounded-full"
                    >
                      {fl}
                    </span>
                  ))}
                </div>
                <div className="flex gap-spacing-xs">
                  <input
                    value={newFlag}
                    onChange={(e) => onNewFlagChange(e.target.value)}
                    onKeyDown={handleFlagKeyDown}
                    placeholder="Add tag (e.g., Red Zone)"
                    className="flex-1 px-spacing-sm py-spacing-xs text-sm border border-border-medium rounded-lg focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onAddFlag}
                    disabled={!newFlag.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-surface-secondary/30 rounded-lg p-spacing-md">
            <Typography
              variant="label-lg"
              className="block mb-spacing-sm text-text-primary"
            >
              Additional Information
            </Typography>
            <div className="space-y-spacing-sm">
              <div>
                <Typography
                  variant="label-md"
                  className="block mb-spacing-xs text-text-secondary"
                >
                  One Word Call
                </Typography>
                <input
                  type="text"
                  value={oneWordPlay}
                  onChange={(e) => onOneWordPlayChange(e.target.value)}
                  placeholder="e.g., POWER, SLANT"
                  className="w-full px-spacing-sm py-spacing-xs text-sm border border-border-medium rounded-lg focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                />
              </div>
              <div>
                <Typography
                  variant="label-md"
                  className="block mb-spacing-xs text-text-secondary"
                >
                  Description
                </Typography>
                <textarea
                  value={description}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  placeholder="Brief description of the play..."
                  rows={2}
                  className="w-full px-spacing-sm py-spacing-xs text-sm border border-border-medium rounded-lg focus:ring-2 focus:ring-text-info focus:border-surface-primary/0 resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
