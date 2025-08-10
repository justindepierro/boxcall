/**
 * Development Tools Panel
 * Clean, modular development tools with better error handling
 * Refactored from 946-line monolithic component into modular architecture
 */
import React, { useState, useEffect } from "react";
import { Button } from "../ui";
import { useAuth } from "../../app/auth-store";
import { useDevMode } from "../../app/dev-mode-hooks";
import { useTeamsData } from "../../hooks/useTeamsData";
import { useToast } from "../../hooks/useToast";
import { Typography } from "../design-system";
import { Icon } from "../ui/Icon/Icon";
import { OverviewTab } from "./tabs/OverviewTab";
import { DataTab } from "./tabs/DataTab";
import { LogsTab } from "./tabs/LogsTab";
import { DevToolsActions } from "./services/DevToolsActions";
import { DEV_MODES, type DevToolsState, type DevLog } from "./types";
// import { checkDatabaseData } from "../../utils/demo-data-check";
import type { DevMode } from "../../app/dev-mode-types";

export const DevTools: React.FC = () => {
  const { user, profile } = useAuth();
  const { devMode, setDevMode } = useDevMode();
  const { teams, playbooks, plays } = useTeamsData();
  const toast = useToast();

  const [state, setState] = useState<DevToolsState>({
    isExpanded: false,
    activeTab: "overview",
    isVisible: false,
    isHovered: false,
    opacity: 0.95,
    autoHideTimer: null,
  });

  const [logs, setLogs] = useState<DevLog[]>([]);

  // Auto-hide functionality
  useEffect(() => {
    const showTimer = setTimeout(() => {
      setState((prev) => ({ ...prev, isVisible: true }));

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

    return () => clearTimeout(showTimer);
  }, []);

  // Don't show in production build
  if (process.env.NODE_ENV === "production") return null;

  const addLog = (
    level: DevLog["level"],
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

  const showToast = (
    level: DevLog["level"],
    message: string,
    title?: string
  ) => {
    switch (level) {
      case "success":
        toast.success(message, title);
        break;
      case "error":
        toast.error(message, title);
        break;
      case "warning":
        toast.warning(message, title);
        break;
      case "info":
      default:
        toast.info(message, title);
        break;
    }
  };

  const actions = new DevToolsActions(addLog, showToast);

  const handleModeChange = (newMode: DevMode) => {
    const previousMode = devMode;
    setDevMode(newMode);
    addLog("info", `Switched to ${newMode} mode`, "mode-switcher");

    const modeConfig = DEV_MODES.find((mode) => mode.mode === newMode);
    if (modeConfig) {
      showToast(
        "success",
        `Switched to ${modeConfig.label}`,
        `Role changed from ${previousMode} → ${newMode}`
      );
    }
  };

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

  // Tab configuration
  const tabs = [
    { id: "overview", label: "📊", title: "Overview" },
    { id: "data", label: "🗃️", title: "Data & Modes" },
    { id: "logs", label: "📝", title: "Logs" },
  ] as const;

  const renderTabContent = () => {
    switch (state.activeTab) {
      case "overview":
        return (
          <OverviewTab
            state={state}
            onTestDatabase={() => actions.testDatabaseConnection()}
            onExportState={() =>
              actions.exportStateSnapshot(
                user && user.email ? { id: user.id, email: user.email } : null,
                profile,
                devMode,
                teams,
                playbooks,
                plays
              )
            }
            onReloadData={() => actions.reloadDemoData()}
            onClearData={() => actions.clearAllData()}
            onAddLog={addLog}
          />
        );

      case "data":
        return <DataTab onModeChange={handleModeChange} actions={actions} />;

      case "logs":
        return <LogsTab logs={logs} onClearLogs={() => setLogs([])} />;

      default:
        return (
          <div className="text-center text-sm py-4 text-text-secondary">
            Coming soon...
          </div>
        );
    }
  };

  // Collapsed state - show just trigger
  if (!state.isVisible) {
    return (
      <div
        className="fixed bottom-4 right-4 z-50"
        onMouseEnter={handleMouseEnter}
      >
        <div className="w-12 h-12 bg-jade-600 hover:bg-jade-600 rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all duration-200 animate-pulse">
          <span className="text-text-inverse text-lg">🛠️</span>
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
      <div className="surface-card border border-gray-300 dark:border-gray-600 rounded-lg shadow-2xl max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-text-inverse rounded-t-lg">
          <div className="flex items-center">
            <Icon
              name="settings"
              size="sm"
              className="mr-2 text-text-inverse"
            />
            <Typography
              variant="body-sm"
              className="font-medium text-text-inverse"
            >
              {state.isExpanded ? "BoxCall Dev Tools" : "🛠️"}
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            {state.isExpanded && (
              <div className="flex items-center gap-1">
                <Icon name="eye" size="xs" className="text-text-inverse" />
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
            <Button
              variant="ghost"
              size="xs"
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  isExpanded: !prev.isExpanded,
                }))
              }
              className="p-1 h-auto hover:bg-white/20 text-text-inverse"
              aria-label={
                state.isExpanded ? "Collapse dev tools" : "Expand dev tools"
              }
            >
              <Icon
                name={state.isExpanded ? "chevron-down" : "chevron-up"}
                size="xs"
                className="text-text-inverse"
              />
            </Button>
          </div>
        </div>

        {/* Expanded Content */}
        {state.isExpanded && (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-600 surface-subtle">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={state.activeTab === tab.id ? "primary" : "ghost"}
                  size="xs"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      activeTab: tab.id as DevToolsState["activeTab"],
                    }))
                  }
                  className={`flex-1 px-2 py-2 rounded-none first:rounded-tl-lg last:rounded-tr-lg border-b-2 ${
                    state.activeTab === tab.id
                      ? "bg-white dark:bg-gray-800 border-jade-600 text-blue-600 dark:text-blue-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 border-transparent"
                  }`}
                  title={tab.title}
                >
                  <span className="text-sm">{tab.label}</span>
                </Button>
              ))}
            </div>

            {/* Content */}
            <div className="p-4 max-h-80 overflow-y-auto surface-card text-text-primary">
              {renderTabContent()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
