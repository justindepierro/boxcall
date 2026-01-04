import { useCallback, useMemo, useState } from "react";
import type { DropResult } from "@hello-pangea/dnd";
import {
  createFormationFields,
  createPlayDetailsFields,
} from "./play-card/fieldDefinitions";
import { getDirectionOptions } from "./play-card/constants";
import { usePlayCardState } from "./play-card/hooks";
import { getDisplayName, getSubtitleText } from "../../utils/playNameUtils";
import {
  readLocalJson,
  writeLocalJson,
  writeLocalString,
  storageKeys,
} from "../../utils/storage";
import type { Play } from "../../types/play";
import type { PersonnelConfiguration } from "../../types/personnel";
import { getConfidenceColor, getPlayTypeColor } from "./play-card/helpers";
import { PlayCardDetails } from "./play-card/PlayCardDetails/PlayCardDetails";

const FORMATION_ORDER_KEY = "bc_formation_field_order";
const PLAY_DETAILS_ORDER_KEY = "bc_play_details_field_order";

const FORMATION_ORDER_DEFAULT = [
  "formation",
  "f_dir",
  "back_align",
  "back_position",
  "shift",
  "motion",
  "ftags",
];

const PLAY_DETAILS_ORDER_DEFAULT = [
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

const FORMATION_VISIBILITY_DEFAULT: Record<string, boolean> = {
  formation: true,
  personnel: false,
  f_dir: true,
  back_align: true,
  back_position: true,
  shift: true,
  motion: true,
  ftags: true,
};

const PLAY_DETAILS_VISIBILITY_DEFAULT: Record<string, boolean> = {
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

const loadJson = <T,>(key: string, fallback: T): T => {
  const stored = readLocalJson<T>(key);
  return Array.isArray(fallback) && Array.isArray(stored)
    ? (stored as T)
    : (stored ?? fallback);
};

export interface LegacyFeatureOptions {
  play: Play;
  showOneWordCalls?: boolean;
  directionDisplayFormat?: "full" | "abbrev" | "letter";
  onSave?: (playId: string, updates: Partial<Play>) => Promise<void>;
  formationSuggestions?: string[];
  playNameSuggestions?: string[];
  playTypeSuggestions?: string[];
  personnelSuggestions?: string[];
  personnelConfigurations?: PersonnelConfiguration[];
}

// eslint-disable-next-line max-lines-per-function
export function useLegacyPlayCardFeatures({
  play,
  showOneWordCalls = false,
  directionDisplayFormat = "full",
  onSave,
  formationSuggestions = [],
  playNameSuggestions = [],
  playTypeSuggestions = [],
  personnelSuggestions = [],
  personnelConfigurations = [],
}: LegacyFeatureOptions) {
  const { optimisticPlay, savingFields, handleInlineSave } = usePlayCardState({
    play,
    onSave,
  });

  const [formationFieldOrder, setFormationFieldOrder] = useState<string[]>(() =>
    loadJson(FORMATION_ORDER_KEY, FORMATION_ORDER_DEFAULT)
  );
  const [playDetailsFieldOrder, setPlayDetailsFieldOrder] = useState<string[]>(
    () => loadJson(PLAY_DETAILS_ORDER_KEY, PLAY_DETAILS_ORDER_DEFAULT)
  );

  const [formationFieldVisibility, setFormationFieldVisibility] = useState<
    Record<string, boolean>
  >(() =>
    loadJson(
      storageKeys.preferences.formationFieldVisibility,
      FORMATION_VISIBILITY_DEFAULT
    )
  );

  const [playDetailsFieldVisibility, setPlayDetailsFieldVisibility] = useState<
    Record<string, boolean>
  >(() =>
    loadJson(
      storageKeys.preferences.playDetailsFieldVisibility,
      PLAY_DETAILS_VISIBILITY_DEFAULT
    )
  );

  const directionOptions = useMemo(
    () => getDirectionOptions(directionDisplayFormat),
    [directionDisplayFormat]
  );

  const formationFields = useMemo(
    () =>
      createFormationFields({
        normalizeValue: (value: string) => value.trim(),
        formationSuggestions,
        personnelSuggestions,
        directionOptions,
      }),
    [directionOptions, formationSuggestions, personnelSuggestions]
  );

  const playDetailsFields = useMemo(
    () =>
      createPlayDetailsFields({
        normalizeValue: (value: string) => value.trim(),
        playNameSuggestions,
        playTypeSuggestions,
        directionOptions,
      }),
    [directionOptions, playNameSuggestions, playTypeSuggestions]
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
      directionDisplayFormat,
      optimisticPlay,
      showOneWordCalls,
      visibleFormationFields,
      visiblePlayDetailsFields,
    ]
  );

  const subtitleText = useMemo(
    () => getSubtitleText(optimisticPlay, showOneWordCalls),
    [optimisticPlay, showOneWordCalls]
  );

  const phaseLabel = useMemo(() => {
    if (!play.install_phase) return null;
    const value = play.install_phase as string;
    const mapped = value
      .replace("install", "Install ")
      .replace("gameplan", "Game Plan")
      .replace("situational", "Situational");
    return mapped;
  }, [play.install_phase]);

  const handleFormationDragEnd = useCallback(
    (result: DropResult) => {
      const destination = result.destination;
      if (!destination) return;

      const items = Array.from(formationFieldOrder);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      setFormationFieldOrder(items);
      writeLocalJson(FORMATION_ORDER_KEY, items);
    },
    [formationFieldOrder]
  );

  const handlePlayDetailsDragEnd = useCallback(
    (result: DropResult) => {
      const destination = result.destination;
      if (!destination) return;

      const items = Array.from(playDetailsFieldOrder);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      setPlayDetailsFieldOrder(items);
      writeLocalJson(PLAY_DETAILS_ORDER_KEY, items);
    },
    [playDetailsFieldOrder]
  );

  const toggleFieldVisibility = useCallback(
    (fieldKey: string, section: "formation" | "playDetails") => {
      if (section === "formation") {
        setFormationFieldVisibility((prev) => {
          const updated = {
            ...prev,
            [fieldKey]: prev[fieldKey] === false ? true : !prev[fieldKey],
          };
          writeLocalJson(
            storageKeys.preferences.formationFieldVisibility,
            updated
          );
          return updated;
        });
      } else {
        setPlayDetailsFieldVisibility((prev) => {
          const updated = {
            ...prev,
            [fieldKey]: prev[fieldKey] === false ? true : !prev[fieldKey],
          };
          writeLocalJson(
            storageKeys.preferences.playDetailsFieldVisibility,
            updated
          );
          return updated;
        });
      }
      writeLocalString(storageKeys.playbook.playcardDefaultExpanded, "true");
    },
    []
  );

  const details = (
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
      existingPlays={[play]}
    />
  );

  return {
    optimisticPlay,
    displayName,
    subtitleText,
    phaseLabel,
    details,
    savingFields,
    formationFieldOrder,
    playDetailsFieldOrder,
    visibleFormationFields,
    visiblePlayDetailsFields,
    toggleFieldVisibility,
    handleInlineSave,
    formationFieldVisibility,
    playDetailsFieldVisibility,
    personnelConfigurations,
  };
}
