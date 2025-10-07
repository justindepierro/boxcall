import React, { useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Typography } from "../../design-system/Typography";
import Icon from "../../ui/Icon/Icon";
import { InlineEditField } from "../../ui/InlineEditField";
import { Button } from "../../ui/Button/Button";
import {
  DISTANCE_OPTIONS,
  DOWN_OPTIONS,
  HASH_OPTIONS,
  PERSONNEL_OPTIONS,
} from "./constants";
import {
  addFlag,
  getPlayFlags,
  removeFlag,
  POSITION_OPTIONS,
  type PlayFlags,
} from "../../../utils/localPlayFlags";
import type { Play as PlayType } from "../../../types/play";
import { Badge } from "../../ui/Badge";
import type { FieldDefinitionMap } from "./fieldDefinitions";
import {
  getDiagramButtonIcon,
  getDiagramButtonText,
} from "../../../utils/diagramHelpers";

interface PlayCardDetailsProps {
  play: PlayType;
  optimisticPlay: PlayType;
  showOneWordCalls: boolean;
  phaseLabel: string | null;
  handleInlineSave: (
    field: keyof PlayType,
    value: string | number
  ) => Promise<void>;
  savingFields: Set<string>;
  formationFieldOrder: string[];
  formationFields: FieldDefinitionMap;
  formationFieldVisibility: Record<string, boolean>;
  toggleFieldVisibility: (
    fieldKey: string,
    section: "formation" | "playDetails"
  ) => void;
  handleFormationDragEnd: (result: any) => void;
  playDetailsFieldOrder: string[];
  playDetailsFields: FieldDefinitionMap;
  playDetailsFieldVisibility: Record<string, boolean>;
  handlePlayDetailsDragEnd: (result: any) => void;
  getPlayTypeColor: (type: string) => string;
  getConfidenceColor: (confidence: number) => string;
  onAddToPracticeScript?: (play: PlayType) => void;
  onAddToGamePlan?: (play: PlayType) => void;
  onCreateDiagram?: (play: PlayType) => void;
}

