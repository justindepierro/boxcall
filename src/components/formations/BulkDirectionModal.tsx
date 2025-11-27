/**
 * BulkDirectionModal.tsx
 *
 * Modal for bulk setting formation direction.
 * Auto-creates opposite formations when needed.
 */

import React, { useState } from "react";
import { useBulkSetDirection } from "../../hooks/useFormations";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useToast } from "../../hooks/useToast";
import { error as logError } from "../../utils/logger";

interface BulkDirectionModalProps {
  playbookId: string;
  formationIds: string[];
  onClose: () => void;
}

export function BulkDirectionModal({
  playbookId,
  formationIds,
  onClose,
}: BulkDirectionModalProps): React.ReactElement {
  const { success, error: showError } = useToast();
  const bulkSetDirection = useBulkSetDirection(playbookId);

  const [direction, setDirection] = useState<"left" | "right" | "both">("left");
  const [autoCreateOpposites, setAutoCreateOpposites] = useState(true);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    try {
      const result = await bulkSetDirection.mutateAsync({
        formationIds,
        direction,
        autoCreateOpposites: direction === "both" ? autoCreateOpposites : false,
      });

      let message = `Set direction to "${direction}" for ${result.updated} formations`;
      if (result.created > 0) {
        message += `, created ${result.created} opposite formations`;
      }

      success(message);
      onClose();
    } catch (error) {
      showError("Failed to update formation directions");
      logError("[BulkDirectionModal] Bulk direction error:", error);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Set Direction for ${formationIds.length} Formation${formationIds.length !== 1 ? "s" : ""}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-md">
        {/* Direction Selection */}
        <div>
          <label className="block text-sm font-medium text-primary mb-sm">
            Formation Direction
          </label>
          <div className="space-y-sm">
            <label className="flex items-center gap-sm p-sm bg-subtle border border-primary rounded-md cursor-pointer hover:border-primary-500 transition-colors">
              <input
                type="radio"
                name="direction"
                value="left"
                checked={direction === "left"}
                onChange={() => setDirection("left")}
                className="text-primary-500"
              />
              <div>
                <div className="text-sm font-medium text-primary">
                  ⬅️ Left
                </div>
                <div className="text-xs text-muted">
                  Formation faces left
                </div>
              </div>
            </label>

            <label className="flex items-center gap-sm p-sm bg-subtle border border-primary rounded-md cursor-pointer hover:border-primary-500 transition-colors">
              <input
                type="radio"
                name="direction"
                value="right"
                checked={direction === "right"}
                onChange={() => setDirection("right")}
                className="text-primary-500"
              />
              <div>
                <div className="text-sm font-medium text-primary">
                  ➡️ Right
                </div>
                <div className="text-xs text-muted">
                  Formation faces right
                </div>
              </div>
            </label>

            <label className="flex items-center gap-sm p-sm bg-subtle border border-primary rounded-md cursor-pointer hover:border-primary-500 transition-colors">
              <input
                type="radio"
                name="direction"
                value="both"
                checked={direction === "both"}
                onChange={() => setDirection("both")}
                className="text-primary-500"
              />
              <div>
                <div className="text-sm font-medium text-primary">
                  ↔️ Both
                </div>
                <div className="text-xs text-muted">
                  Has both left and right variants
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Auto-create opposites option */}
        {direction === "both" && (
          <div className="p-sm bg-info-50 border border-info-200 rounded-md">
            <label className="flex items-start gap-sm cursor-pointer">
              <input
                type="checkbox"
                checked={autoCreateOpposites}
                onChange={(e) => setAutoCreateOpposites(e.target.checked)}
                className="mt-0.5 text-primary-500"
              />
              <div>
                <div className="text-sm font-medium text-primary">
                  Auto-create opposite formations
                </div>
                <div className="text-xs text-muted mt-xs">
                  Automatically create left/right pairs for formations that
                  don't have opposites yet
                </div>
              </div>
            </label>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-sm pt-md border-t border-muted">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={bulkSetDirection.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={bulkSetDirection.isPending}
            loading={bulkSetDirection.isPending}
          >
            Set Direction
          </Button>
        </div>
      </form>
    </Modal>
  );
}
