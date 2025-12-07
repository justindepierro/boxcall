/**
 * Create Formation Modal
 *
 * Simple modal for creating new formations manually
 */

import React, { useState } from "react";
import { Icon } from "../../ui/Icon/Icon";
import { toast } from "sonner";
import { supabase } from "../../../lib/supabase";

interface CreateFormationModalProps {
  isOpen: boolean;
  onClose: () => void;
  playbookId: string;
  onSuccess?: () => void;
}

export const CreateFormationModal: React.FC<CreateFormationModalProps> = ({
  isOpen,
  onClose,
  playbookId,
  onSuccess,
}) => {
  const [formationName, setFormationName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!formationName.trim()) {
      toast.error("Formation name is required");
      return;
    }

    try {
      setCreating(true);

      // Check if formation already exists
      const { data: existing } = await supabase
        .from("formations")
        .select("id")
        .eq("playbook_id", playbookId)
        .ilike("name", formationName.trim())
        .limit(1);

      if (existing && existing.length > 0) {
        toast.error("Formation with this name already exists");
        return;
      }

      // Create formation
      const { error } = await supabase.from("formations").insert({
        playbook_id: playbookId,
        name: formationName.trim(),
        description: description.trim() || null,
        is_standalone: true,
        direction: null,
      });

      if (error) {
        console.error("Error creating formation:", error);
        toast.error(`Failed to create formation: ${error.message}`);
        return;
      }

      toast.success(`Created formation: ${formationName}`);
      setFormationName("");
      setDescription("");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error creating formation:", error);
      toast.error("Failed to create formation");
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-modal-backdrop animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-white dark:bg-gray-900 z-modal shadow-2xl rounded-lg overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-jade-600 to-jade-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Icon name="plus" size="sm" className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">Create Formation</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <Icon name="close" size="sm" className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Formation Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={formationName}
              onChange={(e) => setFormationName(e.target.value)}
              placeholder="e.g., Trips Right, Empty, I-Formation"
              className="input-field w-full"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this formation..."
              rows={3}
              className="input-field w-full resize-none"
            />
          </div>

          <div className="text-xs text-secondary space-y-1">
            <p>• Formation will be available for use in plays</p>
            <p>• Use "Import from Plays" to auto-create from existing plays</p>
            <p>
              • Use "Analyze Plays" to derive metadata like run/pass strength
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-divider flex gap-3 justify-end bg-surface-secondary">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || !formationName.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? (
              <>
                <Icon name="loader" size="sm" className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Icon name="check" size="sm" />
                Create Formation
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};
