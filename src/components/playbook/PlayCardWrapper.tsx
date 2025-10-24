import React from "react";
import { PlayCard } from "./PlayCard";
import type { Play } from "../../types/play";
import type { PersonnelConfiguration } from "../../types/personnel";
import { usePrefetchQueries } from "../../hooks/usePrefetchQueries";

/**
 * Unified wrapper for PlayCard that consolidates common props
 * and handles variant-specific configuration.
 *
 * This component eliminates the duplication of PlayCard instantiation
 * across PlayGrid's list and grid views.
 */

interface PlayCardWrapperProps {
  play: Play;
  variant: "list" | "tile";
  index?: number;

  // Common props from PlayGrid
  showOneWordCalls?: boolean;
  onEdit?: (play: Play) => void;
  onSave?: (playId: string, updates: Partial<Play>) => Promise<void>;
  onDuplicate?: (play: Play) => void;
  onCreateDiagram?: (play: Play) => void;
  onOpenAssignments?: (play: Play) => void;
  onAddToPracticeScript?: (play: Play) => void;
  onAddToGamePlan?: (play: Play) => void;
  onPostToTeamBulletin?: (play: Play) => void;

  // Selection state
  isSelected?: boolean;
  onSelectionChange?: (playId: string, selected: boolean) => void;

  // Suggestions
  formationSuggestions?: string[];
  playNameSuggestions?: string[];
  playTypeSuggestions?: string[];
  personnelSuggestions?: string[];
  personnelConfigurations?: PersonnelConfiguration[];

  // Display format
  directionDisplayFormat?: "full" | "abbrev" | "letter";

  // Expansion state
  expandedPlayId?: string | null;
  onToggleExpand?: (playId: string) => void;
}

export const PlayCardWrapper: React.FC<PlayCardWrapperProps> = ({
  play,
  variant,
  index,
  showOneWordCalls,
  onEdit,
  onSave,
  onDuplicate,
  onCreateDiagram,
  onOpenAssignments,
  onAddToPracticeScript,
  onAddToGamePlan,
  onPostToTeamBulletin,
  isSelected,
  onSelectionChange,
  formationSuggestions,
  playNameSuggestions,
  playTypeSuggestions,
  personnelSuggestions,
  personnelConfigurations,
  directionDisplayFormat,
  expandedPlayId,
  onToggleExpand,
}) => {
  const { prefetchPlayDetails, cancelPrefetch } = usePrefetchQueries();

  // Determine variant-specific props
  const variantProps =
    variant === "tile"
      ? { variant: "tile" as const, density: "comfortable" as const }
      : { variant: "list" as const, density: "compact" as const };

  // Common props for all PlayCard instances
  const commonProps = {
    play,
    showOneWordCalls,
    onEdit,
    onSave,
    onDuplicate,
    onCreateDiagram,
    onOpenAssignments,
    onAddToPracticeScript,
    onAddToGamePlan,
    onPostToTeamBulletin,
    isSelected,
    onSelectionChange,
    formationSuggestions,
    playNameSuggestions,
    playTypeSuggestions,
    personnelSuggestions,
    personnelConfigurations,
    directionDisplayFormat: directionDisplayFormat || "full",
    isExpanded: expandedPlayId === play.id,
    onToggleExpand,
  };

  return (
    <div
      className={variant === "list" ? "mb-4" : ""}
      role="listitem"
      data-index={index}
      onMouseEnter={() => prefetchPlayDetails(play.id)}
      onMouseLeave={cancelPrefetch}
    >
      <PlayCard {...commonProps} {...variantProps} />
    </div>
  );
};

// 🚀 PERFORMANCE: Memoize wrapper to prevent re-renders when props haven't changed
export default React.memo(PlayCardWrapper, (prevProps, nextProps) => {
  // Critical props that affect rendering
  if (prevProps.play.id !== nextProps.play.id) return false;
  if (prevProps.isSelected !== nextProps.isSelected) return false;
  if (prevProps.expandedPlayId !== nextProps.expandedPlayId) return false;
  if (prevProps.showOneWordCalls !== nextProps.showOneWordCalls) return false;
  if (prevProps.directionDisplayFormat !== nextProps.directionDisplayFormat)
    return false;
  if (prevProps.variant !== nextProps.variant) return false;

  // Check if play data changed
  const p = prevProps.play;
  const n = nextProps.play;
  if (p.play_name !== n.play_name) return false;
  if (p.formation !== n.formation) return false;
  if (p.p_type !== n.p_type) return false;
  if (p.times_called !== n.times_called) return false;

  return true; // Props equal, skip re-render
});
