/**
 * Development Tools Panel
 *
 * Comprehensive dev tools for BoxCall development and testing
 */
import React, { useState, useEffect } from "react";
import { useAuth } from "../../app/auth-store";
import { useDevMode } from "../../app/dev-mode-hooks";
import { useTeamsData } from "../../hooks/useTeamsData";
import { supabase } from "../../lib/supabase";
import { Typography } from "../design-system";
import { Card } from "../ui";
import { Icon } from "../ui/Icon/Icon";
import type { DevMode } from "../../app/dev-mode-types";

interface DevToolsState {
  isExpanded: boolean;
  activeTab: "overview" | "data" | "auth" | "performance" | "testing" | "logs";
  isVisible: boolean; // replaces position tracking
  isHovered: boolean;
  opacity: number;
  autoHideTimer: NodeJS.Timeout | null;
}

const DEV_MODES = [
  {
    mode: "production",
    label: "🏠 Production",
    description: "Real user data",
    color: "green",
  },
  {
    mode: "blank_slate",
    label: "📄 Blank Slate",
    description: "New user - no data",
    color: "gray",
  },
  {
    mode: "test_as_head_coach",
    label: "👑 Head Coach",
    description: "Coach permissions",
    color: "purple",
  },
  {
    mode: "test_as_coach",
    label: "🎯 Assistant Coach",
    description: "Limited coach access",
    color: "orange",
  },
  {
    mode: "test_as_player",
    label: "🏃 Player",
    description: "Player perspective",
    color: "blue",
  },
  {
    mode: "test_as_family",
    label: "👨‍👩‍👧‍👦 Family",
    description: "Parent portal",
    color: "pink",
  },
] as const;

