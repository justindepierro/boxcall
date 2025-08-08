/**
 * DevTools Logs Tab
 * System logs display and management
 */
import React from "react";
import { Typography } from "../../design-system";
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
        <button
          onClick={onClearLogs}
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
};
