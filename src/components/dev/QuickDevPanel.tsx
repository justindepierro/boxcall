import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../app/auth-store";
import { useDevMode } from "../../app/dev-mode-hooks";
import type { DevMode } from "../../app/dev-mode-types";
import { Button } from "../ui";

interface QuickDevPanelProps {
  className?: string;
}

const DEV_MODES = [
  {
    mode: "blank_slate",
    label: "🆕 Blank Slate",
    description: "New user - no data",
  },
  { mode: "production", label: "🏭 Production", description: "Real user data" },
  {
    mode: "super_admin_real",
    label: "👑 Super Admin (Real)",
    description: "Your team data",
  },
  {
    mode: "super_admin_mock",
    label: "🧪 Super Admin (Mock)",
    description: "Mock Dev team",
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

export const QuickDevPanel: React.FC<QuickDevPanelProps> = ({
  className = "",
}) => {
  const { user, profile, signOut } = useAuth();
  const { devMode, setDevMode, isDevMode } = useDevMode();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect will be handled by the auth store/provider
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const currentDevMode = DEV_MODES.find((mode) => mode.mode === devMode);

  // Don't show in production
  if (import.meta.env.PROD) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Main Panel */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🛠️</span>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Dev Tools
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
                {currentDevMode?.label || devMode}
              </span>
            </div>
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
            {/* Dev Mode Switcher */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Development Mode
              </label>
              <select
                value={devMode}
                onChange={(e) => setDevMode(e.target.value as DevMode)}
                className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {DEV_MODES.map(({ mode, label, description }) => (
                  <option key={mode} value={mode}>
                    {label} - {description}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Navigation */}
            {isDevMode && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Quick Navigation
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Team", href: "/team/1" },
                    { label: "Calendar", href: "/calendar" },
                    { label: "Playbook", href: "/playbook" },
                    { label: "Settings", href: "/team/1/settings" },
                    { label: "Profile", href: "/profile" },
                  ].map(({ label, href }) => (
                    <button
                      key={label}
                      onClick={() => navigate(href)}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Data Source Info */}
            <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-2">
              <div>
                <strong>Data Source:</strong>{" "}
                {devMode === "blank_slate"
                  ? "Blank Slate (No Data)"
                  : isDevMode &&
                      (devMode === "super_admin_mock" ||
                        devMode.startsWith("view_as_"))
                    ? "Mock Data (Dev Team)"
                    : "Real Database"}
              </div>
              <div>
                <strong>Real Role:</strong> {profile?.role || "none"}
              </div>
              {isDevMode && (
                <div>
                  <strong>Effective Role:</strong> {currentDevMode?.description}
                </div>
              )}
            </div>

            {/* Reset to Production */}
            {isDevMode && (
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDevMode("production")}
                  className="w-full text-xs"
                >
                  🔄 Reset to Production Mode
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
