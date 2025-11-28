import React from "react";
import { Button } from "../../../ui/Button/Button";
import { Icon } from "../../../ui/Icon/Icon";
import { Typography } from "../../../design-system/Typography";
import {
  TagInput,
  KeyPositionSelector,
  KeyPlayerSelector,
} from "../components";
import { ValidatedInput } from "../../../playbook/ValidatedInput";
import { useRosterData } from "../../../../pages/RosterPage/hooks/useRosterData";
import { usePersonnelConfigurations } from "../../../../hooks/usePersonnel";
import { usePlayFieldValues } from "../hooks/usePlayFieldValues";
import type { Play } from "../../../../types/play";

interface AdvancedOptionsSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  // Formation details
  formationType: string;
  formationDir: string;
  backAlign: string;
  backLeftOfQb: boolean;
  backRightOfQb: boolean;
  shift: string;
  motion: string;
  formationTags: string;
  runStrength: string;
  passStrength: string;
  onFormationTypeChange: (value: string) => void;
  onFormationDirChange: (value: string) => void;
  onBackAlignChange: (value: string) => void;
  onBackLeftOfQbChange: (value: boolean) => void;
  onBackRightOfQbChange: (value: boolean) => void;
  onShiftChange: (value: string) => void;
  onMotionChange: (value: string) => void;
  onFormationTagsChange: (value: string) => void;
  onRunStrengthChange: (value: string) => void;
  onPassStrengthChange: (value: string) => void;
  // Play details
  playDir: string;
  protection: string;
  checkInto: string;
  playTags: string;
  onPlayDirChange: (value: string) => void;
  onProtectionChange: (value: string) => void;
  onCheckIntoChange: (value: string) => void;
  onPlayTagsChange: (value: string) => void;
  // Confidence
  confidence: number;
  onConfidenceChange: (value: number) => void;
  // NEW: Play Metadata Arrays (October 17, 2025)
  tags: string[];
  key_positions: string[];
  key_players: string[];
  personnel?: string;
  playbookId?: string;
  onTagsChange: (tags: string[]) => void;
  onKeyPositionsChange: (positions: string[]) => void;
  onKeyPlayersChange: (players: string[]) => void;
  // Additional info
  oneWordPlay: string;
  wristbandNumber: string;
  description: string;
  onOneWordPlayChange: (value: string) => void;
  onWristbandNumberChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  // Constants
  directionOptions: Array<{ value: string; label: string }>;
  // NEW: Validation data
  existingPlays?: Play[];
}

