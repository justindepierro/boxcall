/**
 * PlayCardContext
 *
 * Provides shared state and handlers for PlayCard components,
 * eliminating prop drilling and centralizing state management.
 */

import React, {
  createContext,
  useCallback,
  useState,
  useRef,
  useEffect,
  useMemo,
} from "react";
import type { Play as PlayType } from "../../../../types/play";
import type { PersonnelConfiguration } from "../../../../types/personnel";
import { logError } from "../../../../utils/logger";
import { legacyValueToLeftRight } from "../../../../utils/leftRight";

// ============================================================================
// Types (exported for hook file)
// ============================================================================

type SaveQueue = Set<string>;

export interface PlayCardContextValue {
  // Play data
  play: PlayType;
  optimisticPlay: PlayType;

  // Saving state
  savingFields: SaveQueue;
  isSaving: (field: string) => boolean;

  // Handlers
  handleInlineSave: (
    field: keyof PlayType,
    value: string | number | boolean | null | string[]
  ) => Promise<void>;

  // Configuration
  personnelConfigurations: PersonnelConfiguration[];
  showOneWordCalls: boolean;
  directionDisplayFormat: "full" | "abbrev" | "letter";

  // Suggestions
  formationSuggestions: string[];
  playNameSuggestions: string[];
  playTypeSuggestions: string[];
  personnelSuggestions: string[];
}

interface PlayCardProviderProps {
  play: PlayType;
  children: React.ReactNode;
  onSave?: (playId: string, updates: Partial<PlayType>) => Promise<void>;
  personnelConfigurations?: PersonnelConfiguration[];
  showOneWordCalls?: boolean;
  directionDisplayFormat?: "full" | "abbrev" | "letter";
  formationSuggestions?: string[];
  playNameSuggestions?: string[];
  playTypeSuggestions?: string[];
  personnelSuggestions?: string[];
}

// ============================================================================
// Context (exported for hook file)
// ============================================================================

export const PlayCardContext = createContext<PlayCardContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

export const PlayCardProvider: React.FC<PlayCardProviderProps> = ({
  play,
  children,
  onSave,
  personnelConfigurations = [],
  showOneWordCalls = false,
  directionDisplayFormat = "full",
  formationSuggestions = [],
  playNameSuggestions = [],
  playTypeSuggestions = [],
  personnelSuggestions = [],
}) => {
  // Optimistic state for instant UI updates
  const [optimisticPlay, setOptimisticPlay] = useState<PlayType>(play);
  const [savingFields, setSavingFields] = useState<SaveQueue>(new Set());

  // Track last synced play to prevent overwriting during saves
  const lastSyncedPlayRef = useRef<PlayType>(play);
  const lastSaveTimeRef = useRef<number>(0);

  // Sync optimistic state when play prop changes (from server)
  useEffect(() => {
    if (play !== lastSyncedPlayRef.current) {
      const timeSinceLastSave = Date.now() - lastSaveTimeRef.current;
      lastSyncedPlayRef.current = play;

      // Don't sync if we're currently saving or just finished
      if (savingFields.size === 0 && timeSinceLastSave > 500) {
        setOptimisticPlay(play);
      }
    }
  }, [play, savingFields.size]);

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
        lastSaveTimeRef.current = Date.now();
      }
    },
    [onSave, play]
  );

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<PlayCardContextValue>(
    () => ({
      play,
      optimisticPlay,
      savingFields,
      isSaving,
      handleInlineSave,
      personnelConfigurations,
      showOneWordCalls,
      directionDisplayFormat,
      formationSuggestions,
      playNameSuggestions,
      playTypeSuggestions,
      personnelSuggestions,
    }),
    [
      play,
      optimisticPlay,
      savingFields,
      isSaving,
      handleInlineSave,
      personnelConfigurations,
      showOneWordCalls,
      directionDisplayFormat,
      formationSuggestions,
      playNameSuggestions,
      playTypeSuggestions,
      personnelSuggestions,
    ]
  );

  return (
    <PlayCardContext.Provider value={value}>
      {children}
    </PlayCardContext.Provider>
  );
};

export default PlayCardContext;
