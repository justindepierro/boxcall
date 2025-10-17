/**
 * CreateOppositeFormationModal
 *
 * Automatic prompt shown after saving a formation to create its opposite-side variant.
 * Part of the simplified formation direction system.
 *
 * Features:
 * - Side-by-side preview of original and flipped formation
 * - Three action options: Create, Skip, or Mark as Standalone
 * - Auto-flips positions and strengths
 * - Bidirectional linking via database RPC
 * - Smart name detection for opposite formations (Twins Left → Twins Right, Rip → Liz, etc.)
 *
 * Design Goals:
 * - Simple 3-step workflow (create → save → prompt)
 * - Clear visual comparison
 * - Quick decision-making
 * - Intelligent name suggestions
 */

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal/Modal";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import { FormationService } from "../../services/formationService";
import { error as logError } from "../../utils/logger";
import type { Formation, FormationPlayerPosition } from "../../types/formation";

/**
 * Smart naming patterns for opposite formations
 * Detects common football formation naming conventions
 */
const NAMING_PATTERNS = [
  // Left/Right patterns
  { pattern: /\bLeft\b/gi, opposite: "Right", label: "Left → Right" },
  { pattern: /\bRight\b/gi, opposite: "Left", label: "Right → Left" },
  { pattern: /\bLT\b/g, opposite: "RT", label: "LT → RT" },
  { pattern: /\bRT\b/g, opposite: "LT", label: "RT → LT" },
  { pattern: /\bL\b/g, opposite: "R", label: "L → R" },
  { pattern: /\bR\b/g, opposite: "L", label: "R → L" },

  // Common football formation opposites
  { pattern: /\bRip\b/gi, opposite: "Liz", label: "Rip → Liz" },
  { pattern: /\bLiz\b/gi, opposite: "Rip", label: "Liz → Rip" },
  { pattern: /\bRed\b/gi, opposite: "Blue", label: "Red → Blue" },
  { pattern: /\bBlue\b/gi, opposite: "Red", label: "Blue → Red" },
  { pattern: /\bOpen\b/gi, opposite: "Closed", label: "Open → Closed" },
  { pattern: /\bClosed\b/gi, opposite: "Open", label: "Closed → Open" },
  { pattern: /\bStrong\b/gi, opposite: "Weak", label: "Strong → Weak" },
  { pattern: /\bWeak\b/gi, opposite: "Strong", label: "Weak → Strong" },
  { pattern: /\bOver\b/gi, opposite: "Under", label: "Over → Under" },
  { pattern: /\bUnder\b/gi, opposite: "Over", label: "Under → Over" },
];

/**
 * Suggest opposite formation name based on patterns
 * Returns suggested name and detected pattern (or null if no pattern found)
 */
function suggestOppositeName(originalName: string): {
  suggestedName: string | null;
  detectedPattern: string | null;
} {
  for (const { pattern, opposite, label } of NAMING_PATTERNS) {
    if (pattern.test(originalName)) {
      // Reset regex lastIndex (important for global regex)
      pattern.lastIndex = 0;

      const suggestedName = originalName.replace(pattern, opposite);

      // Only suggest if the name actually changed
      if (suggestedName !== originalName) {
        return { suggestedName, detectedPattern: label };
      }
    }
  }

  // No pattern detected - return null
  return { suggestedName: null, detectedPattern: null };
}

export interface CreateOppositeFormationModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close modal callback */
  onClose: () => void;
  /** The original formation that was just saved */
  originalFormation: Formation;
  /** Callback after successfully creating opposite */
  onOppositeCreated?: (oppositeFormation: Formation) => void;
  /** Callback after marking as standalone */
  onMarkedAsStandalone?: () => void;
}

/**
 * Mini canvas preview for formation positions
 */
