/**
 * QuickDetailsSection - Commonly used play details
 *
 * Contains fields coaches frequently fill out:
 * - One Word Call (sideline call name)
 * - Protection scheme
 * - Wristband Number
 * - Notes/Description
 */

import React from "react";
import { Typography } from "../../../design-system/Typography";
import { Icon } from "../../../ui/Icon/Icon";
import { ValidatedInput } from "../../ValidatedInput";
import type { Play } from "../../../../types/play";

interface QuickDetailsSectionProps {
  oneWordPlay: string;
  protection: string;
  wristbandNumber: string;
  notes: string;
  onOneWordPlayChange: (value: string) => void;
  onProtectionChange: (value: string) => void;
  onWristbandNumberChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  existingPlays: Play[];
}

export const QuickDetailsSection: React.FC<QuickDetailsSectionProps> = ({
  oneWordPlay,
  protection,
  wristbandNumber,
  notes,
  onOneWordPlayChange,
  onProtectionChange,
  onWristbandNumberChange,
  onNotesChange,
  existingPlays,
}) => {
  // Extract unique values for validation
  const existingOneWordPlays = React.useMemo(
    () => [
      ...new Set(
        existingPlays.map((p) => p.one_word_play).filter(Boolean) as string[]
      ),
    ],
    [existingPlays]
  );
  const existingProtections = React.useMemo(
    () => [
      ...new Set(
        existingPlays.map((p) => p.protection).filter(Boolean) as string[]
      ),
    ],
    [existingPlays]
  );
  const existingWristbandNumbers = React.useMemo(
    () => [
      ...new Set(
        existingPlays.map((p) => p.wristband_number).filter(Boolean) as string[]
      ),
    ],
    [existingPlays]
  );

  return (
    <div className="space-y-md">
      {/* Section Header */}
      <div className="flex items-center gap-sm">
        <div className="p-xs bg-warning-500/10 rounded-lg">
          <Icon name="zap" className="h-5 w-5 text-warning-600" />
        </div>
        <Typography variant="label-lg" className="text-primary font-semibold">
          Quick Reference
        </Typography>
      </div>

      {/* Two-column grid for compact layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
        {/* One Word Call */}
        <ValidatedInput
          label="One Word Call"
          value={oneWordPlay}
          onChange={(e) => onOneWordPlayChange(e.target.value)}
          placeholder="e.g., POWER, SLANT, GO"
          type="oneWordPlay"
          existingValues={existingOneWordPlays}
          helperText="Uppercase sideline call"
        />

        {/* Protection */}
        <ValidatedInput
          label="Protection"
          value={protection}
          onChange={(e) => onProtectionChange(e.target.value)}
          placeholder="e.g., 5-man, Slide, BOB"
          type="protection"
          existingValues={existingProtections}
        />

        {/* Wristband Number */}
        <ValidatedInput
          label="Wristband #"
          value={wristbandNumber}
          onChange={(e) => onWristbandNumberChange(e.target.value)}
          placeholder="e.g., 23, 8A, Q12"
          type="wristbandNumber"
          existingValues={existingWristbandNumbers}
          helperText="Must be unique"
        />
      </div>

      {/* Notes - Full width */}
      <div className="space-y-xs">
        <Typography variant="label-md" className="text-secondary">
          Coaching Notes
        </Typography>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Key coaching points, reads, progressions..."
          rows={3}
          className="w-full px-sm py-xs text-sm border border-secondary rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        />
      </div>
    </div>
  );
};
