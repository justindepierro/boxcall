import React from "react";
import { PlayCard } from "./PlayCard";
import type { Play } from "../../types/play";
import type { PersonnelConfiguration } from "../../types/personnel";

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
  onAddToPracticeScript?: (play: Play) => void;
  onAddToGamePlan?: (play: Play) => void;

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
  onAddToPracticeScript,
  onAddToGamePlan,
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
    onAddToPracticeScript,
    onAddToGamePlan,
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
    >
      <PlayCard {...commonProps} {...variantProps} />
    </div>
  );
};