export const DevTools: React.FC = () => {
  const { user, profile } = useAuth();
  const { devMode, setDevMode } = useDevMode();
  const { teams, playbooks, plays, loading, error } = useTeamsData();

  const [state, setState] = useState<DevToolsState>({
    isExpanded: false,
    activeTab: "overview",
    isVisible: false, // Start hidden
    isHovered: false,
    opacity: 0.95,
    autoHideTimer: null,
  });

  const [performanceData, setPerformanceData] = useState({
    renderTime: 0,
    memoryUsage: 0,
    dbQueries: 0,
    lastUpdate: new Date(),
  });

  const [logs, setLogs] = useState<
    Array<{
      id: string;
      level: "info" | "warning" | "error" | "success";
      message: string;
      timestamp: Date;
      source: string;
    }>
  >([]);

  // Update performance data
  useEffect(() => {
    const interval = setInterval(() => {
      setPerformanceData((prev) => ({
        ...prev,
        renderTime: performance.now() % 100,
        memoryUsage:
          (performance as Performance & { memory?: { usedJSHeapSize: number } })
            .memory?.usedJSHeapSize || 0,
        lastUpdate: new Date(),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Auto-hide functionality with hover detection
  useEffect(() => {
    // Show briefly on mount, then auto-hide
    const showTimer = setTimeout(() => {
      setState((prev) => ({ ...prev, isVisible: true }));

      // Auto-hide after 3 seconds if not hovered
      const hideTimer = setTimeout(() => {
        setState((prev) => {
          if (!prev.isHovered && !prev.isExpanded) {
            return { ...prev, isVisible: false };
          }
          return prev;
        });
      }, 3000);

      setState((prev) => ({ ...prev, autoHideTimer: hideTimer }));
    }, 1000);

    return () => {
      clearTimeout(showTimer);
    };
  }, []);

  // Handle auto-hide timer
  useEffect(() => {
    return () => {
      if (state.autoHideTimer) {
        clearTimeout(state.autoHideTimer);
      }
    };
  }, [state.autoHideTimer]);

  // Show/hide based on mouse interaction
  const handleMouseEnter = () => {
    setState((prev) => {
      if (prev.autoHideTimer) {
        clearTimeout(prev.autoHideTimer);
      }
      return {
        ...prev,
        isHovered: true,
        isVisible: true,
        autoHideTimer: null,
      };
    });
  };

  const handleMouseLeave = () => {
    setState((prev) => {
      // Auto-hide after 2 seconds if not expanded
      const hideTimer = setTimeout(() => {
        setState((curr) => {
          if (!curr.isExpanded && !curr.isHovered) {
            return { ...curr, isVisible: false };
          }
          return curr;
        });
      }, 2000);

      return {
        ...prev,
        isHovered: false,
        autoHideTimer: hideTimer,
      };
    });
  };

  // Don't show in production build
  if (process.env.NODE_ENV === "production") return null;

  const addLog = (
    level: (typeof logs)[0]["level"],
    message: string,
    source = "devtools"
  ) => {
    setLogs((prev) => [
      ...prev.slice(-99),
      {
        id: Date.now().toString(),
        level,
        message,
        timestamp: new Date(),
        source,
      },
    ]);
  };

  const clearLogs = () => setLogs([]);

  const currentMode =
    DEV_MODES.find((mode) => mode.mode === devMode) || DEV_MODES[0];

  const handleModeChange = (newMode: DevMode) => {
    setDevMode(newMode);
    addLog("info", `Switched to ${newMode} mode`, "mode-switcher");
  };

  const testDatabaseConnection = async () => {
    try {
      addLog("info", "Testing database connection...", "database");
      const { data: _data, error } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);
      if (error) {
        addLog("error", `Database error: ${error.message}`, "database");
      } else {
        addLog("success", "Database connection successful", "database");
      }
    } catch (err) {
      addLog("error", `Connection failed: ${err}`, "database");
    }
  };

  const exportStateSnapshot = () => {
    const snapshot = {
      user: user ? { id: user.id, email: user.email } : null,
      profile: profile
        ? { id: profile.id, role: profile.role, full_name: profile.full_name }
        : null,
      devMode,
      dataCount: {
        teams: teams.length,
        playbooks: playbooks.length,
        plays: plays.length,
      },
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `boxcall-state-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    addLog("success", "State snapshot exported", "export");
  };

  const clearAllData = async () => {
    if (confirm("⚠️ This will clear ALL demo data. Are you sure?")) {
      try {
        addLog("warning", "Clearing all demo data...", "data-management");

        // Clear plays first (due to foreign keys)
        await supabase
          .from("plays")
          .delete()
          .neq("id", "00000000-0000-0000-0000-000000000000");
        // Clear playbooks
        await supabase
          .from("playbooks")
          .delete()
          .neq("id", "00000000-0000-0000-0000-000000000000");
        // Clear teams
        await supabase
          .from("teams")
          .delete()
          .neq("id", "00000000-0000-0000-0000-000000000000");

        addLog("success", "All demo data cleared", "data-management");
        window.location.reload(); // Refresh to update UI
      } catch (error) {
        addLog("error", `Failed to clear data: ${error}`, "data-management");
      }
    }
  };

  const reloadDemoData = async () => {
    addLog("info", "Reloading demo data...", "data-management");

    if (confirm("🔄 This will reload demo data. Continue?")) {
      try {
        addLog("info", "Attempting to reload demo data...", "data-management");

        // Try to fetch the demo data script endpoint or trigger reload
        // Since we can't directly run Node scripts from the frontend,
        // we'll provide clear instructions and refresh after delay
        addLog("info", "Demo data reload initiated", "data-management");
        addLog(
          "warning",
          "Note: Run 'node scripts/load-demo-data.mjs' in terminal for full reload",
          "data-management"
        );

        // Simulate data refresh by reloading the page
        setTimeout(() => {
          addLog(
            "info",
            "Refreshing application to show updated data...",
            "data-management"
          );
          window.location.reload();
        }, 3000);
      } catch (error) {
        addLog("error", `Failed to reload data: ${error}`, "data-management");
      }
    }
  };

  const renderTabContent = () => {
    switch (state.activeTab) {
      case "overview":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3">
                <Typography variant="body-xs" color="muted">
                  Current Mode
                </Typography>
                <div className="flex items-center mt-1">
                  <div
                    className={`w-2 h-2 rounded-full bg-${currentMode.color}-500 mr-2`}
                  ></div>
                  <Typography variant="body-sm" className="font-medium">
                    {currentMode.label}
                  </Typography>
                </div>
              </Card>
              <Card className="p-3">
                <Typography variant="body-xs" color="muted">
                  User Role
                </Typography>
                <Typography variant="body-sm" className="font-medium">
                  {profile?.role || "None"}
                </Typography>
              </Card>
              <Card className="p-3">
                <Typography variant="body-xs" color="muted">
                  Data Count
                </Typography>
                <Typography variant="body-sm" className="font-medium">
                  {teams.length + playbooks.length + plays.length} items
                </Typography>
              </Card>
              <Card className="p-3">
                <Typography variant="body-xs" color="muted">
                  Status
                </Typography>
                <Typography
                  variant="body-sm"
                  className="font-medium text-green-600"
                >
                  {error ? "Error" : loading ? "Loading" : "Ready"}
                </Typography>
              </Card>
            </div>

            <div className="space-y-2">
              <Typography variant="body-sm" className="font-medium">
                Quick Actions
              </Typography>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={testDatabaseConnection}
                  className="px-3 py-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  🔍 Test DB
                </button>
                <button
                  onClick={exportStateSnapshot}
                  className="px-3 py-2 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  📥 Export State
                </button>
                <button
                  onClick={reloadDemoData}
                  className="px-3 py-2 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                >
                  🔄 Reload Data
                </button>
                <button
                  onClick={clearAllData}
                  className="px-3 py-2 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  🗑️ Clear All
                </button>
                <button
                  onClick={async () => {
                    addLog(
                      "info",
                      "Running comprehensive system test...",
                      "overview"
                    );

                    // Test popup visibility status
                    addLog(
                      "info",
                      `Popup status: ${state.isVisible ? "� Visible" : "� Hidden"}`,
                      "overview"
                    );

                    // Test hover state
                    addLog(
                      "info",
                      `Hover state: ${state.isHovered ? "🖱️ Hovered" : "👋 Not hovered"}`,
                      "overview"
                    );

                    // Test expanded state
                    addLog(
                      "info",
                      `Panel state: ${state.isExpanded ? "📖 Expanded" : "📕 Collapsed"}`,
                      "overview"
                    );

                    // Test opacity
                    addLog(
                      "info",
                      `Opacity: ${(state.opacity * 100).toFixed(0)}%`,
                      "overview"
                    );

                    // Test all tabs
                    addLog(
                      "info",
                      `Active tab: ${state.activeTab}`,
                      "overview"
                    );

                    // Test data counts
                    const totalData =
                      teams.length + playbooks.length + plays.length;
                    addLog(
                      totalData > 0 ? "success" : "warning",
                      `Data loaded: ${totalData} total items`,
                      "overview"
                    );

                    // Test auto-hide behavior
                    if (state.autoHideTimer) {
                      addLog(
                        "info",
                        "⏰ Auto-hide timer is active",
                        "overview"
                      );
                    } else {
                      addLog("info", "⏸️ No auto-hide timer", "overview");
                    }
                  }}
                  className="px-3 py-2 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors col-span-2"
                >
                  🧪 Run All Tests
                </button>
              </div>
            </div>
          </div>
        );

      case "data":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Typography variant="body-sm" className="font-medium">
                Database Status
              </Typography>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Teams:</span>
                  <span className="font-mono">{teams.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Playbooks:</span>
                  <span className="font-mono">{playbooks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Plays:</span>
                  <span className="font-mono">{plays.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span
                    className={`font-mono ${error ? "text-red-500" : "text-green-500"}`}
                  >
                    {error ? "ERROR" : "OK"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Typography variant="body-sm" className="font-medium">
                Mode Switcher
              </Typography>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {DEV_MODES.map((mode) => (
                  <button
                    key={mode.mode}
                    onClick={() => handleModeChange(mode.mode)}
                    className={`w-full text-left px-2 py-1 text-xs rounded transition-colors ${
                      devMode === mode.mode
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-600"
                        : "hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-2 h-2 rounded-full bg-${mode.color}-500 mr-2`}
                      ></div>
                      <span className="font-medium">{mode.label}</span>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 ml-4">
                      {mode.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case "performance":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Card className="p-3">
                <Typography variant="body-xs" color="muted">
                  Render Time
                </Typography>
                <Typography variant="body-sm" className="font-mono">
                  {performanceData.renderTime.toFixed(2)}ms
                </Typography>
              </Card>
              <Card className="p-3">
                <Typography variant="body-xs" color="muted">
                  Memory Usage
                </Typography>
                <Typography variant="body-sm" className="font-mono">
                  {(performanceData.memoryUsage / 1024 / 1024).toFixed(1)}MB
                </Typography>
              </Card>
              <Card className="p-3">
                <Typography variant="body-xs" color="muted">
                  Last Update
                </Typography>
                <Typography variant="body-sm" className="font-mono">
                  {performanceData.lastUpdate.toLocaleTimeString()}
                </Typography>
              </Card>
            </div>
          </div>
        );

      case "logs":
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Typography variant="body-sm" className="font-medium">
                System Logs
              </Typography>
              <button
                onClick={clearLogs}
                className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {logs
                .slice(-20)
                .reverse()
                .map((log) => (
                  <div
                    key={log.id}
                    className="text-xs p-2 rounded bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-medium ${
                          log.level === "error"
                            ? "text-red-600 dark:text-red-400"
                            : log.level === "warning"
                              ? "text-orange-600 dark:text-orange-400"
                              : log.level === "success"
                                ? "text-green-600 dark:text-green-400"
                                : "text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 font-mono">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="mt-1 text-gray-900 dark:text-gray-100">
                      {log.message}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                      {log.source}
                    </div>
                  </div>
                ))}
              {logs.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 text-xs py-4">
                  No logs yet. Actions will appear here.
                </div>
              )}
            </div>
          </div>
        );

      case "testing":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Typography variant="body-sm" className="font-medium">
                Database Tests
              </Typography>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={testDatabaseConnection}
                  className="px-3 py-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-left"
                >
                  🔍 Test Database Connection
                </button>
                <button
                  onClick={async () => {
                    addLog(
                      "info",
                      "Running comprehensive auth test...",
                      "testing"
                    );

                    // Test 1: Check if user is authenticated
                    if (user) {
                      addLog(
                        "success",
                        `✓ User authenticated: ${user.email}`,
                        "testing"
                      );
                    } else {
                      addLog("error", "✗ No user authenticated", "testing");
                      return;
                    }

                    // Test 2: Check profile data
                    if (profile) {
                      addLog(
                        "success",
                        `✓ Profile loaded: ${profile.role}`,
                        "testing"
                      );
                    } else {
                      addLog("warning", "⚠ No profile data", "testing");
                    }

                    // Test 3: Test Supabase session
                    try {
                      const {
                        data: { session },
                        error,
                      } = await supabase.auth.getSession();
                      if (error) {
                        addLog(
                          "error",
                          `✗ Session error: ${error.message}`,
                          "testing"
                        );
                      } else if (session) {
                        addLog(
                          "success",
                          "✓ Valid Supabase session",
                          "testing"
                        );
                      } else {
                        addLog("error", "✗ No active session", "testing");
                      }
                    } catch (err) {
                      addLog("error", `✗ Auth test failed: ${err}`, "testing");
                    }
                  }}
                  className="px-3 py-2 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-left"
                >
                  🔐 Test Authentication
                </button>
                <button
                  onClick={() => {
                    addLog("info", "Testing team data fetch...", "testing");
                    // The useTeamsData hook is already doing this
                    if (teams.length > 0) {
                      addLog(
                        "success",
                        `Found ${teams.length} teams`,
                        "testing"
                      );
                    } else {
                      addLog("warning", "No teams found", "testing");
                    }
                  }}
                  className="px-3 py-2 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-left"
                >
                  🏈 Test Team Data
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Typography variant="body-sm" className="font-medium">
                System Info
              </Typography>
              <div className="text-xs space-y-1 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                <div>
                  Environment:{" "}
                  {process.env.NODE_ENV === "production"
                    ? "Production"
                    : "Development"}
                </div>
                <div>User Agent: {navigator.userAgent.split(" ")[0]}</div>
                <div>
                  Screen: {window.screen.width}x{window.screen.height}
                </div>
                <div>
                  Viewport: {window.innerWidth}x{window.innerHeight}
                </div>
              </div>
            </div>
          </div>
        );

      case "auth":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Typography variant="body-sm" className="font-medium">
                Authentication Status
              </Typography>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Authenticated:</span>
                  <span
                    className={`font-mono ${user ? "text-green-500" : "text-red-500"}`}
                  >
                    {user ? "YES" : "NO"}
                  </span>
                </div>
                {user && (
                  <>
                    <div className="flex justify-between">
                      <span>User ID:</span>
                      <span className="font-mono text-xs">
                        {user.id.slice(0, 8)}...
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <span className="font-mono">{user.email}</span>
                    </div>
                  </>
                )}
                {profile && (
                  <>
                    <div className="flex justify-between">
                      <span>Profile Role:</span>
                      <span className="font-mono">{profile.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Full Name:</span>
                      <span className="font-mono">
                        {profile.full_name || "Not set"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {user && (
              <div className="space-y-2">
                <Typography variant="body-sm" className="font-medium">
                  Session Info
                </Typography>
                <div className="text-xs space-y-1 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <div>
                    Created:{" "}
                    {user.created_at
                      ? new Date(user.created_at).toLocaleString()
                      : "Unknown"}
                  </div>
                  <div>
                    Last Sign In:{" "}
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleString()
                      : "Never"}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">
            Coming soon...
          </div>
        );
    }
  };

  const tabs = [
    { id: "overview", label: "📊", title: "Overview" },
    { id: "data", label: "🗃️", title: "Data & Modes" },
    { id: "performance", label: "⚡", title: "Performance" },
    { id: "logs", label: "📝", title: "Logs" },
    { id: "testing", label: "🧪", title: "Testing" },
    { id: "auth", label: "🔐", title: "Auth" },
  ] as const;

  // If not visible, show just a small trigger at the bottom
  if (!state.isVisible) {
    return (
      <div
        className="fixed bottom-4 right-4 z-50"
        onMouseEnter={handleMouseEnter}
      >
        <div className="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all duration-200 animate-pulse">
          <span className="text-white text-lg">🛠️</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ opacity: state.opacity }}
    >
      {/* Main popup container */}
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-2xl max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center">
            <Icon name="settings" size="sm" className="mr-2 text-white" />
            <Typography variant="body-sm" className="font-medium text-white">
              {state.isExpanded ? "BoxCall Dev Tools" : "🛠️"}
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            {/* Opacity Control */}
            {state.isExpanded && (
              <div className="flex items-center gap-1">
                <Icon name="eye" size="xs" className="text-white" />
                <input
                  type="range"
                  min="0.3"
                  max="1"
                  step="0.1"
                  value={state.opacity}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      opacity: parseFloat(e.target.value),
                    }))
                  }
                  className="w-16 h-1"
                />
              </div>
            )}
            <button
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  isExpanded: !prev.isExpanded,
                }))
              }
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <Icon
                name={state.isExpanded ? "chevron-down" : "chevron-up"}
                size="xs"
                className="text-white"
              />
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        {state.isExpanded && (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      activeTab: tab.id as DevToolsState["activeTab"],
                    }))
                  }
                  className={`flex-1 px-2 py-2 text-xs text-center transition-colors ${
                    state.activeTab === tab.id
                      ? "bg-white dark:bg-gray-800 border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
                  }`}
                  title={tab.title}
                >
                  <span className="text-sm">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-4 max-h-80 overflow-y-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              {renderTabContent()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
