/**
 * DevTools Data & Modes Tab
 * Database status and role switching
 */
import React from "react";
import { Typography } from "../../design-system";
import { useDevMode } from "../../../app/dev-mode-hooks";
import { useTeamsData } from "../../../hooks/useTeamsData";
import { DEV_MODES } from "../types";
import type { DevMode } from "../../../app/dev-mode-types";

import { DevToolsActions } from "../services/DevToolsActions";

interface DataTabProps {
  onModeChange: (mode: DevMode) => void;
  actions: DevToolsActions;
}

export const DataTab: React.FC<DataTabProps> = ({ onModeChange, actions }) => {
  const { devMode } = useDevMode();
  const { teams, playbooks, plays, error } = useTeamsData();

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

        {/* Demo Data Check Button */}
        <button
          onClick={() => actions.checkDemoData()}
          className="w-full px-3 py-1.5 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
        >
          🔍 Check Demo Data
        </button>

        {/* Create Sample Data Button */}
        <button
          onClick={() => actions.createSampleData()}
          className="w-full px-3 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
        >
          🌱 Create Sample Data
        </button>

        {/* Navigation Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => actions.navigateToTeams()}
            className="px-3 py-1.5 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
          >
            👥 Teams
          </button>
          <button
            onClick={() => actions.navigateToPlaybook()}
            className="px-3 py-1.5 text-xs bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors"
          >
            📋 Playbook
          </button>
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
              onClick={() => onModeChange(mode.mode as DevMode)}
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
};
