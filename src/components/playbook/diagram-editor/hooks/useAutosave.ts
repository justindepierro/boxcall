/**
 * useAutosave Hook
 *
 * Provides debounced autosave functionality for the diagram editor.
 * Saves diagram data to Supabase after user stops making changes for N seconds.
 */

import { useEffect, useRef, useCallback, useState } from "react";
import type { Player } from "../types/Player";
import type { DiagramDocument } from "../types/DiagramTypes";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface UseAutosaveOptions {
  /**
   * Delay in milliseconds before triggering save after last change
   * @default 2000
   */
  debounceMs?: number;

  /**
   * Whether autosave is enabled
   * @default true
   */
  enabled?: boolean;

  /**
   * Callback function to perform the actual save
   */
  onSave: (data: DiagramDocument) => Promise<void>;

  /**
   * Callback when save succeeds
   */
  onSaveSuccess?: () => void;

  /**
   * Callback when save fails
   */
  onSaveError?: (error: Error) => void;
}

export interface UseAutosaveReturn {
  /**
   * Current save status
   */
  status: SaveStatus;

  /**
   * Last saved timestamp (ISO string)
   */
  lastSaved: string | null;

  /**
   * Trigger a manual save immediately
   */
  saveNow: () => Promise<void>;

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
 * Hook for autosaving diagram data with debouncing
 */
export function useAutosave(
  players: Player[],
  playName: string,
  options: UseAutosaveOptions
): UseAutosaveReturn {
  const {
    debounceMs = 2000,
    enabled = true,
    onSave,
    onSaveSuccess,
    onSaveError,
  } = options;

  const [status, setStatus] = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const lastPlayersRef = useRef<Player[]>(players);
  const lastPlayNameRef = useRef<string>(playName);

  // Create diagram document from current state
  const createDiagramDocument = useCallback((): DiagramDocument => {
    return {
      version: 2,
      players,
      meta: {
        createdAt: lastSaved ? new Date(lastSaved).getTime() : Date.now(),
        updatedAt: Date.now(),
      },
    };
  }, [players, lastSaved]);

  // Perform the save
  const performSave = useCallback(async () => {
    if (isSavingRef.current) {
      console.log("⏳ Save already in progress, skipping...");
      return;
    }

    // Don't save if there are no players or no play name
    if (players.length === 0 || !playName.trim()) {
      console.log("⏭️  Skipping autosave: no players or play name");
      return;
    }

    try {
      isSavingRef.current = true;
      setStatus("saving");
      setHasUnsavedChanges(false);

      const diagramData = createDiagramDocument();
      await onSave(diagramData);

      const now = new Date().toISOString();
      setLastSaved(now);
      setStatus("saved");
      lastPlayersRef.current = players;
      lastPlayNameRef.current = playName;

      onSaveSuccess?.();

      // Reset status back to idle after 2 seconds
      setTimeout(() => {
        setStatus("idle");
      }, 2000);
    } catch (error) {
      console.error("❌ Autosave failed:", error);
      setStatus("error");
      setHasUnsavedChanges(true);
      onSaveError?.(
        error instanceof Error ? error : new Error("Unknown error")
      );

      // Reset status back to idle after 5 seconds
      setTimeout(() => {
        setStatus("idle");
      }, 5000);
    } finally {
      isSavingRef.current = false;
    }
  }, [
    players,
    playName,
    createDiagramDocument,
    onSave,
    onSaveSuccess,
    onSaveError,
  ]);

  // Trigger save now (manual)
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    await performSave();
  }, [performSave]);

  // Reset the debounce timer
  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!enabled) return;

    setHasUnsavedChanges(true);

    timeoutRef.current = setTimeout(() => {
      performSave();
    }, debounceMs);
  }, [enabled, debounceMs, performSave]);

  // Watch for changes in players or play name
  useEffect(() => {
    // Skip if autosave is disabled
    if (!enabled) return;

    // Skip if no meaningful changes
    const playersChanged =
      JSON.stringify(players) !== JSON.stringify(lastPlayersRef.current);
    const playNameChanged = playName !== lastPlayNameRef.current;

    if (!playersChanged && !playNameChanged) {
      return;
    }

    // Reset the timer on every change
    resetTimer();

    // Cleanup: clear timeout on unmount or when dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [players, playName, enabled, resetTimer]);

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
    saveNow,
    resetTimer,
    hasUnsavedChanges,
  };
}
