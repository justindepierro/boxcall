/**
 * usePlayCardState Hook
 *
 * Extracts optimistic state management from PlayCard component.
 * Handles:
 * - Optimistic updates for instant UI feedback
 * - Server sync with conflict resolution
 * - Field-level saving state tracking
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { Play as PlayType } from "../../../../types/play";
import { logError } from "../../../../utils/logger";
import { legacyValueToLeftRight } from "../../../../utils/leftRight";

// ============================================================================
// Types
// ============================================================================

type SaveQueue = Set<string>;

export interface UsePlayCardStateOptions {
  /** The play data from the server */
  play: PlayType;
  /** Callback to save updates to the server */
  onSave?: (playId: string, updates: Partial<PlayType>) => Promise<void>;
}

export interface UsePlayCardStateReturn {
  /** Current optimistic state (may differ from server during saves) */
  optimisticPlay: PlayType;
  /** Set of field names currently being saved */
  savingFields: SaveQueue;
  /** Check if a specific field is saving */
  isSaving: (field: string) => boolean;
  /** Handle inline field saves with optimistic updates */
  handleInlineSave: (
    field: keyof PlayType,
    value: string | number | boolean | null | string[]
  ) => Promise<void>;
}

// ============================================================================
// Hook
// ============================================================================

export function usePlayCardState({
  play,
  onSave,
}: UsePlayCardStateOptions): UsePlayCardStateReturn {
  const [optimisticPlay, setOptimisticPlay] = useState<PlayType>(play);
  const [savingFields, setSavingFields] = useState<SaveQueue>(new Set());

  // Track last synced play to prevent overwriting during saves
  const lastSyncedPlayRef = useRef<PlayType>(play);
  const lastSaveTimeRef = useRef<number>(0);

  // Sync optimistic state when play prop changes (from server)
  useEffect(() => {
    // Only sync when play prop actually changes (new data from server)
    if (play !== lastSyncedPlayRef.current) {
      const timeSinceLastSave = Date.now() - lastSaveTimeRef.current;
      lastSyncedPlayRef.current = play;

      // Don't sync if:
      // 1. We're currently saving any fields, OR
      // 2. We just finished saving within the last 500ms (optimistic update grace period)
      if (savingFields.size === 0 && timeSinceLastSave > 500) {
        setOptimisticPlay(play);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play]);

  // Check if a field is currently saving
  const isSaving = useCallback(
    (field: string) => savingFields.has(field),
    [savingFields]
  );

  // Handle inline field saves with optimistic updates
  const handleInlineSave = useCallback(
    async (
      field: keyof PlayType,
      value: string | number | boolean | null | string[]
    ) => {
      const fieldName = field as string;

      // Build updates object
      const updates: Partial<PlayType> = {
        [field]: value,
      } as Partial<PlayType>;

      // Keep legacy f_dir and formation_direction aligned
      if (field === "f_dir") {
        const dir = legacyValueToLeftRight(String(value ?? ""));
        updates.formation_direction = dir;
      }

      // Optimistic update
      setOptimisticPlay((prev) => ({ ...prev, ...updates }));
      setSavingFields((prev) => new Set(prev).add(fieldName));

      try {
        if (onSave) {
          await onSave(play.id, updates);
        }
      } catch (error) {
        // Revert on error
        logError(`[PlayCard] Failed to save ${fieldName}, reverting:`, error);
        setOptimisticPlay((prev) => {
          const reverted: Partial<PlayType> = { [field]: play[field] };
          if (field === "f_dir") {
            reverted.formation_direction = play.formation_direction ?? null;
          }
          return { ...prev, ...reverted };
        });
      } finally {
        setSavingFields((prev) => {
          const next = new Set(prev);
          next.delete(fieldName);
          return next;
        });
        // Track when the save completed to prevent immediate sync
        lastSaveTimeRef.current = Date.now();
      }
    },
    [onSave, play]
  );

  return {
    optimisticPlay,
    savingFields,
    isSaving,
    handleInlineSave,
  };
}
