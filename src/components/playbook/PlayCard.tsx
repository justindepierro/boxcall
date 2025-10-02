import React, { useState, useEffect } from "react";
import { Typography } from "../design-system/Typography";
import Icon from "../ui/Icon/Icon";
import { InlineEditField } from "../ui/InlineEditField";
import { InlineSelectField } from "../ui/InlineSelectField";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { Play as PlayType } from "../../types/play";
import { getDisplayName, getSubtitleText } from "../../utils/playNameUtils";
import {
  getPlayFlags,
  addFlag,
  removeFlag,
  POSITION_OPTIONS,
  type PlayFlags,
} from "../../utils/localPlayFlags";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button/Button";
import { INSTALL_PHASES, type InstallPhase } from "../../types/play";
import { UserAvatar } from "../ui/UserAvatar";
interface PlayCardProps {
  play: PlayType;
  showOneWordCalls?: boolean;
  onEdit?: (play: PlayType) => void;
  onSave?: (playId: string, updates: Partial<PlayType>) => Promise<void>;
  onDuplicate?: (play: PlayType) => void;
  onCreateDiagram?: (play: PlayType) => void;
  onAddToPracticeScript?: (play: PlayType) => void;
  onAddToGamePlan?: (play: PlayType) => void;
  // Bulk Operations
  isSelected?: boolean;
  onSelectionChange?: (playId: string, selected: boolean) => void;
  density?: "comfortable" | "compact";
  // Suggestions for inline editing
  formationSuggestions?: string[];
  playNameSuggestions?: string[];
}
export const PlayCard: React.FC<PlayCardProps> = ({
  play,
  showOneWordCalls = false,
  onEdit,
  onSave,
  onDuplicate,
  onCreateDiagram,
  onAddToPracticeScript,
  onAddToGamePlan,
  // Bulk Operations
  isSelected = false,
  onSelectionChange,
  density = "compact",
  // Suggestions
  formationSuggestions = [],
  playNameSuggestions = [],
}) => {
  // Optimistic updates for smooth inline editing
  const [optimisticPlay, setOptimisticPlay] = useState<PlayType>(play);
  const [savingFields, setSavingFields] = useState<Set<string>>(new Set());

  // Formation field ordering for drag-and-drop
  const [formationFieldOrder, setFormationFieldOrder] = useState<string[]>([
    "formation",
    "f_dir",
    "f_type",
    "back_align",
    "shift",
    "motion",
    "ftags",
    "r_str",
    "p_str",
  ]);

  // Formation field visibility
  const [formationFieldVisibility, setFormationFieldVisibility] = useState<
    Record<string, boolean>
  >({
    formation: true,
    f_type: true,
    f_dir: true,
    back_align: true,
    shift: true,
    motion: true,
    ftags: true,
    r_str: true,
    p_str: true,
  });

  // Play Details field ordering for drag-and-drop
  const [playDetailsFieldOrder, setPlayDetailsFieldOrder] = useState<string[]>([
    "play_name",
    "p_dir",
    "p_type",
    "protection",
    "ptags",
    "one_word_play",
  ]);

  // Play Details field visibility
  const [playDetailsFieldVisibility, setPlayDetailsFieldVisibility] = useState<
    Record<string, boolean>
  >({
    play_name: true,
    p_dir: true,
    p_type: true,
    protection: true,
    ptags: true,
    one_word_play: true,
  });

  // Toggle field visibility
  const toggleFieldVisibility = (
    fieldKey: string,
    section: "formation" | "playDetails"
  ) => {
    if (section === "formation") {
      setFormationFieldVisibility((prev) => ({
        ...prev,
        [fieldKey]: !prev[fieldKey],
      }));
    } else {
      setPlayDetailsFieldVisibility((prev) => ({
        ...prev,
        [fieldKey]: !prev[fieldKey],
      }));
    }
  };

  // Get visible field order for display name
  const visibleFormationFields = formationFieldOrder.filter(
    (key) => formationFieldVisibility[key]
  );
  const visiblePlayDetailsFields = playDetailsFieldOrder.filter(
    (key) => playDetailsFieldVisibility[key]
  );

  // Sync optimistic state with prop changes
  useEffect(() => {
    setOptimisticPlay(play);
  }, [play]);

  // Default suggestions if none provided
  const defaultFormationSuggestions = [
    "Shotgun",
    "Pistol",
    "Wildcat",
    "Empty",
    "Trips Right",
    "Trips Left",
    "Bunch Right",
    "Bunch Left",
    "Stack Right",
    "Stack Left",
  ];
  const defaultPlayNameSuggestions = [
    "Slant",
    "Out",
    "Fade",
    "Post",
    "Corner",
    "Go Route",
    "Screen",
    "Draw",
    "Inside Zone",
    "Outside Zone",
    "Power",
    "Counter",
  ];

  const actualFormationSuggestions =
    formationSuggestions.length > 0
      ? formationSuggestions
      : defaultFormationSuggestions;
  const actualPlayNameSuggestions =
    playNameSuggestions.length > 0
      ? playNameSuggestions
      : defaultPlayNameSuggestions;

  // Normalization function for text fields
  const normalizeValue = (value: string): string => {
    return value
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Save handler for inline edits with optimistic updates
  const handleInlineSave = async (
    field: keyof PlayType,
    value: string | number
  ) => {
    const fieldName = field as string;

    // Optimistic update
    setOptimisticPlay((prev) => ({ ...prev, [field]: value }));
    setSavingFields((prev) => new Set(prev).add(fieldName));

    try {
      if (onSave) {
        console.log(`Saving ${fieldName}:`, value);
        await onSave(play.id, { [field]: value });
        console.log(`Successfully saved ${fieldName}`);
      } else {
        console.warn(`No onSave function provided for ${fieldName}`);
        // If no onSave, just keep the optimistic update
      }
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticPlay((prev) => ({ ...prev, [field]: play[field] }));
      console.error(`Failed to save ${fieldName}:`, error);
    } finally {
      setSavingFields((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fieldName);
        return newSet;
      });
    }
  };

  // Handle drag-and-drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(formationFieldOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormationFieldOrder(items);
  };

  // Handle drag-and-drop reordering for Play Details
  const handlePlayDetailsDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(playDetailsFieldOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPlayDetailsFieldOrder(items);
  };

  const getPlayTypeColor = (type: string) => {
    switch (type) {
      case "Pass":
        // Electric purple background with white text for high contrast
        return "bg-electric-600 text-white";
      case "Run":
        // Jade green background with white text for high contrast
        return "bg-jade-600 text-white";
      case "RPO":
        // Navy background with light text for professional look
        return "bg-navy-700 text-white";
      case "Play Action":
        // Amber background with dark text for good contrast
        return "bg-warning-500 text-gray-900";
      default:
        // Neutral gray with good contrast
        return "bg-gray-600 text-white";
    }
  };
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85)
      return "text-white bg-jade-600 px-1.5 py-0.5 rounded font-semibold"; // High confidence - dark jade bg
    if (confidence >= 70)
      return "text-jade-800 bg-jade-100 px-1.5 py-0.5 rounded font-medium"; // Good confidence - light jade bg
    if (confidence >= 60)
      return "text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-medium"; // Medium confidence - light amber bg
    if (confidence >= 50)
      return "text-orange-800 bg-orange-100 px-1.5 py-0.5 rounded font-medium"; // Low-medium confidence - light orange bg
    return "text-white bg-red-600 px-1.5 py-0.5 rounded font-semibold"; // Low confidence - red bg
  };
  const phaseLabel = ((): string | null => {
    if (!play.install_phase) return null;
    const value = play.install_phase as string;
    const isPhase = (val: string): val is InstallPhase =>
      (INSTALL_PHASES as readonly string[]).includes(val);
    if (!isPhase(value)) return null;
    return value
      .replace("install", "Install ")
      .replace("gameplan", "Game Plan")
      .replace("situational", "Situational");
  })();
  const handleCreateDiagram = () => {
    if (onCreateDiagram) {
      onCreateDiagram(play);
    }
  };

  // Dropdown options for inline editing
  const FORMATION_OPTIONS = [
    { value: "Empty", label: "Empty" },
    { value: "Shotgun", label: "Shotgun" },
    { value: "Pistol", label: "Pistol" },
    { value: "Wildcat", label: "Wildcat" },
    { value: "Trips Right", label: "Trips Right" },
    { value: "Trips Left", label: "Trips Left" },
    { value: "Bunch Right", label: "Bunch Right" },
    { value: "Bunch Left", label: "Bunch Left" },
    { value: "Stack Right", label: "Stack Right" },
    { value: "Stack Left", label: "Stack Left" },
  ];

  const PERSONNEL_OPTIONS = [
    { value: "10", label: "10 Personnel (1 RB, 0 TE)" },
    { value: "11", label: "11 Personnel (1 RB, 1 TE)" },
    { value: "12", label: "12 Personnel (1 RB, 2 TE)" },
    { value: "13", label: "13 Personnel (1 RB, 3 TE)" },
    { value: "20", label: "20 Personnel (2 RB, 0 TE)" },
    { value: "21", label: "21 Personnel (2 RB, 1 TE)" },
    { value: "22", label: "22 Personnel (2 RB, 2 TE)" },
  ];

  const PLAY_TYPE_OPTIONS = [
    { value: "Pass", label: "Pass" },
    { value: "Run", label: "Run" },
    { value: "RPO", label: "RPO" },
    { value: "Play Action", label: "Play Action" },
  ];

  const DIRECTION_OPTIONS = [
    { value: "Left", label: "Left" },
    { value: "Right", label: "Right" },
    { value: "Middle", label: "Middle" },
    { value: "Stretch", label: "Stretch" },
  ];

  const DOWN_OPTIONS = [
    { value: "1st", label: "1st Down" },
    { value: "2nd", label: "2nd Down" },
    { value: "3rd", label: "3rd Down" },
    { value: "4th", label: "4th Down" },
  ];

  const DISTANCE_OPTIONS = [
    { value: "Short", label: "Short" },
    { value: "Medium", label: "Medium" },
    { value: "Long", label: "Long" },
  ];

  const HASH_OPTIONS = [
    { value: "Left", label: "Left Hash" },
    { value: "Right", label: "Right Hash" },
    { value: "Middle", label: "Middle" },
  ];
  const displayName = getDisplayName(
    play,
    showOneWordCalls,
    visibleFormationFields,
    visiblePlayDetailsFields
  );
  const subtitleText = getSubtitleText(play, showOneWordCalls);

  // Formation field definitions for drag-and-drop
  const formationFields = {
    formation: {
      label: "Base",
      render: (
        optimisticPlay: PlayType,
        handleInlineSave: (
          field: keyof PlayType,
          value: string | number
        ) => Promise<void>,
        savingFields: Set<string>
      ) => (
        <InlineSelectField
          value={optimisticPlay.formation}
          options={FORMATION_OPTIONS}
          onSave={(value) => handleInlineSave("formation", value)}
          placeholder="Select formation"
          isSaving={savingFields.has("formation")}
        />
      ),
    },
    f_type: {
      label: "Type",
      render: (
        optimisticPlay: PlayType,
        handleInlineSave: (
          field: keyof PlayType,
          value: string | number
        ) => Promise<void>,
        savingFields: Set<string>
      ) => (
        <InlineEditField
          value={optimisticPlay.f_type || ""}
          onSave={(value) => handleInlineSave("f_type", value)}
          placeholder="Formation type"
          suggestions={actualFormationSuggestions}
          enableSuggestions={true}
          normalizeValue={normalizeValue}
          isSaving={savingFields.has("f_type")}
        />
      ),
    },
    f_dir: {
      label: "Direction",
      render: (
        optimisticPlay: PlayType,
        handleInlineSave: (
          field: keyof PlayType,
          value: string | number
        ) => Promise<void>,
        savingFields: Set<string>
      ) => (
        <InlineSelectField
          value={optimisticPlay.f_dir || ""}
          options={DIRECTION_OPTIONS}
          onSave={(value) => handleInlineSave("f_dir", value)}
          placeholder="Direction"
          allowEmpty={true}
          emptyLabel="None"
          isSaving={savingFields.has("f_dir")}
        />
      ),
    },
    back_align: {
      label: "Back Align",
      render: (
        optimisticPlay: PlayType,
        handleInlineSave: (
          field: keyof PlayType,
          value: string | number
        ) => Promise<void>,
        savingFields: Set<string>
      ) => (
        <InlineEditField
          value={optimisticPlay.back_align || ""}
          onSave={(value) => handleInlineSave("back_align", value)}
          placeholder="Backfield alignment"
          isSaving={savingFields.has("back_align")}
        />
      ),
    },
    shift: {
      label: "Shift",
      render: (
        optimisticPlay: PlayType,
        handleInlineSave: (
          field: keyof PlayType,
          value: string | number
        ) => Promise<void>,
        savingFields: Set<string>
      ) => (
        <InlineEditField
          value={optimisticPlay.shift || ""}
          onSave={(value) => handleInlineSave("shift", value)}
          placeholder="Pre-snap shift"
          isSaving={savingFields.has("shift")}
        />
      ),
    },
    motion: {
      label: "Motion",
      render: (
        optimisticPlay: PlayType,
        handleInlineSave: (
          field: keyof PlayType,
          value: string | number
        ) => Promise<void>,
        savingFields: Set<string>
      ) => (
        <InlineEditField
          value={optimisticPlay.motion || ""}
          onSave={(value) => handleInlineSave("motion", value)}
          placeholder="Pre-snap motion"
          isSaving={savingFields.has("motion")}
        />
      ),
    },
    ftags: {
      label: "Tags",
      render: (
        optimisticPlay: PlayType,
        handleInlineSave: (
          field: keyof PlayType,
          value: string | number
        ) => Promise<void>,
        savingFields: Set<string>
      ) => (
        <InlineEditField
          value={[optimisticPlay.ftag1, optimisticPlay.ftag2]
            .filter(Boolean)
            .join(", ")}
          onSave={(value) => {
            const tags = value
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean);
            handleInlineSave("ftag1", tags[0] || "");
            if (tags[1]) handleInlineSave("ftag2", tags[1]);
          }}
          placeholder="Formation tags"
          isSaving={savingFields.has("ftag1") || savingFields.has("ftag2")}
        />
      ),
    },
    r_str: {
      label: "Run Strength",
      render: (
        optimisticPlay: PlayType,
        handleInlineSave: (
          field: keyof PlayType,
          value: string | number
        ) => Promise<void>,
        savingFields: Set<string>
      ) => (
        <InlineEditField
          value={optimisticPlay.r_str || ""}
          onSave={(value) => handleInlineSave("r_str", value)}
          placeholder="Run strength"
          isSaving={savingFields.has("r_str")}
        />
      ),
    },
    p_str: {
      label: "Pass Strength",
      render: (
        optimisticPlay: PlayType,
        handleInlineSave: (
          field: keyof PlayType,
          value: string | number
        ) => Promise<void>,
        savingFields: Set<string>
      ) => (
        <InlineEditField
          value={optimisticPlay.p_str || ""}
          onSave={(value) => handleInlineSave("p_str", value)}
          placeholder="Pass strength"
          isSaving={savingFields.has("p_str")}
        />
      ),
    },
  };

  // Play Details field definitions for drag-and-drop
  const playDetailsFields = {
    play_name: {
      label: "Name",
      render: (
        optimisticPlay: PlayType,
        handleInlineSave: (
          field: keyof PlayType,
          value: string | number
        ) => Promise<void>,
        savingFields: Set<string>
      ) => (
        <InlineEditField
          value={optimisticPlay.play_name}
          onSave={(value) => handleInlineSave("play_name", value)}
          placeholder="Play name"
          suggestions={actualPlayNameSuggestions}
          enableSuggestions={true}
          normalizeValue={normalizeValue}
          validation={(value) => {
            if (!value.trim()) return "Play name is required";
            return null;
          }}
          isSaving={savingFields.has("play_name")}
        />
      ),
    },
    p_dir: {
      label: "Direction",
      render: (
        optimisticPlay: PlayType,
        handleInlineSave: (
          field: keyof PlayType,
          value: string | number
        ) => Promise<void>,
        savingFields: Set<string>
      ) => (
        <InlineSelectField
          value={optimisticPlay.p_dir || ""}
          options={DIRECTION_OPTIONS}
          onSave={(value) => handleInlineSave("p_dir", value)}
          placeholder="Pass direction"
          allowEmpty={true}
          emptyLabel="None"
          isSaving={savingFields.has("p_dir")}
        />
      ),
    },
    p_type: {
      label: "Type",
      render: (
        optimisticPlay: PlayType,
        handleInlineSave: (
          field: keyof PlayType,
          value: string | number
        ) => Promise<void>,
        savingFields: Set<string>
      ) => (
        <InlineSelectField
          value={optimisticPlay.p_type}
          options={PLAY_TYPE_OPTIONS}
          onSave={(value) => handleInlineSave("p_type", value)}
          placeholder="Play type"
          isSaving={savingFields.has("p_type")}
        />
      ),
    },
    protection: {
      label: "Protection",
      render: (
        optimisticPlay: PlayType,
        handleInlineSave: (
          field: keyof PlayType,
          value: string | number
        ) => Promise<void>,
        savingFields: Set<string>
      ) => (
        <InlineEditField
          value={optimisticPlay.protection || ""}
          onSave={(value) => handleInlineSave("protection", value)}
          placeholder="Pass protection scheme"
          isSaving={savingFields.has("protection")}
        />
      ),
    },
    ptags: {
      label: "Tags",
      render: (
        optimisticPlay: PlayType,
        handleInlineSave: (
          field: keyof PlayType,
          value: string | number
        ) => Promise<void>,
        savingFields: Set<string>
      ) => (
        <InlineEditField
          value={[optimisticPlay.p_tag1, optimisticPlay.p_tag2]
            .filter(Boolean)
            .join(", ")}
          onSave={(value) => {
            const tags = value
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean);
            handleInlineSave("p_tag1", tags[0] || "");
            if (tags[1]) handleInlineSave("p_tag2", tags[1]);
          }}
          placeholder="Play tags"
          isSaving={savingFields.has("p_tag1") || savingFields.has("p_tag2")}
        />
      ),
    },
    one_word_play: {
      label: "Code",
      render: (
        optimisticPlay: PlayType,
        handleInlineSave: (
          field: keyof PlayType,
          value: string | number
        ) => Promise<void>,
        savingFields: Set<string>
      ) => (
        <InlineEditField
          value={optimisticPlay.one_word_play || ""}
          onSave={(value) => handleInlineSave("one_word_play", value)}
          placeholder="One-word call"
          isSaving={savingFields.has("one_word_play")}
        />
      ),
    },
  };

  const [flags, setFlags] = useState<PlayFlags>(() => getPlayFlags(play.id));
  const [newFlag, setNewFlag] = useState("");
  const [newPlayer, setNewPlayer] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [showTagsEditor, setShowTagsEditor] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Derive isCompact from density prop
  const isCompact = density === "compact";

  return (
    <>
      <div
        className={`rounded-[20px] border border-white/70 bg-white/80 dark:border-slate-700/60 dark:bg-slate-900/70 backdrop-blur-xl transition-all duration-200 ${
          isSelected
            ? "ring-2 ring-jade-500 border-jade-400 shadow-lg shadow-jade-500/20"
            : "shadow-[0_8px_16px_-8px_rgba(15,23,42,0.3)] hover:shadow-[0_12px_20px_-8px_rgba(15,23,42,0.4)] hover:border-white"
        } ${isCompact ? "text-[13px]" : ""}`}
      >
        <div className={isCompact ? "p-3 sm:p-4" : "p-4 sm:p-6"}>
          {play.diagram_url && (
            <div className="mb-3 -mt-1">
              <img
                src={play.diagram_url}
                alt={`${displayName} diagram preview`}
                className="w-full h-40 object-cover rounded-md border border-subtle"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
          {/* Collapsed/Skinny Mode */}
          <div className="flex items-center justify-between">
            {/* Selection Checkbox: always available for quick selection */}
            <div className="flex items-center mr-3">
              <input
                type="checkbox"
                checked={Boolean(isSelected)}
                onChange={(e) => onSelectionChange?.(play.id, e.target.checked)}
                className="rounded border-border text-text-info focus:ring-text-accent"
                title="Select play"
              />
            </div>

            <div className="flex-1 min-w-0">
              {/* Title bar: Primary + small secondary on one line when space allows */}
              <div className="flex items-baseline gap-2 min-w-0">
                <h3
                  className={`truncate font-mono font-bold ${
                    isCompact ? "text-base" : "text-lg"
                  } ${
                    showOneWordCalls && play.one_word_play
                      ? "text-text-info"
                      : "text-text-primary"
                  } text-left`}
                >
                  {displayName}
                </h3>
                {subtitleText && (
                  <span className="shrink-0 text-[11px] text-text-secondary italic">
                    {subtitleText}
                  </span>
                )}
              </div>
              {/* Badges row */}
              <div
                className={`flex flex-wrap items-center gap-2 ${
                  isCompact ? "mt-1" : "mt-2"
                }`}
              >
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${getPlayTypeColor(optimisticPlay.p_type)}`}
                >
                  {optimisticPlay.p_type}
                </span>
                {optimisticPlay.f_type && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-800 border border-gray-200 rounded-full text-[11px] font-medium">
                    {optimisticPlay.f_type}
                  </span>
                )}
                {phaseLabel && (
                  <span className="px-2 py-0.5 bg-warning-500 text-gray-900 rounded-full text-[10px] font-semibold tracking-wide uppercase border border-warning-600">
                    {phaseLabel}
                  </span>
                )}
                <span
                  className={`text-xs font-medium ${getConfidenceColor(optimisticPlay.confidence_base)}`}
                >
                  {optimisticPlay.confidence_base}%
                </span>
                {/* Creator Information */}
                {optimisticPlay.created_by && (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-text-muted">by</span>
                    <UserAvatar
                      userId={optimisticPlay.created_by}
                      size="xs"
                      showName={false}
                      showPopover={true}
                    />
                  </div>
                )}
              </div>
            </div>
            {/* Action Buttons - Mobile Touch-Optimized */}
            <div className="flex items-center space-x-1 ml-4">
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="ghost"
                size="sm"
                icon={
                  isExpanded ? (
                    <Icon name="chevron-up" className="h-5 w-5" />
                  ) : (
                    <Icon name="chevron-down" className="h-5 w-5" />
                  )
                }
                iconPosition="only"
                aria-label={isExpanded ? "Collapse details" : "Expand details"}
                aria-expanded={isExpanded}
                aria-controls={`play-details-${play.id}`}
                title={isExpanded ? "Collapse" : "Expand details"}
                className={`p-3 !h-auto ${isCompact ? "min-w-[40px] min-h-[40px]" : "min-w-[48px] min-h-[48px]"}`}
              />
              <Button
                onClick={() => onEdit?.(play)}
                variant="ghost"
                size="sm"
                icon={<Icon name="edit" className="h-5 w-5" />}
                iconPosition="only"
                aria-label="Edit play"
                title="Edit play"
                className={`p-3 !h-auto ${isCompact ? "min-w-[40px] min-h-[40px]" : "min-w-[48px] min-h-[48px]"}`}
              />
              <Button
                onClick={() => onDuplicate?.(play)}
                variant="ghost"
                size="sm"
                icon={<Icon name="copy" className="h-5 w-5" />}
                iconPosition="only"
                aria-label="Duplicate play"
                title="Duplicate play"
                className={`p-3 !h-auto ${isCompact ? "min-w-[40px] min-h-[40px]" : "min-w-[48px] min-h-[48px]"}`}
              />
              <Button
                onClick={handleCreateDiagram}
                variant="ghost"
                size="sm"
                icon={<Icon name="image" className="h-5 w-5" />}
                iconPosition="only"
                aria-label="Create diagram"
                title="Create diagram"
                className={`p-3 !h-auto ${isCompact ? "min-w-[40px] min-h-[40px]" : "min-w-[48px] min-h-[48px]"}`}
              />
            </div>
          </div>
          {/* Expanded Details */}
          {isExpanded && (
            <div
              id={`play-details-${play.id}`}
              className="mt-4 pt-4 border-t border-subtle space-y-4"
              role="region"
              aria-label={`Details for ${displayName}`}
            >
              {/* Overview bar */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${getPlayTypeColor(optimisticPlay.p_type)}`}
                >
                  {optimisticPlay.p_type}
                </span>
                {optimisticPlay.personnel && (
                  <InlineSelectField
                    value={optimisticPlay.personnel}
                    options={PERSONNEL_OPTIONS}
                    onSave={(value) => handleInlineSave("personnel", value)}
                    placeholder="Select personnel"
                    isSaving={savingFields.has("personnel")}
                    className="px-2 py-0.5 bg-gray-100 text-gray-800 border border-gray-200 rounded-full text-[11px] font-medium hover:bg-gray-200 transition-colors"
                  />
                )}
                {phaseLabel && (
                  <span className="px-2 py-0.5 bg-warning-500 text-gray-900 rounded-full text-[10px] font-semibold uppercase border border-warning-600">
                    {phaseLabel}
                  </span>
                )}
                {optimisticPlay.one_word_play && !showOneWordCalls && (
                  <span className="px-2 py-0.5 bg-electric-100 text-electric-800 border border-electric-200 rounded-full text-[11px] font-medium">
                    Code: {optimisticPlay.one_word_play.toUpperCase()}
                  </span>
                )}
                <span
                  className={`ml-auto text-xs font-medium ${getConfidenceColor(optimisticPlay.confidence_base)}`}
                >
                  Confidence {optimisticPlay.confidence_base}%
                </span>
              </div>

              {/* Main details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Formation */}
                <div className="surface-subtle rounded-md p-3">
                  <Typography
                    variant="label-lg"
                    as="h4"
                    className="text-text-primary flex items-center mb-2"
                  >
                    <Icon name="target" className="h-4 w-4 mr-1" /> Formation
                  </Typography>
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="formation-fields">
                      {(provided) => (
                        <dl
                          className="space-y-2 text-sm"
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {formationFieldOrder.map((fieldKey, index) => {
                            const field =
                              formationFields[
                                fieldKey as keyof typeof formationFields
                              ];
                            if (!field) return null;
                            return (
                              <Draggable
                                key={fieldKey}
                                draggableId={fieldKey}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`grid grid-cols-[120px_1fr_auto] gap-3 items-center p-2 rounded-md transition-colors ${
                                      snapshot.isDragging
                                        ? "bg-surface-hover shadow-lg"
                                        : "hover:bg-surface-hover"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div
                                        {...provided.dragHandleProps}
                                        className="cursor-grab active:cursor-grabbing text-text-tertiary hover:text-text-secondary"
                                      >
                                        <Icon
                                          name="grip-vertical"
                                          className="h-4 w-4"
                                        />
                                      </div>
                                      <dt
                                        className={`font-medium ${formationFieldVisibility[fieldKey] ? "text-text-secondary" : "text-text-tertiary line-through"}`}
                                      >
                                        {field.label}
                                      </dt>
                                    </div>
                                    <dd className="min-w-0">
                                      {field.render(
                                        optimisticPlay,
                                        handleInlineSave,
                                        savingFields
                                      )}
                                    </dd>
                                    <button
                                      onClick={() =>
                                        toggleFieldVisibility(
                                          fieldKey,
                                          "formation"
                                        )
                                      }
                                      className="p-1 rounded hover:bg-surface-hover text-text-tertiary hover:text-text-secondary transition-colors"
                                      title={
                                        formationFieldVisibility[fieldKey]
                                          ? "Hide from display name"
                                          : "Show in display name"
                                      }
                                    >
                                      <Icon
                                        name={
                                          formationFieldVisibility[fieldKey]
                                            ? "eye"
                                            : "eye-off"
                                        }
                                        className="h-4 w-4"
                                      />
                                    </button>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </dl>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>

                {/* Play details */}
                <div className="surface-subtle rounded-md p-3">
                  <Typography
                    variant="label-lg"
                    as="h4"
                    className="text-text-primary flex items-center mb-2"
                  >
                    <Icon name="hash" className="h-4 w-4 mr-1" /> Play Details
                  </Typography>
                  <DragDropContext onDragEnd={handlePlayDetailsDragEnd}>
                    <Droppable droppableId="play-details">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2 text-sm"
                        >
                          {playDetailsFieldOrder.map((fieldKey, index) => {
                            const field =
                              playDetailsFields[
                                fieldKey as keyof typeof playDetailsFields
                              ];
                            if (!field) return null;

                            const isVisible =
                              playDetailsFieldVisibility[fieldKey] !== false;

                            return (
                              <Draggable
                                key={fieldKey}
                                draggableId={fieldKey}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`grid grid-cols-[120px_1fr_auto] gap-3 items-center p-2 rounded-md transition-colors ${
                                      snapshot.isDragging
                                        ? "bg-surface-hover shadow-lg"
                                        : "hover:bg-surface-hover"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div
                                        {...provided.dragHandleProps}
                                        className="cursor-grab active:cursor-grabbing text-text-tertiary hover:text-text-secondary"
                                      >
                                        <Icon
                                          name="grip-vertical"
                                          className="h-4 w-4"
                                        />
                                      </div>
                                      <dt
                                        className={`font-medium ${isVisible ? "text-text-secondary" : "text-text-tertiary line-through"}`}
                                      >
                                        {field.label}
                                      </dt>
                                    </div>
                                    <dd className="min-w-0">
                                      {field.render(
                                        optimisticPlay,
                                        handleInlineSave,
                                        savingFields
                                      )}
                                    </dd>
                                    <button
                                      onClick={() =>
                                        toggleFieldVisibility(
                                          fieldKey,
                                          "playDetails"
                                        )
                                      }
                                      className="p-1 rounded hover:bg-surface-hover text-text-tertiary hover:text-text-secondary transition-colors"
                                      title={
                                        isVisible
                                          ? "Hide from display name"
                                          : "Show in display name"
                                      }
                                    >
                                      <Icon
                                        name={isVisible ? "eye" : "eye-off"}
                                        className="h-4 w-4"
                                      />
                                    </button>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>

                {/* Preferences */}
                <div className="surface-subtle rounded-md p-3">
                  <Typography
                    variant="label-lg"
                    as="h4"
                    className="text-text-primary flex items-center mb-2"
                  >
                    Preferences
                  </Typography>
                  <dl className="space-y-2 text-sm">
                    <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                      <dt className="text-text-secondary font-medium">Down</dt>
                      <dd>
                        <InlineSelectField
                          value={optimisticPlay.pref_down || ""}
                          options={DOWN_OPTIONS}
                          onSave={(value) =>
                            handleInlineSave("pref_down", value)
                          }
                          placeholder="Preferred down"
                          allowEmpty={true}
                          emptyLabel="Any"
                          isSaving={savingFields.has("pref_down")}
                        />
                      </dd>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                      <dt className="text-text-secondary font-medium">
                        Distance
                      </dt>
                      <dd>
                        <InlineSelectField
                          value={optimisticPlay.pref_dis || ""}
                          options={DISTANCE_OPTIONS}
                          onSave={(value) =>
                            handleInlineSave("pref_dis", value)
                          }
                          placeholder="Preferred distance"
                          allowEmpty={true}
                          emptyLabel="Any"
                          isSaving={savingFields.has("pref_dis")}
                        />
                      </dd>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                      <dt className="text-text-secondary font-medium">Hash</dt>
                      <dd>
                        <InlineSelectField
                          value={optimisticPlay.pref_hash || ""}
                          options={HASH_OPTIONS}
                          onSave={(value) =>
                            handleInlineSave("pref_hash", value)
                          }
                          placeholder="Preferred hash"
                          allowEmpty={true}
                          emptyLabel="Any"
                          isSaving={savingFields.has("pref_hash")}
                        />
                      </dd>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                      <dt className="text-text-secondary font-medium">
                        Coverage
                      </dt>
                      <dd>
                        <InlineEditField
                          value={optimisticPlay.pref_cov || ""}
                          onSave={(value) =>
                            handleInlineSave("pref_cov", value)
                          }
                          placeholder="Preferred coverage"
                          isSaving={savingFields.has("pref_cov")}
                        />
                      </dd>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                      <dt className="text-text-secondary font-medium">Front</dt>
                      <dd>
                        <InlineEditField
                          value={play.pref_front || ""}
                          onSave={(value) =>
                            handleInlineSave("pref_front", value)
                          }
                          placeholder="Preferred defensive front"
                        />
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Usage & Stats */}
                <div className="surface-subtle rounded-md p-3">
                  <Typography
                    variant="label-lg"
                    as="h4"
                    className="text-text-primary flex items-center mb-2"
                  >
                    <Icon name="clock" className="h-4 w-4 mr-1" /> Usage & Stats
                  </Typography>
                  <dl className="space-y-2 text-sm">
                    <div className="grid grid-cols-[120px_1fr] gap-3">
                      <dt className="text-text-secondary font-medium">
                        Times Called
                      </dt>
                      <dd className="text-text-primary">{play.times_called}</dd>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-3">
                      <dt className="text-text-secondary font-medium">
                        Times Successful
                      </dt>
                      <dd className="text-text-primary">
                        {play.times_successful}
                      </dd>
                    </div>
                    {play.last_used_at && (
                      <div className="grid grid-cols-[120px_1fr] gap-3">
                        <dt className="text-text-secondary font-medium">
                          Last Used
                        </dt>
                        <dd className="text-text-primary">
                          {new Date(play.last_used_at).toLocaleDateString()}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              {/* Notes */}
              <div className="surface-subtle rounded-md p-3">
                <Typography
                  variant="label-lg"
                  as="h4"
                  className="text-text-primary mb-2"
                >
                  Notes
                </Typography>
                <InlineEditField
                  value={play.notes || ""}
                  onSave={(value) => handleInlineSave("notes", value)}
                  placeholder="Add notes about this play..."
                  type="textarea"
                  rows={3}
                />
              </div>

              {/* Tags & Roles (summary + editor) */}
              <div className="surface-subtle rounded-md p-3">
                <div className="flex items-center justify-between">
                  <Typography
                    variant="label-lg"
                    as="h4"
                    className="text-text-primary mb-2"
                  >
                    Tags & Roles
                  </Typography>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setShowTagsEditor((s) => !s)}
                    aria-expanded={showTagsEditor}
                  >
                    {showTagsEditor ? "Hide" : "Edit"}
                  </Button>
                </div>
                {/* Summary chips */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {[
                    ...flags.positions.map((x) => `Position:${x}`),
                    ...flags.players.map((x) => `Player:${x}`),
                    ...flags.flags.map((x) => `Flag:${x}`),
                  ]
                    .slice(0, 8)
                    .map((chip) => (
                      <span
                        key={chip}
                        className="px-2 py-0.5 text-[11px] rounded bg-surface-secondary text-text-primary"
                      >
                        {chip}
                      </span>
                    ))}
                  {flags.positions.length +
                    flags.players.length +
                    flags.flags.length >
                    8 && (
                    <span className="text-xs text-text-secondary">
                      +
                      {flags.positions.length +
                        flags.players.length +
                        flags.flags.length -
                        8}{" "}
                      more
                    </span>
                  )}
                </div>
                {showTagsEditor && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Positions */}
                    <div>
                      <div className="text-xs text-text-secondary mb-1">
                        Positions
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {flags.positions.map((pos) => (
                          <Button
                            key={pos}
                            size="xs"
                            variant="subtle"
                            className="!h-auto px-2 py-0.5 text-[11px]"
                            onClick={() =>
                              setFlags(removeFlag(play.id, "positions", pos))
                            }
                            title="Remove"
                          >
                            {pos} ×
                          </Button>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <select
                          value={newPosition}
                          onChange={(e) => setNewPosition(e.target.value)}
                          className="border-subtle rounded px-2 py-1 text-xs"
                        >
                          <option value="">Select…</option>
                          {POSITION_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => {
                            if (!newPosition) return;
                            const next = addFlag(
                              play.id,
                              "positions",
                              newPosition
                            );
                            setFlags(next);
                            setNewPosition("");
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                    {/* Players */}
                    <div>
                      <div className="text-xs text-text-secondary mb-1">
                        Players
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {flags.players.map((pl) => (
                          <Button
                            key={pl}
                            size="xs"
                            variant="subtle"
                            className="!h-auto px-2 py-0.5 text-[11px]"
                            onClick={() =>
                              setFlags(removeFlag(play.id, "players", pl))
                            }
                            title="Remove"
                          >
                            {pl} ×
                          </Button>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          value={newPlayer}
                          onChange={(e) => setNewPlayer(e.target.value)}
                          placeholder="Add player (e.g., Z, WR1)"
                          className="border-subtle rounded px-2 py-1 text-xs flex-1"
                        />
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => {
                            if (!newPlayer.trim()) return;
                            const next = addFlag(
                              play.id,
                              "players",
                              newPlayer.trim()
                            );
                            setFlags(next);
                            setNewPlayer("");
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                    {/* Flags */}
                    <div>
                      <div className="text-xs text-text-secondary mb-1">
                        Flags
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {flags.flags.map((fl) => (
                          <Button
                            key={fl}
                            size="xs"
                            variant="subtle"
                            className="!h-auto px-2 py-0.5 text-[11px]"
                            onClick={() =>
                              setFlags(removeFlag(play.id, "flags", fl))
                            }
                            title="Remove"
                          >
                            {fl} ×
                          </Button>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          value={newFlag}
                          onChange={(e) => setNewFlag(e.target.value)}
                          placeholder="Add flag (e.g., Red Zone, 3rd&Short)"
                          className="border-subtle rounded px-2 py-1 text-xs flex-1"
                        />
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => {
                            if (!newFlag.trim()) return;
                            const next = addFlag(
                              play.id,
                              "flags",
                              newFlag.trim()
                            );
                            setFlags(next);
                            setNewFlag("");
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Workflow actions */}
              <div className="flex items-center justify-between">
                <div>
                  <Typography
                    variant="label-lg"
                    as="h4"
                    className="text-text-primary mb-2"
                  >
                    Add to Workflow
                  </Typography>
                  <p className="text-xs text-text-secondary">
                    Build practice scripts and game plans from this play
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => onAddToPracticeScript?.(play)}
                    title="Add this play to a practice script"
                    className="surface-subtle hover:bg-surface-info text-text-info border-surface-primary"
                  >
                    <Icon name="calendar" className="h-3 w-3 mr-1" /> Practice
                    Script
                  </Button>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => onAddToGamePlan?.(play)}
                    title="Add this play to a game plan"
                    className="surface-subtle hover:bg-surface-success text-text-success border-surface-primary"
                  >
                    <Icon name="gamepad-2" className="h-3 w-3 mr-1" /> Game Plan
                  </Button>
                  <Badge variant="premium" size="sm">
                    Week 3
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Legacy VisualPlayBuilder modal removed (always-on V2 route). */}
    </>
  );
};
