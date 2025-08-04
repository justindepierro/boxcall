import React, { useState } from "react";
import { useAuth } from "../../app/auth-store";
import {
  useDevMode,
  useDevProfileState,
} from "../../app/dev-mode-hooks-enhanced";
import type { DevMode } from "../../types/dev-profiles";
import { Button } from "../ui";

interface QuickDevPanelProps {
  className?: string;
}

// Real world development modes
const REAL_WORLD_DEV_MODES = [
  {
    mode: "production",
    label: "🌍 My Real Team",
    description: "Your actual team and data",
    category: "Real World",
  },
  {
    mode: "real_world_dev",
    label: "🔧 My Team (Dev Mode)",
    description: "Your team with dev tools active",
    category: "Real World",
  },
] as const;

// Professional dev profiles with proper descriptions
const PROFESSIONAL_DEV_MODES = [
  {
    mode: "blank_slate",
    label: "🆕 Blank Slate",
    description: "New coach experience - no data",
    category: "Testing",
  },
  {
    mode: "dev_head_coach",
    label: "🏆 Dev Head Coach",
    description: "Professional head coach profile",
    category: "Professional",
  },
  {
    mode: "dev_assistant_coach",
    label: "👨‍🏫 Dev Assistant Coach",
    description: "Professional assistant coach profile",
    category: "Professional",
  },
  {
    mode: "dev_player",
    label: "🏃‍♂️ Dev Player",
    description: "Professional player profile",
    category: "Professional",
  },
  {
    mode: "dev_super_admin",
    label: "👑 Dev Super Admin",
    description: "Professional super admin profile",
    category: "Professional",
  },
] as const;

// Legacy fallback modes for backward compatibility
const LEGACY_FALLBACK_MODES = [
  { mode: "production", label: "🏭 Production", description: "Real user data" },
  {
    mode: "super_admin_real",
    label: "👑 Super Admin (Real)",
    description: "Your team data",
  },
  {
    mode: "super_admin_mock",
    label: "🧪 Super Admin (Mock)",
    description: "Mock Eagles team",
  },
  {
    mode: "view_as_head_coach",
    label: "🏆 Head Coach",
    description: "Coach permissions",
  },
  {
    mode: "view_as_coach",
    label: "👨‍🏫 Assistant Coach",
    description: "Limited coach access",
  },
  {
    mode: "view_as_player",
    label: "🏃‍♂️ Player",
    description: "Player perspective",
  },
  {
    mode: "view_as_manager",
    label: "📋 Manager",
    description: "Team manager view",
  },
  { mode: "view_as_family", label: "👨‍👩‍👧‍👦 Family", description: "Parent portal" },
] as const;

export const QuickDevPanelEnhanced: React.FC<QuickDevPanelProps> = ({
  className = "",
}) => {
  const { user, profile, signOut } = useAuth();
  const { devMode, setDevMode, isDevMode } = useDevMode();
  const profileState = useDevProfileState();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLegacyModes, setShowLegacyModes] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect will be handled by the auth store/provider
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleDevModeChange = async (newMode: DevMode) => {
    try {
      await setDevMode(newMode);
    } catch (error) {
      console.error("Error changing dev mode:", error);
    }
  };

  const currentMode =
    REAL_WORLD_DEV_MODES.find((mode) => mode.mode === devMode) ||
    PROFESSIONAL_DEV_MODES.find((mode) => mode.mode === devMode) ||
    LEGACY_FALLBACK_MODES.find((mode) => mode.mode === devMode);

  // Don't show in production
  if (import.meta.env.PROD) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Main Panel */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-w-sm">
        {/* Header */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🛠️</span>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Professional Dev Tools
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {/* Sign Out Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleSignOut}
                className="text-xs"
              >
                Sign Out
              </Button>
              {/* Expand/Collapse */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {isExpanded ? "▼" : "▲"}
              </button>
            </div>
          </div>
        </div>

        {/* Current Status - Always Visible */}
        <div className="p-3 bg-gray-50 dark:bg-gray-900">
          <div className="text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">User:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {profile?.full_name || user?.email || "Unknown"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Mode:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {currentMode?.label || devMode}
              </span>
            </div>
            {profileState.isActive && profileState.currentProfile && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Profile:
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {profileState.currentProfile.fullName}
                </span>
              </div>
            )}
            {isDevMode && (
              <div className="text-orange-600 dark:text-orange-400 font-medium">
                🚨 DEV MODE ACTIVE
              </div>
            )}
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-3 space-y-3">
            {/* Real World Dev Mode Switcher */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Real World Development
              </label>
              <select
                value={devMode}
                onChange={(e) => handleDevModeChange(e.target.value as DevMode)}
                className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-3"
              >
                {REAL_WORLD_DEV_MODES.map(({ mode, label, description }) => (
                  <option key={mode} value={mode}>
                    {label} - {description}
                  </option>
                ))}
              </select>
            </div>

            {/* Professional Dev Mode Switcher */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Professional Development Profiles
              </label>
              <select
                value={devMode}
                onChange={(e) => handleDevModeChange(e.target.value as DevMode)}
                className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {PROFESSIONAL_DEV_MODES.map(({ mode, label, description }) => (
                  <option key={mode} value={mode}>
                    {label} - {description}
                  </option>
                ))}
              </select>
            </div>

            {/* Profile System Status */}
            {profileState.isActive && profileState.currentProfile && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-2">
                <div className="text-xs text-green-800 dark:text-green-200">
                  <div className="font-semibold mb-1">Active Profile</div>
                  <div>Name: {profileState.currentProfile.fullName}</div>
                  <div>Role: {profileState.currentProfile.role}</div>
                  <div>
                    Teams: {profileState.currentProfile.teamMemberships.length}
                  </div>
                  <div>
                    Data: {profileState.currentProfile.dataScope.dataSource}
                  </div>
                </div>
              </div>
            )}

            {/* Legacy Mode Toggle */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <button
                onClick={() => setShowLegacyModes(!showLegacyModes)}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showLegacyModes ? "Hide" : "Show"} Legacy Modes
              </button>
            </div>

            {/* Legacy Fallback Modes */}
            {showLegacyModes && (
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Legacy Development Modes
                </label>
                <select
                  value={devMode}
                  onChange={(e) =>
                    handleDevModeChange(e.target.value as DevMode)
                  }
                  className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 opacity-75"
                >
                  {LEGACY_FALLBACK_MODES.map(({ mode, label, description }) => (
                    <option key={mode} value={mode}>
                      {label} - {description}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Quick Actions
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDevModeChange("production")}
                  className="text-xs flex-1"
                >
                  🌍 My Team
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDevModeChange("blank_slate")}
                  className="text-xs flex-1"
                >
                  🆕 Blank Slate
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDevModeChange("dev_head_coach")}
                  className="text-xs flex-1"
                >
                  🏆 Head Coach
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDevModeChange("dev_player")}
                  className="text-xs flex-1"
                >
                  🏃‍♂️ Player
                </Button>
              </div>
            </div>

            {/* Development Info */}
            <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-1">
                <div>Environment: {import.meta.env.MODE}</div>
                <div>
                  Build: {import.meta.env.DEV ? "Development" : "Production"}
                </div>
                <div>
                  Profile System:{" "}
                  {profileState.isActive ? "Active" : "Inactive"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
