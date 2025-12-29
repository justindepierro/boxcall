/* eslint-disable max-lines-per-function */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DropResult } from "@hello-pangea/dnd";
import type { Play as PlayType } from "../../types/play";
import type { PersonnelConfiguration } from "../../types/personnel";
import { INSTALL_PHASES, type InstallPhase } from "../../types/play";
import { getDisplayName, getSubtitleText } from "../../utils/playNameUtils";
import { PlayCardListHeader } from "./play-card/PlayCardListHeader";
import { PlayCardTileHeader } from "./play-card/PlayCardTileHeader";
import { PlayCardDetails } from "./play-card/PlayCardDetails";
import { PlayCardQuickActions } from "./play-card/PlayCardQuickActions";
import { PlayDiagramTooltip } from "./play-card/PlayDiagramTooltip";
import { PlayCardProvider } from "./play-card/context";
import { useRecentPlays } from "../../hooks/useRecentPlays";
import { useFavoritePlays } from "../../hooks/useFavoritePlays";
import { useIsMobile } from "../../hooks/useBreakpoint";
import { usePlayCardLayoutPreferences } from "../../hooks/usePlayCardLayoutPreferences";
import { usePlayCardState } from "./play-card/hooks";
import {
  DEFAULT_FORMATION_SUGGESTIONS,
  DEFAULT_PLAY_NAME_SUGGESTIONS,
  getDirectionOptions,
} from "./play-card/constants";
import {
  createFormationFields,
  createPlayDetailsFields,
  type FieldDefinitionMap,
} from "./play-card/fieldDefinitions";
import {
  getConfidenceColor,
  getPlayTypeColor,
  normalizePlayText,
} from "./play-card/helpers";
import {
  readLocalString,
  storageKeys,
  writeLocalString,
} from "../../utils/storage";
import { usePlayFieldValues } from "./AddNewPlayModal/hooks/usePlayFieldValues";
import { info } from "../../utils/logger";

interface PlayCardProps {
  play: PlayType;
  showOneWordCalls?: boolean;
  onEdit?: (play: PlayType) => void;
  onSave?: (playId: string, updates: Partial<PlayType>) => Promise<void>;
  onDuplicate?: (play: PlayType) => void;
  onAddToPracticeScript?: (play: PlayType) => void;
  onAddToGamePlan?: (play: PlayType) => void;
  onOpenAssignments?: (play: PlayType) => void;
  onPostToTeamBulletin?: (play: PlayType) => void;
  onEnterFullscreen?: (plays: PlayType[], playIndex: number) => void;
  allPlays?: PlayType[];
  isSelected?: boolean;
  onSelectionChange?: (playId: string, selected: boolean) => void;
  density?: "comfortable" | "compact";
  variant?: "list" | "tile";
  directionDisplayFormat?: "full" | "abbrev" | "letter";
  formationSuggestions?: string[];
  playNameSuggestions?: string[];
  playTypeSuggestions?: string[];
  personnelSuggestions?: string[];
  personnelConfigurations?: PersonnelConfiguration[];
  // Controlled expansion state
  isExpanded?: boolean;
  onToggleExpand?: (playId: string) => void;
  // NEW: For validation
  existingPlays?: PlayType[];
}

type FieldVisibility = Record<string, boolean>;

const INITIAL_FORMATION_ORDER = [
  "formation",
  // NOTE: "personnel" removed - should NOT appear in play display name
  // Personnel is shown in the badge, not the title
  "f_dir",
  "back_align",
  "back_position",
  "shift",
  "motion",
  "ftags",
];

const INITIAL_FORMATION_VISIBILITY: FieldVisibility = {
  formation: true,
  personnel: false, // Personnel should NOT be in the display name
  f_dir: true,
  back_align: true,
  back_position: true,
  shift: true,
  motion: true,
  ftags: true,
};

const INITIAL_PLAY_DETAILS_ORDER = [
  "play_name",
  "p_dir",
  "p_type",
  "protection",
  "check_into",
  "ptags",
  "tags",
  "key_positions",
  "key_players",
  "one_word_play",
  "wristband_number",
  "confidence_base",
];

const INITIAL_PLAY_DETAILS_VISIBILITY: FieldVisibility = {
  play_name: true,
  p_dir: true,
  p_type: true,
  protection: true,
  check_into: true,
  ptags: true,
  tags: true,
  key_positions: true,
  key_players: true,
  one_word_play: true,
  wristband_number: true,
  confidence_base: true,
};

