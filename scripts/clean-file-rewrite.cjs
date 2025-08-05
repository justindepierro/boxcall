#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔄 CLEAN FILE REWRITE: Completely rewriting CleanDevPanel.tsx...");
console.log(
  "======================================================================\n"
);

const filePath = path.join(
  process.cwd(),
  "src/components/dev/CleanDevPanel.tsx"
);

const cleanContent = `/**
 * Clean Dev Mode Switcher - Phase 3 Implementation
 *
 * Modern React component with clean dev mode names and clear indicators.
 * Replaces the confusing QuickDevPanel with professional UX.
 *
 * @version 3.0.0 - Phase 3 Clean Dev Modes
 * @author BoxCall Development Team
 */

import React, { useState } from "react";
import { Icon } from '../ui/Icon/Icon';
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
    mode: "production",
    label: "Production",
    description: "Your real data and permissions",
    category: "Production",
  },

  // Development modes - realistic testing
  {
    mode: "view_as_head_coach",
    label: "Head Coach",
    description: "Professional head coach with full access",
    category: "Development",
  },
  {
    mode: "view_as_coach",
    label: "Assistant Coach",
    description: "Professional assistant coach with limited access",
    category: "Development",
  },
  {
    mode: "view_as_player",
    label: "Player",
    description: "Student athlete perspective",
    category: "Development",
  },
  {
    mode: "view_as_manager",
    label: "Team Manager",
    description: "Administrative and logistics role",
    category: "Development",
  },
  {
    mode: "view_as_family",
    label: "Family Member",
    description: "Parent/guardian portal access",
    category: "Development",
  },

  // Testing modes
  {
    mode: "blank_slate",
    label: "Blank Slate",
    description: "New coach experience - no data",
    category: "Testing",
  },

  // Legacy mode for backward compatibility
  {
    mode: "super_admin_mock",
    label: "Legacy Mock Data",
    description: "Original mock system (backward compatibility)",
    category: "Legacy",
  },
] as const;

export const CleanDevPanel: React.FC<CleanDevPanelProps> = ({
  className = "",
}) => {
  const { user, profile } = useAuth();
  const { devMode, setDevMode, isDevMode } = useDevMode();
  const [isExpanded, setIsExpanded] = useState(false);

  const currentMode = CLEAN_DEV_MODES.find((mode) => mode.mode === devMode);

  // Don't show in production
  if (import.meta.env.PROD) return null;

  // Super admin indicator for system owner
  const isSuperAdminUser = user?.email === "justindepierro@gmail.com";

  return (
    <div className={\`fixed bottom-4 right-4 z-50 \${className}\`}>
      {/* Main Panel */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-w-sm">
        {/* Header */}
        <div
          className="p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Icon name="settings" className="w-4 h-4 inline" /> Dev Mode
            </span>
            <span className="text-xs text-gray-500">
              {isExpanded ? "▼" : "▶"}
            </span>
          </div>

          {/* Current Mode Display */}
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400 text-xs">
                Mode:
              </span>
              <span className="font-medium text-gray-800 dark:text-gray-200 text-xs">
                {currentMode?.label || devMode}
              </span>
            </div>

            {/* Super Admin Indicator */}
            {isSuperAdminUser && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 text-xs">
                  Status:
                </span>
                <span className="font-medium text-green-600 dark:text-green-400 text-xs">
                  System Owner
                </span>
              </div>
            )}

            {/* Dev Mode Active Indicator */}
            {isDevMode && (
              <div className="text-orange-600 dark:text-orange-400 font-medium text-xs">
                ⚠ DEV MODE ACTIVE
              </div>
            )}

            {/* Data Source Indicator */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400 text-xs">
                Data:
              </span>
              <span className="text-xs">
                {devMode === "production" && (
                  <span className="text-blue-600 dark:text-blue-400">
                    Real Database
                  </span>
                )}
                {devMode === "blank_slate" && (
                  <span className="text-purple-600 dark:text-purple-400">
                    Empty State
                  </span>
                )}
                {devMode.startsWith("view_as_") && (
                  <span className="text-green-600 dark:text-green-400">
                    Dev Profiles
                  </span>
                )}
                {devMode === "super_admin_mock" && (
                  <span className="text-orange-600 dark:text-orange-400">
                    Legacy Mock
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-3 space-y-3">
            {/* Current User Info */}
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>
                <strong>User:</strong> {user?.email || "Not signed in"}
              </div>
              <div>
                <strong>Real Role:</strong> {profile?.role || "none"}
              </div>
              {currentMode && (
                <div>
                  <strong>Test Role:</strong> {currentMode.description}
                </div>
              )}
            </div>

            {/* Dev Mode Categories */}
            {["Production", "Development", "Testing", "Legacy"].map(
              (category) => {
                const categoryModes = CLEAN_DEV_MODES.filter(
                  (mode) => mode.category === category
                );
                if (categoryModes.length === 0) return null;

                return (
                  <div key={category}>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {category}
                    </label>
                    <div className="space-y-1">
                      {categoryModes.map((mode) => (
                        <button
                          key={mode.mode}
                          onClick={() => setDevMode(mode.mode as DevMode)}
                          className={\`w-full text-left p-2 text-xs rounded border transition-colors \${
                            devMode === mode.mode
                              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                              : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                          }\`}
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
`;

// Write the clean content
fs.writeFileSync(filePath, cleanContent, "utf8");

console.log("✅ File completely rewritten with clean content!");
console.log("🔄 This should resolve any hidden character or encoding issues.");
console.log("💡 TypeScript errors should now be resolved.");
