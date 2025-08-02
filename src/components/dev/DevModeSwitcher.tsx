import React, { useState } from "react";
import { useAuthProfile } from "../../app/auth-store";
import { useDevMode } from "../../app/dev-mode-hooks";
import type { DevMode } from "../../app/dev-mode-types";
import { Typography } from "../design-system";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

const DevModeSwitcher: React.FC = () => {
  const { devMode, setDevMode, isDevMode } = useDevMode();
  const profile = useAuthProfile();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Only show in development environment
  if (import.meta.env.PROD) {
    return null;
  }

  const devModes: Array<{
    mode: DevMode;
    label: string;
    description: string;
    color: string;
  }> = [
    {
      mode: "production",
      label: "🏭 Production Mode",
      description: "Normal app behavior - real data only",
      color: "bg-gray-100 dark:bg-gray-800",
    },
    {
      mode: "super_admin_real",
      label: "👑 Super Admin (Your Team)",
      description: "Super admin access with your real team data",
      color: "bg-jade-100 dark:bg-jade-900",
    },
    {
      mode: "super_admin_mock",
      label: "🧪 Super Admin (Mock Data)",
      description: "Super admin access with mock Eastside Eagles team",
      color: "bg-purple-100 dark:bg-purple-900",
    },
    {
      mode: "view_as_head_coach",
      label: "🏆 View as Head Coach",
      description: "Experience the app as a head coach",
      color: "bg-green-100 dark:bg-green-900",
    },
    {
      mode: "view_as_coach",
      label: "👨‍🏫 View as Assistant Coach",
      description: "Experience the app as an assistant coach",
      color: "bg-emerald-100 dark:bg-emerald-900",
    },
    {
      mode: "view_as_player",
      label: "🏃‍♂️ View as Player",
      description: "Experience the app as a team player",
      color: "bg-orange-100 dark:bg-orange-900",
    },
    {
      mode: "view_as_manager",
      label: "📋 View as Team Manager",
      description: "Experience the app as a team manager",
      color: "bg-yellow-100 dark:bg-yellow-900",
    },
    {
      mode: "view_as_family",
      label: "👨‍👩‍👧‍👦 View as Family Member",
      description: "Experience the app as a parent/family member",
      color: "bg-pink-100 dark:bg-pink-900",
    },
  ];

  return (
    <Card className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Typography variant="headline-sm" className="text-sm font-bold">
            🛠️ Dev Mode
          </Typography>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xs"
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              {isCollapsed ? "🔼" : "🔽"}
            </button>
            <div
              className={`px-2 py-1 rounded text-xs font-medium ${
                isDevMode
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
              }`}
            >
              {isDevMode ? "DEV" : "PROD"}
            </div>
          </div>
        </div>

        {!isCollapsed && (
          <>
            <div className="mb-3">
              <Typography variant="body-sm" color="muted" className="text-xs">
                Current User: {profile?.email || "Not authenticated"}
              </Typography>
              <Typography variant="body-sm" color="muted" className="text-xs">
                Real Role: {profile?.role || "None"}
              </Typography>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {devModes.map(({ mode, label, description, color }) => (
                <button
                  key={mode}
                  onClick={() => setDevMode(mode)}
                  className={`w-full text-left p-2 rounded-md border-2 transition-all font-sans ${
                    devMode === mode
                      ? "border-jade-500 bg-jade-50 dark:bg-navy-950 dark:border-jade-400"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  } ${color}`}
                >
                  <div className="text-xs font-medium">{label}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {description}
                  </div>
                </button>
              ))}
            </div>

            {isDevMode && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDevMode("production")}
                  className="w-full text-xs"
                >
                  Return to Production
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default DevModeSwitcher;
