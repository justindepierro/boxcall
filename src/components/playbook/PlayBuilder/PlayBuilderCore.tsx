/**
 * Core Play Builder - Main container component
 * Database-aligned with clean architecture
 */

import React, { useState } from "react";
import { X, Save } from "lucide-react";
import type { Play } from "../../../types/play";
import { PlayBuilderForm } from "./PlayBuilderForm";
import { PlayBuilderPreview } from "./PlayBuilderPreview";
import { QuickEntry } from "./QuickEntry";

interface PlayBuilderCoreProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (play: Partial<Play>) => void;
  initialPlay?: Partial<Play>;
}

export const PlayBuilderCore: React.FC<PlayBuilderCoreProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPlay = {},
}) => {
  // Database-aligned play state (only valid fields)
  const [playData, setPlayData] = useState<Partial<Play>>({
    // Core required fields
    play_name: initialPlay.play_name || "",
    p_type: initialPlay.p_type || "Pass",
    formation: initialPlay.formation || "",

    // Optional database fields
    one_word_play: initialPlay.one_word_play || "",
    notes: initialPlay.notes || "",
    personnel: initialPlay.personnel || "",
    f_type: initialPlay.f_type || "",
    f_dir: initialPlay.f_dir || "",
    protection: initialPlay.protection || "",

    // Performance metrics
    confidence_base: initialPlay.confidence_base || 70,
    times_called: initialPlay.times_called || 0,
    times_successful: initialPlay.times_successful || 0,
    complexity_score: initialPlay.complexity_score || 1,

    // Metadata
    is_archived: initialPlay.is_archived || false,
  });

  const [isQuickEntryVisible, setIsQuickEntryVisible] = useState(false);

  const updateField = (field: keyof Play, value: string | number | boolean) => {
    setPlayData((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuickEntryParsed = (parsedData: Partial<Play>) => {
    setPlayData((prev) => ({ ...prev, ...parsedData }));
  };

  const handleSave = () => {
    // Validate required fields
    if (!playData.play_name?.trim()) {
      alert("Play name is required");
      return;
    }
    if (!playData.p_type) {
      alert("Play type is required");
      return;
    }
    if (!playData.formation?.trim()) {
      alert("Formation is required");
      return;
    }

    console.log("💾 Saving play data:", playData);
    onSave(playData);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  const isValid = !!(
    playData.play_name?.trim() &&
    playData.p_type &&
    playData.formation?.trim()
  );

  const validationErrors: string[] = [];
  if (!playData.play_name?.trim())
    validationErrors.push("Play name is required");
  if (!playData.p_type) validationErrors.push("Play type is required");
  if (!playData.formation?.trim())
    validationErrors.push("Formation is required");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900 bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {initialPlay?.id ? "Edit Play" : "Create New Play"}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Build your play with proper database fields
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="bg-white overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
              {/* Form Section - 2/3 width */}
              <div className="lg:col-span-2">
                <QuickEntry
                  onPlayParsed={handleQuickEntryParsed}
                  isVisible={isQuickEntryVisible}
                  onToggle={() => setIsQuickEntryVisible(!isQuickEntryVisible)}
                />

                <PlayBuilderForm
                  playData={playData}
                  onUpdateField={updateField}
                />
              </div>

              {/* Preview Section - 1/3 width */}
              <div className="lg:col-span-1">
                <PlayBuilderPreview
                  playData={playData}
                  isValid={isValid}
                  validationErrors={validationErrors}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              {isValid ? (
                <span className="text-emerald-600">✓ Ready to save</span>
              ) : (
                <span className="text-amber-600">
                  ⚠ Missing required fields
                </span>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!isValid}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {initialPlay?.id ? "Update Play" : "Create Play"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
