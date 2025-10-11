import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { DropResult } from "@hello-pangea/dnd";
import type { Play as PlayType } from "../../types/play";
import { INSTALL_PHASES, type InstallPhase } from "../../types/play";
import { getDisplayName, getSubtitleText } from "../../utils/playNameUtils";
import { PlayCardListHeader } from "./play-card/PlayCardListHeader";
import { PlayCardTileHeader } from "./play-card/PlayCardTileHeader";
import { PlayCardDetails } from "./play-card/PlayCardDetails";
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
}) => {
  const [optimisticPlay, setOptimisticPlay] = useState<PlayType>(play);
  const [savingFields, setSavingFields] = useState<SaveQueue>(new Set());
  const [formationFieldOrder, setFormationFieldOrder] = useState<string[]>(
    INITIAL_FORMATION_ORDER
  );
  const [formationFieldVisibility, setFormationFieldVisibility] =
    useState<FieldVisibility>(INITIAL_FORMATION_VISIBILITY);
  const [playDetailsFieldOrder, setPlayDetailsFieldOrder] = useState<string[]>(
    INITIAL_PLAY_DETAILS_ORDER
  );
  const [playDetailsFieldVisibility, setPlayDetailsFieldVisibility] =
    useState<FieldVisibility>(INITIAL_PLAY_DETAILS_VISIBILITY);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setOptimisticPlay(play);
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
        (key) => formationFieldVisibility[key] !== false
      ),
    [formationFieldOrder, formationFieldVisibility]
  );

  const visiblePlayDetailsFields = useMemo(
    () =>
      playDetailsFieldOrder.filter(
        (key) => playDetailsFieldVisibility[key] !== false
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

      setOptimisticPlay((prev) => ({ ...prev, [field]: value }));
      setSavingFields((prev) => new Set(prev).add(fieldName));

      try {
        if (onSave) {
          await onSave(play.id, { [field]: value });
        }
      } catch (error) {
        setOptimisticPlay((prev) => ({ ...prev, [field]: play[field] }));
        console.error(`Failed to save ${fieldName}:`, error);
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
        setFormationFieldVisibility((prev) => ({
          ...prev,
          [fieldKey]: prev[fieldKey] === false ? true : !prev[fieldKey],
        }));
      } else {
        setPlayDetailsFieldVisibility((prev) => ({
          ...prev,
          [fieldKey]: prev[fieldKey] === false ? true : !prev[fieldKey],
        }));
      }
    },
    []
  );

  const handleCreateDiagram = useCallback(() => {
    if (onCreateDiagram) {
      onCreateDiagram(play);
    }
  }, [onCreateDiagram, play]);

  const isTile = variant === "tile";
  const isCompact = !isTile && density === "compact";

  const onToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <div
      className={`rounded-xl border bg-surface-base/90 backdrop-blur-xl transition-all duration-200 overflow-visible ${
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
          <PlayCardTileHeader
            play={play}
            optimisticPlay={optimisticPlay}
            displayName={displayName}
            subtitleText={subtitleText}
            showOneWordCalls={showOneWordCalls}
            isSelected={isSelected}
            onSelectionChange={onSelectionChange}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onCreateDiagram={handleCreateDiagram}
            getPlayTypeColor={getPlayTypeColor}
            phaseLabel={phaseLabel}
          />
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
            onToggleExpand={onToggleExpand}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onCreateDiagram={handleCreateDiagram}
            getPlayTypeColor={getPlayTypeColor}
            getConfidenceColor={getConfidenceColor}
            phaseLabel={phaseLabel}
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
            formationFieldVisibility={formationFieldVisibility}
            toggleFieldVisibility={toggleFieldVisibility}
            handleFormationDragEnd={handleFormationDragEnd}
            playDetailsFieldOrder={playDetailsFieldOrder}
            playDetailsFields={playDetailsFields}
            playDetailsFieldVisibility={playDetailsFieldVisibility}
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
