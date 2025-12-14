/**
 * Global Save State Context
 *
 * Provides universal save state tracking across the entire application.
 * Displays visual feedback in the app header logo (spinning, color-coded).
 *
 * Features:
 * - Spinning logo while saving
 * - Green flash on successful save
 * - Red flash on error
 * - Yellow flash on warning
 * - Memory-safe timeout cleanup
 * - Race condition prevention
 * - Save queue with retry logic (v3.0)
 * - Exponential backoff for failures
 * - Online/offline detection (v3.1)
 * - IndexedDB persistence (v3.2)
 * - Conflict resolution (v3.3) 🆕
 *
 * @version 3.3.0 - Conflict Resolution
 */

import React, {
  createContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { info, error as logError } from "../utils/logger";
import {
  persistOperation,
  loadOperations,
  removeOperation as _removeOperation,
  clearAllOperations,
  type PersistedSaveOperation,
} from "../utils/saveQueueDB";
import type { ConflictResolution } from "../types/saveConflict";

export type SaveStatus = "idle" | "success" | "error" | "warning" | "conflict";

export interface SaveOperation {
  id: string;
  entityType: "play" | "formation" | "team" | "personnel" | "other";
  entityId: string;
  operation: () => Promise<void>;
  retries: number;
  maxRetries: number;
  timestamp: number;
  description?: string;
  version?: number; // For optimistic locking (v3.3)
}

interface SaveStateContextValue {
  /** Whether a save operation is currently in progress */
  isSaving: boolean;
  /** Current save status for color-coded feedback */
  saveStatus: SaveStatus;
  /** Number of pending saves in queue */
  queueLength: number;
  /** Whether the app is currently online */
  isOnline: boolean;
  /** Whether there are pending operations from last session (v3.2) */
  hasPendingFromLastSession: boolean;
  /** Current active conflict (v3.3) */
  activeConflict: ConflictResolution | null;
  /** Start a save operation (shows spinner) */
  startSaving: () => void;
  /** Finish save operation with status (shows color flash) */
  finishSaving: (status: SaveStatus) => void;
  /** Queue a save operation with automatic retry */
  queueSave: (operation: SaveOperation) => void;
  /** Retry all failed saves */
  retryFailedSaves: () => Promise<void>;
  /** Clear all queued saves */
  clearQueue: () => Promise<void>;
  /** Show conflict resolution dialog (v3.3) */
  showConflict: (conflict: ConflictResolution) => void;
  /** Clear active conflict */
  clearConflict: () => void;
}

const SaveStateContext = createContext<SaveStateContextValue | undefined>(
  undefined
);

export { SaveStateContext };

// Hook to handle queue persistence to IndexedDB
function useQueuePersistence(
  saveQueue: SaveOperation[],
  hasLoadedPersistedQueue: React.MutableRefObject<boolean>
) {
  useEffect(() => {
    const persistQueue = async () => {
      try {
        // Clear existing persisted operations
        await clearAllOperations();

        // Persist current queue (metadata only, not the operation function)
        for (const op of saveQueue) {
          const persistedOp: PersistedSaveOperation = {
            id: op.id,
            entityType: op.entityType,
            entityId: op.entityId,
            operationData: {}, // We don't have the data, just metadata
            retries: op.retries,
            maxRetries: op.maxRetries,
            timestamp: op.timestamp,
            description: op.description,
          };
          await persistOperation(persistedOp);
        }

        info(
          `[SaveQueue] Persisted ${saveQueue.length} operations to IndexedDB`
        );
      } catch (error) {
        logError("[SaveQueue] Failed to persist queue:", error);
      }
    };

    if (hasLoadedPersistedQueue.current) {
      persistQueue();
    }
  }, [saveQueue, hasLoadedPersistedQueue]);
}

// Hook to handle online/offline status
function useOnlineStatus(
  setIsOnline: (online: boolean) => void,
  saveQueueLength: number,
  retryFailedSaves: () => Promise<void>
) {
  useEffect(() => {
    const handleOnline = () => {
      info("[SaveQueue] Back online - retrying queued operations");
      setIsOnline(true);
      // Automatically retry queued operations when coming back online
      if (saveQueueLength > 0) {
        retryFailedSaves();
      }
    };

    const handleOffline = () => {
      info("[SaveQueue] Gone offline");
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setIsOnline, saveQueueLength, retryFailedSaves]);
}

export const SaveStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveQueue, setSaveQueue] = useState<SaveOperation[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasPendingFromLastSession, setHasPendingFromLastSession] =
    useState(false);
  const [activeConflict, setActiveConflict] =
    useState<ConflictResolution | null>(null);

  // Track timeout for cleanup
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track save start time for minimum duration
  const saveStartTimeRef = useRef<number>(0);

  // Track if queue is currently processing
  const isProcessingQueue = useRef(false);

  // Track if we've loaded persisted operations
  const hasLoadedPersistedQueue = useRef(false);

  // Load persisted queue metadata on mount
  useEffect(() => {
    if (hasLoadedPersistedQueue.current) return;
    hasLoadedPersistedQueue.current = true;

    const loadPersistedQueue = async () => {
      try {
        const operations = await loadOperations();
        if (operations.length > 0) {
          info(
            `[SaveQueue] Found ${operations.length} pending operations from last session`
          );
          setHasPendingFromLastSession(true);
          // Don't auto-retry - let user decide
          // They can click "Retry Pending Saves" button
        }
      } catch (error) {
        logError("[SaveQueue] Failed to load persisted queue:", error);
      }
    };

    loadPersistedQueue();
  }, []);

  const startSaving = useCallback(() => {
    // Clear any pending status reset
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Record start time for minimum duration
    saveStartTimeRef.current = Date.now();

    // Batch state updates to prevent multiple renders
    setIsSaving((prev) => {
      if (!prev) {
        // Only reset status if not already saving
        setSaveStatus("idle");
        return true;
      }
      return prev;
    });
  }, []);

  const finishSaving = useCallback(async (status: SaveStatus) => {
    // Calculate elapsed time
    const elapsed = Date.now() - saveStartTimeRef.current;
    const minDuration = 300; // 300ms minimum spinner visibility

    // If save was too fast, wait to ensure user sees spinner
    if (elapsed < minDuration) {
      await new Promise((resolve) =>
        setTimeout(resolve, minDuration - elapsed)
      );
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Update states
    setIsSaving(false);
    setSaveStatus(status);

    // Reset status after flash (1 second)
    timeoutRef.current = setTimeout(() => {
      setSaveStatus("idle");
      timeoutRef.current = null;
    }, 1000);
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Process save queue
  const processSaveQueue = useCallback(async () => {
    if (isProcessingQueue.current) return;
    if (saveQueue.length === 0) return;

    isProcessingQueue.current = true;
    const operation = saveQueue[0];

    try {
      await operation.operation();

      // Remove successful operation from queue
      setSaveQueue((prev) => prev.slice(1));

      // Continue processing if more in queue
      isProcessingQueue.current = false;
      if (saveQueue.length > 1) {
        setTimeout(processSaveQueue, 100);
      }
    } catch (error) {
      logError("[SaveQueue] Operation failed:", {
        id: operation.id,
        retries: operation.retries,
        maxRetries: operation.maxRetries,
        error,
      });

      if (operation.retries < operation.maxRetries) {
        // Retry with exponential backoff
        const backoffMs = Math.min(
          Math.pow(2, operation.retries) * 1000,
          30000
        );

        info("[SaveQueue] Retrying after backoff:", {
          id: operation.id,
          retries: operation.retries + 1,
          backoffMs,
        });

        setTimeout(() => {
          setSaveQueue((prev) => [
            { ...prev[0], retries: prev[0].retries + 1 },
            ...prev.slice(1),
          ]);
          isProcessingQueue.current = false;
          processSaveQueue();
        }, backoffMs);
      } else {
        // Max retries exceeded - remove from queue
        logError(
          "[SaveQueue] Max retries exceeded, removing from queue:",
          operation.id
        );
        setSaveQueue((prev) => prev.slice(1));
        isProcessingQueue.current = false;

        // Continue with next operation
        if (saveQueue.length > 1) {
          setTimeout(processSaveQueue, 100);
        }
      }
    }
  }, [saveQueue]);

  // Queue a save operation
  const queueSave = useCallback(
    (operation: SaveOperation) => {
      info("[SaveQueue] Queueing save:", {
        id: operation.id,
        entityType: operation.entityType,
        entityId: operation.entityId,
      });

      setSaveQueue((prev) => [...prev, operation]);

      // Start processing if not already
      setTimeout(processSaveQueue, 0);
    },
    [processSaveQueue]
  );

  // Retry all failed saves
  const retryFailedSaves = useCallback(async () => {
    info("[SaveQueue] Retrying all failed saves:", saveQueue.length);

    // Reset retry count for all operations
    setSaveQueue((prev) => prev.map((op) => ({ ...op, retries: 0 })));

    // Start processing
    isProcessingQueue.current = false;
    processSaveQueue();
  }, [saveQueue, processSaveQueue]);

  // Clear queue
  const clearQueue = useCallback(async () => {
    info("[SaveQueue] Clearing queue:", saveQueue.length);
    setSaveQueue([]);
    isProcessingQueue.current = false;
    setHasPendingFromLastSession(false);

    // Clear persisted queue
    try {
      await clearAllOperations();
      info("[SaveQueue] Cleared persisted queue from IndexedDB");
    } catch (error) {
      logError("[SaveQueue] Failed to clear persisted queue:", error);
    }
  }, [saveQueue]);

  // Persist queue to IndexedDB whenever it changes
  useQueuePersistence(saveQueue, hasLoadedPersistedQueue);

  // Track online/offline status and auto-retry when back online
  useOnlineStatus(setIsOnline, saveQueue.length, retryFailedSaves);

  // Conflict resolution methods (v3.3)
  const showConflict = useCallback(
    (conflict: ConflictResolution) => {
      setActiveConflict(conflict);
      finishSaving("conflict"); // Show yellow indicator
    },
    [finishSaving]
  );

  const clearConflict = useCallback(() => {
    setActiveConflict(null);
  }, []);

  return (
    <SaveStateContext.Provider
      value={{
        isSaving,
        saveStatus,
        queueLength: saveQueue.length,
        isOnline,
        hasPendingFromLastSession,
        activeConflict,
        startSaving,
        finishSaving,
        queueSave,
        retryFailedSaves,
        clearQueue,
        showConflict,
        clearConflict,
      }}
    >
      {children}
    </SaveStateContext.Provider>
  );
};

/**
 * Hook to access global save state
 *
 * Usage:
 * ```tsx
 * const { isSaving, saveStatus, startSaving, finishSaving } = useSaveState();
 *
 * // Start save
 * startSaving();
 *
 * // Finish with status
 * try {
 *   await saveData();
 *   finishSaving('success');
 * } catch (error) {
 *   finishSaving('error');
 * }
 * ```
 */
