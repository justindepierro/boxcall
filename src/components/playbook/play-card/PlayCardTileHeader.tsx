import React from "react";
import { motion } from "framer-motion";
import { Button } from "../../ui/Button/Button";
import Icon from "../../ui/Icon/Icon";
import { ScrollingText } from "../../ui/ScrollingText";
import { ConfidenceBadge } from "../../ui/ConfidenceBadge";
import { FavoriteButton } from "../../ui/FavoriteButton";
import { SelectionCheckbox } from "../../ui/SelectionCheckbox";
import { PersonnelBadge } from "../PersonnelBadge";
import { WristbandBadge } from "../WristbandBadge";
import type { Play as PlayType } from "../../../types/play";
import type { PersonnelConfiguration } from "../../../types/personnel";
import { getTileGradient, getTileIcon } from "./helpers";
import { useIsMobile } from "../../../hooks/useBreakpoint";

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

export const PlayCardTileHeader: React.FC<PlayCardTileHeaderProps> = ({
  play,
  optimisticPlay,
  displayName,
  subtitleText,
  showOneWordCalls,
  isSelected,
  onSelectionChange,
  onOpenAssignments,
  phaseLabel,
  isFavorite,
  onToggleFavorite,
  isExpanded,
  onToggleExpand,
  personnelConfigurations = [],
}) => {
  // Mobile detection for responsive font sizes
  const isMobile = useIsMobile();

  // Find the badge customization for this play's personnel
  const personnelConfig = personnelConfigurations.find(
    (config) => config.name === optimisticPlay.personnel
  );

  const tileTitle =
    showOneWordCalls && play.one_word_play
      ? play.one_word_play.toUpperCase()
      : displayName;

  const tileSubtitle =
    subtitleText ||
    (showOneWordCalls && play.one_word_play
      ? play.formation || optimisticPlay.p_type
      : play.one_word_play
        ? play.one_word_play.toUpperCase()
        : optimisticPlay.p_type);

  return (
    <motion.div
      className="flex flex-col overflow-visible group"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="relative w-full overflow-visible">
        {/* Selection checkbox - top-left (when selection mode is on) */}
        {onSelectionChange && (
          <div className="absolute -top-2 -left-2 z-20">
            <SelectionCheckbox
              isSelected={Boolean(isSelected)}
              onChange={(selected) => {
                console.log(
                  "[PlayCardTileHeader] SelectionCheckbox onChange:",
                  {
                    playId: play.id,
                    selected,
                  }
                );
                onSelectionChange(play.id, selected);
              }}
              label={`Select ${tileTitle}`}
            />
          </div>
        )}

        {/* Photo or Gradient Card */}
        <motion.div
          className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-md shadow-jade-500/10 hover:shadow-xl hover:shadow-jade-500/20 transition-all duration-300 ${isExpanded ? "ring-2 ring-jade-500" : ""}`}
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {play.diagram_image_url ? (
            /* Photo thumbnail */
            <>
              <img
                src={play.diagram_image_url}
                alt={`${tileTitle} diagram`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute top-3 left-3">
                <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <Icon name="image" className="w-4 h-4 text-white" />
                </div>
              </div>
            </>
          ) : (
            /* Gradient with icon */
            <>
              <div
                className={`absolute inset-0 bg-gradient-to-br ${getTileGradient(optimisticPlay.p_type)}`}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-50" />
              <Icon
                name={getTileIcon(optimisticPlay.p_type)}
                className="absolute inset-0 m-auto w-[50%] h-[50%] text-white/90 drop-shadow-lg"
                aria-hidden="true"
              />
            </>
          )}
        </motion.div>

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
              confidence={typeof optimisticPlay.confidence_base === 'number' ? optimisticPlay.confidence_base : 70}
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
          className={`font-mono font-bold leading-snug text-primary ${
            isMobile ? "text-lg" : "text-base"
          } ${showOneWordCalls && play.one_word_play ? "text-jade-600" : ""}`}
          title={tileTitle}
          speed={50}
        >
          {tileTitle}
        </ScrollingText>
        {tileSubtitle && (
          <p
            className={`text-secondary mt-1 italic ${isMobile ? "text-sm" : "text-xs"}`}
          >
            {tileSubtitle}
          </p>
        )}

        {/* 3-TIER DESIGN: Compact metadata when collapsed */}
        {!isExpanded && (
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
        )}
      </div>

      {/* Badges - PRIMARY INFO ONLY (personnel badge) */}
      {/* 3-TIER DESIGN: Show only essential info in collapsed state */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {/* Personnel badge - ALWAYS VISIBLE (critical for coaches) */}
        {optimisticPlay.personnel && (
          <PersonnelBadge
            personnel={optimisticPlay.personnel}
            size="sm"
            badgeCustomization={personnelConfig?.badgeCustomization}
          />
        )}

        {/* Secondary badges - ONLY SHOW WHEN EXPANDED */}
        {isExpanded && (
          <>
            {/* Wristband badge */}
            {optimisticPlay.wristband_number && (
              <WristbandBadge
                wristbandNumber={optimisticPlay.wristband_number}
                size="sm"
              />
            )}

            {/* Installation phase badge */}
            {phaseLabel && (
              <span className="px-2 py-0.5 bg-warning-500 text-primary rounded-full text-2xs font-semibold tracking-wide uppercase border border-warning-600">
                {phaseLabel}
              </span>
            )}
          </>
        )}
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
            className="w-full"
          >
            {isExpanded ? "Hide Details" : "Show More"}
          </Button>
        </div>
      )}
    </motion.div>
  );
};
