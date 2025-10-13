import React from "react";
import { motion } from "framer-motion";
import { Button } from "../../ui/Button/Button";
import Icon from "../../ui/Icon/Icon";
import { ScrollingText } from "../../ui/ScrollingText";
import { ConfidenceBadge } from "../../ui/ConfidenceBadge";
import { FavoriteButton } from "../../ui/FavoriteButton";
import { SelectionCheckbox } from "../../ui/SelectionCheckbox";
import { PersonnelBadge } from "../PersonnelBadge";
import type { Play as PlayType } from "../../../types/play";
import type { PersonnelConfiguration } from "../../../types/personnel";
import { getTileGradient, getTileIcon } from "./helpers";

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
  phaseLabel,
  isFavorite,
  onToggleFavorite,
  isExpanded,
  onToggleExpand,
  personnelConfigurations = [],
}) => {
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
        {onSelectionChange && (
          <div className="absolute -top-3 -left-3 z-10">
            <SelectionCheckbox
              isSelected={Boolean(isSelected)}
              onChange={(selected) => onSelectionChange(play.id, selected)}
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

        {/* Favorite button - top-left */}
        <div className="absolute -top-3 -left-3 z-10">
          <FavoriteButton
            isFavorite={isFavorite}
            onToggle={onToggleFavorite}
            size="md"
          />
        </div>

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
      </div>

      <div className="mt-3 w-full px-2">
        <ScrollingText
          as="h3"
          className={`font-mono font-bold text-sm leading-tight text-text-primary text-center ${
            showOneWordCalls && play.one_word_play ? "text-text-info" : ""
          }`}
          title={tileTitle}
          speed={50}
        >
          {tileTitle}
        </ScrollingText>
        {tileSubtitle && (
          <p className="text-xs text-text-secondary text-center mt-1">
            {tileSubtitle}
          </p>
        )}
      </div>

      {/* Badges - personnel and installation phase */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
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
