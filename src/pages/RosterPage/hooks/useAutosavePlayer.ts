/**
 * useAutosavePlayer Hook
 *
 * Provides debounced autosave functionality for the roster edit modal.
 * Saves player data after user stops typing for 800ms.
 * Integrates with global save indicator.
 *
 * @version 1.0.0
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { useSaveState } from "../../../contexts/SaveStateContext";
import type { PlayerRosterUpdate } from "../../../services/rosterService";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface UseAutosavePlayerOptions {
  /**
   * Delay in milliseconds before triggering save after last change
   * @default 800
   */
  debounceMs?: number;

  /**
   * Whether autosave is enabled
   * @default true
   */
  enabled?: boolean;

  /**
   * Player ID being edited
   */
  playerId: string | null;

  /**
   * Callback function to perform the actual save
   * Should update the player in database and return success
   */
  onSave: (playerId: string, updates: PlayerRosterUpdate) => Promise<void>;

  /**
   * Callback when save succeeds
   */
  onSaveSuccess?: () => void;

  /**
   * Callback when save fails
   */
  onSaveError?: (error: Error) => void;
}

export interface UseAutosavePlayerReturn {
  /**
   * Current save status
   */
  status: SaveStatus;

  /**
   * Last saved timestamp (ISO string)
   */
  lastSaved: string | null;

  /**
   * Trigger autosave with debounce
   * Call this from onChange handlers
   */
  triggerAutosave: (updates: PlayerRosterUpdate) => void;

  /**
   * Trigger a manual save immediately (bypasses debounce)
   */
  saveNow: (updates: PlayerRosterUpdate) => Promise<void>;

  /**
   * Reset the autosave timer
   */
  resetTimer: () => void;

  /**
   * Whether there are unsaved changes pending
   */
  hasUnsavedChanges: boolean;
}

/**
 * Hook for autosaving player data with debouncing
 */
export function useAutosavePlayer(
  options: UseAutosavePlayerOptions
): UseAutosavePlayerReturn {
  const {
    debounceMs = 800,
    enabled = true,
    playerId,
    onSave,
    onSaveSuccess,
    onSaveError,
  } = options;

  const [status, setStatus] = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Global save indicator
  const { startSaving, finishSaving } = useSaveState();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const pendingUpdatesRef = useRef<PlayerRosterUpdate | null>(null);

  // Perform the save
  const performSave = useCallback(
    async (updates: PlayerRosterUpdate) => {
      if (isSavingRef.current) {
        // Already saving, queue this update
        pendingUpdatesRef.current = updates;
        return;
      }

      if (!playerId) {
        console.warn("⚠️ Cannot autosave: no playerId provided");
        return;
      }

      try {
        isSavingRef.current = true;
        setStatus("saving");
        setHasUnsavedChanges(false);

        // Start global save indicator
        startSaving();

        await onSave(playerId, updates);

        const now = new Date().toISOString();
        setLastSaved(now);
        setStatus("saved");

        onSaveSuccess?.();

        // Finish with success status
        finishSaving("success");

        // Reset status back to idle after 2 seconds
        setTimeout(() => {
          setStatus("idle");
        }, 2000);

        // If there are pending updates, save them now
        if (pendingUpdatesRef.current) {
          const nextUpdates = pendingUpdatesRef.current;
          pendingUpdatesRef.current = null;
          isSavingRef.current = false;
          await performSave(nextUpdates);
        }
      } catch (error) {
        console.error("❌ Autosave failed:", error);
        setStatus("error");

        onSaveError?.(error as Error);

        // Finish with error status
        finishSaving("error");

        // Reset status back to idle after 2 seconds
        setTimeout(() => {
          setStatus("idle");
        }, 2000);
      } finally {
        if (!pendingUpdatesRef.current) {
          isSavingRef.current = false;
        }
      }
    },
    [playerId, onSave, onSaveSuccess, onSaveError, startSaving, finishSaving]
  );

  // Trigger autosave with debounce
  const triggerAutosave = useCallback(
    (updates: PlayerRosterUpdate) => {
      if (!enabled || !playerId) return;

      setHasUnsavedChanges(true);

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for autosave
      timeoutRef.current = setTimeout(() => {
        performSave(updates);
      }, debounceMs);
    },
    [enabled, playerId, debounceMs, performSave]
  );

  // Save immediately (bypass debounce)
  const saveNow = useCallback(
    async (updates: PlayerRosterUpdate) => {
      // Clear any pending debounced save
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      await performSave(updates);
    },
    [performSave]
  );

  // Reset the timer
  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setHasUnsavedChanges(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    status,
    lastSaved,
    triggerAutosave,
    saveNow,
    resetTimer,
    hasUnsavedChanges,
  };
}
