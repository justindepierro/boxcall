import React, { useState, useEffect } from "react";
import { useAuthProfile } from "../../app/auth-store";
import { useDevMode } from "../../app/dev-mode-hooks";
import type { DevMode } from "../../app/dev-mode-types";
import { Typography } from "../design-system";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Icon } from "../ui/Icon/Icon";

const DevModeSwitcher: React.FC = () => {
  const { devMode, setDevMode, isDevMode } = useDevMode();
  const profile = useAuthProfile();
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed
  const [isGhostMode, setIsGhostMode] = useState(false);

  // Keyboard shortcuts for enhanced developer experience
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Shift+D to toggle dev tools
      if (e.metaKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsCollapsed(!isCollapsed);
      }
      // Cmd+Shift+G to toggle ghost mode
      if (e.metaKey && e.shiftKey && e.key === 'G') {
        e.preventDefault();
        setIsGhostMode(!isGhostMode);
      }
      // Cmd+1-5 for quick navigation when in dev mode
      if (e.metaKey && isDevMode && ['1', '2', '3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        const routes = ['/dashboard', '/calendar', '/team/1', '/admin', '/super-admin'];
        const routeIndex = parseInt(e.key) - 1;
        const route = routes[routeIndex];
        if (route) {
          console.log(`BoxCall Dev: Navigation jump to ${route}`);
          window.location.href = route;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCollapsed, isGhostMode, isDevMode]);

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
      label: "Production Mode",
      description: "Normal app behavior - real data only",
      color: "bg-gray-100 dark:bg-gray-800",
    },
    {
      mode: "super_admin_real",
      label: "Super Admin (Your Team)",
      description: "Super admin access with your real team data",
      color: "bg-jade-100 dark:bg-jade-900",
    },
    {
      mode: "super_admin_mock",
      label: "Super Admin (Mock Data)",
      description: "Super admin access with mock Eastside Eagles team",
      color: "bg-purple-100 dark:bg-purple-900",
    },
    {
      mode: "view_as_head_coach",
      label: "View as Head Coach",
      description: "Experience the app as a head coach",
      color: "bg-green-100 dark:bg-green-900",
    },
    {
      mode: "view_as_coach",
      label: "View as Assistant Coach",
      description: "Experience the app as an assistant coach",
      color: "bg-emerald-100 dark:bg-emerald-900",
    },
    {
      mode: "view_as_player",
      label: "View as Player",
      description: "Experience the app as a team player",
      color: "bg-orange-100 dark:bg-orange-900",
    },
    {
      mode: "view_as_manager",
      label: "View as Team Manager",
      description: "Experience the app as a team manager",
      color: "bg-yellow-100 dark:bg-yellow-900",
    },
    {
      mode: "view_as_family",
      label: "View as Family Member",
      description: "Experience the app as a parent/family member",
      color: "bg-pink-100 dark:bg-pink-900",
    },
  ];

  return (
    <Card className={`fixed bottom-4 right-4 z-50 max-w-sm shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-2 border-gray-200 dark:border-gray-600 transition-all duration-300 hover:bg-white/95 dark:hover:bg-gray-800/95 ${
      isGhostMode ? 'opacity-20 hover:opacity-90' : 'opacity-95'
    }`}>
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon name="wrench" size="sm" color="slate" />
            <Typography variant="headline-sm" className="text-sm font-bold">
              Dev Tools
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGhostMode(!isGhostMode)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xs p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isGhostMode ? "Exit ghost mode" : "Enter ghost mode (Cmd+Shift+G)"}
            >
              <Icon name={isGhostMode ? "eye-off" : "eye"} size="sm" color="current" />
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xs p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isCollapsed ? "Expand dev tools (Cmd+Shift+D)" : "Collapse dev tools (Cmd+Shift+D)"}
            >
              <Icon name={isCollapsed ? "chevron-up" : "chevron-down"} size="sm" color="current" />
            </button>
            <div
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                isDevMode
                  ? "bg-jade-100 text-jade-800 dark:bg-jade-900 dark:text-jade-200"
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

            {/* Keyboard Shortcuts */}
            <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded border">
              <Typography variant="body-sm" className="text-xs font-semibold mb-1">
                ⌨️ Keyboard Shortcuts
              </Typography>
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <div>⌘+Shift+D - Toggle dev tools</div>
                <div>⌘+Shift+G - Ghost mode</div>
                {isDevMode && (
                  <div className="text-jade-600 dark:text-jade-400 font-medium">
                    ⌘+1-5 - Quick navigation
                  </div>
                )}
              </div>
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
