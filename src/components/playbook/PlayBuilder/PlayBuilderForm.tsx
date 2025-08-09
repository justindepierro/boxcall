/**
 * Play Builder Form - Core form fields with text normalization
 * Only includes database-valid fields
 */

import React from "react";
import type { Play } from "../../../types/play";
import {
  normalizeText,
  normalizePlayName,
  normalizeFormation,
  normalizePersonnel,
  fuzzyMatch,
} from "../../../utils/textNormalization";

interface PlayBuilderFormProps {
  playData: Partial<Play>;
  onUpdateField: (field: keyof Play, value: string | number | boolean) => void;
}

export const PlayBuilderForm: React.FC<PlayBuilderFormProps> = ({
  playData,
  onUpdateField,
}) => {
  // Helper function for normalized input handling
  const handleNormalizedBlur = (
    field: keyof Play,
    value: string,
    normalizer: (input: string) => string
  ) => {
    const normalized = normalizer(value);
    if (normalized !== value) {
      onUpdateField(field, normalized);
    }
  };

  return (
    <div className="space-y-6">
      {/* Core Play Information */}
      <div className="bg-slate-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">
          Basic Play Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Play Name - Required */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Play Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={playData.play_name || ""}
              onChange={(e) => onUpdateField("play_name", e.target.value)}
              onBlur={(e) =>
                handleNormalizedBlur(
                  "play_name",
                  e.target.value,
                  normalizePlayName
                )
              }
              placeholder="e.g., Four Verticals, Power O, Quick Slant"
              className="playbuilder-input w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          {/* Play Type - Required */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Play Type <span className="text-red-500">*</span>
            </label>
            <select
              value={playData.p_type || ""}
              onChange={(e) => onUpdateField("p_type", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            >
              <option value="">Select play type</option>
              <option value="Pass">Pass</option>
              <option value="Run">Run</option>
              <option value="RPO">RPO (Run-Pass Option)</option>
              <option value="Play Action">Play Action</option>
            </select>
          </div>

          {/* Formation - Required */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Formation <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={playData.formation || ""}
              onChange={(e) => onUpdateField("formation", e.target.value)}
              onBlur={(e) =>
                handleNormalizedBlur(
                  "formation",
                  e.target.value,
                  normalizeFormation
                )
              }
              placeholder="e.g., Shotgun, I-Formation, Singleback"
              className="playbuilder-input w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          {/* One Word Call - Optional */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              One Word Call (Optional)
            </label>
            <input
              type="text"
              value={playData.one_word_play || ""}
              onChange={(e) => onUpdateField("one_word_play", e.target.value)}
              onBlur={(e) =>
                handleNormalizedBlur(
                  "one_word_play",
                  e.target.value,
                  normalizeText
                )
              }
              placeholder="e.g., Thunder, Smash, Quick"
              className="playbuilder-input w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Personnel */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Personnel Package
            </label>
            <select
              value={playData.personnel || ""}
              onChange={(e) => onUpdateField("personnel", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select personnel</option>
              <option value="11">11 Personnel (1 RB, 1 TE, 3 WR)</option>
              <option value="12">12 Personnel (1 RB, 2 TE, 2 WR)</option>
              <option value="21">21 Personnel (2 RB, 1 TE, 2 WR)</option>
              <option value="10">10 Personnel (1 RB, 0 TE, 4 WR)</option>
              <option value="01">01 Personnel (0 RB, 1 TE, 4 WR)</option>
              <option value="00">00 Personnel (0 RB, 0 TE, 5 WR)</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Play Notes
          </label>
          <textarea
            value={playData.notes || ""}
            onChange={(e) => onUpdateField("notes", e.target.value)}
            placeholder="Add coaching notes, key reads, or execution details..."
            rows={3}
            className="playbuilder-input w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Formation Details */}
      <div className="bg-slate-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">
          Formation Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Formation Type
            </label>
            <input
              type="text"
              value={playData.f_type || ""}
              onChange={(e) => onUpdateField("f_type", e.target.value)}
              onBlur={(e) =>
                handleNormalizedBlur("f_type", e.target.value, normalizeText)
              }
              placeholder="e.g., Trips Right, Bunch Left, Stack"
              className="playbuilder-input w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Formation Direction
            </label>
            <select
              value={playData.f_dir || ""}
              onChange={(e) => onUpdateField("f_dir", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select direction</option>
              <option value="Right">Right</option>
              <option value="Left">Left</option>
              <option value="Balanced">Balanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Protection
            </label>
            <input
              type="text"
              value={playData.protection || ""}
              onChange={(e) => onUpdateField("protection", e.target.value)}
              placeholder="e.g., 6-man protection, Max protect, Slide"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Performance Settings */}
      <div className="bg-slate-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">
          Performance & Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Confidence Level (1-100)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={playData.confidence_base || 70}
              onChange={(e) =>
                onUpdateField("confidence_base", parseInt(e.target.value) || 70)
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Your confidence in executing this play
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Complexity Score (1-5)
            </label>
            <select
              value={playData.complexity_score || 1}
              onChange={(e) =>
                onUpdateField("complexity_score", parseInt(e.target.value) || 1)
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value={1}>1 - Very Simple</option>
              <option value={2}>2 - Simple</option>
              <option value={3}>3 - Moderate</option>
              <option value={4}>4 - Complex</option>
              <option value={5}>5 - Very Complex</option>
            </select>
          </div>
        </div>

        {/* Archive option */}
        <div className="mt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={playData.is_archived || false}
              onChange={(e) => onUpdateField("is_archived", e.target.checked)}
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
            />
            <span className="text-sm font-medium text-slate-700">
              Archive this play
            </span>
          </label>
          <p className="text-xs text-slate-500 mt-1">
            Archived plays won't appear in regular playbook views
          </p>
        </div>
      </div>
    </div>
  );
};
