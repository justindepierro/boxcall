/**
 * UndoRedoIndicator Component
 *
 * Shows visual indicators for undo/redo availability and keyboard shortcuts.
 * Displays in bottom-right corner of the screen.
 */

import { useUndoRedo } from "../../hooks/useUndoRedo";

export function UndoRedoIndicator() {
  const { canUndo, canRedo, state, undo, redo } = useUndoRedo();

  // Don't show if no history
  if (state.undoStack.length === 0 && state.redoStack.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex gap-2">
      {/* Undo Button */}
      <button
        onClick={undo}
        disabled={!canUndo}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border
          transition-all duration-200
          ${
            canUndo
              ? "bg-primary border-primary-300 hover:bg-primary-50 hover:border-primary-400 text-primary cursor-pointer"
              : "bg-muted border-muted text-muted cursor-not-allowed opacity-50"
          }
        `}
        title={
          canUndo
            ? `Undo: ${state.undoStack[state.undoStack.length - 1]?.description} (Cmd+Z)`
            : "Nothing to undo"
        }
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
        <span className="text-sm font-medium">Undo</span>
        <kbd className="text-xs px-1.5 py-0.5 bg-secondary rounded border">
          ⌘Z
        </kbd>
      </button>

      {/* Redo Button */}
      <button
        onClick={redo}
        disabled={!canRedo}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border
          transition-all duration-200
          ${
            canRedo
              ? "bg-primary border-primary-300 hover:bg-primary-50 hover:border-primary-400 text-primary cursor-pointer"
              : "bg-muted border-muted text-muted cursor-not-allowed opacity-50"
          }
        `}
        title={
          canRedo
            ? `Redo: ${state.redoStack[state.redoStack.length - 1]?.description} (Cmd+Shift+Z)`
            : "Nothing to redo"
        }
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
          />
        </svg>
        <span className="text-sm font-medium">Redo</span>
        <kbd className="text-xs px-1.5 py-0.5 bg-secondary rounded border">
          ⌘⇧Z
        </kbd>
      </button>

      {/* History Count */}
      <div
        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-muted bg-secondary text-secondary"
        title={`Undo stack: ${state.undoStack.length} | Redo stack: ${state.redoStack.length}`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-sm font-medium">
          {state.undoStack.length + state.redoStack.length}
        </span>
      </div>
    </div>
  );
}
