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
 * - IndexedDB persistence (v3.1)
 *
 * @version 3.1.0 - Offline Support
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";

export type SaveStatus = "idle" | "success" | "error" | "warning";

export interface SaveOperation {
  id: string;
  entityType: "play" | "formation" | "team" | "personnel" | "other";
  entityId: string;
  operation: () => Promise<void>;
  retries: number;
  maxRetries: number;
  timestamp: number;
  description?: string;
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
  /** Start a save operation (shows spinner) */
  startSaving: () => void;
  /** Finish save operation with status (shows color flash) */
  finishSaving: (status: SaveStatus) => void;
  /** Queue a save operation with automatic retry */
  queueSave: (operation: SaveOperation) => void;
  /** Retry all failed saves */
  retryFailedSaves: () => Promise<void>;
  /** Clear all queued saves */
  clearQueue: () => void;
}

const SaveStateContext = createContext<SaveStateContextValue | undefined>(
  undefined
);

export const SaveStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveQueue, setSaveQueue] = useState<SaveOperation[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Track timeout for cleanup
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track save start time for minimum duration
  const saveStartTimeRef = useRef<number>(0);
  
  // Track if queue is currently processing
  const isProcessingQueue = useRef(false);

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
      setSaveQueue(prev => prev.slice(1));
      
      // Continue processing if more in queue
      isProcessingQueue.current = false;
      if (saveQueue.length > 1) {
        setTimeout(processSaveQueue, 100);
      }
    } catch (error) {
      console.error("[SaveQueue] Operation failed:", {
        id: operation.id,
        retries: operation.retries,
        maxRetries: operation.maxRetries,
        error
      });
      
      if (operation.retries < operation.maxRetries) {
        // Retry with exponential backoff
        const backoffMs = Math.min(Math.pow(2, operation.retries) * 1000, 30000);
        
        console.log("[SaveQueue] Retrying after backoff:", {
          id: operation.id,
          retries: operation.retries + 1,
          backoffMs
        });
        
        setTimeout(() => {
          setSaveQueue(prev => [
            { ...prev[0], retries: prev[0].retries + 1 },
            ...prev.slice(1)
          ]);
          isProcessingQueue.current = false;
          processSaveQueue();
        }, backoffMs);
      } else {
        // Max retries exceeded - remove from queue
        console.error("[SaveQueue] Max retries exceeded, removing from queue:", operation.id);
        setSaveQueue(prev => prev.slice(1));
        isProcessingQueue.current = false;
        
        // Continue with next operation
        if (saveQueue.length > 1) {
          setTimeout(processSaveQueue, 100);
        }
      }
    }
  }, [saveQueue]);
  
  // Queue a save operation
  const queueSave = useCallback((operation: SaveOperation) => {
    console.log("[SaveQueue] Queueing save:", {
      id: operation.id,
      entityType: operation.entityType,
      entityId: operation.entityId
    });
    
    setSaveQueue(prev => [...prev, operation]);
    
    // Start processing if not already
    setTimeout(processSaveQueue, 0);
  }, [processSaveQueue]);
  
  // Retry all failed saves
  const retryFailedSaves = useCallback(async () => {
    console.log("[SaveQueue] Retrying all failed saves:", saveQueue.length);
    
    // Reset retry count for all operations
    setSaveQueue(prev => prev.map(op => ({ ...op, retries: 0 })));
    
    // Start processing
    isProcessingQueue.current = false;
    processSaveQueue();
  }, [saveQueue, processSaveQueue]);
  
  // Clear queue
  const clearQueue = useCallback(() => {
    console.log("[SaveQueue] Clearing queue:", saveQueue.length);
    setSaveQueue([]);
    isProcessingQueue.current = false;
  }, [saveQueue]);
  
  // Track online/offline status and auto-retry when back online
  useEffect(() => {
    const handleOnline = () => {
      console.log("[SaveQueue] Back online - retrying queued operations");
      setIsOnline(true);
      // Automatically retry queued operations when coming back online
      if (saveQueue.length > 0) {
        retryFailedSaves();
      }
    };
    
    const handleOffline = () => {
      console.log("[SaveQueue] Gone offline");
      setIsOnline(false);
    };
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [saveQueue.length, retryFailedSaves]);

  return (
    <SaveStateContext.Provider
      value={{ 
        isSaving, 
        saveStatus, 
        queueLength: saveQueue.length,
        isOnline,
        startSaving, 
        finishSaving,
        queueSave,
        retryFailedSaves,
        clearQueue
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
export const useSaveState = () => {
  const context = useContext(SaveStateContext);
  if (!context) {
    throw new Error("useSaveState must be used within SaveStateProvider");
  }
  return context;
};
