/**
 * usePlayCardProps Hook
 *
 * Merges PlayCardContext values with component props.
 * Context values take precedence when available.
 * Reduces complexity in header components.
 */

import type { Play as PlayType } from "../../../../types/play";
import type { PersonnelConfiguration } from "../../../../types/personnel";
import { useOptionalPlayCardContext } from "../context";

// ============================================================================
// Types
// ============================================================================

export interface PlayCardHeaderProps {
  play: PlayType;
  optimisticPlay: PlayType;
  displayName: string;
  subtitleText: string | null;
  showOneWordCalls: boolean;
  isSelected?: boolean;
  onSelectionChange?: (playId: string, selected: boolean) => void;
  phaseLabel: string | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  personnelConfigurations?: PersonnelConfiguration[];
}

export interface MergedPlayCardProps {
  play: PlayType;
  optimisticPlay: PlayType;
  displayName: string;
  subtitleText: string | null;
  showOneWordCalls: boolean;
  isSelected: boolean;
  onSelectionChange?: (playId: string, selected: boolean) => void;
  phaseLabel: string | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isExpanded: boolean;
  onToggleExpand?: () => void;
  personnelConfigurations: PersonnelConfiguration[];
}

// ============================================================================
// Helper
// ============================================================================

/**
 * Merge context and props, preferring context values when defined.
 * Uses type-safe object spread to avoid complexity from multiple ternaries.
 */
function mergeWithContext<T extends PlayCardHeaderProps>(
  ctx: ReturnType<typeof useOptionalPlayCardContext>,
  props: T
): MergedPlayCardProps {
  // Start with prop defaults
  const base: MergedPlayCardProps = {
    play: props.play,
    optimisticPlay: props.optimisticPlay,
    displayName: props.displayName,
    subtitleText: props.subtitleText,
    showOneWordCalls: props.showOneWordCalls,
    isSelected: props.isSelected ?? false,
    onSelectionChange: props.onSelectionChange,
    phaseLabel: props.phaseLabel,
    isFavorite: props.isFavorite,
    onToggleFavorite: props.onToggleFavorite,
    isExpanded: props.isExpanded ?? false,
    onToggleExpand: props.onToggleExpand,
    personnelConfigurations: props.personnelConfigurations ?? [],
  };

  // No context? Return base
  if (!ctx) return base;

  // Override with context values where defined
  return {
    play: ctx.play ?? base.play,
    optimisticPlay: ctx.optimisticPlay ?? base.optimisticPlay,
    displayName: ctx.displayName ?? base.displayName,
    subtitleText: ctx.subtitleText ?? base.subtitleText,
    showOneWordCalls: ctx.showOneWordCalls ?? base.showOneWordCalls,
    isSelected: ctx.isSelected ?? base.isSelected,
    onSelectionChange: ctx.onSelectionChange ?? base.onSelectionChange,
    phaseLabel: ctx.phaseLabel ?? base.phaseLabel,
    isFavorite: ctx.isFavorite ?? base.isFavorite,
    onToggleFavorite: ctx.onToggleFavorite ?? base.onToggleFavorite,
    isExpanded: ctx.isExpanded ?? base.isExpanded,
    onToggleExpand: ctx.onToggleExpand ?? base.onToggleExpand,
    personnelConfigurations:
      ctx.personnelConfigurations ?? base.personnelConfigurations,
  };
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Merges context values with props, preferring context when available.
 * This reduces complexity in header components by centralizing the merge logic.
 */
export function usePlayCardProps(
  props: PlayCardHeaderProps
): MergedPlayCardProps {
  const ctx = useOptionalPlayCardContext();
  return mergeWithContext(ctx, props);
}
