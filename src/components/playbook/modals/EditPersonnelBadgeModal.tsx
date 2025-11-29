/**
 * Edit Personnel Badge Modal
 *
 * Modal for customizing personnel badge colors (background + text).
 * Similar to formation badge customization but for personnel packages.
 */

import React, { useState } from "react";
import { Icon } from "../../ui/Icon/Icon";
import { toast } from "sonner";
import { PersonnelLibraryService } from "../../../services/personnelLibrary/PersonnelLibraryService";
import type { PersonnelConfiguration } from "../../../types/personnel";

interface EditPersonnelBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnel: PersonnelConfiguration;
  onSuccess: () => void;
}

const COLOR_PRESETS = [
  { name: "Green", bg: "#10b981", text: "#ffffff" },
  { name: "Orange", bg: "#f97316", text: "#ffffff" },
  { name: "Purple", bg: "#9333ea", text: "#ffffff" },
  { name: "Blue", bg: "#3b82f6", text: "#ffffff" },
  { name: "Red", bg: "#ef4444", text: "#ffffff" },
  { name: "Yellow", bg: "#eab308", text: "#000000" },
  { name: "Pink", bg: "#ec4899", text: "#ffffff" },
  { name: "Indigo", bg: "#6366f1", text: "#ffffff" },
  { name: "Teal", bg: "#14b8a6", text: "#ffffff" },
  { name: "Gray", bg: "#6b7280", text: "#ffffff" },
  { name: "Black", bg: "#000000", text: "#ffffff" },
  { name: "White", bg: "#ffffff", text: "#000000" },
];

export const EditPersonnelBadgeModal: React.FC<
  EditPersonnelBadgeModalProps
> = ({ isOpen, onClose, personnel, onSuccess }) => {
  const existingBadge = personnel.badgeCustomization as any;
  const [backgroundColor, setBackgroundColor] = useState(
    existingBadge?.backgroundColor || "#10b981"
  );
  const [textColor, setTextColor] = useState(
    existingBadge?.textColor || "#ffffff"
  );
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      await PersonnelLibraryService.updateBadgeCustomization(personnel.id, {
        backgroundColor,
        textColor,
      });

      toast.success("Badge colors updated!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating badge:", error);
      toast.error("Failed to update badge colors");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-white dark:bg-gray-900 z-[70] shadow-2xl rounded-xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Icon name="settings" size="lg" className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Customize Badge
                </h2>
                <p className="text-sm text-white/80 mt-1">{personnel.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <Icon name="close" size="md" className="text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Preview */}
          <div className="text-center">
            <p className="text-sm text-secondary mb-3">Preview</p>
            <div className="inline-flex items-center justify-center">
              <div
                className="px-6 py-3 rounded-lg text-lg font-bold shadow-lg"
                style={{
                  backgroundColor,
                  color: textColor,
                  boxShadow: `0 4px 6px -1px ${backgroundColor}33, 0 2px 4px -1px ${backgroundColor}22`,
                }}
              >
                {personnel.name}
              </div>
            </div>
          </div>

          {/* Color Presets */}
          <div>
            <label className="text-sm font-medium text-primary mb-2 block">
              Quick Colors
            </label>
            <div className="grid grid-cols-6 gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setBackgroundColor(preset.bg);
                    setTextColor(preset.text);
                  }}
                  className="aspect-square rounded-lg border-2 hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: preset.bg,
                    borderColor:
                      preset.bg === backgroundColor
                        ? "#9333ea"
                        : "transparent",
                  }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>

          {/* Custom Background Color */}
          <div>
            <label className="text-sm font-medium text-primary mb-2 block">
              Background Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-12 h-12 rounded-lg border-2 border-divider cursor-pointer"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="input-field flex-1"
                placeholder="#10b981"
              />
            </div>
          </div>

          {/* Custom Text Color */}
          <div>
            <label className="text-sm font-medium text-primary mb-2 block">
              Text Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-12 h-12 rounded-lg border-2 border-divider cursor-pointer"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="input-field flex-1"
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-divider p-4 flex items-center justify-end gap-2 bg-surface-muted">
          <button
            onClick={onClose}
            className="btn-secondary px-4 py-2"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary px-4 py-2 flex items-center gap-2"
            disabled={saving}
          >
            {saving ? (
              <>
                <Icon name="loader" size="sm" className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Icon name="save" size="sm" />
                Save Colors
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};
