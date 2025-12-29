/**
 * FormationAdvancedSection - Advanced formation details
 *
 * Collapsible section containing rarely-used formation fields:
 * - Formation Type
 * - Backfield Alignment
 * - Shift/Motion
 * - Run/Pass Strength
 * - Back position modifiers
 * - Check Into (audible)
 */

import React from "react";
import { Typography } from "../../../design-system/Typography";
import { Icon } from "../../../ui/Icon/Icon";
import { Button } from "../../../ui/Button/Button";
import { ValidatedInput } from "../../ValidatedInput";
import type { Play } from "../../../../types/play";

interface FormationAdvancedSectionProps {
  isOpen: boolean;
  onToggle: () => void;

  // Formation details
  formationType: string;
  backAlign: string;
  shift: string;
  motion: string;
  runStrength: string;
  passStrength: string;
  backLeftOfQb: boolean;
  backRightOfQb: boolean;
  checkInto: string;

  // Change handlers
  onFormationTypeChange: (value: string) => void;
  onBackAlignChange: (value: string) => void;
  onShiftChange: (value: string) => void;
  onMotionChange: (value: string) => void;
  onRunStrengthChange: (value: string) => void;
  onPassStrengthChange: (value: string) => void;
  onBackLeftOfQbChange: (value: boolean) => void;
  onBackRightOfQbChange: (value: boolean) => void;
  onCheckIntoChange: (value: string) => void;

  // Confidence
  confidence: number;
  onConfidenceChange: (value: number) => void;

  // Validation
  existingPlays: Play[];
}

export const FormationAdvancedSection: React.FC<
  FormationAdvancedSectionProps
> = ({
  isOpen,
  onToggle,
  formationType,
  backAlign,
  shift,
  motion,
  runStrength,
  passStrength,
  backLeftOfQb,
  backRightOfQb,
  checkInto,
  onFormationTypeChange,
  onBackAlignChange,
  onShiftChange,
  onMotionChange,
  onRunStrengthChange,
  onPassStrengthChange,
  onBackLeftOfQbChange,
  onBackRightOfQbChange,
  onCheckIntoChange,
  confidence,
  onConfidenceChange,
  existingPlays,
}) => {
  // Extract unique values for validation
  const formationTypes = React.useMemo(
    () => [
      ...new Set(
        existingPlays.map((p) => p.f_type).filter(Boolean) as string[]
      ),
    ],
    [existingPlays]
  );
  const backAligns = React.useMemo(
    () => [
      ...new Set(
        existingPlays.map((p) => p.back_align).filter(Boolean) as string[]
      ),
    ],
    [existingPlays]
  );
  const shifts = React.useMemo(
    () => [
      ...new Set(existingPlays.map((p) => p.shift).filter(Boolean) as string[]),
    ],
    [existingPlays]
  );
  const motions = React.useMemo(
    () => [
      ...new Set(
        existingPlays.map((p) => p.motion).filter(Boolean) as string[]
      ),
    ],
    [existingPlays]
  );

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
          <div className="p-xs bg-purple-500/10 rounded-lg">
            <Icon name="settings" className="h-5 w-5 text-purple-600" />
          </div>
          <Typography variant="label-lg" className="text-primary font-semibold">
            Advanced Formation Details
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
          {/* Formation Type & Check Into */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
            <ValidatedInput
              label="Formation Type"
              value={formationType}
              onChange={(e) => onFormationTypeChange(e.target.value)}
              placeholder="e.g., Spread, Tight, Balanced"
              type="formationType"
              existingValues={formationTypes}
            />
            <div className="space-y-xs">
              <Typography variant="label-md" className="text-secondary">
                Check Into / Audible
              </Typography>
              <input
                type="text"
                value={checkInto}
                onChange={(e) => onCheckIntoChange(e.target.value)}
                placeholder="e.g., Kill, Alert, Check"
                className="w-full px-sm py-xs text-sm border border-secondary rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Backfield & Motion */}
          <div className="space-y-xs">
            <Typography variant="label-md" className="text-secondary">
              Backfield & Motion
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-xs">
              <ValidatedInput
                value={backAlign}
                onChange={(e) => onBackAlignChange(e.target.value)}
                placeholder="Back alignment"
                type="backfieldAlignment"
                existingValues={backAligns}
              />
              <ValidatedInput
                value={shift}
                onChange={(e) => onShiftChange(e.target.value)}
                placeholder="Shift"
                type="shift"
                existingValues={shifts}
              />
              <ValidatedInput
                value={motion}
                onChange={(e) => onMotionChange(e.target.value)}
                placeholder="Motion"
                type="motion"
                existingValues={motions}
              />
            </div>

            {/* Back Position Checkboxes */}
            <div className="flex items-center gap-md mt-sm">
              <label className="flex items-center gap-xs cursor-pointer group">
                <input
                  type="checkbox"
                  checked={backLeftOfQb}
                  onChange={(e) => onBackLeftOfQbChange(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-secondary focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-secondary group-hover:text-primary">
                  ← Back Left of QB
                </span>
              </label>
              <label className="flex items-center gap-xs cursor-pointer group">
                <input
                  type="checkbox"
                  checked={backRightOfQb}
                  onChange={(e) => onBackRightOfQbChange(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-secondary focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-secondary group-hover:text-primary">
                  Back Right of QB →
                </span>
              </label>
            </div>
          </div>

          {/* Strength */}
          <div className="space-y-xs">
            <Typography variant="label-md" className="text-secondary">
              Strength
            </Typography>
            <div className="grid grid-cols-2 gap-sm">
              <input
                type="text"
                value={runStrength}
                onChange={(e) => onRunStrengthChange(e.target.value)}
                placeholder="Run strength"
                className="px-sm py-xs text-sm border border-secondary rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <input
                type="text"
                value={passStrength}
                onChange={(e) => onPassStrengthChange(e.target.value)}
                placeholder="Pass strength"
                className="px-sm py-xs text-sm border border-secondary rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Confidence Slider */}
          <div className="space-y-xs">
            <div className="flex items-center justify-between">
              <Typography variant="label-md" className="text-secondary">
                Confidence Level
              </Typography>
              <span className="text-sm font-medium text-primary bg-primary/10 px-sm py-xs rounded-lg">
                {confidence}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={confidence}
              onChange={(e) => onConfidenceChange(Number(e.target.value))}
              className="w-full h-2 bg-surface-elevated rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-tertiary">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
