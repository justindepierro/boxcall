/**
 * PlayBuilderForm - Clean, organized form with smart text normalization
 * Features MonoSpace fonts, consistent styling, and intuitive field grouping
 */

import React from "react";
import type { Play } from "../../../types/play";
import {
  normalizeText,
  normalizePlayName,
  normalizeFormation,
} from "../../../utils/textNormalization";

interface PlayBuilderFormProps {
  playData: Partial<Play>;
  onUpdateField: (field: keyof Play, value: string | number | boolean) => void;
}

// Shared form styles for consistency
const formStyles = {
  section: "bg-white rounded-lg border border-slate-200 p-6 space-y-4",
  sectionTitle:
    "text-lg font-semibold text-slate-900 pb-2 border-b border-slate-200",
  label: "block text-sm font-medium text-slate-700 mb-1.5",
  required: "text-red-500 ml-1",
  input:
    "playbuilder-input w-full px-3 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors",
  select:
    "w-full px-3 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-colors",
  textarea:
    "playbuilder-input w-full px-3 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none transition-colors",
  helpText: "text-xs text-slate-500 mt-1",
  grid: "grid grid-cols-1 md:grid-cols-2 gap-4",
  gridFull: "md:col-span-2",
};

export const PlayBuilderForm: React.FC<PlayBuilderFormProps> = ({
  playData,
  onUpdateField,
}) => {
  // Helper for normalized text input handling
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
      {/* === CORE PLAY INFORMATION === */}
      <div className={formStyles.section}>
        <h3 className={formStyles.sectionTitle}>Essential Play Details</h3>

        <div className={formStyles.grid}>
          {/* Play Name - Required Field */}
          <div className={formStyles.gridFull}>
            <label className={formStyles.label}>
              Play Name<span className={formStyles.required}>*</span>
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
              placeholder="Four Verticals, Power O, Quick Slant..."
              className={formStyles.input}
              required
            />
            <p className={formStyles.helpText}>
              The primary name coaches and players will use
            </p>
          </div>

          {/* Play Type - Required */}
          <div>
            <label className={formStyles.label}>
              Play Type<span className={formStyles.required}>*</span>
            </label>
            <select
              value={playData.p_type || ""}
              onChange={(e) => onUpdateField("p_type", e.target.value)}
              className={formStyles.select}
              required
            >
              <option value="">Choose play type</option>
              <option value="Pass">Pass</option>
              <option value="Run">Run</option>
              <option value="RPO">RPO (Run-Pass Option)</option>
              <option value="Play Action">Play Action</option>
            </select>
          </div>

          {/* Formation - Required */}
          <div>
            <label className={formStyles.label}>
              Formation<span className={formStyles.required}>*</span>
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
              placeholder="Shotgun, I-Formation, Singleback..."
              className={formStyles.input}
              required
            />
          </div>

          {/* Personnel Package */}
          <div>
            <label className={formStyles.label}>Personnel Package</label>
            <select
              value={playData.personnel || ""}
              onChange={(e) => onUpdateField("personnel", e.target.value)}
              className={formStyles.select}
            >
              <option value="">Choose personnel</option>
              <option value="11">11 Personnel (1 RB, 1 TE, 3 WR)</option>
              <option value="12">12 Personnel (1 RB, 2 TE, 2 WR)</option>
              <option value="21">21 Personnel (2 RB, 1 TE, 2 WR)</option>
              <option value="10">10 Personnel (1 RB, 0 TE, 4 WR)</option>
              <option value="01">01 Personnel (0 RB, 1 TE, 4 WR)</option>
              <option value="00">00 Personnel (0 RB, 0 TE, 5 WR)</option>
            </select>
          </div>

          {/* One Word Call */}
          <div>
            <label className={formStyles.label}>Quick Call (Optional)</label>
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
              placeholder="Thunder, Smash, Quick..."
              className={formStyles.input}
            />
            <p className={formStyles.helpText}>
              Single word for quick sideline calls
            </p>
          </div>
        </div>

        {/* Play Notes */}
        <div>
          <label className={formStyles.label}>Coaching Notes</label>
          <textarea
            value={playData.notes || ""}
            onChange={(e) => onUpdateField("notes", e.target.value)}
            placeholder="Key coaching points, reads, execution details..."
            rows={3}
            className={formStyles.textarea}
          />
        </div>
      </div>

      {/* === FORMATION DETAILS === */}
      <div className={formStyles.section}>
        <h3 className={formStyles.sectionTitle}>Formation & Protection</h3>

        <div className={formStyles.grid}>
          <div>
            <label className={formStyles.label}>Formation Type</label>
            <input
              type="text"
              value={playData.f_type || ""}
              onChange={(e) => onUpdateField("f_type", e.target.value)}
              onBlur={(e) =>
                handleNormalizedBlur("f_type", e.target.value, normalizeText)
              }
              placeholder="Trips Right, Bunch Left, Stack..."
              className={formStyles.input}
            />
          </div>

          <div>
            <label className={formStyles.label}>Formation Direction</label>
            <select
              value={playData.f_dir || ""}
              onChange={(e) => onUpdateField("f_dir", e.target.value)}
              className={formStyles.select}
            >
              <option value="">Choose direction</option>
              <option value="Right">Right</option>
              <option value="Left">Left</option>
              <option value="Balanced">Balanced</option>
            </select>
          </div>

          <div className={formStyles.gridFull}>
            <label className={formStyles.label}>Protection Scheme</label>
            <input
              type="text"
              value={playData.protection || ""}
              onChange={(e) => onUpdateField("protection", e.target.value)}
              placeholder="6-man protection, Max protect, Slide left..."
              className={formStyles.input}
            />
            <p className={formStyles.helpText}>
              Blocking scheme and protection calls
            </p>
          </div>
        </div>
      </div>

      {/* === PERFORMANCE & SETTINGS === */}
      <div className={formStyles.section}>
        <h3 className={formStyles.sectionTitle}>Performance Metrics</h3>

        <div className={formStyles.grid}>
          <div>
            <label className={formStyles.label}>Confidence Level</label>
            <input
              type="number"
              min="1"
              max="100"
              value={playData.confidence_base || 70}
              onChange={(e) =>
                onUpdateField("confidence_base", parseInt(e.target.value) || 70)
              }
              className={formStyles.input}
            />
            <p className={formStyles.helpText}>
              Your confidence executing this play (1-100)
            </p>
          </div>

          <div>
            <label className={formStyles.label}>Complexity Score</label>
            <select
              value={playData.complexity_score || 1}
              onChange={(e) =>
                onUpdateField("complexity_score", parseInt(e.target.value) || 1)
              }
              className={formStyles.select}
            >
              <option value={1}>1 - Very Simple</option>
              <option value={2}>2 - Simple</option>
              <option value={3}>3 - Moderate</option>
              <option value={4}>4 - Complex</option>
              <option value={5}>5 - Very Complex</option>
            </select>
          </div>
        </div>

        {/* Archive Toggle */}
        <div className="pt-4 border-t border-slate-200">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={playData.is_archived || false}
              onChange={(e) => onUpdateField("is_archived", e.target.checked)}
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
            />
            <div>
              <span className="text-sm font-medium text-slate-700">
                Archive this play
              </span>
              <p className="text-xs text-slate-500">
                Won't appear in regular playbook views
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
