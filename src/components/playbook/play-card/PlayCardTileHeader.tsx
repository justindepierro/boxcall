import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "../../ui/Button/Button";
import Icon from "../../ui/Icon/Icon";
import { ScrollingText } from "../../ui/ScrollingText";
import { ConfidenceBadge } from "../../ui/ConfidenceBadge";
import { FavoriteButton } from "../../ui/FavoriteButton";
import { SelectionCheckbox } from "../../ui/SelectionCheckbox";
import { EditableSchemeBadge } from "../../ui/Badge";
import { PersonnelBadge } from "../PersonnelBadge";
import { WristbandBadge } from "../WristbandBadge";
import { InlineEditField } from "../../ui/InlineEditField";
import type { Play as PlayType } from "../../../types/play";
import type { PersonnelConfiguration } from "../../../types/personnel";
import type { BadgeColorScheme } from "../../../types/badge";
import { getTileGradient, getTileIcon } from "./helpers";
import { useIsMobile } from "../../../hooks/useBreakpoint";
import { debug } from "../../../utils/logger";
import {
  getCategoryBadgeScheme,
  useTeamBadgeSchemeOverrides,
} from "../../../hooks/useTeamBadgeSchemeOverrides";

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
  // NEW: For inline personnel editing
  onPersonnelChange?: (value: string) => Promise<void>;
  personnelSuggestions?: string[];
  isSavingPersonnel?: boolean;
}