export const PlayCardDetails: React.FC<PlayCardDetailsProps> = ({
  play,
  optimisticPlay,
  showOneWordCalls,
  phaseLabel,
  handleInlineSave,
  savingFields,
  formationFieldOrder,
  formationFields,
  formationFieldVisibility,
  toggleFieldVisibility,
  handleFormationDragEnd,
  playDetailsFieldOrder,
  playDetailsFields,
  playDetailsFieldVisibility,
  handlePlayDetailsDragEnd,
  getPlayTypeColor,
  getConfidenceColor,
  onAddToPracticeScript,
  onAddToGamePlan,
  onCreateDiagram,
}) => {
  const [flags, setFlags] = useState<PlayFlags>(() => getPlayFlags(play.id));
  const [newFlag, setNewFlag] = useState("");
  const [newPlayer, setNewPlayer] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [showTagsEditor, setShowTagsEditor] = useState(false);

  useEffect(() => {
    setFlags(getPlayFlags(play.id));
  }, [play.id]);

  const totalFlagsCount = useMemo(
    () => flags.positions.length + flags.players.length + flags.flags.length,
    [flags.flags.length, flags.players.length, flags.positions.length]
  );

  const summaryChips = useMemo(
    () => [
      ...flags.positions.map((x) => `Position:${x}`),
      ...flags.players.map((x) => `Player:${x}`),
      ...flags.flags.map((x) => `Flag:${x}`),
    ],
    [flags.flags, flags.players, flags.positions]
  );

  return (
    <div
      id={`play-details-${play.id}`}
      className="mt-spacing-md pt-spacing-md divider-t space-y-spacing-md"
      role="region"
      aria-label={`Details for ${play.play_name}`}
    >
      <div className="flex flex-wrap items-center gap-spacing-xs">
        <span
          className={`px-spacing-xs py-spacing-xs rounded-full text-xs font-medium ${getPlayTypeColor(optimisticPlay.p_type)}`}
        >
          {optimisticPlay.p_type}
        </span>
        {optimisticPlay.personnel && (
          <InlineEditField
            value={optimisticPlay.personnel}
            onSave={(value) => handleInlineSave("personnel", value)}
            placeholder="Personnel (e.g., 11, 12, 21)"
            suggestions={PERSONNEL_OPTIONS.map((option) => option.label)}
            enableSuggestions={true}
            isSaving={savingFields.has("personnel")}
            className="px-spacing-xs py-spacing-xs bg-surface-muted text-primary border-subtle rounded-full text-xs font-medium hover:bg-surface-secondary transition-colors"
          />
        )}
        {phaseLabel && (
          <span className="px-spacing-xs py-spacing-xs bg-warning-500 text-primary rounded-full text-2xs font-semibold uppercase border border-warning-600">
            {phaseLabel}
          </span>
        )}
        {optimisticPlay.one_word_play && !showOneWordCalls && (
          <span className="px-spacing-xs py-spacing-xs bg-electric-100 text-electric-800 border border-electric-200 rounded-full text-xs font-medium">
            Code: {optimisticPlay.one_word_play.toUpperCase()}
          </span>
        )}
        <span
          className={`ml-auto text-xsssssssss font-medium ${getConfidenceColor(optimisticPlay.confidence_base)}`}
        >
          Formation Confidence {optimisticPlay.confidence_base}%
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-spacing-lg">
        <div className="surface-subtle rounded-lg p-spacing-md">
          <Typography
            variant="label-lg"
            as="h4"
            className="text-text-xssssssssrimary flex items-center mb-spacing-md"
          >
            <Icon name="target" className="h-4 w-4 mr-spacing-xs" /> Formation
          </Typography>
          <DragDropContext onDragEnd={handleFormationDragEnd}>
            <Droppable droppableId="formation-fields">
              {(provided) => (
                <dl
                  className="space-y-spacing-sm text-sm"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {formationFieldOrder.map((fieldKey, index) => {
                    const field =
                      formationFields[fieldKey as keyof typeof formationFields];
                    if (!field) return null;
                    const isVisible =
                      formationFieldVisibility[fieldKey] !== false;
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
                            className={`p-spacing-sm rounded-lg transition-all duration-200 ${
                              snapshot.isDragging
                                ? "bg-surface-hover shadow-lg scale-105"
                                : "hover:bg-surface-hover hover:shadow-sm"
                            }`}
                          >
                            <div className="flex items-center gap-spacing-sm mb-spacing-xs">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing text-text-tertiary hover:text-text-secondary transition-colors"
                              >
                                <Icon
                                  name="grip-vertical"
                                  className="h-4 w-4"
                                />
                              </div>
                              <dt
                                className={`font-medium text-sm ${
                                  isVisible
                                    ? "text-text-xssssssssrimary"
                                    : "text-text-tertiary line-through"
                                }`}
                              >
                                {field.label}
                              </dt>
                              <button
                                onClick={() =>
                                  toggleFieldVisibility(fieldKey, "formation")
                                }
                                className="flex-shrink-0 p-spacing-xs rounded-lg hover:bg-surface-hover text-text-tertiary hover:text-text-secondary transition-colors ml-auto"
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
                            <div className="w-full">
                              {field.render(
                                optimisticPlay,
                                handleInlineSave,
                                savingFields
                              )}
                            </div>
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

        <div className="surface-subtle rounded-lg p-spacing-md">
          <Typography
            variant="label-lg"
            as="h4"
            className="text-text-xssssssssrimary flex items-center mb-spacing-md"
          >
            <Icon name="hash" className="h-4 w-4 mr-spacing-xs" /> Play Details
          </Typography>
          <DragDropContext onDragEnd={handlePlayDetailsDragEnd}>
            <Droppable droppableId="play-details">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-spacing-sm text-sm"
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
                            className={`p-spacing-sm rounded-lg transition-all duration-200 ${
                              snapshot.isDragging
                                ? "bg-surface-hover shadow-lg scale-105"
                                : "hover:bg-surface-hover hover:shadow-sm"
                            }`}
                          >
                            <div className="flex items-center gap-spacing-sm mb-spacing-xs">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing text-text-tertiary hover:text-text-secondary transition-colors"
                              >
                                <Icon
                                  name="grip-vertical"
                                  className="h-4 w-4"
                                />
                              </div>
                              <dt
                                className={`font-medium text-sm ${
                                  isVisible
                                    ? "text-text-xssssssssrimary"
                                    : "text-text-tertiary line-through"
                                }`}
                              >
                                {field.label}
                              </dt>
                              <button
                                onClick={() =>
                                  toggleFieldVisibility(fieldKey, "playDetails")
                                }
                                className="flex-shrink-0 p-spacing-xs rounded-lg hover:bg-surface-hover text-text-tertiary hover:text-text-secondary transition-colors ml-auto"
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
                            <div className="w-full">
                              {field.render(
                                optimisticPlay,
                                handleInlineSave,
                                savingFields
                              )}
                            </div>
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

        <div className="surface-subtle rounded-lg p-spacing-md">
          <Typography
            variant="label-lg"
            as="h4"
            className="text-text-xssssssssrimary flex items-center mb-spacing-md"
          >
            <Icon name="settings" className="h-4 w-4 mr-spacing-xs" />{" "}
            Preferences
          </Typography>
          <dl className="space-y-spacing-md text-sm">
            <div className="flex items-center gap-spacing-md">
              <dt className="text-text-xssssssssrimary font-medium flex-shrink-0 w-24">
                Down
              </dt>
              <dd className="flex-1">
                <InlineEditField
                  value={optimisticPlay.pref_down || ""}
                  onSave={(value) => handleInlineSave("pref_down", value)}
                  placeholder="Preferred down (e.g., 1st, 2nd, 3rd)"
                  suggestions={DOWN_OPTIONS.map((option) => option.label)}
                  enableSuggestions={true}
                  isSaving={savingFields.has("pref_down")}
                />
              </dd>
            </div>
            <div className="flex items-center gap-spacing-md">
              <dt className="text-text-xssssssssrimary font-medium flex-shrink-0 w-24">
                Distance
              </dt>
              <dd className="flex-1">
                <InlineEditField
                  value={optimisticPlay.pref_dis || ""}
                  onSave={(value) => handleInlineSave("pref_dis", value)}
                  placeholder="Preferred distance (e.g., Short, Medium, Long)"
                  suggestions={DISTANCE_OPTIONS.map((option) => option.label)}
                  enableSuggestions={true}
                  isSaving={savingFields.has("pref_dis")}
                />
              </dd>
            </div>
            <div className="flex items-center gap-spacing-md">
              <dt className="text-text-xssssssssrimary font-medium flex-shrink-0 w-24">
                Hash
              </dt>
              <dd className="flex-1">
                <InlineEditField
                  value={optimisticPlay.pref_hash || ""}
                  onSave={(value) => handleInlineSave("pref_hash", value)}
                  placeholder="Preferred hash (e.g., Left, Right, Middle)"
                  suggestions={HASH_OPTIONS.map((option) => option.label)}
                  enableSuggestions={true}
                  isSaving={savingFields.has("pref_hash")}
                />
              </dd>
            </div>
            <div className="flex items-center gap-spacing-md">
              <dt className="text-text-xssssssssrimary font-medium flex-shrink-0 w-24">
                Coverage
              </dt>
              <dd className="flex-1">
                <InlineEditField
                  value={optimisticPlay.pref_cov || ""}
                  onSave={(value) => handleInlineSave("pref_cov", value)}
                  placeholder="Preferred coverage"
                  isSaving={savingFields.has("pref_cov")}
                />
              </dd>
            </div>
            <div className="flex items-center gap-spacing-md">
              <dt className="text-text-xssssssssrimary font-medium flex-shrink-0 w-24">
                Front
              </dt>
              <dd className="flex-1">
                <InlineEditField
                  value={optimisticPlay.pref_front || ""}
                  onSave={(value) => handleInlineSave("pref_front", value)}
                  placeholder="Preferred defensive front"
                  isSaving={savingFields.has("pref_front")}
                />
              </dd>
            </div>
          </dl>
        </div>

        <div className="surface-subtle rounded-lg p-spacing-md">
          <Typography
            variant="label-lg"
            as="h4"
            className="text-text-xssssssssrimary flex items-center mb-spacing-md"
          >
            <Icon name="clock" className="h-4 w-4 mr-spacing-xs" /> Usage &
            Stats
          </Typography>
          <dl className="space-y-spacing-sm text-sm">
            <div className="flex items-center gap-spacing-md">
              <dt className="text-text-xssssssssrimary font-medium flex-shrink-0 w-32">
                Times Called
              </dt>
              <dd className="text-text-xssssssssrimary font-mono">
                {play.times_called}
              </dd>
            </div>
            <div className="flex items-center gap-spacing-md">
              <dt className="text-text-xssssssssrimary font-medium flex-shrink-0 w-32">
                Times Successful
              </dt>
              <dd className="text-text-xssssssssrimary font-mono">
                {play.times_successful}
              </dd>
            </div>
            {play.last_used_at && (
              <div className="flex items-center gap-spacing-md">
                <dt className="text-text-xssssssssrimary font-medium flex-shrink-0 w-32">
                  Last Used
                </dt>
                <dd className="text-text-xssssssssrimary font-mono">
                  {new Date(play.last_used_at).toLocaleDateString()}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="surface-subtle rounded-lg p-spacing-md">
        <Typography
          variant="label-lg"
          as="h4"
          className="text-text-xssssssssrimary flex items-center mb-spacing-md"
        >
          <Icon name="file" className="h-4 w-4 mr-spacing-xs" /> Notes
        </Typography>
        <InlineEditField
          value={optimisticPlay.notes || ""}
          onSave={(value) => handleInlineSave("notes", value)}
          placeholder="Add notes about this play..."
          type="textarea"
          rows={4}
          isSaving={savingFields.has("notes")}
        />
      </div>

      <div className="surface-subtle rounded-lg p-spacing-sm">
        <div className="flex items-center justify-between">
          <Typography
            variant="label-lg"
            as="h4"
            className="text-text-xssssssssrimary mb-spacing-xs"
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
        <div className="mt-spacing-xs flex flex-wrap gap-spacing-xs">
          {summaryChips.slice(0, 8).map((chip) => (
            <span
              key={chip}
              className="px-spacing-xs py-spacing-xs text-xs rounded-lg bg-surface-secondary text-text-xssssssssrimary"
            >
              {chip}
            </span>
          ))}
          {totalFlagsCount > 8 && (
            <span className="text-xsssssssss text-text-secondary">
              +{totalFlagsCount - 8} more
            </span>
          )}
        </div>
        {showTagsEditor && (
          <div className="mt-spacing-sm grid grid-cols-1 md:grid-cols-3 gap-spacing-sm">
            <div>
              <div className="text-xsssssssss text-text-secondary mb-spacing-xs">
                Positions
              </div>
              <div className="flex flex-wrap gap-spacing-xs">
                {flags.positions.map((pos) => (
                  <Button
                    key={pos}
                    size="xs"
                    variant="subtle"
                    className="!h-auto px-spacing-xs py-spacing-xs text-xs"
                    onClick={() =>
                      setFlags(removeFlag(play.id, "positions", pos))
                    }
                    title="Remove"
                  >
                    {pos} ×
                  </Button>
                ))}
              </div>
              <div className="mt-spacing-xs flex items-center gap-spacing-xs">
                <select
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  className="border-subtle rounded-lg px-2 py-1 text-xsssssssss"
                >
                  <option value="">Select…</option>
                  {POSITION_OPTIONS.map((opt: string) => (
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
                    const next = addFlag(play.id, "positions", newPosition);
                    setFlags(next);
                    setNewPosition("");
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
            <div>
              <div className="text-xsssssssss text-text-secondary mb-spacing-xs">
                Players
              </div>
              <div className="flex flex-wrap gap-spacing-xs">
                {flags.players.map((pl) => (
                  <Button
                    key={pl}
                    size="xs"
                    variant="subtle"
                    className="!h-auto px-spacing-xs py-spacing-xs text-xs"
                    onClick={() => setFlags(removeFlag(play.id, "players", pl))}
                    title="Remove"
                  >
                    {pl} ×
                  </Button>
                ))}
              </div>
              <div className="mt-spacing-xs flex items-center gap-spacing-xs">
                <input
                  value={newPlayer}
                  onChange={(e) => setNewPlayer(e.target.value)}
                  placeholder="Add player (e.g., Z, WR1)"
                  className="border-subtle rounded-lg px-2 py-1 text-xsssssssss flex-1"
                />
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => {
                    if (!newPlayer.trim()) return;
                    const next = addFlag(play.id, "players", newPlayer.trim());
                    setFlags(next);
                    setNewPlayer("");
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
            <div>
              <div className="text-xsssssssss text-text-secondary mb-spacing-xs">
                Flags
              </div>
              <div className="flex flex-wrap gap-spacing-xs">
                {flags.flags.map((fl) => (
                  <Button
                    key={fl}
                    size="xs"
                    variant="subtle"
                    className="!h-auto px-spacing-xs py-spacing-xs text-xs"
                    onClick={() => setFlags(removeFlag(play.id, "flags", fl))}
                    title="Remove"
                  >
                    {fl} ×
                  </Button>
                ))}
              </div>
              <div className="mt-spacing-xs flex items-center gap-spacing-xs">
                <input
                  value={newFlag}
                  onChange={(e) => setNewFlag(e.target.value)}
                  placeholder="Add flag (e.g., Red Zone, 3rd&Short)"
                  className="border-subtle rounded-lg px-2 py-1 text-xsssssssss flex-1"
                />
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => {
                    if (!newFlag.trim()) return;
                    const next = addFlag(play.id, "flags", newFlag.trim());
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

      <div className="flex items-center justify-between">
        <div>
          <Typography
            variant="label-lg"
            as="h4"
            className="text-text-xssssssssrimary mb-spacing-xs"
          >
            Add to Workflow
          </Typography>
          <p className="text-xsssssssss text-text-secondary">
            Build practice scripts and game plans from this play
          </p>
        </div>
        <div className="flex items-center gap-spacing-xs">
          <Button
            variant={play.diagram_url ? "primary" : "secondary"}
            size="xs"
            onClick={() => onCreateDiagram?.(play)}
            title={getDiagramButtonText(Boolean(play.diagram_url))}
            className={
              play.diagram_url
                ? ""
                : "surface-subtle hover:bg-surface-warning text-text-warning border-surface-primary"
            }
          >
            <Icon
              name={getDiagramButtonIcon(Boolean(play.diagram_url))}
              className="h-3 w-3 mr-spacing-xs"
            />{" "}
            {getDiagramButtonText(Boolean(play.diagram_url))}
          </Button>
          <Button
            variant="secondary"
            size="xs"
            onClick={() => onAddToPracticeScript?.(play)}
            title="Add this play to a practice script"
            className="surface-subtle hover:bg-surface-info text-text-info border-surface-primary"
          >
            <Icon name="calendar" className="h-3 w-3 mr-spacing-xs" /> Practice
            Script
          </Button>
          <Button
            variant="secondary"
            size="xs"
            onClick={() => onAddToGamePlan?.(play)}
            title="Add this play to a game plan"
            className="surface-subtle hover:bg-surface-success text-text-success border-surface-primary"
          >
            <Icon name="gamepad-2" className="h-3 w-3 mr-spacing-xs" /> Game
            Plan
          </Button>
          <Badge variant="premium" size="sm">
            Week 3
          </Badge>
        </div>
      </div>
    </div>
  );
};