export const AdvancedOptionsSection: React.FC<AdvancedOptionsSectionProps> = ({
  isOpen,
  onToggle,
  formationType,
  formationDir,
  backAlign,
  backLeftOfQb,
  backRightOfQb,
  shift,
  motion,
  formationTags,
  runStrength,
  passStrength,
  onFormationTypeChange,
  onFormationDirChange,
  onBackAlignChange,
  onBackLeftOfQbChange,
  onBackRightOfQbChange,
  onShiftChange,
  onMotionChange,
  onFormationTagsChange,
  onRunStrengthChange,
  onPassStrengthChange,
  playDir,
  protection,
  checkInto,
  playTags,
  onPlayDirChange,
  onProtectionChange,
  onCheckIntoChange,
  onPlayTagsChange,
  confidence,
  onConfidenceChange,
  // NEW: Play Metadata Arrays (October 17, 2025)
  tags,
  key_positions,
  key_players,
  personnel,
  playbookId,
  onTagsChange,
  onKeyPositionsChange,
  onKeyPlayersChange,
  oneWordPlay,
  wristbandNumber,
  description,
  onOneWordPlayChange,
  onWristbandNumberChange,
  onDescriptionChange,
  directionOptions,
  existingPlays = [],
}) => {
  // Extract unique field values for validation
  const fieldValues = usePlayFieldValues(existingPlays);

  // Fetch personnel configurations and roster data
  const { data: configurations } = usePersonnelConfigurations(playbookId);
  const { players: rosterPlayers } = useRosterData();

  // Find current personnel configuration
  const personnelConfig = React.useMemo(() => {
    if (!configurations || !personnel) return null;
    return configurations.find((config) => config.name === personnel);
  }, [configurations, personnel]);

  // Extract available positions from personnel config
  const availablePositions = React.useMemo(() => {
    if (!personnelConfig?.players) return [];
    return personnelConfig.players.map((p) => p.label); // ["Q", "R", "X", "Y", "Z"]
  }, [personnelConfig]);

  // Local state for TagInput (play variations)
  const [newTag, setNewTag] = React.useState("");

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onTagsChange([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag));
  };

  return (
    <div className="border-t border-secondary pt-lg">
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
        <div className="space-y-lg mt-lg">
          {/* Formation Details */}
          <div className="bg-secondary/30 rounded-lg p-md">
            <Typography
              variant="label-lg"
              className="flex items-center mb-sm text-primary"
            >
              <Icon name="target" className="h-4 w-4 mr-xs" />
              Formation Details
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
              <div>
                <ValidatedInput
                  label="Formation Type"
                  value={formationType}
                  onChange={(e) => onFormationTypeChange(e.target.value)}
                  placeholder="e.g., Spread, Tight, Balanced"
                  type="formationType"
                  existingValues={fieldValues.formationTypes}
                />
              </div>
              <div>
                <Typography
                  variant="label-md"
                  className="block mb-xs text-secondary"
                >
                  Direction
                </Typography>
                <select
                  value={formationDir}
                  onChange={(e) => onFormationDirChange(e.target.value)}
                  className="w-full px-sm py-xs text-sm border border-secondary rounded-lg focus:ring-2 focus:ring-text-info focus:border-bg-primary/0"
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
                  className="block mb-xs text-secondary"
                >
                  Backfield & Motion
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-xs">
                  <ValidatedInput
                    value={backAlign}
                    onChange={(e) => onBackAlignChange(e.target.value)}
                    placeholder="e.g., I-Formation, Shotgun"
                    type="backfieldAlignment"
                    existingValues={fieldValues.backfieldAlignments}
                  />
                  <ValidatedInput
                    value={shift}
                    onChange={(e) => onShiftChange(e.target.value)}
                    placeholder="e.g., Z-Motion, Jet"
                    type="shift"
                    existingValues={fieldValues.shifts}
                  />
                  <ValidatedInput
                    value={motion}
                    onChange={(e) => onMotionChange(e.target.value)}
                    placeholder="e.g., Orbit, Fly"
                    type="motion"
                    existingValues={fieldValues.motions}
                  />
                </div>
                {/* Back Position Modifiers */}
                <div className="flex items-center gap-sm mt-sm">
                  <label className="flex items-center gap-xs cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={backLeftOfQb}
                      onChange={(e) => onBackLeftOfQbChange(e.target.checked)}
                      className="w-4 h-4 text-primary-500 border-border rounded focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-sm group-hover:text-primary-600">
                      ← Back Left of QB
                    </span>
                  </label>
                  <label className="flex items-center gap-xs cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={backRightOfQb}
                      onChange={(e) => onBackRightOfQbChange(e.target.checked)}
                      className="w-4 h-4 text-primary-500 border-border rounded focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-sm group-hover:text-primary-600">
                      Back Right of QB →
                    </span>
                  </label>
                </div>
              </div>
              <div>
                <Typography
                  variant="label-md"
                  className="block mb-xs text-secondary"
                >
                  Formation Tags
                </Typography>
                <input
                  type="text"
                  value={formationTags}
                  onChange={(e) => onFormationTagsChange(e.target.value)}
                  placeholder="e.g., Nickel, Dime"
                  className="w-full px-sm py-xs text-sm border border-secondary rounded-lg focus:ring-2 focus:ring-text-info focus:border-bg-primary/0"
                />
              </div>
              <div>
                <Typography
                  variant="label-md"
                  className="block mb-xs text-secondary"
                >
                  Strength
                </Typography>
                <div className="grid grid-cols-2 gap-xs">
                  <input
                    type="text"
                    value={runStrength}
                    onChange={(e) => onRunStrengthChange(e.target.value)}
                    placeholder="Run strength"
                    className="px-sm py-xs text-sm border border-secondary rounded-lg focus:ring-2 focus:ring-text-info focus:border-bg-primary/0"
                  />
                  <input
                    type="text"
                    value={passStrength}
                    onChange={(e) => onPassStrengthChange(e.target.value)}
                    placeholder="Pass strength"
                    className="px-sm py-xs text-sm border border-secondary rounded-lg focus:ring-2 focus:ring-text-info focus:border-bg-primary/0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Play Details */}
          <div className="bg-secondary/30 rounded-lg p-md">
            <Typography
              variant="label-lg"
              className="flex items-center mb-sm text-primary"
            >
              <Icon name="hash" className="h-4 w-4 mr-xs" />
              Play Details
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
              <div>
                <Typography
                  variant="label-md"
                  className="block mb-xs text-secondary"
                >
                  Direction
                </Typography>
                <select
                  value={playDir}
                  onChange={(e) => onPlayDirChange(e.target.value)}
                  className="w-full px-sm py-xs text-sm border border-secondary rounded-lg focus:ring-2 focus:ring-text-info focus:border-bg-primary/0"
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
                <ValidatedInput
                  label="Pass Protection"
                  value={protection}
                  onChange={(e) => onProtectionChange(e.target.value)}
                  placeholder="e.g., 5-man, Slide, BOB"
                  type="protection"
                  existingValues={fieldValues.protections}
                />
              </div>
              <div>
                <Typography
                  variant="label-md"
                  className="block mb-xs text-secondary"
                >
                  Check Into
                </Typography>
                <input
                  type="text"
                  value={checkInto}
                  onChange={(e) => onCheckIntoChange(e.target.value)}
                  placeholder="e.g., Kill, Audible, Check"
                  className="w-full px-sm py-xs text-sm border border-secondary rounded-lg focus:ring-2 focus:ring-text-info focus:border-bg-primary/0"
                />
              </div>
              <div className="md:col-span-2">
                <Typography
                  variant="label-md"
                  className="block mb-xs text-secondary"
                >
                  Play Tags
                </Typography>
                <input
                  type="text"
                  value={playTags}
                  onChange={(e) => onPlayTagsChange(e.target.value)}
                  placeholder="e.g., Red Zone, 3rd&Short"
                  className="w-full px-sm py-xs text-sm border border-secondary rounded-lg focus:ring-2 focus:ring-text-info focus:border-bg-primary/0"
                />
              </div>
            </div>
          </div>

          {/* Confidence */}
          <div className="bg-secondary/30 rounded-lg p-md">
            <Typography
              variant="label-lg"
              className="block mb-sm text-primary"
            >
              Confidence Level
            </Typography>
            <div className="space-y-sm">
              <div className="flex items-center justify-between">
                <Typography variant="body-sm" className="text-secondary">
                  How confident are you in this play?
                </Typography>
                <span className="text-sm font-medium text-primary bg-primary px-xs py-xs rounded-lg">
                  {confidence}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={confidence}
                onChange={(e) => onConfidenceChange(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>
          </div>

          {/* Tags & Metadata */}
          <div className="bg-secondary/30 rounded-lg p-md">
            <Typography
              variant="label-lg"
              className="flex items-center mb-sm text-primary"
            >
              <Icon name="tag" className="h-4 w-4 mr-xs" />
              Tags & Metadata
            </Typography>
            <div className="space-y-md">
              {/* Play Variation Tags */}
              <TagInput
                label="Play Variations"
                tags={tags}
                newTagValue={newTag}
                onNewTagChange={setNewTag}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
                placeholder="Add variation (e.g., IZ Bubble, IZ Read)"
                maxTags={10}
              />

              {/* Key Positions */}
              <KeyPositionSelector
                positions={key_positions}
                personnelId={personnel}
                availablePositions={availablePositions}
                onAdd={(position: string) =>
                  onKeyPositionsChange([...key_positions, position])
                }
                onRemove={(index: number) =>
                  onKeyPositionsChange(
                    key_positions.filter((_, i) => i !== index)
                  )
                }
              />

              {/* Key Players */}
              <KeyPlayerSelector
                selectedPlayerIds={key_players}
                teamPlayers={rosterPlayers.map((p) => ({
                  id: p.id,
                  first_name: p.first_name || "",
                  last_name: p.last_name || "",
                  jersey_number: p.jersey_number || 0,
                  position: p.position || "",
                  is_active: p.is_active ?? true,
                }))}
                onAdd={(playerId: string) =>
                  onKeyPlayersChange([...key_players, playerId])
                }
                onRemove={(playerId: string) =>
                  onKeyPlayersChange(key_players.filter((p) => p !== playerId))
                }
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-secondary/30 rounded-lg p-md">
            <Typography
              variant="label-lg"
              className="block mb-sm text-primary"
            >
              Additional Information
            </Typography>
            <div className="space-y-sm">
              <div>
                <ValidatedInput
                  label="One Word Call"
                  value={oneWordPlay}
                  onChange={(e) => onOneWordPlayChange(e.target.value)}
                  placeholder="e.g., POWER, SLANT, GO"
                  type="oneWordPlay"
                  existingValues={fieldValues.oneWordPlays}
                  helperText="Uppercase sideline call name"
                />
              </div>
              <div>
                <ValidatedInput
                  label="Wristband Number"
                  value={wristbandNumber}
                  onChange={(e) => onWristbandNumberChange(e.target.value)}
                  placeholder="e.g., 23, 8A, Q12"
                  type="wristbandNumber"
                  existingValues={fieldValues.wristbandNumbers}
                  helperText="Must be unique"
                />
              </div>
              <div>
                <Typography
                  variant="label-md"
                  className="block mb-xs text-secondary"
                >
                  Description
                </Typography>
                <textarea
                  value={description}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  placeholder="Brief description of the play..."
                  rows={2}
                  className="w-full px-sm py-xs text-sm border border-secondary rounded-lg focus:ring-2 focus:ring-text-info focus:border-bg-primary/0 resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
