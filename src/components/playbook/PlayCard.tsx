import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DropResult } from "@hello-pangea/dnd";
import type { Play as PlayType } from "../../types/play";
import { INSTALL_PHASES, type InstallPhase } from "../../types/play";
import { getDisplayName, getSubtitleText } from "../../utils/playNameUtils";
import { PlayCardListHeader } from "./play-card/PlayCardListHeader";
import { PlayCardTileHeader } from "./play-card/PlayCardTileHeader";
import { PlayCardDetails } from "./play-card/PlayCardDetails";
import { usePreference } from "../../hooks/usePreferences";
import { useRecentPlays } from "../../hooks/useRecentPlays";
import { useFavoritePlays } from "../../hooks/useFavoritePlays";
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
  onCreateDiagram?: (play: PlayType) => void;
  onAddToPracticeScript?: (play: PlayType) => void;
  onAddToGamePlan?: (play: PlayType) => void;
  isSelected?: boolean;
  onSelectionChange?: (playId: string, selected: boolean) => void;
  density?: "comfortable" | "compact";
  variant?: "list" | "tile";
  directionDisplayFormat?: "full" | "abbrev" | "letter";
  formationSuggestions?: string[];
  playNameSuggestions?: string[];
  playTypeSuggestions?: string[];
  // Controlled expansion state
  isExpanded?: boolean;
  onToggleExpand?: (playId: string) => void;
}

type FieldVisibility = Record<string, boolean>;

type SaveQueue = Set<string>;

const INITIAL_FORMATION_ORDER = [
  "formation",
  "f_dir",
  "f_type",
  "back_align",
  "shift",
  "motion",
  "ftags",
  "r_str",
  "p_str",
];

const INITIAL_FORMATION_VISIBILITY: FieldVisibility = {
  formation: true,
  f_type: true,
  f_dir: true,
  back_align: true,
  shift: true,
  motion: true,
  ftags: true,
  r_str: true,
  p_str: true,
};

const INITIAL_PLAY_DETAILS_ORDER = [
  "play_name",
  "p_dir",
  "p_type",
  "protection",
  "ptags",
  "one_word_play",
];

const INITIAL_PLAY_DETAILS_VISIBILITY: FieldVisibility = {
  play_name: true,
  p_dir: true,
  p_type: true,
  protection: true,
  ptags: true,
  one_word_play: true,
};

export const PlayCard: React.FC<PlayCardProps> = ({
  play,
  showOneWordCalls = false,
  onEdit,
  onSave,
  onDuplicate,
  onCreateDiagram,
  onAddToPracticeScript,
  onAddToGamePlan,
  isSelected = false,
  onSelectionChange,
  density = "compact",
  variant = "list",
  directionDisplayFormat = "full",
  formationSuggestions = [],
  playNameSuggestions = [],
  playTypeSuggestions = [],
  isExpanded: controlledIsExpanded,
  onToggleExpand,
}) => {
  const [optimisticPlay, setOptimisticPlay] = useState<PlayType>(play);
  const [savingFields, setSavingFields] = useState<SaveQueue>(new Set());
  const [formationFieldOrder, setFormationFieldOrder] = useState<string[]>(
    INITIAL_FORMATION_ORDER
  );

  // Quick Wins: Recent plays tracking and favorites
  const { trackPlayView } = useRecentPlays();
  const { toggleFavorite, isFavorite } = useFavoritePlays();

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

  // Use controlled expansion if provided, otherwise use internal state
  const [internalIsExpanded, setInternalIsExpanded] = useState(false);
  const isExpanded = controlledIsExpanded ?? internalIsExpanded;

  useEffect(() => {
    // Only update optimistic play if we're not currently saving any fields
    // This prevents overwriting optimistic updates while saves are in progress
    if (savingFields.size === 0) {
      console.log(
        "[PlayCard] Syncing optimistic play with prop (no saves in progress):",
        play
      );
      setOptimisticPlay(play);
    } else {
      console.log(
        "[PlayCard] Skipping sync - save in progress for:",
        Array.from(savingFields)
      );
    }
  }, [play, savingFields]);

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
        directionOptions,
      }),
    [actualFormationSuggestions, directionOptions]
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
        visiblePlayDetailsFields
      ),
    [
      optimisticPlay,
      showOneWordCalls,
      visibleFormationFields,
      visiblePlayDetailsFields,
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
    async (field: keyof PlayType, value: string | number) => {
      const fieldName = field as string;

      console.log("[PlayCard] handleInlineSave called:", {
        field,
        value,
        playId: play.id,
      });

      setOptimisticPlay((prev) => {
        const updated = { ...prev, [field]: value };
        console.log("[PlayCard] Set optimistic state:", {
          [field]: value,
          fullPlay: updated,
        });
        return updated;
      });

      setSavingFields((prev) => new Set(prev).add(fieldName));

      try {
        if (onSave) {
          console.log("[PlayCard] Calling onSave prop");
          await onSave(play.id, { [field]: value });
          console.log("[PlayCard] onSave completed successfully");
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
      }
    },
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

  const handleCreateDiagram = useCallback(() => {
    if (onCreateDiagram) {
      onCreateDiagram(play);
    }
  }, [onCreateDiagram, play]);

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
        // Uncontrolled mode - manage internally
        setInternalIsExpanded((prev) => !prev);
      }
    },
    [onToggleExpand, play.id, isExpanded, trackPlayView]
  );

  return (
    <div
      className={`w-full rounded-xl border bg-surface-base/90 transition-all duration-200 overflow-visible ${
        isSelected
          ? "ring-2 ring-brand-primary border-brand-primary shadow-lg"
          : "shadow-card hover:shadow-xl hover:border-brand-primary/40 hover:scale-[1.02] hover:-translate-y-1"
      } ${isCompact ? "text-[13px]" : ""} md:min-h-0`}
    >
      <div
        className={`${isCompact ? "p-3 sm:p-4" : "p-4 sm:p-6"} overflow-visible`}
      >
        {!isTile && play.diagram_url && (
          <div className="mb-3 -mt-1">
            <img
              src={play.diagram_url}
              alt={`${displayName} diagram preview`}
              className="w-full h-40 object-cover rounded-lg border border-subtle"
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
              onCreateDiagram={handleCreateDiagram}
              phaseLabel={phaseLabel}
              isFavorite={isFavorite(play.id)}
              onToggleFavorite={() => toggleFavorite(play.id)}
              isExpanded={isExpanded}
              onToggleExpand={handleToggleExpand}
            />

            {/* Animated expansion for tile details */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1],
                    opacity: { duration: 0.2 },
                  }}
                  className="overflow-hidden"
                >
                  <div className="pt-6 mt-6 border-t border-border-subtle">
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
                      onAddToPracticeScript={onAddToPracticeScript}
                      onAddToGamePlan={onAddToGamePlan}
                      onCreateDiagram={handleCreateDiagram}
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
            onCreateDiagram={handleCreateDiagram}
            getPlayTypeColor={getPlayTypeColor}
            getConfidenceColor={getConfidenceColor}
            phaseLabel={phaseLabel}
            isFavorite={isFavorite(play.id)}
            onToggleFavorite={() => toggleFavorite(play.id)}
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
            onAddToPracticeScript={onAddToPracticeScript}
            onAddToGamePlan={onAddToGamePlan}
            onCreateDiagram={handleCreateDiagram}
          />
        )}
      </div>
    </div>
  );
};
