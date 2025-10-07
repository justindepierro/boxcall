/* eslint-disable boxcall-design/no-raw-tailwind-colors */
/*
 * Aurora components use intentional dark theme colors (slate-*) matching
 * the diagram editor's always-dark interface (like Figma/VS Code dark theme).
 * These are NOT bugs or oversight - they're deliberate design choices for the editor UI.
 */
import { memo } from "react";
import { Icon } from "../../../ui/Icon/Icon";

interface FieldPreset {
  id: string;
  label: string;
  icon: string;
  gradient: string;
  description: string;
}

interface AuroraFieldPresetsProps {
  activePreset: string;
  onPresetSelect: (presetId: string) => void;
}

const FIELD_PRESETS: FieldPreset[] = [
  {
    id: "midfield",
    label: "Midfield",
    icon: "target",
    gradient: "from-blue-500 to-cyan-500",
    description: "Standard midfield view (10-40 yard line)",
  },
  {
    id: "redzone",
    label: "Red Zone",
    icon: "flag",
    gradient: "from-red-500 to-orange-500",
    description: "Inside the 20 (0-25 yards)",
  },
  {
    id: "goalline",
    label: "Goal Line",
    icon: "zap",
    gradient: "from-jade-500 to-emerald-500",
    description: "Goal line situations (0-15 yards)",
  },
  {
    id: "backedup",
    label: "Backed Up",
    icon: "alert-triangle",
    gradient: "from-amber-500 to-yellow-500",
    description: "Deep in own territory",
  },
];

export const AuroraFieldPresets = memo<AuroraFieldPresetsProps>(
  ({ activePreset, onPresetSelect }) => {
    return (
      <div className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 rounded-glass border-2 border-white/30 dark:border-slate-700/30 p-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border dark:border-slate-700">
          <Icon
            name="book"
            className="w-5 h-5 text-slate-600 dark:text-slate-400"
          />
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Field View
          </h3>
        </div>

        {/* Preset Grid */}
        <div className="space-y-3">
          {FIELD_PRESETS.map((preset) => {
            const isActive = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onPresetSelect(preset.id)}
                className={`w-full group relative overflow-hidden rounded-2xl p-4 transition-all duration-200 ${
                  isActive
                    ? "ring-2 ring-electric-500 shadow-lg"
                    : "hover:shadow-md hover:scale-[1.02]"
                }`}
                title={preset.description}
              >
                {/* Gradient background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${preset.gradient} ${
                    isActive
                      ? "opacity-100"
                      : "opacity-20 group-hover:opacity-30"
                  } transition-opacity`}
                />

                {/* Content */}
                <div className="relative flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isActive ? "bg-white/20 backdrop-blur-sm" : "bg-white/10"
                    }`}
                  >
                    <Icon
                      name={preset.icon as any}
                      className={`w-5 h-5 ${
                        isActive
                          ? "text-white"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div
                      className={`text-sm font-bold ${
                        isActive
                          ? "text-white"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {preset.label}
                    </div>
                    <div
                      className={`text-xs ${
                        isActive
                          ? "text-white/80"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {preset.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-6 h-6 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                      <Icon name="check" className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Info Footer */}
        <div className="mt-4 pt-3 border-t border dark:border-slate-700">
          <div className="flex items-start gap-2 p-2 rounded-xl bg-electric-50 dark:bg-electric-900/20">
            <Icon
              name="info"
              className="w-4 h-4 text-electric-600 dark:text-electric-400 mt-0.5"
            />
            <p className="text-xs text-electric-700 dark:text-electric-400 leading-relaxed">
              Select the field zone that matches your play's situation for
              better visualization.
            </p>
          </div>
        </div>
      </div>
    );
  }
);

AuroraFieldPresets.displayName = "AuroraFieldPresets";
