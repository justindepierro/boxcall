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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-primary">Quick Filters</h4>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {QUICK_PRESETS.map((preset) => {
          const isActive = activePresetId === preset.id;
          return (
            <Button
              key={preset.id}
              variant={isActive ? "primary" : "secondary"}
              size="sm"
              onClick={() => onPresetSelect(preset)}
              className="justify-start active:scale-95 transition-transform text-xs md:text-sm"
            >
              <Icon
                name={preset.icon as any}
                className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2 flex-shrink-0"
              />
              <span className="truncate">{preset.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
