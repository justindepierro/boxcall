/**
 * PlayCardListHeader
 *
 * Refactored header component for list view PlayCards.
 * Uses unified BadgeRow component for badge display.
 * Supports PlayCardContext for prop drilling elimination.
 *
 * REFACTOR: Reduced from 706 lines to ~200 lines by:
 * - Replacing CollapsedBadges and ExpandedBadges with unified BadgeRow
 * - Extracting badge scheme logic to useBadgeSchemes hook
 * - Using team situation definitions hook from BadgeRow
 */

import React from "react";
import { Button } from "../../ui/Button/Button";
import Icon from "../../ui/Icon/Icon";
import { SelectionCheckbox } from "../../ui/SelectionCheckbox";
import type { Play as PlayType } from "../../../types/play";
import type { PersonnelConfiguration } from "../../../types/personnel";
import { debug } from "../../../utils/logger";
import { BadgeRow } from "./badges";
import { usePlayCardProps } from "./hooks/usePlayCardProps";
import { SearchHighlight } from "./SearchHighlight";

// ============================================================================
// Types
// ============================================================================

type ToggleHandler = () => void;

interface PlayCardListHeaderProps {
  play: PlayType;
  optimisticPlay: PlayType;
  displayName: string;
  subtitleText: string | null;
  showOneWordCalls: boolean;
  isSelected?: boolean;
  onSelectionChange?: (playId: string, selected: boolean) => void;
  isCompact: boolean;
  isExpanded: boolean;
  onToggleExpand: ToggleHandler;
  onEdit?: (play: PlayType) => void;
  onDuplicate?: (play: PlayType) => void;
  onOpenAssignments?: () => void;
  getPlayTypeColor: (value: string) => string;
  getConfidenceColor: (confidence: number) => string;
  phaseLabel: string | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  personnelConfigurations?: PersonnelConfiguration[];
  /** Search query for highlighting matches */
  searchQuery?: string;
  /** Whether this card is keyboard-focused */
  isFocused?: boolean;
}

// ============================================================================
// Sub-Components
// ============================================================================

interface ActionButtonsProps {
  play: PlayType;
  onSelectionChange?: (playId: string, selected: boolean) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenAssignments?: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  play,
  onSelectionChange,
  isFavorite,
  onToggleFavorite,
  onOpenAssignments,
  isExpanded,
  onToggleExpand,
}) => (
  <div className="flex items-center gap-1 ml-4">
    {!onSelectionChange && (
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        variant="ghost"
        size="sm"
        icon={
          <Icon
            name={isFavorite ? "star" : "star"}
            className={
              isFavorite ? "text-warning-500 fill-current" : "text-muted"
            }
          />
        }
        iconPosition="only"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      />
    )}

    {onOpenAssignments && (
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onOpenAssignments();
        }}
        variant="ghost"
        size="sm"
        icon={<Icon name="users" className="text-primary-500" />}
        iconPosition="only"
        aria-label="Player Assignments"
        title="Player Assignments"
      />
    )}

    <Button
      onClick={onToggleExpand}
      variant="ghost"
      size="sm"
      icon={
        <Icon
          name="chevron-down"
          className={`h-5 w-5 transition-transform duration-300 ease-in-out ${
            isExpanded ? "rotate-180" : "rotate-0"
          }`}
        />
      }
      iconPosition="only"
      aria-label={isExpanded ? "Collapse details" : "Expand details"}
      aria-expanded={isExpanded}
      aria-controls={`play-details-${play.id}`}
      title={isExpanded ? "Collapse" : "Expand details"}
    />
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

export const PlayCardListHeader: React.FC<PlayCardListHeaderProps> = (
  props
) => {
  // Merge context and props via hook (context takes precedence)
  const merged = usePlayCardProps(props);

  // Destructure with guaranteed fallbacks for required props
  const {
    play,
    optimisticPlay,
    displayName,
    subtitleText,
    showOneWordCalls,
    isSelected,
    onSelectionChange,
    phaseLabel,
    isFavorite,
    onToggleFavorite,
    personnelConfigurations,
  } = merged;

  // These are required in this header - use props as guaranteed fallback
  const isExpanded = merged.isExpanded ?? props.isExpanded;
  const onToggleExpand = merged.onToggleExpand ?? props.onToggleExpand;

  // Props that are still only passed as props (no context equivalent)
  const {
    isCompact,
    onEdit: _onEdit,
    onDuplicate: _onDuplicate,
    onOpenAssignments,
    getPlayTypeColor: _getPlayTypeColor,
    getConfidenceColor,
    searchQuery,
    isFocused,
  } = props;

  return (
    <div
      className={`flex items-center gap-4 overflow-visible transition-all duration-150 ${
        isFocused ? "ring-2 ring-jade-500 ring-offset-2 rounded-lg" : ""
      }`}
    >
      {/* Selection checkbox on the left (when selection mode is on) */}
      {onSelectionChange && (
        <div className="shrink-0">
          <SelectionCheckbox
            isSelected={Boolean(isSelected)}
            onChange={(selected) => {
              debug("[PlayCardListHeader] SelectionCheckbox onChange:", {
                playId: play.id,
                selected,
              });
              onSelectionChange(play.id, selected);
            }}
            label={`Select ${displayName}`}
          />
        </div>
      )}

      {/* Photo thumbnail (if available) */}
      {(play.diagram_url ||
        (play as PlayType & { diagram_image_url?: string })
          .diagram_image_url) && (
        <div className="shrink-0 w-24 h-16 rounded-lg overflow-hidden border border-neutral-200 dark:border-navy-600 shadow-sm bg-neutral-50 dark:bg-navy-800">
          <img
            src={
              play.diagram_url ||
              (play as PlayType & { diagram_image_url?: string })
                .diagram_image_url
            }
            alt={`${displayName} diagram`}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
            decoding="async"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <h3
            className={`truncate font-bold font-mono tracking-tight ${
              isCompact ? "text-base" : "text-lg"
            } ${
              showOneWordCalls && play.one_word_play
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-neutral-900 dark:text-white"
            }`}
          >
            <SearchHighlight text={displayName} query={searchQuery} />
          </h3>
          {subtitleText && (
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium ml-1">
              <SearchHighlight text={subtitleText} query={searchQuery} />
            </span>
          )}
        </div>

        {/* Unified BadgeRow - handles both collapsed and expanded states */}
        <div
          className={`flex flex-wrap items-center gap-1.5 transition-all duration-300 ease-in-out ${
            isCompact ? "mt-1" : "mt-1.5"
          }`}
        >
          <BadgeRow
            play={optimisticPlay}
            originalPlay={play}
            isExpanded={isExpanded}
            personnelConfigurations={personnelConfigurations}
            phaseLabel={phaseLabel}
            getConfidenceColor={getConfidenceColor}
          />
        </div>
      </div>

      <ActionButtons
        play={play}
        onSelectionChange={onSelectionChange}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        onOpenAssignments={onOpenAssignments}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      />
    </div>
  );
};

export default PlayCardListHeader;