const FormationPreview: React.FC<{
  positions: FormationPlayerPosition[];
  label: string;
  flipped?: boolean;
}> = ({ positions, label, flipped = false }) => {
  const FIELD_WIDTH = 53.3; // yards
  const FIELD_HEIGHT = 20; // yards (shortened for preview)
  const CANVAS_WIDTH = 280;
  const CANVAS_HEIGHT = 160;

  return (
    <div className="flex flex-col gap-spacing-sm">
      <Typography variant="label-md" className="text-center text-text-muted">
        {label}
        {flipped && " (Flipped)"}
      </Typography>
      <div className="relative surface-card border-2 border-border-subtle rounded-md overflow-hidden">
        {/* Field background */}
        <svg
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          className="bg-field-grass"
        >
          {/* Hash marks */}
          <line
            x1="0"
            y1={CANVAS_HEIGHT / 2}
            x2={CANVAS_WIDTH}
            y2={CANVAS_HEIGHT / 2}
            stroke="currentColor"
            strokeWidth="2"
            className="text-field-line opacity-30"
          />

          {/* Player positions */}
          {positions.map((pos, idx) => {
            const x = (pos.x / FIELD_WIDTH) * CANVAS_WIDTH;
            const y = (pos.y / FIELD_HEIGHT) * CANVAS_HEIGHT;

            return (
              <g key={idx}>
                {/* Player circle */}
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  fill="currentColor"
                  className="text-brand-jade"
                  stroke="white"
                  strokeWidth="2"
                />
                {/* Player label */}
                <text
                  x={x}
                  y={y + 1}
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {pos.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export const CreateOppositeFormationModal: React.FC<
  CreateOppositeFormationModalProps
> = ({
  isOpen,
  onClose,
  originalFormation,
  onOppositeCreated,
  onMarkedAsStandalone,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flippedPositions, setFlippedPositions] = useState<
    FormationPlayerPosition[]
  >([]);

  // Smart naming state
  const [customName, setCustomName] = useState<string>("");
  const [suggestedName, setSuggestedName] = useState<string | null>(null);
  const [detectedPattern, setDetectedPattern] = useState<string | null>(null);

  // Calculate flipped positions and suggested name
  useEffect(() => {
    if (originalFormation) {
      // Flip positions for preview
      const FIELD_WIDTH = 53.3;
      const flipped = originalFormation.player_positions.map((pos) => ({
        ...pos,
        x: FIELD_WIDTH - pos.x, // Flip horizontally
      }));
      setFlippedPositions(flipped);

      // Detect naming pattern and suggest opposite name
      const { suggestedName: suggested, detectedPattern: pattern } =
        suggestOppositeName(originalFormation.name);

      setSuggestedName(suggested);
      setDetectedPattern(pattern);

      // If we have a suggestion, use it as default; otherwise use original name
      setCustomName(suggested || originalFormation.name);
    }
  }, [originalFormation]);

  const handleCreateOpposite = async () => {
    setLoading(true);
    setError(null);

    try {
      // Pass custom name to service (uses original name if custom name matches or is empty)
      const nameToUse = customName.trim() || originalFormation.name;
      const opposite = await FormationService.createOppositeFormation(
        originalFormation.id,
        nameToUse
      );

      // Success!
      onOppositeCreated?.(opposite);
      onClose();
    } catch (err) {
      logError(
        "[CreateOppositeFormationModal] Failed to create opposite formation:",
        err
      );
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create opposite formation"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsStandalone = async () => {
    setLoading(true);
    setError(null);

    try {
      await FormationService.markAsStandalone(originalFormation.id);

      // Success!
      onMarkedAsStandalone?.();
      onClose();
    } catch (err) {
      logError(
        "[CreateOppositeFormationModal] Failed to mark as standalone:",
        err
      );
      setError(
        err instanceof Error ? err.message : "Failed to mark as standalone"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Just close - user can link later via manual linking
    onClose();
  };

  // Determine what direction the opposite would be
  const oppositeDirection =
    originalFormation.direction === "left"
      ? "right"
      : originalFormation.direction === "right"
        ? "left"
        : "right"; // Default for standalone

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Opposite-Side Formation?"
      size="xl"
      closeOnBackdropClick={false}
      closeOnEscape={!loading}
    >
      <div className="flex flex-col gap-spacing-lg p-spacing-lg">
        {/* Explanation */}
        <div className="flex flex-col gap-spacing-sm">
          <Typography variant="body" className="text-text-primary">
            <strong>{originalFormation.name}</strong> doesn't have an
            opposite-side version yet.
          </Typography>
          <Typography variant="body-sm" className="text-text-muted">
            Most formations need both left and right versions for your playbook.
            We can automatically create a flipped version for you.
          </Typography>
        </div>

        {/* Side-by-side preview */}
        <div className="grid grid-cols-2 gap-spacing-lg">
          <FormationPreview
            positions={originalFormation.player_positions}
            label={`Original (${originalFormation.direction || "Standalone"})`}
          />
          <FormationPreview
            positions={flippedPositions}
            label={`Opposite (${oppositeDirection})`}
            flipped
          />
        </div>

        {/* Smart naming section */}
        <div className="surface-subtle border border-border-subtle rounded-md p-spacing-md">
          <Typography
            variant="label-md"
            className="text-text-secondary mb-spacing-sm"
          >
            Formation Name
          </Typography>

          {/* Show detected pattern hint */}
          {suggestedName && detectedPattern && (
            <div className="flex items-start gap-spacing-xs mb-spacing-sm p-spacing-sm bg-info-50 border border-info-200 rounded">
              <span className="text-info-600">💡</span>
              <div className="flex-1">
                <Typography variant="body-sm" className="text-info-700">
                  <strong>Smart suggestion:</strong> Detected "{detectedPattern}
                  " pattern
                </Typography>
                <Typography variant="body-xs" className="text-info-600">
                  "{originalFormation.name}" → "{suggestedName}"
                </Typography>
              </div>
            </div>
          )}

          {/* Name input */}
          <div className="flex flex-col gap-spacing-xs">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Opposite formation name..."
              className="px-spacing-md py-spacing-sm border border-border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={loading}
            />
            <Typography variant="body-xs" className="text-text-muted">
              {!suggestedName ? (
                <>
                  No naming pattern detected. Using original name "
                  {originalFormation.name}".
                </>
              ) : customName === suggestedName ? (
                <>Using suggested name. You can edit it if needed.</>
              ) : (
                <>Custom name will be used for the opposite formation.</>
              )}
            </Typography>
          </div>
        </div>

        {/* Formation details */}
        <div className="surface-subtle border border-border-subtle rounded-md p-spacing-md">
          <div className="grid grid-cols-2 gap-spacing-md text-sm">
            <div>
              <Typography variant="label-md" className="text-text-muted">
                Personnel
              </Typography>
              <Typography variant="body-sm" className="text-text-primary">
                {originalFormation.personnel_name || "None"}
              </Typography>
            </div>
            <div>
              <Typography variant="label-md" className="text-text-muted">
                Category
              </Typography>
              <Typography variant="body-sm" className="text-text-primary">
                {originalFormation.category || "Uncategorized"}
              </Typography>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="surface-error border border-border-error rounded-md p-spacing-md">
            <Typography variant="body-sm" className="text-text-error">
              ❌ {error}
            </Typography>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-spacing-md">
          <Button
            variant="primary"
            size="lg"
            onClick={handleCreateOpposite}
            disabled={loading || !customName.trim()}
            fullWidth
          >
            {loading ? (
              "Creating..."
            ) : (
              <>
                ✅ Create "{customName || originalFormation.name}"
                {suggestedName &&
                  customName === suggestedName &&
                  " (Suggested)"}
              </>
            )}
          </Button>

          <div className="grid grid-cols-2 gap-spacing-md">
            <Button
              variant="secondary"
              size="lg"
              onClick={handleSkip}
              disabled={loading}
            >
              ⏭️ Skip for now
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={handleMarkAsStandalone}
              disabled={loading}
            >
              ❌ This formation doesn't need one
            </Button>
          </div>
        </div>

        {/* Help text */}
        <Typography variant="body-xs" className="text-text-muted text-center">
          You can always create or link formations later from the Formation
          Manager.
        </Typography>
      </div>
    </Modal>
  );
};
