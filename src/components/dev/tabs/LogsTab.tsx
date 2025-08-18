import React from "react";

import { Typography } from "../../design-system";
/**
 * DevTools Logs Tab
 * System logs display and management
 */
import { Button } from "../../ui";

import type { DevLog } from "../types";

interface LogsTabProps {
  logs: DevLog[];
  onClearLogs: () => void;
}

export const LogsTab: React.FC<LogsTabProps> = ({ logs, onClearLogs }) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Typography variant="body-sm" className="font-medium">
          System Logs
        </Typography>
        <Button
          onClick={onClearLogs}
          size="xs"
          variant="ghost"
          className="px-2 py-1 text-xs"
        >
          Clear
        </Button>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-1">
        {logs
          .slice(-20)
          .reverse()
          .map((log) => (
            <div key={log.id} className="text-xs p-2 rounded surface-subtle">
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
                <span className="font-mono text-text-secondary">
                  {log.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="mt-1 text-text-primary">
                {log.message}
              </div>
              <div className="text-xs mt-1 text-text-secondary">
                {log.source}
              </div>
            </div>
          ))}
        {logs.length === 0 && (
          <div className="text-center text-xs py-4 text-text-secondary">
            No logs yet. Actions will appear here.
          </div>
        )}
      </div>
    </div>
  );
};