/**
 * PlayCard Component
 *
 * High complexity score (33) is due to many useMemo/useCallback hooks for performance.
 * The component is well-structured - each hook handles a specific concern:
 * - Display value computation (displayName, subtitleText, phaseLabel)
 * - Field configuration (formationFields, playDetailsFields)
 * - Visibility filtering (visibleFormationFields, visiblePlayDetailsFields)
 * - Event handlers (handleFormationDragEnd, handlePlayDetailsDragEnd, etc.)
 *
 * Refactoring into smaller components would require significant prop drilling
 * or additional context, which would add more complexity.
 */
// eslint-disable-next-line complexity
export const PlayCard: React.FC<PlayCardProps> = ({
  play,
  showOneWordCalls = false,
  onEdit,
  onSave,
  onDuplicate,
  onAddToPracticeScript,
  onAddToGamePlan,
  onOpenAssignments,
  onPostToTeamBulletin,
  onEnterFullscreen,
  allPlays = [],
  isSelected = false,
  onSelectionChange,
  density = "compact",
  variant = "list",
  directionDisplayFormat = "full",
  formationSuggestions = [],
  playNameSuggestions = [],
  playTypeSuggestions = [],
  personnelSuggestions = [],
  personnelConfigurations = [],
  isExpanded: controlledIsExpanded,
  onToggleExpand,
  existingPlays = [],
}) => {
  // Extract unique field values for validation
  const fieldValues = usePlayFieldValues(existingPlays);

  // Optimistic state management (extracted to hook)
  const { optimisticPlay, savingFields, handleInlineSave } = usePlayCardState({
    play,
    onSave,
  });

  const { layout: playCardLayout, patchLayout: patchPlayCardLayout } =
    usePlayCardLayoutPreferences(play.id, {
      formationFieldOrder: INITIAL_FORMATION_ORDER,
      formationFieldVisibility: INITIAL_FORMATION_VISIBILITY,
      playDetailsFieldOrder: INITIAL_PLAY_DETAILS_ORDER,
      playDetailsFieldVisibility: INITIAL_PLAY_DETAILS_VISIBILITY,
    });

  // Quick Wins: Recent plays tracking and favorites
  const { trackPlayView } = useRecentPlays();
  const { isFavorite, toggleFavorite } = useFavoritePlays();

  // Mobile detection for responsive styling
  const isMobile = useIsMobile();

  const formationFieldOrder = playCardLayout.formationFieldOrder;
  const formationFieldVisibility = playCardLayout.formationFieldVisibility;
  const playDetailsFieldOrder = playCardLayout.playDetailsFieldOrder;
  const playDetailsFieldVisibility = playCardLayout.playDetailsFieldVisibility;

  // Use controlled expansion if provided, otherwise use internal state with localStorage persistence
  const [internalIsExpanded, setInternalIsExpanded] = useState(() => {
    // Load user's default preference from localStorage
    const savedPreference = readLocalString(
      storageKeys.playbook.playcardDefaultExpanded
    );
    return savedPreference === "true";
  });
  const isExpanded = controlledIsExpanded ?? internalIsExpanded;

  // DEBUG: Log play data for the currently-expanded card (dev only)
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (!isExpanded) return;

    info("[PlayCard] Expanded play from database:", {
      id: play.id,
      play_name: play.play_name,
      formation: play.formation,
      // Direction fields
      formation_direction: play.formation_direction,
      f_dir: play.f_dir,
      formation_id: play.formation_id,
      // Misc
      f_type: play.f_type,
      back_align: play.back_align,
      shift: play.shift,
      motion: play.motion,
      r_str: play.r_str,
      p_str: play.p_str,
      protection: play.protection,
      one_word_play: play.one_word_play,
      wristband_number: play.wristband_number,
    });
  }, [isExpanded, play]);

  const actualFormationSuggestions =
    formationSuggestions.length > 0
      ? formationSuggestions
      : DEFAULT_FORMATION_SUGGESTIONS;
  const actualPlayNameSuggestions =
    playNameSuggestions.length > 0
      ? playNameSuggestions
      : DEFAULT_PLAY_NAME_SUGGESTIONS;

  const directionOptions = getDirectionOptions(directionDisplayFormat);

  const formationFields: FieldDefinitionMap = useMemo(
    () =>
      createFormationFields({
        normalizeValue: normalizePlayText,
        formationSuggestions: actualFormationSuggestions,
        personnelSuggestions,
        directionOptions,
        formationTypeValues: fieldValues.formationTypes,
        backfieldAlignmentValues: fieldValues.backfieldAlignments,
        shiftValues: fieldValues.shifts,
        motionValues: fieldValues.motions,
      }),
    [
      actualFormationSuggestions,
      personnelSuggestions,
      directionOptions,
      fieldValues,
    ]
  );

  const playDetailsFields: FieldDefinitionMap = useMemo(
    () =>
      createPlayDetailsFields({
        normalizeValue: normalizePlayText,
        playNameSuggestions: actualPlayNameSuggestions,
        playTypeSuggestions,
        directionOptions,
        protectionValues: fieldValues.protections,
        wristbandValues: fieldValues.wristbandNumbers,
      }),
    [
      actualPlayNameSuggestions,
      playTypeSuggestions,
      directionOptions,
      fieldValues,
    ]
  );

  const visibleFormationFields = useMemo(
    () =>
      formationFieldOrder.filter(
        (key) => (formationFieldVisibility?.[key] ?? true) !== false
      ),
    [formationFieldOrder, formationFieldVisibility]
  );

  const visiblePlayDetailsFields = useMemo(
    () =>
      playDetailsFieldOrder.filter(
        (key) => (playDetailsFieldVisibility?.[key] ?? true) !== false
      ),
    [playDetailsFieldOrder, playDetailsFieldVisibility]
  );

  const displayName = useMemo(
    () =>
      getDisplayName(
        optimisticPlay,
        showOneWordCalls,
        visibleFormationFields,
        visiblePlayDetailsFields,
        directionDisplayFormat
      ),
    [
      optimisticPlay,
      showOneWordCalls,
      visibleFormationFields,
      visiblePlayDetailsFields,
      directionDisplayFormat,
    ]
  );

  const subtitleText = useMemo(
    () => getSubtitleText(play, showOneWordCalls),
    [play, showOneWordCalls]
  );

  const phaseLabel = useMemo(() => {
    if (!play.install_phase) return null;
    const value = play.install_phase as string;
    const isPhase = (val: string): val is InstallPhase =>
      (INSTALL_PHASES as readonly string[]).includes(val);
    if (!isPhase(value)) return null;
    return value
      .replace("install", "Install ")
      .replace("gameplan", "Game Plan")
      .replace("situational", "Situational");
  }, [play.install_phase]);

  const handleFormationDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;
      const items = Array.from(formationFieldOrder);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      patchPlayCardLayout({ formationFieldOrder: items });
    },
    [formationFieldOrder, patchPlayCardLayout]
  );

  const handlePlayDetailsDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;
      const items = Array.from(playDetailsFieldOrder);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      patchPlayCardLayout({ playDetailsFieldOrder: items });
    },
    [playDetailsFieldOrder, patchPlayCardLayout]
  );

  const toggleFieldVisibility = useCallback(
    (fieldKey: string, section: "formation" | "playDetails") => {
      if (section === "formation") {
        const prev = formationFieldVisibility || INITIAL_FORMATION_VISIBILITY;
        const next: FieldVisibility = {
          ...prev,
          [fieldKey]: prev?.[fieldKey] === false ? true : !prev?.[fieldKey],
        };
        patchPlayCardLayout({ formationFieldVisibility: next });
      } else {
        const prev =
          playDetailsFieldVisibility || INITIAL_PLAY_DETAILS_VISIBILITY;
        const next: FieldVisibility = {
          ...prev,
          [fieldKey]: prev?.[fieldKey] === false ? true : !prev?.[fieldKey],
        };
        patchPlayCardLayout({ playDetailsFieldVisibility: next });
      }
    },
    [formationFieldVisibility, playDetailsFieldVisibility, patchPlayCardLayout]
  );

  const handleOpenAssignments = useCallback(() => {
    if (onOpenAssignments) {
      onOpenAssignments(play);
    }
  }, [onOpenAssignments, play]);

  const isTile = variant === "tile";
  const isCompact = !isTile && density === "compact";

  const contentPaddingClass = (() => {
    if (isCompact) return isMobile ? "p-5" : "p-3 sm:p-4";
    return isMobile ? "p-6" : "p-4 sm:p-6";
  })();

  const handleToggleExpand = useCallback(
    (event?: React.MouseEvent) => {
      // Prevent any event bubbling
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }

      // Track play view when expanding
      if (!isExpanded) {
        trackPlayView(play.id);
      }

      if (onToggleExpand) {
        // Controlled mode - notify parent
        onToggleExpand(play.id);
      } else {
        // Uncontrolled mode - manage internally and save preference
        setInternalIsExpanded((prev) => {
          const newState = !prev;
          // Save user's preference for next time
          writeLocalString(
            storageKeys.playbook.playcardDefaultExpanded,
            String(newState)
          );
          return newState;
        });
      }
    },
    [onToggleExpand, play.id, isExpanded, trackPlayView]
  );

  return (
    <PlayCardProvider
      play={play}
      onSave={onSave}
      displayName={displayName}
      subtitleText={subtitleText}
      phaseLabel={phaseLabel}
      isExpanded={isExpanded}
      onToggleExpand={handleToggleExpand}
      isFavorite={isFavorite(play.id)}
      onToggleFavorite={() => toggleFavorite(play.id)}
      isSelected={isSelected}
      onSelectionChange={onSelectionChange}
      personnelConfigurations={personnelConfigurations}
      showOneWordCalls={showOneWordCalls}
      directionDisplayFormat={directionDisplayFormat}
      formationSuggestions={actualFormationSuggestions}
      playNameSuggestions={actualPlayNameSuggestions}
      playTypeSuggestions={playTypeSuggestions}
      personnelSuggestions={personnelSuggestions}
    >
      <PlayDiagramTooltip
        play={play}
        displayName={displayName}
        disabled={isExpanded || isMobile}
        hoverDelay={2000} // 2 second delay for general card hover
        allPlays={allPlays}
        onEnterFullscreen={onEnterFullscreen}
      >
        <div
          className={`w-full rounded-xl border bg-white dark:bg-navy-800 transition-all duration-200 overflow-visible group ${
            isSelected
              ? "ring-2 ring-primary border-primary shadow-md"
              : "border-neutral-200 dark:border-navy-700 shadow-sm hover:shadow-lg hover:border-jade-300 dark:hover:border-jade-600 hover:-translate-y-0.5"
          } ${isCompact ? "text-[13px]" : ""} ${isMobile ? "text-base" : ""} md:min-h-0`}
        >
          <div className={`${contentPaddingClass} overflow-visible`}>
            {!isTile && play.diagram_url && (
              <PlayDiagramTooltip
                play={play}
                displayName={displayName}
                disabled={isExpanded || isMobile}
                hoverDelay={0} // Instant for image hover
                allPlays={allPlays}
                onEnterFullscreen={onEnterFullscreen}
              >
                <div className="mb-3 -mt-1">
                  <img
                    src={play.diagram_url}
                    alt={`${displayName} diagram preview`}
                    className="w-full h-40 object-cover rounded-xl border border-muted cursor-pointer"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </PlayDiagramTooltip>
            )}

            {isTile ? (
              <>
                <PlayCardTileHeader
                  play={play}
                  optimisticPlay={optimisticPlay}
                  displayName={displayName}
                  subtitleText={subtitleText}
                  showOneWordCalls={showOneWordCalls}
                  isSelected={isSelected}
                  onSelectionChange={onSelectionChange}
                  onOpenAssignments={handleOpenAssignments}
                  phaseLabel={phaseLabel}
                  isFavorite={isFavorite(play.id)}
                  onToggleFavorite={() => toggleFavorite(play.id)}
                  isExpanded={isExpanded}
                  onToggleExpand={handleToggleExpand}
                  personnelConfigurations={personnelConfigurations}
                />

                {/* Quick Actions - always visible */}
                <PlayCardQuickActions
                  play={play}
                  onAddToPracticeScript={onAddToPracticeScript}
                  onAddToGamePlan={onAddToGamePlan}
                  onOpenAssignments={handleOpenAssignments}
                  onPostToTeamBulletin={onPostToTeamBulletin}
                />

                {/* Animated expansion for tile details */}
                {/* 3-TIER DESIGN: Fast expand/collapse animation (Facebook-fast: 200ms) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.2,
                        ease: [0.4, 0, 0.2, 1],
                        opacity: { duration: 0.15 },
                      }}
                      className="overflow-hidden"
                    >
                      <div className="pt-6 mt-6 border-t border-muted">
                        <PlayCardDetails
                          play={play}
                          optimisticPlay={optimisticPlay}
                          showOneWordCalls={showOneWordCalls}
                          phaseLabel={phaseLabel}
                          handleInlineSave={handleInlineSave}
                          savingFields={savingFields}
                          formationFieldOrder={formationFieldOrder}
                          formationFields={formationFields}
                          formationFieldVisibility={
                            formationFieldVisibility ||
                            INITIAL_FORMATION_VISIBILITY
                          }
                          toggleFieldVisibility={toggleFieldVisibility}
                          handleFormationDragEnd={handleFormationDragEnd}
                          playDetailsFieldOrder={playDetailsFieldOrder}
                          playDetailsFields={playDetailsFields}
                          playDetailsFieldVisibility={
                            playDetailsFieldVisibility ||
                            INITIAL_PLAY_DETAILS_VISIBILITY
                          }
                          handlePlayDetailsDragEnd={handlePlayDetailsDragEnd}
                          getPlayTypeColor={getPlayTypeColor}
                          getConfidenceColor={getConfidenceColor}
                          existingPlays={existingPlays}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <PlayCardListHeader
                play={play}
                optimisticPlay={optimisticPlay}
                displayName={displayName}
                subtitleText={subtitleText}
                showOneWordCalls={showOneWordCalls}
                isSelected={isSelected}
                onSelectionChange={onSelectionChange}
                isCompact={isCompact}
                isExpanded={isExpanded}
                onToggleExpand={handleToggleExpand}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onOpenAssignments={handleOpenAssignments}
                getPlayTypeColor={getPlayTypeColor}
                getConfidenceColor={getConfidenceColor}
                phaseLabel={phaseLabel}
                isFavorite={isFavorite(play.id)}
                onToggleFavorite={() => toggleFavorite(play.id)}
                personnelConfigurations={personnelConfigurations}
              />
            )}

            {/* Quick Actions - always visible in list view too */}
            {!isTile && (
              <PlayCardQuickActions
                play={play}
                onAddToPracticeScript={onAddToPracticeScript}
                onAddToGamePlan={onAddToGamePlan}
                onOpenAssignments={handleOpenAssignments}
                onPostToTeamBulletin={onPostToTeamBulletin}
              />
            )}

            {!isTile && isExpanded && (
              <PlayCardDetails
                play={play}
                optimisticPlay={optimisticPlay}
                showOneWordCalls={showOneWordCalls}
                phaseLabel={phaseLabel}
                handleInlineSave={handleInlineSave}
                savingFields={savingFields}
                formationFieldOrder={formationFieldOrder}
                formationFields={formationFields}
                formationFieldVisibility={
                  formationFieldVisibility || INITIAL_FORMATION_VISIBILITY
                }
                toggleFieldVisibility={toggleFieldVisibility}
                handleFormationDragEnd={handleFormationDragEnd}
                playDetailsFieldOrder={playDetailsFieldOrder}
                playDetailsFields={playDetailsFields}
                playDetailsFieldVisibility={
                  playDetailsFieldVisibility || INITIAL_PLAY_DETAILS_VISIBILITY
                }
                handlePlayDetailsDragEnd={handlePlayDetailsDragEnd}
                getPlayTypeColor={getPlayTypeColor}
                getConfidenceColor={getConfidenceColor}
                existingPlays={existingPlays}
              />
            )}
          </div>
        </div>
      </PlayDiagramTooltip>
    </PlayCardProvider>
  );
};

// 🚀 PERFORMANCE: Memoize PlayCard to prevent unnecessary re-renders
// Only re-render when props actually change (not on parent re-renders)
export default React.memo(PlayCard, (prevProps, nextProps) => {
  // Quick bailout for identity checks
  if (prevProps.play.id !== nextProps.play.id) return false;
  if (prevProps.isSelected !== nextProps.isSelected) return false;
  if (prevProps.isExpanded !== nextProps.isExpanded) return false;
  if (prevProps.showOneWordCalls !== nextProps.showOneWordCalls) return false;
  if (prevProps.variant !== nextProps.variant) return false;
  if (prevProps.density !== nextProps.density) return false;
  if (prevProps.directionDisplayFormat !== nextProps.directionDisplayFormat)
    return false;

  // Deep check on play object (only critical fields that affect rendering)
  const p = prevProps.play;
  const n = nextProps.play;
  if (p.play_name !== n.play_name) return false;
  if (p.formation !== n.formation) return false;
  if (p.p_type !== n.p_type) return false;
  if (p.times_called !== n.times_called) return false;
  if (p.install_phase !== n.install_phase) return false;

  // Functions are stable via useCallback, so we can skip deep comparison
  // If they change, parent wants a re-render anyway

  return true; // Props are equal, skip re-render
});
