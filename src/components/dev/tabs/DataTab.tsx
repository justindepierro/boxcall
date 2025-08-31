import React from "react";

import { useDevMode } from "../../../app/dev-mode-hooks";
import { useUI } from "../../../app/store";
import { useTeamsData } from "../../../hooks/useTeamsData";
import { Typography } from "../../design-system";
import { Button } from "../../ui/Button/Button";
import { Icon } from "../../ui/Icon/Icon";
/**
 * DevTools Data & Modes Tab
 * Database status and role switching
 */
import { DevToolsActions } from "../services/DevToolsActions";
import { DEV_MODES } from "../types";

import type { DevMode } from "../../../app/dev-mode-types";

interface DataTabProps {
  onModeChange: (mode: DevMode) => void;
  actions: DevToolsActions;
}

export const DataTab: React.FC<DataTabProps> = ({ onModeChange, actions }) => {
  const { devMode } = useDevMode();
  const { teams, playbooks, plays, error } = useTeamsData();
  const { uiDensity, setUIDensity } = useUI();

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

        {/* Demo Data Section Disabled */}
        <div className="text-sm text-text-muted text-center py-4">
          Demo data utilities have been removed from production build
        </div>

        {/* Create Sample Data Button */}
        <Button
          onClick={() => actions.createSampleData()}
          variant="primary"
          size="xs"
          fullWidth
        >
          <Icon
            name="sprout"
            className="inline h-4 w-4 align-middle text-current"
          />{" "}
          Create Sample Data
        </Button>

        {/* Navigation Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => actions.navigateToTeams()}
            variant="success"
            size="xs"
          >
            <Icon
              name="users"
              className="inline h-4 w-4 align-middle text-current"
            />{" "}
            Teams
          </Button>
          <Button
            onClick={() => actions.navigateToPlaybook()}
            variant="secondary"
            size="xs"
          >
            <Icon
              name="list"
              className="inline h-4 w-4 align-middle text-current"
            />{" "}
            Playbook
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Typography variant="body-sm" className="font-medium">
          Mode Switcher
        </Typography>
        <div className="max-h-40 overflow-y-auto space-y-1">
          {DEV_MODES.map((mode) => (
            <Button
              key={mode.mode}
              onClick={() => onModeChange(mode.mode as DevMode)}
              variant={devMode === mode.mode ? "primary" : "ghost"}
              size="xs"
              className="w-full justify-start flex-col items-start text-left !h-auto px-2 py-1"
            >
              <div className="flex items-center">
                <span
                  className={`w-2 h-2 rounded-full bg-${mode.color}-500 mr-2`}
                ></span>
                <span className="font-medium">{mode.label}</span>
              </div>
              <div className="ml-4 text-[10px] leading-snug text-text-secondary">
                {mode.description}
              </div>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Typography variant="body-sm" className="font-medium">
          Layout Density
        </Typography>
        <div className="flex gap-2">
          {(["compact", "comfortable"] as const).map((d) => (
            <Button
              key={d}
              onClick={() => setUIDensity(d)}
              variant={uiDensity === d ? "success" : "ghost"}
              size="xs"
            >
              {d}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
