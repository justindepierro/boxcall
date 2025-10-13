/**
 * SaveHistoryPanel Component
 *
 * Dev tools panel showing recent save operations with timing, status, and details.
 * Useful for debugging save issues and understanding save patterns.
 */

import { useState } from "react";
import { useSaveState } from "../../contexts/SaveStateContext";
import { useUndoRedo } from "../../contexts/UndoRedoContext";

interface SaveHistoryEntry {
  id: string;
  timestamp: number;
  status: "success" | "error" | "warning" | "conflict";
  duration: number;
  description: string;
  entityType?: string;
  entityId?: string;
}

export function SaveHistoryPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "success" | "error" | "warning" | "conflict"
  >("all");
  const { queueLength, isOnline, hasPendingFromLastSession } = useSaveState();
  const { history: undoRedoHistory, state: undoRedoState } = useUndoRedo();

  // Convert undo/redo history to save history entries
  const saveHistory: SaveHistoryEntry[] = undoRedoHistory.map((entry) => ({
    id: entry.command.id,
    timestamp: entry.executedAt,
    status: entry.undoneAt ? "warning" : "success",
    duration: entry.redoneAt
      ? entry.redoneAt - entry.executedAt
      : entry.undoneAt
        ? entry.undoneAt - entry.executedAt
        : Date.now() - entry.executedAt,
    description: entry.command.description,
    entityType: entry.command.entityType,
    entityId: entry.command.entityId,
  }));

  const filteredHistory =
    filter === "all"
      ? saveHistory
      : saveHistory.filter((entry) => entry.status === filter);

  const getStatusColor = (status: SaveHistoryEntry["status"]) => {
    switch (status) {
      case "success":
        return "text-success-600 bg-success-50";
      case "error":
        return "text-error-600 bg-error-50";
      case "warning":
        return "text-warning-600 bg-warning-50";
      case "conflict":
        return "text-warning-600 bg-warning-50";
      default:
        return "text-secondary bg-surface-secondary";
    }
  };

  const getStatusIcon = (status: SaveHistoryEntry["status"]) => {
    switch (status) {
      case "success":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "error":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "warning":
      case "conflict":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(saveHistory, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = `save-history-${Date.now()}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  if (!isOpen) {
    // Minimized button
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-30 flex items-center gap-2 px-3 py-2 bg-surface-primary border rounded-lg shadow-lg hover:bg-surface-secondary transition-colors"
        title="Open Save History Panel"
      >
        <svg
          className="w-5 h-5 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <span className="text-sm font-medium text-primary">
          History ({saveHistory.length})
        </span>
      </button>
    );
  }

  // Full panel (max-w-2xl ≈ 672px, max-h-screen for responsiveness)
  return (
    <div className="fixed bottom-4 right-4 z-30 w-full max-w-2xl h-128 bg-surface-primary border rounded-lg shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-surface-secondary">
        <div className="flex items-center gap-3">
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h2 className="text-lg font-semibold text-primary">Save History</h2>
          <span className="text-sm text-secondary">
            ({filteredHistory.length} {filter !== "all" && `${filter} `}
            operations)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportHistory}
            className="p-2 hover:bg-surface-muted rounded"
            title="Export history as JSON"
          >
            <svg
              className="w-4 h-4 text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </button>

          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-surface-muted rounded"
            title="Close panel"
          >
            <svg
              className="w-4 h-4 text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-surface-secondary border-b">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{queueLength}</div>
          <div className="text-xs text-secondary">Queue Length</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {undoRedoState.undoStack.length}
          </div>
          <div className="text-xs text-secondary">Undo Stack</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {undoRedoState.redoStack.length}
          </div>
          <div className="text-xs text-secondary">Redo Stack</div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-2 p-4 border-b">
        {isOnline ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-success-50 text-success-700 rounded-full">
            <span className="w-2 h-2 bg-success-500 rounded-full"></span>
            Online
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-error-50 text-error-700 rounded-full">
            <span className="w-2 h-2 bg-error-500 rounded-full"></span>
            Offline
          </span>
        )}

        {hasPendingFromLastSession && (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-warning-50 text-warning-700 rounded-full">
            Pending from last session
          </span>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-2 border-b bg-surface-secondary">
        {(["all", "success", "error", "warning"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`
              px-3 py-1 text-sm rounded transition-colors
              ${
                filter === status
                  ? "bg-primary-100 text-primary-700 font-medium"
                  : "text-secondary hover:bg-surface-muted"
              }
            `}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-secondary">
            <svg
              className="w-12 h-12 mb-2 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm">
              No {filter !== "all" && filter} operations yet
            </p>
          </div>
        ) : (
          filteredHistory
            .slice()
            .reverse()
            .map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-surface-secondary hover:bg-surface-muted transition-colors"
              >
                {/* Status Icon */}
                <div
                  className={`p-1.5 rounded ${getStatusColor(entry.status)}`}
                >
                  {getStatusIcon(entry.status)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-primary truncate">
                    {entry.description}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-secondary">
                    <span>{formatTimestamp(entry.timestamp)}</span>
                    <span>•</span>
                    <span>{formatDuration(entry.duration)}</span>
                    {entry.entityType && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{entry.entityType}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
