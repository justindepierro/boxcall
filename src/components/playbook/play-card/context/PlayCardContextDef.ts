/**
 * PlayCardContext Definition
 * 
 * Extracted to separate file for Fast Refresh compatibility.
 * Context definitions should be in their own file, separate from components.
 */

import { createContext } from "react";
import type { Play as PlayType } from "../../../../types/play";
import type { PersonnelConfiguration } from "../../../../types/personnel";

// ============================================================================
// Types
// ============================================================================

export type SaveQueue = Set<string>;

export interface PlayCardContextValue {
  // Play data
  play: PlayType;
  optimisticPlay: PlayType;

  // Display values (computed)
  displayName: string;
  subtitleText: string | null;
  phaseLabel: string | null;

  // Saving state
  savingFields: SaveQueue;
  isSaving: (field: string) => boolean;

  // Handlers
  handleInlineSave: (
    field: keyof PlayType,
    value: string | number | boolean | null | string[]
  ) => Promise<void>;

  // Expansion state
  isExpanded: boolean;
  onToggleExpand: () => void;

  // Favorites
  isFavorite: boolean;
  onToggleFavorite: () => void;

  // Selection
  isSelected: boolean;
  onSelectionChange?: (playId: string, selected: boolean) => void;

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

// ============================================================================
// Context
// ============================================================================

export const PlayCardContext = createContext<PlayCardContextValue | null>(null);
