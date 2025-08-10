/**
 * DevTools Overview Tab
 * System status and quick actions
 */
import React from "react";
import { Typography } from "../../design-system";
import { Card } from "../../ui";
import { useAuth } from "../../../app/auth-store";
import { useDevMode } from "../../../app/dev-mode-hooks";
import { useTeamsData } from "../../../hooks/useTeamsData";
import { DEV_MODES, type DevToolsState, type DevLog } from "../types";

interface OverviewTabProps {
  state: DevToolsState;
  onTestDatabase: () => void;
  onExportState: () => void;
  onReloadData: () => void;
  onClearData: () => void;
  onAddLog: (level: DevLog["level"], message: string, source?: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  state,
  onTestDatabase,
  onExportState,
  onReloadData,
  onClearData,
  onAddLog,
}) => {
  const { profile } = useAuth();
  const { devMode } = useDevMode();
  const { teams, playbooks, plays, loading, error } = useTeamsData();

  const currentMode =
    DEV_MODES.find((mode) => mode.mode === devMode) || DEV_MODES[0];

  const runAllTests = async () => {
    onAddLog("info", "Running comprehensive system test...", "overview");

    // Test various system states
    onAddLog(
      "info",
      `Popup status: ${state.isVisible ? "✓ Visible" : "✗ Hidden"}`,
      "overview"
    );
    onAddLog(
      "info",
      `Hover state: ${state.isHovered ? "🖱️ Hovered" : "👋 Not hovered"}`,
      "overview"
    );
    onAddLog(
      "info",
      `Panel state: ${state.isExpanded ? "📖 Expanded" : "📕 Collapsed"}`,
      "overview"
    );
    onAddLog(
      "info",
      `Opacity: ${(state.opacity * 100).toFixed(0)}%`,
      "overview"
    );
    onAddLog("info", `Active tab: ${state.activeTab}`, "overview");

    // Test data counts
    const totalData = teams.length + playbooks.length + plays.length;
    onAddLog(
      totalData > 0 ? "success" : "warning",
      `Data loaded: ${totalData} total items`,
      "overview"
    );

    // Test auto-hide behavior
    if (state.autoHideTimer) {
      onAddLog("info", "⏰ Auto-hide timer is active", "overview");
    } else {
      onAddLog("info", "⏸️ No auto-hide timer", "overview");
    }
  };

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
          <Typography variant="body-sm" className="font-medium text-green-600">
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
            onClick={onTestDatabase}
            className="px-3 py-2 text-xs bg-jade-600 text-white rounded hover:bg-jade-600 transition-colors"
          >
            🔍 Test DB
          </button>
          <button
            onClick={onExportState}
            className="px-3 py-2 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            📥 Export State
          </button>
          <button
            onClick={onReloadData}
            className="px-3 py-2 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            🔄 Reload Data
          </button>
          <button
            onClick={onClearData}
            className="px-3 py-2 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            🗑️ Clear All
          </button>
          <button
            onClick={runAllTests}
            className="px-3 py-2 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors col-span-2"
          >
            🧪 Run All Tests
          </button>
        </div>
      </div>
    </div>
  );
};
