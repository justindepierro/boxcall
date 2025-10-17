/**
 * BulkDeleteConfirmation.tsx
 *
 * Smart delete confirmation for bulk formation deletion.
 * Shows what will be deleted and handles opposite formations.
 */

import React, { useState } from "react";
import { useBulkDelete } from "../../hooks/useFormations";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useToast } from "../../hooks/useToast";
import { error as logError } from "../../utils/logger";

interface BulkDeleteConfirmationProps {
  playbookId: string;
  formationIds: string[];
  onClose: () => void;
  onConfirm: () => void;
}

export function BulkDeleteConfirmation({
  playbookId,
  formationIds,
  onClose,
  onConfirm,
}: BulkDeleteConfirmationProps): React.ReactElement {
  const { success, error: showError } = useToast();
  const bulkDelete = useBulkDelete(playbookId);

  const [deleteOpposites, setDeleteOpposites] = useState(false);

  const handleDelete = async (): Promise<void> => {
    try {
      const result = await bulkDelete.mutateAsync({
        formationIds,
        deleteOpposites,
      });

      success(
        `Deleted ${result.count} formation${result.count !== 1 ? "s" : ""}`
      );
      onConfirm();
    } catch (error) {
      showError("Failed to delete formations");
      logError("[BulkDeleteConfirmation] Bulk delete error:", error);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Delete Formations" size="md">
      <div className="space-y-spacing-md">
        {/* Warning */}
        <div className="p-spacing-md bg-error-50 border border-error-200 rounded-md">
          <div className="flex items-start gap-spacing-sm">
            <svg
              className="w-5 h-5 text-error-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <div className="text-sm font-medium text-error-800">
                You are about to delete {formationIds.length} formation
                {formationIds.length !== 1 ? "s" : ""}
              </div>
              <div className="text-xs text-error-700 mt-spacing-xs">
                This action cannot be undone. Any plays using these formations
                will need to be updated.
              </div>
            </div>
          </div>
        </div>

        {/* Delete opposites option */}
        <div className="p-spacing-sm surface-subtle border border-border-subtle rounded-md">
          <label className="flex items-start gap-spacing-sm cursor-pointer">
            <input
              type="checkbox"
              checked={deleteOpposites}
              onChange={(e) => setDeleteOpposites(e.target.checked)}
              className="mt-0.5 text-primary-500"
            />
            <div>
              <div className="text-sm font-medium text-text-primary">
                Also delete opposite formations
              </div>
              <div className="text-xs text-text-muted mt-spacing-xs">
                If checked, will also delete the linked left/right variants of
                these formations
              </div>
            </div>
          </label>
        </div>

        {/* Info */}
        <div className="text-xs text-text-muted">
          {deleteOpposites
            ? "This will delete the selected formations AND their opposite variants."
            : "This will only delete the selected formations. Their opposites will be unlinked."}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-spacing-sm pt-spacing-md border-t border-border-subtle">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={bulkDelete.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleDelete}
            disabled={bulkDelete.isPending}
            loading={bulkDelete.isPending}
            className="!bg-error-600 !hover:bg-error-700"
          >
            Delete {formationIds.length} Formation
            {formationIds.length !== 1 ? "s" : ""}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
