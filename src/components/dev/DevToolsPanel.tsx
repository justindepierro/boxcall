/**
 * Dev Tools Panel - Clean, modular dev tools UI
 */

import React, { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Typography } from "../design-system";
import { Icon } from "../ui/Icon/Icon";
import type {
  DevToolsState,
  SystemStatus,
  LogEntry,
  DevMode,
} from "../../types/dev";

type UserProfile = {
  id: string;
  role?: string;
  first_name?: string;
  last_name?: string;
};
import { DEV_MODE_CONFIGS } from "../../app/dev-mode-types";
import { useDevMode } from "../../app/dev-mode-hooks";
import { useAuth } from "../../app/auth-store";
import { devLogger } from "./dev-logger";
import { systemMonitor } from "./system-monitor";
import { devActions } from "./dev-actions";

export const DevToolsPanel: React.FC = () => {
  const { devMode, setDevMode } = useDevMode();
  const { profile } = useAuth();

  const [state, setState] = useState<DevToolsState>({
    mode: devMode,
    isVisible: false,
    isExpanded: false,
    activeTab: "overview",
  });

  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-show briefly on mount, then hide
  useEffect(() => {
    const timer = setTimeout(() => {
      setState((prev) => ({ ...prev, isVisible: true }));

      // Auto-hide after 3 seconds
      const hideTimer = setTimeout(() => {
        setState((prev) => ({ ...prev, isVisible: false }));
      }, 3000);

      return () => clearTimeout(hideTimer);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Update status periodically
  useEffect(() => {
    const updateStatus = async () => {
      const newStatus = await systemMonitor.getSystemStatus();
      setStatus(newStatus);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Update logs
  useEffect(() => {
    const updateLogs = () => {
      setLogs(devLogger.getLogs());
    };

    updateLogs();
    const interval = setInterval(updateLogs, 2000); // Every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // Don't show in production
  if (import.meta.env.NODE_ENV === 'production') return null;

  const handleModeSwitch = async (newMode: DevMode) => {
    setIsLoading(true);
    const result = await devActions.switchMode(newMode);

    if (result.success) {
      setDevMode(newMode);
      setState((prev) => ({ ...prev, mode: newMode }));
    }

    setIsLoading(false);
  };

  const handleMouseEnter = () => {
    setState((prev) => ({ ...prev, isVisible: true }));
  };

  const handleMouseLeave = () => {
    if (!state.isExpanded) {
      setState((prev) => ({ ...prev, isVisible: false }));
    }
  };

  const currentModeConfig = DEV_MODE_CONFIGS[state.mode];

  if (!state.isVisible) {
    return (
      <div
        className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300"
        onMouseEnter={handleMouseEnter}
        style={{
          transform: state.isVisible
            ? "translate(-50%, 0)"
            : "translate(-50%, 80%)",
        }}
      >
        <div className="bg-slate-900 text-white px-4 py-2 rounded-t-lg text-sm">
          Dev: {currentModeConfig.label}
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50 transition-all duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Card className="w-80 bg-slate-900 text-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full bg-${currentModeConfig.color}-500`}
            />
            <Typography variant="body-sm" className="font-medium text-white">
              {currentModeConfig.label}
            </Typography>
          </div>
          <button
            onClick={() =>
              setState((prev) => ({ ...prev, isExpanded: !prev.isExpanded }))
            }
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <Icon
              name={state.isExpanded ? "chevron-down" : "chevron-up"}
              size="sm"
              color="secondary"
            />
          </button>
        </div>

        {/* Expanded Content */}
        {state.isExpanded && (
          <div className="p-3 space-y-3">
            {/* Tab Navigation */}
            <div className="flex space-x-1 text-xs">
              {(["overview", "database", "permissions", "logs"] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() =>
                      setState((prev) => ({ ...prev, activeTab: tab }))
                    }
                    className={`px-2 py-1 rounded capitalize transition-colors ${
                      state.activeTab === tab
                        ? "bg-slate-700 text-white"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>

            {/* Tab Content */}
            <div className="max-h-64 overflow-y-auto">
              {state.activeTab === "overview" && (
                <OverviewTab
                  status={status}
                  profile={profile}
                  onAction={async (action) => {
                    setIsLoading(true);
                    try {
                      switch (action) {
                        case "test-db":
                          await systemMonitor.testDatabaseConnection();
                          break;
                        case "export-debug":
                          await devActions.exportDebugInfo();
                          break;
                        case "clear-test-data":
                          await devActions.clearTestData();
                          break;
                        case "reset-production":
                          await devActions.resetToProduction();
                          break;
                      }
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  isLoading={isLoading}
                />
              )}

              {state.activeTab === "database" && (
                <DatabaseTab status={status} />
              )}

              {state.activeTab === "permissions" && (
                <PermissionsTab
                  modes={Object.entries(DEV_MODE_CONFIGS)}
                  currentMode={state.mode}
                  onModeSwitch={handleModeSwitch}
                  isLoading={isLoading}
                />
              )}

              {state.activeTab === "logs" && (
                <LogsTab
                  logs={logs.slice(0, 20)}
                  onClear={() => devLogger.clearLogs()}
                />
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

// Tab Components
const OverviewTab: React.FC<{
  status: SystemStatus | null;
  profile: UserProfile | null;
  onAction: (action: string) => Promise<void>;
  isLoading: boolean;
}> = ({ status, profile, onAction, isLoading }) => (
  <div className="space-y-3">
    {status && (
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-slate-400">Database</div>
          <div
            className={`font-medium ${
              status.database === "connected"
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {status.database}
          </div>
        </div>
        <div>
          <div className="text-slate-400">Auth</div>
          <div className="font-medium text-white">{status.auth}</div>
        </div>
        <div>
          <div className="text-slate-400">Role</div>
          <div className="font-medium text-white">
            {profile?.role || "None"}
          </div>
        </div>
        <div>
          <div className="text-slate-400">Data</div>
          <div className="font-medium text-white">
            {Object.values(status.dataCount).reduce((a, b) => a + b, 0)} items
          </div>
        </div>
      </div>
    )}

    <div className="grid grid-cols-2 gap-1">
      <Button
        size="xs"
        variant="outline"
        onClick={() => onAction("test-db")}
        disabled={isLoading}
        className="text-xs"
      >
        Test DB
      </Button>
      <Button
        size="xs"
        variant="outline"
        onClick={() => onAction("export-debug")}
        disabled={isLoading}
        className="text-xs"
      >
        Export
      </Button>
      <Button
        size="xs"
        variant="outline"
        onClick={() => onAction("clear-test-data")}
        disabled={isLoading}
        className="text-xs"
      >
        Clear Test
      </Button>
      <Button
        size="xs"
        variant="outline"
        onClick={() => onAction("reset-production")}
        disabled={isLoading}
        className="text-xs"
      >
        Production
      </Button>
    </div>
  </div>
);

const DatabaseTab: React.FC<{ status: SystemStatus | null }> = ({ status }) => (
  <div className="space-y-2">
    {status && (
      <>
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Teams:</span>
            <span className="font-mono">{status.dataCount.teams}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Playbooks:</span>
            <span className="font-mono">{status.dataCount.playbooks}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Plays:</span>
            <span className="font-mono">{status.dataCount.plays}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-700">
          <div className="text-xs text-slate-400">
            Status:{" "}
            <span
              className={`font-medium ${
                status.database === "connected"
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {status.database}
            </span>
          </div>
        </div>
      </>
    )}
  </div>
);

const PermissionsTab: React.FC<{
  modes: Array<[string, { label: string; description: string; color: string }]>;
  currentMode: DevMode;
  onModeSwitch: (mode: DevMode) => Promise<void>;
  isLoading: boolean;
}> = ({ modes, currentMode, onModeSwitch, isLoading }) => (
  <div className="space-y-1">
    {modes.map(([mode, config]) => (
      <button
        key={mode}
        onClick={() => onModeSwitch(mode as DevMode)}
        disabled={isLoading || currentMode === mode}
        className={`w-full text-left p-2 rounded text-xs transition-colors ${
          currentMode === mode
            ? "bg-slate-700 text-white"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`}
      >
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full bg-${config.color}-500`} />
          <span className="font-medium">{config.label}</span>
        </div>
        <div className="text-slate-400 text-xs mt-1">{config.description}</div>
      </button>
    ))}
  </div>
);

const LogsTab: React.FC<{
  logs: LogEntry[];
  onClear: () => void;
}> = ({ logs, onClear }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <Typography variant="body-xs" className="text-slate-400">
        Recent Logs ({logs.length})
      </Typography>
      <Button size="xs" variant="outline" onClick={onClear} className="text-xs">
        Clear
      </Button>
    </div>

    <div className="space-y-1 max-h-40 overflow-y-auto">
      {logs.map((log) => (
        <div key={log.id} className="text-xs p-1 rounded bg-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <div
                className={`w-1 h-1 rounded-full ${
                  log.level === "error"
                    ? "bg-red-500"
                    : log.level === "warning"
                      ? "bg-yellow-500"
                      : log.level === "success"
                        ? "bg-green-500"
                        : "bg-blue-500"
                }`}
              />
              <span className="text-slate-400">{log.module}</span>
            </div>
            <span className="text-slate-500">
              {log.timestamp.toLocaleTimeString()}
            </span>
          </div>
          <div className="text-white mt-1">{log.message}</div>
        </div>
      ))}
    </div>
  </div>
);
