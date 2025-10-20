/**
 * BulkActionToolbar.tsx
 *
 * Floating action bar that appears when formations are selected.
 * Provides bulk operations: edit metadata, set direction, delete.
 */

import React, { useState } from "react";
import { useBulkSelection } from "./BulkSelectionContext";
import { BulkMetadataModal } from "./BulkMetadataModal.tsx";
import { BulkDirectionModal } from "./BulkDirectionModal.tsx";
import { BulkDeleteConfirmation } from "./BulkDeleteConfirmation.tsx";

interface BulkActionToolbarProps {
  playbookId: string;
}

export function BulkActionToolbar({
  playbookId,
}: BulkActionToolbarProps): React.ReactElement | null {
  const { selectionCount, hasSelection, clearSelection, selectedIds } =
    useBulkSelection();

  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [showDirectionModal, setShowDirectionModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Don't render if nothing selected
  if (!hasSelection) {
    return null;
  }

  const selectedIdsArray = Array.from(selectedIds);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-border-primary shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Selection count */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-text-primary">
                {selectionCount} formation{selectionCount !== 1 ? "s" : ""}{" "}
                selected
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMetadataModal(true)}
                className="px-4 py-2 text-sm font-medium text-text-primary bg-white border border-border-primary rounded-md hover:bg-surface-secondary transition-colors"
              >
                📝 Edit Metadata
              </button>

              <button
                onClick={() => setShowDirectionModal(true)}
                className="px-4 py-2 text-sm font-medium text-text-primary bg-white border border-border-primary rounded-md hover:bg-surface-secondary transition-colors"
              >
                ↔️ Set Direction
              </button>

              <button
                onClick={() => setShowDeleteConfirmation(true)}
                className="px-4 py-2 text-sm font-medium text-error-600 bg-white border border-error-200 rounded-md hover:bg-error-bg transition-colors"
              >
                🗑️ Delete
              </button>

              <div className="w-px h-6 bg-border-subtle" />

              <button
                onClick={clearSelection}
                className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
              >
                ✕ Clear Selection
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showMetadataModal && (
        <BulkMetadataModal
          playbookId={playbookId}
          formationIds={selectedIdsArray}
          onClose={() => {
            setShowMetadataModal(false);
            clearSelection();
          }}
        />
      )}

      {showDirectionModal && (
        <BulkDirectionModal
          playbookId={playbookId}
          formationIds={selectedIdsArray}
          onClose={() => {
            setShowDirectionModal(false);
            clearSelection();
          }}
        />
      )}

      {showDeleteConfirmation && (
        <BulkDeleteConfirmation
          playbookId={playbookId}
          formationIds={selectedIdsArray}
          onClose={() => {
            setShowDeleteConfirmation(false);
          }}
          onConfirm={() => {
            setShowDeleteConfirmation(false);
            clearSelection();
          }}
        />
      )}
    </>
  );
}
