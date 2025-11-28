import React from "react";
import { Icon } from "../ui/Icon/Icon";
import { Button } from "../ui/Button/Button";
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
                return "bg-warning-50 hover:bg-warning-100 text-warning-700 border-warning-200";
              case "most-used":
                return "bg-error-50 hover:bg-error-100 text-error-700 border-error-200";
              case "run":
                return "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200";
              case "pass":
                return "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200";
              case "rpo":
                return "bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200";
              case "redzone":
                return "bg-success-50 hover:bg-success-100 text-success-700 border-success-200";
              case "thirddown":
                return "bg-info-50 hover:bg-info-100 text-info-700 border-info-200";
              default:
                return "bg-subtle hover:bg-secondary text-primary border-muted";
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
