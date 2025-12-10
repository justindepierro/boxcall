/**
 * BulkMetadataModal.tsx
 *
 * Modal for bulk editing formation metadata.
 * Supports replace and merge modes for tags.
 */

import React, { useState } from "react";
import { useBulkUpdateMetadata } from "../../hooks/useFormations";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { FormSelect } from "../ui";
import { useToast } from "../../hooks/useToast";
import { error as logError } from "../../utils/logger";

interface BulkMetadataModalProps {
  playbookId: string;
  formationIds: string[];
  onClose: () => void;
}

export function BulkMetadataModal({
  playbookId,
  formationIds,
  onClose,
}: BulkMetadataModalProps): React.ReactElement {
  const { success, error: showError } = useToast();
  const bulkUpdate = useBulkUpdateMetadata(playbookId);

  const [category, setCategory] = useState("");
  const [personnelName, setPersonnelName] = useState("");
  const [tags, setTags] = useState("");
  const [formationType, setFormationType] = useState("");
  const [mode, setMode] = useState<"replace" | "merge">("replace");

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    const updates: any = {};
    if (category) updates.category = category;
    if (personnelName) updates.personnel_name = personnelName;
    if (tags)
      updates.tags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    if (formationType) updates.formation_type = formationType;

    try {
      await bulkUpdate.mutateAsync({
        formationIds,
        updates,
        mode,
      });

      success(`Successfully updated ${formationIds.length} formations`);
      onClose();
    } catch (error) {
      showError("Failed to update formations");
      logError("[BulkMetadataModal] Bulk update error:", error);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Edit ${formationIds.length} Formation${formationIds.length !== 1 ? "s" : ""}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-md">
        {/* Mode Selection */}
        <div className="flex items-center gap-md bg-subtle border border-muted rounded-md p-sm">
          <label className="flex items-center gap-xs cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="replace"
              checked={mode === "replace"}
              onChange={() => setMode("replace")}
              className="text-primary-500"
            />
            <span className="text-sm text-primary">
              Replace existing values
            </span>
          </label>
          <label className="flex items-center gap-xs cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="merge"
              checked={mode === "merge"}
              onChange={() => setMode("merge")}
              className="text-primary-500"
            />
            <span className="text-sm text-primary">Merge (tags only)</span>
          </label>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-primary mb-xs">
            Category
          </label>
          <FormSelect
            value={category}
            onChange={(value) => setCategory(value)}
            placeholder="-- Keep existing --"
            options={[
              { value: "run", label: "Run" },
              { value: "pass", label: "Pass" },
              { value: "special", label: "Special" },
            ]}
          />
        </div>

        {/* Personnel */}
        <div>
          <label className="block text-sm font-medium text-primary mb-xs">
            Personnel
          </label>
          <input
            type="text"
            value={personnelName}
            onChange={(e) => setPersonnelName(e.target.value)}
            placeholder="e.g., 11 Personnel"
            className="w-full px-sm py-xs border border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-primary mb-xs">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., spread, shotgun, empty"
            className="w-full px-sm py-xs border border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {mode === "merge" && (
            <p className="text-xs text-muted mt-xs">
              These tags will be added to existing tags
            </p>
          )}
        </div>

        {/* Formation Type */}
        <div>
          <label className="block text-sm font-medium text-primary mb-xs">
            Formation Type
          </label>
          <FormSelect
            value={formationType}
            onChange={(value) => setFormationType(value)}
            placeholder="-- Keep existing --"
            options={[
              { value: "standard", label: "Standard" },
              { value: "custom", label: "Custom" },
            ]}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-sm pt-md border-t border-muted">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={bulkUpdate.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={bulkUpdate.isPending}
            loading={bulkUpdate.isPending}
          >
            Update {formationIds.length} Formation
            {formationIds.length !== 1 ? "s" : ""}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
