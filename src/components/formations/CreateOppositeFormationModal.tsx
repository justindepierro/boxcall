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
    <div className="flex flex-col gap-sm">
      <Typography variant="label-md" className="text-center text-muted">
        {label}
        {flipped && " (Flipped)"}
      </Typography>
      <div className="relative bg-primary border-2 border-muted rounded-md overflow-hidden">
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
      const { suggestedName: suggested } = suggestOppositeName(
        originalFormation.name
      );

      setSuggestedName(suggested);

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
      <div className="flex flex-col gap-lg p-lg">
        {/* Clear Explanation */}
        <div className="flex items-start gap-md p-md bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-3xl">🔄</div>
          <div className="flex-1">
            <Typography
              variant="body-md"
              className="text-blue-900 font-semibold mb-xs"
            >
              Create a Flipped Version of "{originalFormation.name}"
            </Typography>
            <Typography variant="body-sm" className="text-blue-700">
              Most formations need both left and right versions. We'll
              automatically flip all player positions horizontally to create the
              opposite-side formation.
            </Typography>
          </div>
        </div>

        {/* Side-by-side preview with better labels */}
        <div>
          <Typography
            variant="label-md"
            className="text-secondary mb-sm"
          >
            Preview: Side-by-Side Comparison
          </Typography>
          <div className="grid grid-cols-2 gap-md">
            <div className="flex flex-col items-center">
              <Typography
                variant="body-sm"
                className="text-primary font-semibold mb-xs"
              >
                ✅ Current Formation
              </Typography>
              <FormationPreview
                positions={originalFormation.player_positions}
                label={originalFormation.name}
              />
              <Typography variant="caption" className="text-muted mt-1">
                {originalFormation.direction === "left" && "← Left side"}
                {originalFormation.direction === "right" && "Right side →"}
                {!originalFormation.direction && "No direction set"}
              </Typography>
            </div>

            <div className="flex flex-col items-center">
              <Typography
                variant="body-sm"
                className="text-primary-600 font-semibold mb-xs"
              >
                🆕 New Formation (Flipped)
              </Typography>
              <FormationPreview
                positions={flippedPositions}
                label={customName || suggestedName || originalFormation.name}
                flipped
              />
              <Typography variant="caption" className="text-muted mt-1">
                {oppositeDirection === "left" && "← Left side"}
                {oppositeDirection === "right" && "Right side →"}
              </Typography>
            </div>
          </div>
        </div>

        {/* Simplified naming section */}
        <div className="bg-secondary border border-primary rounded-md p-md">
          <div className="flex items-center justify-between mb-sm">
            <Typography
              variant="label-md"
              className="text-primary font-semibold"
            >
              Name for New Formation
            </Typography>
            {suggestedName && suggestedName !== originalFormation.name && (
              <button
                onClick={() => setCustomName(suggestedName)}
                className="text-xs text-primary-600 hover:text-primary-700 underline"
                type="button"
              >
                Use suggestion: "{suggestedName}"
              </button>
            )}
          </div>

          {/* Name input */}
          <div className="flex flex-col gap-xs">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Enter name for opposite formation..."
              className="w-full px-md py-sm border-2 border-primary rounded-md bg-primary text-primary text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={loading}
            />
            <Typography variant="body-xs" className="text-muted">
              {!suggestedName || suggestedName === originalFormation.name ? (
                <>
                  💡 Tip: Name it differently from "{originalFormation.name}"
                  (e.g., "Lake", "{originalFormation.name} Right", etc.)
                </>
              ) : customName === suggestedName ? (
                <>✨ Smart suggestion applied. Feel free to edit the name.</>
              ) : (
                <>Custom name will be used for the opposite formation.</>
              )}
            </Typography>
          </div>
        </div>

        {/* What will be copied */}
        <div className="bg-success-bg border border-success-border rounded-md p-md">
          <Typography
            variant="label-md"
            className="text-success font-semibold mb-sm flex items-center gap-2"
          >
            <span>✓</span> What Gets Copied to New Formation
          </Typography>
          <div className="grid grid-cols-2 gap-md text-sm">
            <div>
              <Typography variant="caption" className="text-success">
                Personnel:
              </Typography>
              <Typography
                variant="body-sm"
                className="text-primary font-medium"
              >
                {originalFormation.personnel_name || "None"}
              </Typography>
            </div>
            <div>
              <Typography variant="caption" className="text-success">
                Category:
              </Typography>
              <Typography
                variant="body-sm"
                className="text-primary font-medium"
              >
                {originalFormation.category || "Uncategorized"}
              </Typography>
            </div>
          </div>
          <Typography
            variant="caption"
            className="text-success mt-2 block"
          >
            ⚡ Player positions will be flipped horizontally
          </Typography>
        </div>

        {/* Error message */}
        {error && (
          <div className="surface-error border border-error rounded-md p-md">
            <Typography variant="body-sm" className="text-error">
              ❌ {error}
            </Typography>
          </div>
        )}

        {/* Action buttons with clearer labels */}
        <div className="flex flex-col gap-sm pt-md border-t border-primary">
          <Button
            variant="primary"
            size="lg"
            onClick={handleCreateOpposite}
            disabled={loading || !customName.trim()}
            fullWidth
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Creating flipped
                formation...
              </span>
            ) : (
              <span className="font-semibold">
                ✅ Create "{customName || originalFormation.name}"
              </span>
            )}
          </Button>

          <div className="grid grid-cols-2 gap-sm">
            <Button
              variant="outline"
              size="md"
              onClick={handleSkip}
              disabled={loading}
            >
              ⏭️ Skip (do later)
            </Button>

            <Button
              variant="ghost"
              size="md"
              onClick={handleMarkAsStandalone}
              disabled={loading}
            >
              ❌ Don't need opposite
            </Button>
          </div>

          <Typography
            variant="caption"
            className="text-muted text-center mt-2"
          >
            💡 You can create or link formations later in the Formation Manager
          </Typography>
        </div>
      </div>
    </Modal>
  );
};
