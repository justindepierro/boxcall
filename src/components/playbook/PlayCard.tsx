import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
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
import { usePreference } from "../../hooks/usePreferences";
import { useRecentPlays } from "../../hooks/useRecentPlays";
import { useFavoritePlays } from "../../hooks/useFavoritePlays";
import { useIsMobile } from "../../hooks/useBreakpoint";
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
}

type FieldVisibility = Record<string, boolean>;

type SaveQueue = Set<string>;

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
  "ptags",
  "tags",
  "key_positions",
  "key_players",
  "one_word_play",
];

const INITIAL_PLAY_DETAILS_VISIBILITY: FieldVisibility = {
  play_name: true,
  p_dir: true,
  p_type: true,
  protection: true,
  ptags: true,
  tags: true,
  key_positions: true,
  key_players: true,
  one_word_play: true,
};

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
}) => {
  const [optimisticPlay, setOptimisticPlay] = useState<PlayType>(play);
  const [savingFields, setSavingFields] = useState<SaveQueue>(new Set());
  const [formationFieldOrder, setFormationFieldOrder] = useState<string[]>(
    INITIAL_FORMATION_ORDER
  );
  const lastSyncedPlayRef = useRef<PlayType>(play);
  const lastSaveTimeRef = useRef<number>(0);
  // Quick Wins: Recent plays tracking and favorites
  const { trackPlayView } = useRecentPlays();
  const { isFavorite, toggleFavorite } = useFavoritePlays();

  // Mobile detection for responsive styling
  const isMobile = useIsMobile();

  // Use server-synced preferences for field visibility
  const [formationFieldVisibility, setFormationFieldVisibility] = usePreference(
    "bc_formation_field_visibility",
    INITIAL_FORMATION_VISIBILITY
  );

  const [playDetailsFieldOrder, setPlayDetailsFieldOrder] = useState<string[]>(
    INITIAL_PLAY_DETAILS_ORDER
  );

  const [playDetailsFieldVisibility, setPlayDetailsFieldVisibility] =
    usePreference(
      "bc_play_details_field_visibility",
      INITIAL_PLAY_DETAILS_VISIBILITY
    );

  // Use controlled expansion if provided, otherwise use internal state with localStorage persistence
  const [internalIsExpanded, setInternalIsExpanded] = useState(() => {
    // Load user's default preference from localStorage
    const savedPreference = localStorage.getItem('bc_playcard_default_expanded');
    return savedPreference === 'true';
  });
  const isExpanded = controlledIsExpanded ?? internalIsExpanded;

  useEffect(() => {
    // Only sync when play prop actually changes (new data from server)
    if (play !== lastSyncedPlayRef.current) {
      const timeSinceLastSave = Date.now() - lastSaveTimeRef.current;

      lastSyncedPlayRef.current = play;

      // Don't sync if:
      // 1. We're currently saving any fields, OR
      // 2. We just finished saving within the last 500ms (optimistic update grace period)
      if (savingFields.size === 0 && timeSinceLastSave > 500) {
        setOptimisticPlay(play);
      }
    }
    // We intentionally don't include optimisticPlay in deps to avoid sync loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play]);

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
      }),
    [actualFormationSuggestions, personnelSuggestions, directionOptions]
  );

  const playDetailsFields: FieldDefinitionMap = useMemo(
    () =>
      createPlayDetailsFields({
        normalizeValue: normalizePlayText,
        playNameSuggestions: actualPlayNameSuggestions,
        playTypeSuggestions,
        directionOptions,
      }),
    [actualPlayNameSuggestions, playTypeSuggestions, directionOptions]
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

  const handleInlineSave = useCallback(
    async (field: keyof PlayType, value: string | number | boolean) => {
      const fieldName = field as string;

      setOptimisticPlay((prev) => {
        const updated = { ...prev, [field]: value };
        return updated;
      });

      setSavingFields((prev) => new Set(prev).add(fieldName));

      try {
        if (onSave) {
          await onSave(play.id, { [field]: value });
        }
      } catch (error) {
        console.error(
          `[PlayCard] Failed to save ${fieldName}, reverting:`,
          error
        );
        setOptimisticPlay((prev) => ({ ...prev, [field]: play[field] }));
      } finally {
        setSavingFields((prev) => {
          const next = new Set(prev);
          next.delete(fieldName);
          return next;
        });
        // Track when the save completed to prevent immediate sync
        lastSaveTimeRef.current = Date.now();
      }
    },
    // optimisticPlay is only used for logging, not needed in deps

    [onSave, play]
  );

  const handleFormationDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;
      const items = Array.from(formationFieldOrder);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      setFormationFieldOrder(items);
    },
    [formationFieldOrder]
  );

  const handlePlayDetailsDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;
      const items = Array.from(playDetailsFieldOrder);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      setPlayDetailsFieldOrder(items);
    },
    [playDetailsFieldOrder]
  );

  const toggleFieldVisibility = useCallback(
    (fieldKey: string, section: "formation" | "playDetails") => {
      if (section === "formation") {
        setFormationFieldVisibility(
          (prev: Record<string, boolean> | undefined) => ({
            ...(prev || INITIAL_FORMATION_VISIBILITY),
            [fieldKey]: prev?.[fieldKey] === false ? true : !prev?.[fieldKey],
          })
        );
      } else {
        setPlayDetailsFieldVisibility(
          (prev: Record<string, boolean> | undefined) => ({
            ...(prev || INITIAL_PLAY_DETAILS_VISIBILITY),
            [fieldKey]: prev?.[fieldKey] === false ? true : !prev?.[fieldKey],
          })
        );
      }
    },
    [setFormationFieldVisibility, setPlayDetailsFieldVisibility]
  );

  const handleOpenAssignments = useCallback(() => {
    if (onOpenAssignments) {
      onOpenAssignments(play);
    }
  }, [onOpenAssignments, play]);

  const isTile = variant === "tile";
  const isCompact = !isTile && density === "compact";

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
          localStorage.setItem('bc_playcard_default_expanded', String(newState));
          return newState;
        });
      }
    },
    [onToggleExpand, play.id, isExpanded, trackPlayView]
  );

  return (
    <div
      className={`w-full rounded-2xl border bg-white transition-all duration-300 overflow-visible ${
        isSelected
          ? "ring-2 ring-brand-accent border-accent shadow-lg"
          : "border-secondary/30 shadow-sm hover:shadow-md hover:border-secondary/60 hover:scale-[1.01] hover:-translate-y-0.5"
      } ${isCompact ? "text-[13px]" : ""} ${isMobile ? "text-base" : ""} md:min-h-0`}
    >
      <div
        className={`${
          isCompact
            ? isMobile
              ? "p-5"
              : "p-3 sm:p-4"
            : isMobile
              ? "p-6"
              : "p-4 sm:p-6"
        } overflow-visible`}
      >
        {!isTile && play.diagram_url && (
          <div className="mb-3 -mt-1">
            <img
              src={play.diagram_url}
              alt={`${displayName} diagram preview`}
              className="w-full h-40 object-cover rounded-xl border border-muted"
              loading="lazy"
              decoding="async"
            />
          </div>
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
                        formationFieldVisibility || INITIAL_FORMATION_VISIBILITY
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
          />
        )}
      </div>
    </div>
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
