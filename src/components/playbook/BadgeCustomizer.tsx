import React from "react";
import { Icon } from "../ui/Icon/Icon";
import { Typography } from "../design-system/Typography";
import type { BadgeCustomization, BadgeStyle } from "../../types/personnel";
import { BADGE_COLOR_PRESETS, BADGE_FONT_OPTIONS } from "../../types/personnel";
import { PersonnelBadge } from "./PersonnelBadge";

interface BadgeCustomizerProps {
  personnelName: string;
  customization: BadgeCustomization;
  onChange: (customization: BadgeCustomization) => void;
  onSave: () => void;
}

const STYLE_OPTIONS: Array<{
  id: BadgeStyle;
  name: string;
  icon: "circle" | "check-circle" | "zap" | "star";
  description: string;
}> = [
  {
    id: "solid",
    name: "Solid",
    icon: "circle",
    description: "Filled background",
  },
  {
    id: "border",
    name: "Border",
    icon: "check-circle",
    description: "Outlined style",
  },
  {
    id: "gradient",
    name: "Gradient",
    icon: "zap",
    description: "Gradient effect",
  },
  {
    id: "shiny",
    name: "Shiny",
    icon: "star",
    description: "Glossy finish",
  },
];

/**
 * BadgeCustomizer Component
 *
 * Allows users to customize the appearance of personnel badges
 * with style, color, and font options.
 *
 * Features:
 * - 4 style options: Solid, Border, Gradient, Shiny
 * - 12 color presets
 * - Font selection
 * - Live preview
 */
export const BadgeCustomizer: React.FC<BadgeCustomizerProps> = ({
  personnelName,
  customization,
  onChange,
  onSave,
}) => {
  const selectedPreset = BADGE_COLOR_PRESETS.find(
    (p) => p.id === customization.colorPresetId
  );

  return (
    <div className="space-y-6 p-4 bg-surface-50 dark:bg-surface-900/50 rounded-lg border border-surface-200 dark:border-surface-700">
      {/* Live Preview */}
      <div className="flex items-center justify-between">
        <Typography variant="label" className="text-sm font-medium">
          Preview
        </Typography>
        <PersonnelBadge
          personnel={personnelName}
          size="md"
          badgeCustomization={customization}
        />
      </div>

      {/* Style Selector */}
      <div className="space-y-3">
        <Typography variant="label" className="text-sm font-medium">
          Badge Style
        </Typography>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {STYLE_OPTIONS.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => onChange({ ...customization, style: style.id })}
              className={`
                flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all
                ${
                  customization.style === style.id
                    ? "border-electric-500 bg-electric-50 dark:bg-electric-900/20"
                    : "border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600"
                }
              `}
            >
              <Icon name={style.icon} className="h-5 w-5" />
              <div className="text-center">
                <Typography variant="body-sm" className="font-medium">
                  {style.name}
                </Typography>
                <Typography variant="caption" className="text-muted-foreground">
                  {style.description}
                </Typography>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Color Preset Grid */}
      <div className="space-y-3">
        <Typography variant="label" className="text-sm font-medium">
          Color Preset
        </Typography>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {BADGE_COLOR_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() =>
                onChange({ ...customization, colorPresetId: preset.id })
              }
              className={`
                relative aspect-square rounded-lg transition-all
                ${
                  customization.colorPresetId === preset.id
                    ? "ring-2 ring-electric-500 ring-offset-2 dark:ring-offset-surface-900"
                    : "hover:scale-105"
                }
              `}
              title={preset.name}
            >
              <div
                className={`
                  w-full h-full rounded-lg flex items-center justify-center
                  ${preset.background}
                  ${customization.style === "gradient" ? `bg-gradient-to-br ${preset.gradientFrom} ${preset.gradientTo}` : ""}
                  ${customization.style === "border" ? "border-2" : ""}
                  ${customization.style === "shiny" ? "shadow-lg" : ""}
                `}
              >
                {customization.colorPresetId === preset.id && (
                  <Icon name="check" className={`h-4 w-4 ${preset.text}`} />
                )}
              </div>
            </button>
          ))}
        </div>
        {selectedPreset && (
          <Typography
            variant="caption"
            className="text-muted-foreground text-center"
          >
            {selectedPreset.name}
          </Typography>
        )}
      </div>

      {/* Font Selector */}
      <div className="space-y-3">
        <Typography variant="label" className="text-sm font-medium">
          Font Style
        </Typography>
        <div className="grid grid-cols-3 gap-2">
          {BADGE_FONT_OPTIONS.map((font) => (
            <button
              key={font.id}
              type="button"
              onClick={() =>
                onChange({
                  ...customization,
                  fontFamily: font.id,
                })
              }
              className={`
                p-3 rounded-lg border-2 transition-all ${font.className}
                ${
                  (customization.fontFamily || "default") === font.id
                    ? "border-electric-500 bg-electric-50 dark:bg-electric-900/20"
                    : "border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600"
                }
              `}
            >
              <Typography variant="body-sm" className="font-medium">
                {font.name}
              </Typography>
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2 border-t border-surface-200 dark:border-surface-700">
        <button
          type="button"
          onClick={onSave}
          className="px-4 py-2 bg-electric-500 hover:bg-electric-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Icon name="check" className="h-4 w-4" />
          Save Badge
        </button>
      </div>
    </div>
  );
};

BadgeCustomizer.displayName = "BadgeCustomizer";
