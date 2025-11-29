/**
 * Create Personnel Modal
 *
 * Simple modal for creating new personnel packages manually
 */

import React, { useState } from "react";
import { Icon } from "../../ui/Icon/Icon";
import { toast } from "sonner";
import { supabase } from "../../../lib/supabase";

interface CreatePersonnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  playbookId: string;
  onSuccess?: () => void;
}

export const CreatePersonnelModal: React.FC<CreatePersonnelModalProps> = ({
  isOpen,
  onClose,
  playbookId,
  onSuccess,
}) => {
  const [personnelName, setPersonnelName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    const name = personnelName.trim();
    
    if (!name) {
      toast.error("Personnel name is required");
      return;
    }

    try {
      setCreating(true);

      // Check if personnel already exists
      const { data: existing } = await supabase
        .from("personnel_configurations")
        .select("id")
        .eq("playbook_id", playbookId)
        .eq("name", name)
        .limit(1);

      if (existing && existing.length > 0) {
        toast.error("Personnel package with this name already exists");
        return;
      }

      // Create personnel configuration
      const { error } = await supabase.from("personnel_configurations").insert({
        playbook_id: playbookId,
        name: name,
        description: description.trim() || null,
        badge_customization: {
          color: "#10b981", // Default green
          textColor: "#ffffff",
        },
      });

      if (error) {
        console.error("Error creating personnel:", error);
        toast.error(`Failed to create personnel: ${error.message}`);
        return;
      }

      toast.success(`Created personnel package: ${name}`);
      setPersonnelName("");
      setDescription("");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error creating personnel:", error);
      toast.error("Failed to create personnel");
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-white dark:bg-gray-900 z-[70] shadow-2xl rounded-lg overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Icon name="plus" size="sm" className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Create Personnel Package
            </h3>
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
              Personnel Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={personnelName}
              onChange={(e) => setPersonnelName(e.target.value)}
              placeholder="e.g., Blue, Red, Eagles, 11, 12"
              className="input-field w-full"
              autoFocus
            />
            <p className="text-xs text-secondary mt-1">
              Any format works: colors, animals, numbers, words - whatever your team uses!
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., 3-4 defensive package, Wing-T offense, Spread formation"
              rows={2}
              className="input-field w-full resize-none"
            />
          </div>

          <div className="text-xs text-secondary space-y-1">
            <p>• Personnel will be available for use in plays</p>
            <p>• Default badge color: Green (customize in Personnel Builder)</p>
            <p>• Common packages: 11, 12, 21, 22, 10, 01, 13</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex gap-3 justify-end bg-gray-50 dark:bg-gray-800/50">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || !personnelName.trim()}
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
                Create Personnel
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};
