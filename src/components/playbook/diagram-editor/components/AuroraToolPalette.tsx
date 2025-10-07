/* eslint-disable boxcall-design/no-raw-tailwind-colors */
/*
 * Aurora components use intentional dark theme colors (slate-*) matching
 * the diagram editor's always-dark interface (like Figma/VS Code dark theme).
 * These are NOT bugs or oversight - they're deliberate design choices for the editor UI.
 */
import { memo } from "react";
import { Icon } from "../../../ui/Icon/Icon";

interface Tool {
  id: string;
  label: string;
  icon: string;
  gradient: string;
  description: string;
}

interface AuroraToolPaletteProps {
  activeTool: string;
  onToolSelect: (toolId: string) => void;
}

const TOOLS: Tool[] = [
  {
    id: "player",
    label: "Player",
    icon: "user",
    gradient: "from-electric-500 to-purple-500",
    description: "Add offensive/defensive players",
  },
  {
    id: "route",
    label: "Route",
    icon: "trending-up",
    gradient: "from-jade-500 to-emerald-500",
    description: "Draw player routes",
  },
  {
    id: "arrow",
    label: "Arrow",
    icon: "arrow-right",
    gradient: "from-amber-500 to-orange-500",
    description: "Add directional arrows",
  },
  {
    id: "zone",
    label: "Zone",
    icon: "target",
    gradient: "from-red-500 to-pink-500",
    description: "Mark coverage zones",
  },
  {
    id: "text",
    label: "Text",
    icon: "message",
    gradient: "from-blue-500 to-cyan-500",
    description: "Add labels and notes",
  },
  {
    id: "select",
    label: "Select",
    icon: "cursor",
    gradient: "from-slate-500 to-gray-500",
    description: "Select and move objects",
  },
];

const ACTIONS = [
  { id: "undo", icon: "refresh-cw", label: "Undo" },
  { id: "redo", icon: "refresh-cw", label: "Redo" },
  { id: "clear", icon: "delete", label: "Clear All" },
] as const;

export const AuroraToolPalette = memo<AuroraToolPaletteProps>(
  ({ activeTool, onToolSelect }) => {
    return (
      <div className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 rounded-glass border-2 border-white/30 dark:border-slate-700/30 p-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border dark:border-slate-700">
          <Icon
            name="wrench"
            className="w-5 h-5 text-slate-600 dark:text-slate-400"
          />
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Tools
          </h3>
        </div>

        {/* Tool Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {TOOLS.map((tool) => {
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => onToolSelect(tool.id)}
                className={`group relative overflow-hidden rounded-2xl p-4 transition-all duration-200 ${
                  isActive
                    ? "ring-2 ring-electric-500 shadow-lg scale-105"
                    : "hover:scale-105 hover:shadow-md"
                }`}
                title={tool.description}
              >
                {/* Gradient background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} ${
                    isActive
                      ? "opacity-100"
                      : "opacity-20 group-hover:opacity-30"
                  } transition-opacity`}
                />

                {/* Content */}
                <div className="relative flex flex-col items-center gap-2">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isActive ? "bg-white/20 backdrop-blur-sm" : "bg-white/10"
                    } transition-all`}
                  >
                    <Icon
                      name={tool.icon as any}
                      className={`w-6 h-6 ${
                        isActive
                          ? "text-white"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      isActive
                        ? "text-white"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {tool.label}
                  </span>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white shadow-lg animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="pt-3 border-t border dark:border-slate-700">
          <div className="text-xssss font-semibold text-slate-500 dark:text-slate-400 mb-2">
            Quick Actions
          </div>
          <div className="flex gap-2">
            {ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => onToolSelect(action.id)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                title={action.label}
              >
                <Icon
                  name={action.icon as any}
                  className={`w-4 h-4 text-slate-600 dark:text-slate-400 ${
                    action.id === "redo" ? "scale-x-[-1]" : ""
                  }`}
                />
                <span className="text-xssss font-medium text-slate-700 dark:text-slate-300">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="mt-4 pt-3 border-t border dark:border-slate-700">
          <div className="text-xssss text-slate-500 dark:text-slate-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>Select</span>
              <kbd className="px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-2xs">
                V
              </kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Player</span>
              <kbd className="px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-2xs">
                P
              </kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Route</span>
              <kbd className="px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-2xs">
                R
              </kbd>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

AuroraToolPalette.displayName = "AuroraToolPalette";
