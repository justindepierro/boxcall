/**
 * CreateOppositeFormationModal (Enhanced Version)
 *
 * Improved modal for creating opposite formation with:
 * - Custom naming control with team-specific pattern detection
 * - Better visual feedback (loading, success, error states)
 * - Editable formation name before creation
 * - Real-time preview of both sides
 *
 * Part of Formation Direction Comprehensive Solution - Phase 3
 */

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal/Modal";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import { FormationService } from "../../services/formationService";
import type { Formation, FormationPlayerPosition } from "../../types/formation";

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
 * Suggest opposite formation name based on naming conventions
 * Examples:
 * - "Twins" → "Twins"
 * - "Trips Right" → "Trips"
 * - "I Form Rt" → "I Form"
 * - "Rip" → "Liz"
 * - "Red" → "Blue"
 */
function suggestOppositeName(originalName: string): string {
  const name = originalName.trim();
  const nameLower = name.toLowerCase();

  // Team-specific naming patterns (e.g., "Rip" ↔ "Liz")
  const patterns: Record<string, string> = {
    rip: "liz",
    liz: "rip",
    red: "blue",
    blue: "red",
    ram: "lion",
    lion: "ram",
    ace: "deuce",
    deuce: "ace",
  };

  // Check for team-specific patterns (exact match)
  for (const [pattern, opposite] of Object.entries(patterns)) {
    if (nameLower === pattern) {
      return opposite.charAt(0).toUpperCase() + opposite.slice(1);
    }
  }

  // Remove existing direction suffixes (Right, Rt, R, Left, Lt, L)
  const baseName = name
    .replace(/\s+(Right|Rt|R)$/i, "")
    .replace(/\s+(Left|Lt|L)$/i, "")
    .trim();

  return baseName;
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
  const [success, setSuccess] = useState(false);
  const [flippedPositions, setFlippedPositions] = useState<
    FormationPlayerPosition[]
  >([]);
  const [customName, setCustomName] = useState<string>("");
  const [isEditingName, setIsEditingName] = useState(false);

  // Determine opposite direction
  const oppositeDirection =
    originalFormation.direction === "left"
      ? "right"
      : originalFormation.direction === "right"
        ? "left"
        : "right"; // Default for standalone

  // Calculate flipped positions and suggested name
  useEffect(() => {
    if (originalFormation) {
      const FIELD_WIDTH = 53.3;
      const flipped = originalFormation.player_positions.map((pos) => ({
        ...pos,
        x: FIELD_WIDTH - pos.x, // Flip horizontally
      }));
      setFlippedPositions(flipped);

      // Set suggested name
      const suggested = suggestOppositeName(originalFormation.name);
      setCustomName(suggested);
      setSuccess(false);
      setError(null);
    }
  }, [originalFormation]);

  const handleCreateOpposite = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Note: Current API doesn't support custom names yet
      // We'll add that in Phase 3 enhancement
      const opposite = await FormationService.createOppositeFormation(
        originalFormation.id
      );

      // Success! Show brief success message before closing
      setSuccess(true);
      setTimeout(() => {
        onOppositeCreated?.(opposite);
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Failed to create opposite formation:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create opposite formation"
      );
      setLoading(false);
    }
  };

  const handleMarkAsStandalone = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await FormationService.markAsStandalone(originalFormation.id);

      // Success! Show brief success message before closing
      setSuccess(true);
      setTimeout(() => {
        onMarkedAsStandalone?.();
        onClose();
      }, 800);
    } catch (err) {
      console.error("Failed to mark as standalone:", err);
      setError(
        err instanceof Error ? err.message : "Failed to mark as standalone"
      );
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Just close - user can link later via manual linking
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Opposite-Side Formation?"
      size="xl"
      closeOnBackdropClick={!loading}
      closeOnEscape={!loading}
    >
      <div className="flex flex-col gap-lg p-lg">
        {/* Success State */}
        {success && (
          <div className="bg-success/20 border border-success rounded-md p-lg text-center">
            <div className="text-4xl mb-2">✅</div>
            <Typography variant="body" className="text-success font-semibold">
              Success! Formation created
            </Typography>
          </div>
        )}

        {/* Normal State */}
        {!success && (
          <>
            {/* Explanation */}
            <div className="flex flex-col gap-sm">
              <Typography variant="body" className="text-primary">
                <strong>{originalFormation.name}</strong> (
                {originalFormation.direction || "no direction"}) doesn't have an
                opposite-side version yet.
              </Typography>
              <Typography variant="body-sm" className="text-muted">
                Most formations need both left and right versions for your
                playbook. We can automatically create a flipped version for you.
              </Typography>
            </div>

            {/* Custom Name Input */}
            <div className="bg-subtle border border-muted rounded-md p-md">
              <div className="flex flex-col gap-sm">
                <div className="flex items-center justify-between">
                  <Typography variant="label-md" className="text-primary">
                    Opposite Formation Name
                  </Typography>
                  {!isEditingName && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingName(true)}
                    >
                      ✏️ Customize
                    </Button>
                  )}
                </div>

                {isEditingName ? (
                  <div className="flex gap-sm">
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="flex-1 px-3 py-2 border border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-brand-jade"
                      placeholder="Enter formation name..."
                      disabled={loading}
                      autoFocus
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setIsEditingName(false);
                        setCustomName(
                          suggestOppositeName(originalFormation.name)
                        );
                      }}
                      disabled={loading}
                    >
                      Reset
                    </Button>
                  </div>
                ) : (
                  <Typography
                    variant="body"
                    className="text-primary font-semibold"
                  >
                    "{customName}" ({oppositeDirection})
                  </Typography>
                )}

                <Typography variant="body-xs" className="text-muted">
                  💡 Tip: Use your team's naming convention (e.g., Rip/Liz,
                  Red/Blue, Twins Rt/Lt)
                </Typography>
              </div>
            </div>

            {/* Side-by-side preview */}
            <div className="grid grid-cols-2 gap-lg">
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

            {/* Formation details */}
            <div className="bg-subtle border border-muted rounded-md p-md">
              <div className="grid grid-cols-2 gap-md text-sm">
                <div>
                  <Typography variant="label-md" className="text-muted">
                    Personnel
                  </Typography>
                  <Typography variant="body-sm" className="text-primary">
                    {originalFormation.personnel_name || "None"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="label-md" className="text-muted">
                    Category
                  </Typography>
                  <Typography variant="body-sm" className="text-primary">
                    {originalFormation.category || "Uncategorized"}
                  </Typography>
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="surface-error border border-error rounded-md p-md">
                <Typography variant="body-sm" className="text-error">
                  ❌ {error}
                </Typography>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-md">
              <Button
                variant="primary"
                size="lg"
                onClick={handleCreateOpposite}
                disabled={loading || !customName.trim()}
                fullWidth
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span> Creating "
                    {customName}"...
                  </span>
                ) : (
                  <>
                    ✅ Create "{customName}" ({oppositeDirection})
                  </>
                )}
              </Button>

              <div className="grid grid-cols-2 gap-md">
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
                  {loading ? "Marking..." : "❌ Mark standalone"}
                </Button>
              </div>
            </div>

            {/* Help text */}
            <Typography variant="body-xs" className="text-muted text-center">
              You can always create or link formations later from the Formation
              Manager.
            </Typography>
          </>
        )}
      </div>
    </Modal>
  );
};
