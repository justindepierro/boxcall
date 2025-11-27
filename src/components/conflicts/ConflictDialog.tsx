/**
 * ConflictDialog Component
 *
 * Shows conflict resolution UI when concurrent edits are detected.
 * Displays side-by-side comparison of conflicting changes.
 */

import { useState } from "react";
import type {
  ConflictResolution,
  ConflictResolutionStrategy,
} from "../../types/saveConflict";

interface ConflictDialogProps<T = Record<string, unknown>> {
  conflict: ConflictResolution<T>;
}

export function ConflictDialog<T extends Record<string, unknown>>({
  conflict,
}: ConflictDialogProps<T>) {
  const [selectedStrategy, setSelectedStrategy] =
    useState<ConflictResolutionStrategy>("keep-mine");
  const [customMerge, setCustomMerge] = useState<Partial<T>>({});

  const handleResolve = () => {
    if (selectedStrategy === "merge") {
      // Use custom merge data
      conflict.onResolve(selectedStrategy, {
        ...conflict.currentData,
        ...customMerge,
      } as T);
    } else {
      conflict.onResolve(selectedStrategy);
    }
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "(empty)";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  };

  const getFieldLabel = (field: string): string => {
    // Convert snake_case to Title Case
    return field
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) conflict.onCancel();
      }}
    >
      <div className="bg-primary border rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-warning-50 border-b border-warning-200 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-warning-900 flex items-center gap-2">
                <svg
                  className="w-5 h-5"
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
                Conflict Detected
              </h2>
              <p className="text-sm text-warning-700 mt-1">
                Someone else modified this {conflict.entityType} while you were
                editing. Choose how to resolve the conflict.
              </p>
            </div>
            <button
              onClick={conflict.onCancel}
              className="text-warning-600 hover:text-warning-800"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Strategy Selection */}
          <div className="mb-6">
            <label className="text-sm font-medium text-primary mb-2 block">
              Resolution Strategy:
            </label>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-secondary cursor-pointer">
                <input
                  type="radio"
                  name="strategy"
                  value="keep-mine"
                  checked={selectedStrategy === "keep-mine"}
                  onChange={(e) =>
                    setSelectedStrategy(
                      e.target.value as ConflictResolutionStrategy
                    )
                  }
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-primary">
                    Keep My Changes
                  </div>
                  <div className="text-sm text-secondary">
                    Overwrite the server version with your local changes
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-secondary cursor-pointer">
                <input
                  type="radio"
                  name="strategy"
                  value="use-theirs"
                  checked={selectedStrategy === "use-theirs"}
                  onChange={(e) =>
                    setSelectedStrategy(
                      e.target.value as ConflictResolutionStrategy
                    )
                  }
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-primary">
                    Use Their Changes
                  </div>
                  <div className="text-sm text-secondary">
                    Discard your changes and use the server version
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-secondary cursor-pointer">
                <input
                  type="radio"
                  name="strategy"
                  value="merge"
                  checked={selectedStrategy === "merge"}
                  onChange={(e) =>
                    setSelectedStrategy(
                      e.target.value as ConflictResolutionStrategy
                    )
                  }
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-primary">Merge Manually</div>
                  <div className="text-sm text-secondary">
                    Choose which changes to keep for each field
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Conflict Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary mb-2">
              Conflicting Fields ({conflict.conflicts.length}):
            </h3>

            {conflict.conflicts.map((fieldConflict) => (
              <div
                key={fieldConflict.field}
                className="border rounded-lg p-4 bg-secondary"
              >
                <div className="font-medium text-primary mb-3">
                  {getFieldLabel(fieldConflict.field)}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Your Version */}
                  <div>
                    <div className="text-xs font-medium text-secondary mb-1">
                      Your Version:
                    </div>
                    <div className="bg-primary border rounded p-2 text-sm font-mono text-primary break-all">
                      {formatValue(fieldConflict.yourValue)}
                    </div>
                    {selectedStrategy === "merge" && (
                      <button
                        onClick={() =>
                          setCustomMerge((prev) => ({
                            ...prev,
                            [fieldConflict.field]: fieldConflict.yourValue,
                          }))
                        }
                        className="mt-2 text-xs text-primary-600 hover:text-primary-800"
                      >
                        ← Use this value
                      </button>
                    )}
                  </div>

                  {/* Their Version */}
                  <div>
                    <div className="text-xs font-medium text-secondary mb-1">
                      Their Version:
                    </div>
                    <div className="bg-primary border rounded p-2 text-sm font-mono text-primary break-all">
                      {formatValue(fieldConflict.theirValue)}
                    </div>
                    {selectedStrategy === "merge" && (
                      <button
                        onClick={() =>
                          setCustomMerge((prev) => ({
                            ...prev,
                            [fieldConflict.field]: fieldConflict.theirValue,
                          }))
                        }
                        className="mt-2 text-xs text-primary-600 hover:text-primary-800"
                      >
                        Use this value →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-secondary p-4 flex items-center justify-between">
          <div className="text-sm text-secondary">
            Version conflict: Your v{conflict.yourVersion} vs Server v
            {conflict.currentVersion}
          </div>

          <div className="flex gap-2">
            <button
              onClick={conflict.onCancel}
              className="px-4 py-2 border rounded-lg text-secondary hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleResolve}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Resolve Conflict
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
