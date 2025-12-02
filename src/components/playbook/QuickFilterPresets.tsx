import React from "react";
import { Icon } from "../ui/Icon/Icon";
import { QUICK_PRESETS, type FilterPreset } from "./filterPresets";

interface QuickFilterPresetsProps {
  activePresetId?: string;
  onPresetSelect: (preset: FilterPreset) => void;
}

export const QuickFilterPresets: React.FC<QuickFilterPresetsProps> = ({
  activePresetId = "all",
  onPresetSelect,
}) => {
  return (
    <div className="space-y-3 pb-4">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold text-primary">Quick Filters</h4>
        <span className="text-xs text-muted">
          Tap to filter plays instantly
        </span>
      </div>

      {/* 🎯 ENHANCED: 4x2 grid layout - wider buttons, cleaner responsive behavior */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {QUICK_PRESETS.map((preset) => {
          const isActive = activePresetId === preset.id;

          // Custom styling for each preset type
          const getPresetStyle = () => {
            if (isActive) {
              return "bg-jade-600 hover:bg-jade-700 text-white border-jade-700 shadow-lg scale-105";
            }

            // Custom colors for different preset types
            switch (preset.id) {
              case "favorites":
                return "bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300";
              case "most-used":
                return "bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-300";
              case "run":
                return "bg-sky-100 hover:bg-sky-200 text-sky-900 border-sky-300";
              case "pass":
                return "bg-purple-100 hover:bg-purple-200 text-purple-900 border-purple-300";
              case "rpo":
                return "bg-orange-100 hover:bg-orange-200 text-orange-900 border-orange-300";
              case "redzone":
                return "bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300";
              case "thirddown":
                return "bg-navy-100 hover:bg-navy-200 text-navy-900 border-navy-300";
              default:
                return "bg-surface-elevated hover:bg-surface-overlay text-primary border-border";
            }
          };

          return (
            <button
              key={preset.id}
              onClick={() => onPresetSelect(preset)}
              className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border-2 font-medium transition-all active:scale-95 hover:shadow-md ${getPresetStyle()}`}
            >
              <Icon
                name={preset.icon as any}
                className="h-5 w-5 flex-shrink-0"
              />
              <span className="text-xs font-semibold text-center">
                {preset.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
