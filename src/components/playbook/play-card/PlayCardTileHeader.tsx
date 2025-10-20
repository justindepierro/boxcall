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
  onCreateDiagram: () => void;
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
  onCreateDiagram,
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
      className="flex flex-col items-center text-center overflow-visible group"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="relative w-full max-w-80 mx-auto overflow-visible">
        {/* Selection checkbox - top-left (when selection mode is on) */}
        {onSelectionChange && (
          <div className="absolute -top-3 -left-3 z-20">
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

        <motion.div
          className={`relative w-full aspect-square rounded-[1.75rem] bg-gradient-to-br ${getTileGradient(optimisticPlay.p_type)} shadow-lg hover:shadow-2xl transition-shadow duration-200 overflow-visible before:absolute before:inset-0 before:rounded-[1.75rem] before:bg-gradient-to-tr before:from-transparent before:via-white/20 before:to-transparent before:opacity-50 before:pointer-events-none ${isExpanded ? "ring-2 ring-brand-primary" : ""}`}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Icon
            name={getTileIcon(optimisticPlay.p_type)}
            className="absolute inset-0 m-auto w-[65%] h-[65%] text-white drop-shadow-lg"
            aria-hidden="true"
          />
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

        {/* Confidence badge - top-right */}
        <div className="absolute -top-3 -right-3">
          <ConfidenceBadge
            confidence={optimisticPlay.confidence_base}
            size="md"
            showLabel
          />
        </div>

        {play.diagram_url && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCreateDiagram();
            }}
            className="absolute -bottom-3 -right-3 w-11 h-11 rounded-full bg-purple-500 shadow-md flex items-center justify-center border-2 border-white dark:border-slate-800 hover:bg-purple-600 transition-colors cursor-pointer z-10"
            title="Edit diagram"
            aria-label="Edit diagram"
          >
            <Icon name="image" className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Assignments Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenAssignments();
          }}
          className="absolute -bottom-3 -left-3 w-11 h-11 rounded-full bg-blue-500 shadow-md flex items-center justify-center border-2 border-white dark:border-slate-800 hover:bg-blue-600 transition-colors cursor-pointer z-10"
          title="Player Assignments"
          aria-label="Player Assignments"
        >
          <Icon name="users" className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="mt-3 w-full px-2">
        <ScrollingText
          as="h3"
          className={`font-mono font-bold leading-tight text-text-primary text-center ${
            isMobile ? "text-base" : "text-sm"
          } ${showOneWordCalls && play.one_word_play ? "text-text-info" : ""}`}
          title={tileTitle}
          speed={50}
        >
          {tileTitle}
        </ScrollingText>
        {tileSubtitle && (
          <p
            className={`text-text-secondary text-center mt-1 ${isMobile ? "text-sm" : "text-xs"}`}
          >
            {tileSubtitle}
          </p>
        )}
      </div>

      {/* Badges - wristband, personnel and installation phase */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {/* Wristband badge */}
        {optimisticPlay.wristband_number && (
          <WristbandBadge
            wristbandNumber={optimisticPlay.wristband_number}
            size="sm"
          />
        )}

        {/* Personnel badge */}
        {optimisticPlay.personnel && (
          <PersonnelBadge
            personnel={optimisticPlay.personnel}
            size="sm"
            badgeCustomization={personnelConfig?.badgeCustomization}
          />
        )}

        {/* Installation phase badge */}
        {phaseLabel && (
          <span className="px-2 py-0.5 bg-warning-500 text-primary rounded-full text-2xs font-semibold tracking-wide uppercase border border-warning-600">
            {phaseLabel}
          </span>
        )}
      </div>

      {/* Details button - outside the tile */}
      {onToggleExpand && (
        <div className="mt-4">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onToggleExpand();
            }}
            variant="outline"
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
            {isExpanded ? "Collapse" : "Details"}
          </Button>
        </div>
      )}
    </motion.div>
  );
};
