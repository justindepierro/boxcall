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
import { isColorBadgeCustomization } from "../../../types/personnel";
import { logError } from "../../../utils/logger";
import {
  PERSONNEL_BADGE_PRESETS,
  DEFAULT_BADGE_COLORS,
  CHART_COLORS,
} from "../../../design-system/chartColors";

interface EditPersonnelBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnel: PersonnelConfiguration;
  onSuccess: () => void;
}

// Use centralized badge color presets
const COLOR_PRESETS = PERSONNEL_BADGE_PRESETS;

export const EditPersonnelBadgeModal: React.FC<
  EditPersonnelBadgeModalProps
> = ({ isOpen, onClose, personnel, onSuccess }) => {
  const existingBadge = personnel.badgeCustomization;
  const [backgroundColor, setBackgroundColor] = useState(
    isColorBadgeCustomization(existingBadge)
      ? existingBadge.backgroundColor
      : DEFAULT_BADGE_COLORS.bg
  );
  const [textColor, setTextColor] = useState(
    isColorBadgeCustomization(existingBadge)
      ? existingBadge.textColor
      : DEFAULT_BADGE_COLORS.text
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
      logError("Error updating badge:", error);
      toast.error("Failed to update badge colors");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-modal-backdrop animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-white dark:bg-navy-900 z-modal shadow-2xl rounded-xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
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
              className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
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
                        ? CHART_COLORS.purple
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
                placeholder={DEFAULT_BADGE_COLORS.bg}
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
                placeholder={DEFAULT_BADGE_COLORS.text}
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
