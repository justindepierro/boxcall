/**
 * Undo/Redo Context
 * 
 * Provides undo/redo functionality across the application using command pattern.
 * Integrates with SaveStateContext for visual feedback.
 * 
 * Features:
 * - Cmd+Z / Ctrl+Z for undo
 * - Cmd+Shift+Z / Ctrl+Shift+Z for redo
 * - Command history with configurable max size
 * - Integration with save queue
 * 
 * @version 1.0.0
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import type {
  Command,
  UndoRedoState,
  CommandHistoryEntry,
} from "../types/undoRedo";
import { canUndo, canRedo } from "../types/undoRedo";
import { useSaveState } from "./SaveStateContext";

interface UndoRedoContextValue {
  /** Current undo/redo state */
  state: UndoRedoState;
  /** Execute a command and add to history */
  executeCommand: (command: Command) => Promise<void>;
  /** Undo the last command */
  undo: () => Promise<void>;
  /** Redo the last undone command */
  redo: () => Promise<void>;
  /** Clear all undo/redo history */
  clearHistory: () => void;
  /** Check if undo is available */
  canUndo: boolean;
  /** Check if redo is available */
  canRedo: boolean;
  /** Full command history (for debugging) */
  history: CommandHistoryEntry[];
}

const UndoRedoContext = createContext<UndoRedoContextValue | undefined>(
  undefined
);

interface UndoRedoProviderProps {
  children: React.ReactNode;
  maxHistorySize?: number;
}

export const UndoRedoProvider: React.FC<UndoRedoProviderProps> = ({
  children,
  maxHistorySize = 50,
}) => {
  const { startSaving, finishSaving } = useSaveState();

  const [state, setState] = useState<UndoRedoState>({
    undoStack: [],
    redoStack: [],
    currentCommand: null,
    isUndoing: false,
    isRedoing: false,
    maxHistorySize,
  });

  const [history, setHistory] = useState<CommandHistoryEntry[]>([]);

  // Track if we're currently executing to prevent infinite loops
  const isExecuting = useRef(false);

  /**
   * Execute a command and add to undo stack
   */
  const executeCommand = useCallback(
    async (command: Command) => {
      if (isExecuting.current) {
        console.warn("[UndoRedo] Already executing, skipping...");
        return;
      }

      isExecuting.current = true;
      startSaving();

      try {
        console.log("[UndoRedo] Executing command:", command.description);

        // Execute the command
        await command.execute();

        // Add to undo stack
        setState((prev) => {
          const newUndoStack = [...prev.undoStack, command];

          // Trim if exceeds max size
          if (newUndoStack.length > maxHistorySize) {
            newUndoStack.shift(); // Remove oldest
          }

          return {
            ...prev,
            undoStack: newUndoStack,
            redoStack: [], // Clear redo stack when new command executed
            currentCommand: command,
          };
        });

        // Add to history
        setHistory((prev) => [
          ...prev,
          {
            command,
            executedAt: Date.now(),
          },
        ]);

        finishSaving("success");
        console.log("[UndoRedo] Command executed successfully");
      } catch (error) {
        console.error("[UndoRedo] Command execution failed:", error);
        finishSaving("error");
        throw error;
      } finally {
        isExecuting.current = false;
      }
    },
    [startSaving, finishSaving, maxHistorySize]
  );

  /**
   * Undo the last command
   */
  const undo = useCallback(async () => {
    if (!canUndo(state)) {
      console.warn("[UndoRedo] Cannot undo");
      return;
    }

    if (isExecuting.current) {
      console.warn("[UndoRedo] Already executing, skipping undo");
      return;
    }

    isExecuting.current = true;
    setState((prev) => ({ ...prev, isUndoing: true }));
    startSaving();

    try {
      const command = state.undoStack[state.undoStack.length - 1];
      console.log("[UndoRedo] Undoing command:", command.description);

      // Execute undo
      await command.undo();

      // Move command from undo stack to redo stack
      setState((prev) => ({
        ...prev,
        undoStack: prev.undoStack.slice(0, -1),
        redoStack: [...prev.redoStack, command],
        currentCommand: command,
        isUndoing: false,
      }));

      // Update history
      setHistory((prev) =>
        prev.map((entry) =>
          entry.command.id === command.id
            ? { ...entry, undoneAt: Date.now() }
            : entry
        )
      );

      finishSaving("success");
      console.log("[UndoRedo] Undo successful");
    } catch (error) {
      console.error("[UndoRedo] Undo failed:", error);
      setState((prev) => ({ ...prev, isUndoing: false }));
      finishSaving("error");
      throw error;
    } finally {
      isExecuting.current = false;
    }
  }, [state, startSaving, finishSaving]);

  /**
   * Redo the last undone command
   */
  const redo = useCallback(async () => {
    if (!canRedo(state)) {
      console.warn("[UndoRedo] Cannot redo");
      return;
    }

    if (isExecuting.current) {
      console.warn("[UndoRedo] Already executing, skipping redo");
      return;
    }

    isExecuting.current = true;
    setState((prev) => ({ ...prev, isRedoing: true }));
    startSaving();

    try {
      const command = state.redoStack[state.redoStack.length - 1];
      console.log("[UndoRedo] Redoing command:", command.description);

      // Execute redo
      await command.redo();

      // Move command from redo stack to undo stack
      setState((prev) => ({
        ...prev,
        undoStack: [...prev.undoStack, command],
        redoStack: prev.redoStack.slice(0, -1),
        currentCommand: command,
        isRedoing: false,
      }));

      // Update history
      setHistory((prev) =>
        prev.map((entry) =>
          entry.command.id === command.id
            ? { ...entry, redoneAt: Date.now() }
            : entry
        )
      );

      finishSaving("success");
      console.log("[UndoRedo] Redo successful");
    } catch (error) {
      console.error("[UndoRedo] Redo failed:", error);
      setState((prev) => ({ ...prev, isRedoing: false }));
      finishSaving("error");
      throw error;
    } finally {
      isExecuting.current = false;
    }
  }, [state, startSaving, finishSaving]);

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setState({
      undoStack: [],
      redoStack: [],
      currentCommand: null,
      isUndoing: false,
      isRedoing: false,
      maxHistorySize,
    });
    setHistory([]);
    console.log("[UndoRedo] History cleared");
  }, [maxHistorySize]);

  /**
   * Keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Z (Mac) or Ctrl+Z (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        console.log("[UndoRedo] Keyboard: Undo triggered");
        undo();
      }

      // Cmd+Shift+Z (Mac) or Ctrl+Shift+Z (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        console.log("[UndoRedo] Keyboard: Redo triggered");
        redo();
      }

      // Alternative: Cmd+Y or Ctrl+Y for redo
      if ((e.metaKey || e.ctrlKey) && e.key === "y") {
        e.preventDefault();
        console.log("[UndoRedo] Keyboard: Redo triggered (Cmd+Y)");
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo]);

  return (
    <UndoRedoContext.Provider
      value={{
        state,
        executeCommand,
        undo,
        redo,
        clearHistory,
        canUndo: canUndo(state),
        canRedo: canRedo(state),
        history,
      }}
    >
      {children}
    </UndoRedoContext.Provider>
  );
};

/**
 * Hook to access undo/redo functionality
 */
export const useUndoRedo = () => {
  const context = useContext(UndoRedoContext);
  if (context === undefined) {
    throw new Error("useUndoRedo must be used within UndoRedoProvider");
  }
  return context;
};
