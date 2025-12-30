import React from "react";
import { Icon } from "../ui/Icon/Icon";
import { QUICK_PRESETS, type FilterPreset } from "./filterPresets";

interface QuickFilterPresetsProps {
  activePresetId?: string;
  onPresetSelect: (preset: FilterPreset) => void;
}

/**
 * Compact preset styling - clean pill buttons
 */
const PRESET_STYLES: Record<
  string,
  { bg: string; text: string; icon: string }
> = {
  all: {
    bg: "bg-neutral-100",
    text: "text-neutral-700",
    icon: "text-neutral-500",
  },
  favorites: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    icon: "text-amber-500",
  },
  "most-used": {
    bg: "bg-rose-50",
    text: "text-rose-700",
    icon: "text-rose-500",
  },
  run: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    icon: "text-emerald-600",
  },
  pass: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    icon: "text-violet-600",
  },
  rpo: { bg: "bg-orange-50", text: "text-orange-700", icon: "text-orange-600" },
  playaction: { bg: "bg-sky-50", text: "text-sky-700", icon: "text-sky-600" },
  redzone: { bg: "bg-red-50", text: "text-red-700", icon: "text-red-600" },
  goalline: { bg: "bg-red-50", text: "text-red-700", icon: "text-red-600" },
  backedup: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    icon: "text-slate-600",
  },
  thirddown: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    icon: "text-indigo-600",
  },
  thirdshort: {
    bg: "bg-green-50",
    text: "text-green-700",
    icon: "text-green-600",
  },
  thirdlong: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    icon: "text-amber-600",
  },
  shortyardage: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    icon: "text-teal-600",
  },
  "2minute": { bg: "bg-pink-50", text: "text-pink-700", icon: "text-pink-600" },
  "11personnel": {
    bg: "bg-blue-50",
    text: "text-blue-700",
    icon: "text-blue-600",
  },
  "12personnel": {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    icon: "text-cyan-600",
  },
  "21personnel": {
    bg: "bg-purple-50",
    text: "text-purple-700",
    icon: "text-purple-600",
  },
  "22personnel": {
    bg: "bg-fuchsia-50",
    text: "text-fuchsia-700",
    icon: "text-fuchsia-600",
  },
  empty: { bg: "bg-gray-100", text: "text-gray-700", icon: "text-gray-600" },
};

const DEFAULT_STYLE = {
  bg: "bg-neutral-100",
  text: "text-neutral-700",
  icon: "text-neutral-500",
};

export const QuickFilterPresets: React.FC<QuickFilterPresetsProps> = ({
  activePresetId = "all",
  onPresetSelect,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-primary">Quick Filters</h4>
        <span className="text-xs text-muted">
          Tap to filter plays instantly
        </span>
      </div>

      {/* Compact 4-column grid with pill buttons */}
      <div className="grid grid-cols-4 gap-2">
        {QUICK_PRESETS.map((preset) => {
          const isActive = activePresetId === preset.id;
          const style = PRESET_STYLES[preset.id] || DEFAULT_STYLE;

          return (
            <button
              key={preset.id}
              onClick={() => onPresetSelect(preset)}
              className={`
                flex flex-col items-center justify-center gap-1 p-2 rounded-lg
                text-xs font-medium transition-all active:scale-95
                ${
                  isActive
                    ? "bg-jade-600 text-white shadow-md ring-2 ring-jade-300"
                    : `${style.bg} ${style.text} hover:shadow-sm`
                }
              `}
            >
              <Icon
                name={preset.icon}
                className={`h-4 w-4 ${isActive ? "text-white" : style.icon}`}
              />
              <span className="text-center leading-tight line-clamp-1">
                {preset.label.replace(" Plays", "").replace(" Personnel", "")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
