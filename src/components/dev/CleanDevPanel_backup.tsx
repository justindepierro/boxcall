/**
 * Clean Dev Mode Switcher - Phase 3 Implementation
 *
 * Modern React component with clean dev mode names and clear indicators.
 * Replaces the confusing QuickDevPanel with professional UX.
 *
 * @version 3.0.0 - Phase 3 Clean Dev Modes
 * @author BoxCall Development Team
 */

import React, { useState } from "react";
import { Icon } from "../ui/Icon/Icon";
import { useAuth } from "../../app/auth-store";
import { useDevMode } from "../../app/dev-mode-hooks";
import type { DevMode } from "../../app/dev-mode-types";
import { Button } from "../ui";

interface CleanDevPanelProps {
  className?: string;
}

// Clean, professional dev mode options
const CLEAN_DEV_MODES = [
  // Production modes
  {
    mode: "production" as const,
    label: "Production",
    description: "Your real data and permissions",
    category: "Production",
  },

  // Development modes - realistic testing
  {
    mode: "view_as_head_coach" as const,
    label: "Head Coach",
    description: "Professional head coach with full access",
    category: "Development",
  },
  {
    mode: "view_as_coach" as const,
    label: "Assistant Coach",
    description: "Professional assistant coach with limited access",
    category: "Development",
  },
  {
    mode: "view_as_player" as const,
    label: "Player",
    description: "Student athlete perspective",
    category: "Development",
  },
  {
    mode: "view_as_manager" as const,
    label: "Team Manager",
    description: "Administrative and logistics role",
    category: "Development",
  },
  {
    mode: "view_as_family" as const,
    label: "Family Member",
    description: "Parent/guardian portal access",
    category: "Development",
  },

  // Testing modes
  {
    mode: "blank_slate" as const,
    label: "Blank Slate",
    description: "New coach experience - no data",
    category: "Testing",
  },

  // Legacy mode for backward compatibility
  {
    mode: "super_admin_mock" as const,
    label: "Legacy Mock Data",
    description: "Original mock system (backward compatibility)",
    category: "Legacy",
  },
];

export const CleanDevPanel: React.FC<CleanDevPanelProps> = ({
  className = "",
}) => {
  const { user } = useAuth();
  const { devMode, setDevMode, isDevMode } = useDevMode();
  const [isExpanded, setIsExpanded] = useState(false);

  const currentMode = CLEAN_DEV_MODES.find((mode) => mode.mode === devMode);

  // Don't show in production
  if (import.meta.env.PROD) return null;

  // Super admin indicator for system owner
  const isSuperAdminUser = user?.email === "justindepierro@gmail.com";

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Main Panel */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-w-sm">
        {/* Header */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isSuperAdminUser && (
                <Icon
                  name="shield-check"
                  className="w-4 h-4 text-emerald-600"
                />
              )}
              <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                Dev Mode
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Icon
                name={isExpanded ? "chevron-down" : "chevron-up"}
                className="w-4 h-4 text-gray-500"
              />
            </button>
          </div>

          {/* Current Mode Display */}
          <div className="mt-2">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Current Mode
            </div>
            <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
              {currentMode?.label || "Unknown"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {currentMode?.description || "No description available"}
            </div>
          </div>

          {/* Quick Indicators */}
          <div className="flex gap-2 mt-2">
            {isDevMode && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
                <Icon name="code" className="w-3 h-3 mr-1" />
                Dev Mode
              </span>
            )}
            {isSuperAdminUser && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200">
                <Icon name="shield-check" className="w-3 h-3 mr-1" />
                Super Admin
              </span>
            )}
          </div>
        </div>

        {/* Expanded Panel */}
        {isExpanded && (
          <div className="p-3 max-h-96 overflow-y-auto">
            {/* Mode Groups */}
            {["Production", "Development", "Testing", "Legacy"].map(
              (category) => {
                const categoryModes = CLEAN_DEV_MODES.filter(
                  (mode) => mode.category === category
                );

                if (categoryModes.length === 0) return null;

                return (
                  <div key={category} className="mb-4 last:mb-0">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {category}
                    </label>
                    <div className="space-y-1">
                      {categoryModes.map((mode) => (
                        <button
                          key={mode.mode}
                          onClick={() => setDevMode(mode.mode as DevMode)}
                          className={`w-full text-left p-2 text-xs rounded border transition-colors ${
                            devMode === mode.mode
                              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                              : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                          }`}
                        >
                          <div className="font-medium">{mode.label}</div>
                          <div className="text-gray-500 dark:text-gray-400 mt-1">
                            {mode.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }
            )}

            {/* Reset to Production */}
            {isDevMode && (
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDevMode("production")}
                  className="w-full text-xs"
                >
                  Reset to Production Mode
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CleanDevPanel;
