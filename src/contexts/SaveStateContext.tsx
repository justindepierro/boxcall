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
 *
 * @version 2.0.0 - Production Optimized
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

interface SaveStateContextValue {
  /** Whether a save operation is currently in progress */
  isSaving: boolean;
  /** Current save status for color-coded feedback */
  saveStatus: SaveStatus;
  /** Start a save operation (shows spinner) */
  startSaving: () => void;
  /** Finish save operation with status (shows color flash) */
  finishSaving: (status: SaveStatus) => void;
}

const SaveStateContext = createContext<SaveStateContextValue | undefined>(
  undefined
);

export const SaveStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Track timeout for cleanup
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track save start time for minimum duration
  const saveStartTimeRef = useRef<number>(0);

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

  return (
    <SaveStateContext.Provider
      value={{ isSaving, saveStatus, startSaving, finishSaving }}
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