// Extracted tile image section with photo/gradient variants
const TileImageSection: React.FC<{
  play: PlayType;
  optimisticPlay: PlayType;
  tileTitle: string;
  isExpanded?: boolean;
}> = ({ play, optimisticPlay, tileTitle, isExpanded }) => (
  <motion.div
    className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-md shadow-jade-500/10 hover:shadow-xl hover:shadow-jade-500/20 transition-all duration-300 ${
      isExpanded ? "ring-2 ring-jade-500" : ""
    }`}
    whileHover={{ scale: 1.03 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
  >
    {play.diagram_url || (play as any).diagram_image_url ? (
      /* Photo thumbnail */
      <>
        <img
          src={play.diagram_url || (play as any).diagram_image_url}
          alt={`${tileTitle} diagram`}
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
          decoding="async"
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
  </motion.div>
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

// Badge section with conditional rendering and editable personnel
const BadgeSection: React.FC<{
  optimisticPlay: PlayType;
  personnelConfig?: PersonnelConfiguration;
  phaseLabel: string | null;
  isExpanded?: boolean;
  onPersonnelChange?: (value: string) => Promise<void>;
  personnelSuggestions?: string[];
  isSavingPersonnel?: boolean;
}> = ({ 
  optimisticPlay, 
  personnelConfig, 
  phaseLabel, 
  isExpanded,
  onPersonnelChange,
  personnelSuggestions,
  isSavingPersonnel,
}) => (
  <div className="mt-3 flex flex-wrap items-center gap-2">
    {/* Personnel badge - ALWAYS VISIBLE, now editable */}
    <EditablePersonnelBadge
      personnel={optimisticPlay.personnel || ""}
      badgeCustomization={personnelConfig?.badgeCustomization}
      onPersonnelChange={onPersonnelChange}
      personnelSuggestions={personnelSuggestions}
      isSaving={isSavingPersonnel}
    />

    {/* Secondary badges - ONLY SHOW WHEN EXPANDED */}
    {isExpanded && (
      <>
        {optimisticPlay.wristband_number && (
          <WristbandBadge
            wristbandNumber={optimisticPlay.wristband_number}
            size="sm"
          />
        )}
        {phaseLabel && (
          <span className="px-2 py-0.5 bg-warning-500 text-primary rounded-full text-2xs font-semibold tracking-wide uppercase border border-warning-600">
            {phaseLabel}
          </span>
        )}
      </>
    )}
  </div>
);

// Editable personnel badge - click to edit inline
const EditablePersonnelBadge: React.FC<{
  personnel: string;
  badgeCustomization?: PersonnelConfiguration["badgeCustomization"];
  onPersonnelChange?: (value: string) => Promise<void>;
  personnelSuggestions?: string[];
  isSaving?: boolean;
}> = ({ personnel, badgeCustomization, onPersonnelChange, personnelSuggestions, isSaving }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { overrides, setCategoryScheme } = useTeamBadgeSchemeOverrides();

  const personnelScheme = React.useMemo(
    () => getCategoryBadgeScheme(overrides, "personnel", personnel),
    [overrides, personnel]
  );

  const onChangePersonnelScheme = React.useMemo(() => {
    const label = (personnel || "").trim();
    if (!label) return async () => {};
    return async (scheme: BadgeColorScheme) => {
      await setCategoryScheme("personnel", label, scheme);
    };
  }, [personnel, setCategoryScheme]);

  const handleSave = useCallback(async (value: string) => {
    if (onPersonnelChange) {
      await onPersonnelChange(value);
    }
    setIsEditing(false);
  }, [onPersonnelChange]);

  // If we're in editing mode, show the inline edit field
  if (isEditing && onPersonnelChange) {
    return (
      <div 
        className="inline-flex items-center min-w-20"
        onClick={(e) => e.stopPropagation()}
      >
        <InlineEditField
          value={personnel}
          onSave={handleSave}
          suggestions={personnelSuggestions}
          enableSuggestions={!!personnelSuggestions?.length}
          isSaving={isSaving}
          placeholder="Personnel"
          className="text-xs"
        />
      </div>
    );
  }

  // If there's no edit handler, show the regular badge (read-only)
  if (!onPersonnelChange) {
    if (!personnel) return null;
    
    if (badgeCustomization) {
      return (
        <PersonnelBadge
          personnel={personnel}
          size="sm"
          badgeCustomization={badgeCustomization}
        />
      );
    }
    return (
      <EditableSchemeBadge
        label={personnel}
        scheme={personnelScheme}
        onChangeScheme={onChangePersonnelScheme}
        size="sm"
        ariaLabel={`Change ${personnel} badge color`}
      />
    );
  }

  // Show clickable badge that opens edit mode
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  if (!personnel) {
    // Show "Add Personnel" button when no personnel set
    return (
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-medium bg-surface-muted text-muted border border-dashed border-border-divider hover:border-jade-500 hover:text-jade-600 transition-colors"
        aria-label="Add personnel"
      >
        <Icon name="plus" className="w-3 h-3" />
        Personnel
      </button>
    );
  }

  if (badgeCustomization) {
    return (
      <button
        onClick={handleClick}
        className="group relative cursor-pointer"
        aria-label={`Edit personnel: ${personnel}`}
      >
        <PersonnelBadge
          personnel={personnel}
          size="sm"
          badgeCustomization={badgeCustomization}
        />
        <span className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Icon name="edit" className="w-3 h-3 text-jade-600" />
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="group relative cursor-pointer"
      aria-label={`Edit personnel: ${personnel}`}
    >
      <EditableSchemeBadge
        label={personnel}
        scheme={personnelScheme}
        onChangeScheme={onChangePersonnelScheme}
        size="sm"
        ariaLabel={`Change ${personnel} badge color`}
      />
      <span className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Icon name="edit" className="w-3 h-3 text-jade-600" />
      </span>
    </button>
  );
};

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
  onPersonnelChange,
  personnelSuggestions,
  isSavingPersonnel,
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
    (() => {
      if (showOneWordCalls && play.one_word_play)
        return play.formation || optimisticPlay.p_type;
      if (play.one_word_play) return play.one_word_play.toUpperCase();
      return optimisticPlay.p_type;
    })();

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
        {!isExpanded && <CompactMetadata optimisticPlay={optimisticPlay} />}
      </div>

      {/* Badges - PRIMARY INFO ONLY (personnel badge) */}
      {/* 3-TIER DESIGN: Show only essential info in collapsed state */}
      <BadgeSection
        optimisticPlay={optimisticPlay}
        personnelConfig={personnelConfig}
        phaseLabel={phaseLabel}
        isExpanded={isExpanded}
        onPersonnelChange={onPersonnelChange}
        personnelSuggestions={personnelSuggestions}
        isSavingPersonnel={isSavingPersonnel}
      />

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
