import React from "react";
import { Button } from "../../ui/Button/Button";
import Icon from "../../ui/Icon/Icon";
import { ScrollingText } from "../../ui/ScrollingText";
import { ConfidenceBadge } from "../../ui/ConfidenceBadge";
import { FavoriteButton } from "../../ui/FavoriteButton";
import { SelectionCheckbox } from "../../ui/SelectionCheckbox";
import type { Play as PlayType } from "../../../types/play";
import type { PersonnelConfiguration } from "../../../types/personnel";
import { getTileGradient, getTileIcon } from "./helpers";
import { useIsMobile } from "../../../hooks/useBreakpoint";
import { debug } from "../../../utils/logger";
import { BadgeRow } from "./badges";
import { usePlayCardProps } from "./hooks/usePlayCardProps";

type SelectionHandler = (playId: string, selected: boolean) => void;

interface PlayCardTileHeaderProps {
  play: PlayType;
  optimisticPlay: PlayType;
  displayName: string;
  subtitleText: string | null;
  showOneWordCalls: boolean;
  isSelected: boolean;
  onSelectionChange?: SelectionHandler;
  onOpenAssignments: () => void;
  phaseLabel: string | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  personnelConfigurations?: PersonnelConfiguration[];
}

// Extracted tile image section with photo/gradient variants
const TileImageSection: React.FC<{
  play: PlayType;
  optimisticPlay: PlayType;
  tileTitle: string;
  isExpanded?: boolean;
}> = ({ play, optimisticPlay, tileTitle, isExpanded }) => (
  <div
    className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-md shadow-jade-500/10 hover:shadow-xl hover:shadow-jade-500/20 hover:scale-[1.03] transition-all duration-200 ${
      isExpanded ? "ring-2 ring-jade-500" : ""
    }`}
  >
    {play.diagram_url || play.diagram_image_url ? (
      /* Photo thumbnail with loading skeleton */
      <>
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 animate-pulse" />
        <img
          src={play.diagram_url || play.diagram_image_url || undefined}
          alt={`${tileTitle} diagram`}
          className="absolute inset-0 w-full h-full object-cover"
          crossOrigin="anonymous"
          decoding="async"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute top-3 left-3">
          <div className="px-2 py-1 bg-white/35 backdrop-blur-sm rounded-lg border border-white/30">
            <Icon name="image" className="w-4 h-4 text-white" />
          </div>
        </div>
      </>
    ) : (
      /* Gradient with icon */
      <>
        <div
          className={`absolute inset-0 bg-gradient-to-br ${getTileGradient(
            optimisticPlay.p_type
          )}`}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-50" />
        <Icon
          name={getTileIcon(optimisticPlay.p_type)}
          className="absolute inset-0 m-auto w-[50%] h-[50%] text-white/90 drop-shadow-lg"
          aria-hidden="true"
        />
      </>
    )}
  </div>
);

// Compact metadata shown when collapsed
const CompactMetadata: React.FC<{ optimisticPlay: PlayType }> = ({
  optimisticPlay,
}) => (
  <div className="flex items-center gap-2 mt-1.5 text-muted text-xs">
    {optimisticPlay.p_type && (
      <span className="flex items-center gap-1">
        <Icon name="zap" className="h-3 w-3" />
        {optimisticPlay.p_type}
      </span>
    )}
    {optimisticPlay.times_called !== undefined &&
      optimisticPlay.times_called > 0 && (
        <span className="flex items-center gap-1">
          <Icon name="refresh-cw" className="h-3 w-3" />
          {optimisticPlay.times_called}x
        </span>
      )}
  </div>
);

export const PlayCardTileHeader: React.FC<PlayCardTileHeaderProps> = (
  props
) => {
  // Merge context and props via hook (context takes precedence)
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
    isExpanded,
    onToggleExpand,
    personnelConfigurations,
  } = usePlayCardProps(props);

  // Props that are still only passed as props (no context equivalent)
  const { onOpenAssignments } = props;

  // Mobile detection for responsive font sizes
  const isMobile = useIsMobile();

  const tileTitle =
    showOneWordCalls && play.one_word_play
      ? play.one_word_play.toUpperCase()
      : displayName;

  const tileSubtitle =
    subtitleText ||
    (() => {
      if (showOneWordCalls && play.one_word_play)
        return play.formation || optimisticPlay.p_type;
      if (play.one_word_play) return play.one_word_play.toUpperCase();
      return optimisticPlay.p_type;
    })();

  return (
    <div className="flex flex-col overflow-visible group hover:-translate-y-1 transition-transform duration-200">
      <div className="relative w-full overflow-visible">
        {/* Selection checkbox - top-left (when selection mode is on) */}
        {onSelectionChange && (
          <div className="absolute -top-2 -left-2 z-20">
            <SelectionCheckbox
              isSelected={Boolean(isSelected)}
              onChange={(selected) => {
                debug("[PlayCardTileHeader] SelectionCheckbox onChange:", {
                  playId: play.id,
                  selected,
                });
                onSelectionChange(play.id, selected);
              }}
              label={`Select ${tileTitle}`}
            />
          </div>
        )}

        {/* Photo or Gradient Card */}
        <TileImageSection
          play={play}
          optimisticPlay={optimisticPlay}
          tileTitle={tileTitle}
          isExpanded={isExpanded}
        />

        {/* Favorite button - top-left (hidden when selection mode is on) */}
        {!onSelectionChange && (
          <div className="absolute -top-3 -left-3 z-10">
            <FavoriteButton
              isFavorite={isFavorite}
              onToggle={onToggleFavorite}
              size="md"
            />
          </div>
        )}

        {/* Confidence badge - ONLY SHOW WHEN EXPANDED (3-tier design) */}
        {isExpanded && (
          <div className="absolute -top-3 -right-3">
            <ConfidenceBadge
              confidence={
                typeof optimisticPlay.confidence_base === "number"
                  ? optimisticPlay.confidence_base
                  : 70
              }
              size="md"
              showLabel
            />
          </div>
        )}

        {/* Assignments Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenAssignments();
          }}
          className="absolute -bottom-3 -left-3 w-11 h-11 rounded-full bg-jade-500 shadow-lg shadow-jade-500/30 flex items-center justify-center border-2 border-white hover:bg-jade-600 transition-colors cursor-pointer z-10"
          title="Player Assignments"
          aria-label="Player Assignments"
        >
          <Icon name="users" className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="mt-4 w-full px-1">
        <ScrollingText
          as="h3"
          className={`font-bold font-mono tracking-tight leading-snug text-neutral-900 dark:text-white ${
            isMobile ? "text-lg" : "text-base"
          } ${showOneWordCalls && play.one_word_play ? "text-emerald-600 dark:text-emerald-400" : ""}`}
          title={tileTitle}
          speed={50}
        >
          {tileTitle}
        </ScrollingText>
        {tileSubtitle && (
          <p
            className={`text-neutral-500 dark:text-neutral-400 mt-1 font-medium ${isMobile ? "text-sm" : "text-xs"}`}
          >
            {tileSubtitle}
          </p>
        )}

        {/* 3-TIER DESIGN: Compact metadata when collapsed */}
        {!isExpanded && <CompactMetadata optimisticPlay={optimisticPlay} />}
      </div>

      {/* Badges - Uses unified BadgeRow component */}
      {/* 3-TIER DESIGN: Show only essential info in collapsed state */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <BadgeRow
          play={optimisticPlay}
          originalPlay={play}
          isExpanded={isExpanded}
          personnelConfigurations={personnelConfigurations}
          phaseLabel={phaseLabel}
        />
      </div>

      {/* Details button - outside the tile */}
      {/* 3-TIER DESIGN: Clear expand/collapse action */}
      {onToggleExpand && (
        <div className="mt-4">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onToggleExpand();
            }}
            variant={isExpanded ? "ghost" : "outline"}
            size="sm"
            icon={
              isExpanded ? (
                <Icon name="chevron-up" size={16} />
              ) : (
                <Icon name="chevron-down" size={16} />
              )
            }
            iconPosition="right"
            className={`w-full border-neutral-200 dark:border-navy-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-navy-800 ${isExpanded ? "bg-neutral-50 dark:bg-navy-800" : ""}`}
          >
            {isExpanded ? "Hide Details" : "Show More"}
          </Button>
        </div>
      )}
    </div>
  );
};
