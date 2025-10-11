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
      <div className="grid grid-cols-2 gap-2">
        {QUICK_PRESETS.map((preset) => {
          const isActive = activePresetId === preset.id;
          return (
            <Button
              key={preset.id}
              variant={isActive ? "primary" : "secondary"}
              size="sm"
              onClick={() => onPresetSelect(preset)}
              className="justify-start active:scale-95 transition-transform"
            >
              <Icon name={preset.icon as any} className="h-4 w-4 mr-2" />
              {preset.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
