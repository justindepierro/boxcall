/**
 * Command Pattern Types for Undo/Redo System
 *
 * Implements command pattern to enable undo/redo functionality
 * for save operations in the Universal Save System.
 */

/**
 * Base command interface
 */
export interface Command<T = unknown> {
  /** Unique identifier for this command */
  id: string;
  /** Type of entity being modified */
  entityType: "play" | "formation" | "team" | "personnel" | "other";
  /** ID of the entity being modified */
  entityId: string;
  /** Timestamp when command was executed */
  timestamp: number;
  /** Human-readable description */
  description: string;
  /** Execute the command (apply changes) */
  execute: () => Promise<void>;
  /** Undo the command (revert changes) */
  undo: () => Promise<void>;
  /** Redo the command (reapply changes) */
  redo: () => Promise<void>;
  /** Previous state (for undo) */
  previousState: T;
  /** New state (for redo) */
  newState: T;
}

/**
 * Command history entry
 */
export interface CommandHistoryEntry {
  command: Command;
  executedAt: number;
  undoneAt?: number;
  redoneAt?: number;
}

/**
 * Undo/Redo state
 */
export interface UndoRedoState {
  /** Commands that can be undone (past) */
  undoStack: Command[];
  /** Commands that can be redone (future) */
  redoStack: Command[];
  /** Current command being executed */
  currentCommand: Command | null;
  /** Whether undo is in progress */
  isUndoing: boolean;
  /** Whether redo is in progress */
  isRedoing: boolean;
  /** Maximum history size */
  maxHistorySize: number;
}

/**
 * Factory function to create a command
 */
export function createCommand<T>(params: {
  entityType: Command["entityType"];
  entityId: string;
  description: string;
  previousState: T;
  newState: T;
  applyState: (state: T) => Promise<void>;
}): Command<T> {
  const {
    entityType,
    entityId,
    description,
    previousState,
    newState,
    applyState,
  } = params;

  const command: Command<T> = {
    id: `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    entityType,
    entityId,
    timestamp: Date.now(),
    description,
    previousState,
    newState,
    execute: async () => {
      await applyState(newState);
    },
    undo: async () => {
      await applyState(previousState);
    },
    redo: async () => {
      await applyState(newState);
    },
  };

  return command;
}

/**
 * Helper to create a Play update command
 */
export function createPlayUpdateCommand(params: {
  playId: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  applyUpdate: (
    playId: string,
    updates: Record<string, unknown>
  ) => Promise<void>;
}): Command {
  const { playId, field, oldValue, newValue, applyUpdate } = params;

  return createCommand({
    entityType: "play",
    entityId: playId,
    description: `Update ${field} from "${oldValue}" to "${newValue}"`,
    previousState: { [field]: oldValue },
    newState: { [field]: newValue },
    applyState: async (state) => {
      await applyUpdate(playId, state);
    },
  });
}

/**
 * Helper to create a Formation update command
 */
export function createFormationUpdateCommand(params: {
  formationId: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  applyUpdate: (
    formationId: string,
    updates: Record<string, unknown>
  ) => Promise<void>;
}): Command {
  const { formationId, field, oldValue, newValue, applyUpdate } = params;

  return createCommand({
    entityType: "formation",
    entityId: formationId,
    description: `Update ${field} from "${oldValue}" to "${newValue}"`,
    previousState: { [field]: oldValue },
    newState: { [field]: newValue },
    applyState: async (state) => {
      await applyUpdate(formationId, state);
    },
  });
}

/**
 * Check if undo is available
 */
export function canUndo(state: UndoRedoState): boolean {
  return state.undoStack.length > 0 && !state.isUndoing && !state.isRedoing;
}

/**
 * Check if redo is available
 */
export function canRedo(state: UndoRedoState): boolean {
  return state.redoStack.length > 0 && !state.isUndoing && !state.isRedoing;
}
