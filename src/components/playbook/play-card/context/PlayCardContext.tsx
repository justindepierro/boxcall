/**
 * PlayCardContext Provider
 *
 * Provides shared state and handlers for PlayCard components,
 * eliminating prop drilling and centralizing state management.
 *
 * Note: Context definition is in PlayCardContextDef.ts for Fast Refresh compatibility.
 */

import React, {
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
import {
  PlayCardContext,
  type PlayCardContextValue,
  type SaveQueue,
} from "./PlayCardContextDef";

// Re-export for backward compatibility
export { PlayCardContext, type PlayCardContextValue };

// ============================================================================
// Provider Props
// ============================================================================

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
  // Display values (pre-computed by parent)
  displayName: string;
  subtitleText: string | null;
  phaseLabel: string | null;
  // Expansion state
  isExpanded: boolean;
  onToggleExpand: () => void;
  // Favorites
  isFavorite: boolean;
  onToggleFavorite: () => void;
  // Selection
  isSelected?: boolean;
  onSelectionChange?: (playId: string, selected: boolean) => void;
}

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
  displayName,
  subtitleText,
  phaseLabel,
  isExpanded,
  onToggleExpand,
  isFavorite,
  onToggleFavorite,
  isSelected = false,
  onSelectionChange,
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
      displayName,
      subtitleText,
      phaseLabel,
      savingFields,
      isSaving,
      handleInlineSave,
      isExpanded,
      onToggleExpand,
      isFavorite,
      onToggleFavorite,
      isSelected,
      onSelectionChange,
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
      displayName,
      subtitleText,
      phaseLabel,
      savingFields,
      isSaving,
      handleInlineSave,
      isExpanded,
      onToggleExpand,
      isFavorite,
      onToggleFavorite,
      isSelected,
      onSelectionChange,
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
