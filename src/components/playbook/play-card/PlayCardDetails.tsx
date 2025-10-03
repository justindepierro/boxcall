import React, { useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Typography } from "../../design-system/Typography";
import Icon from "../../ui/Icon/Icon";
import { InlineSelectField } from "../../ui/InlineSelectField";
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
      className="mt-4 pt-4 border-t border-subtle space-y-4"
      role="region"
      aria-label={`Details for ${play.play_name}`}
    >
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="surface-subtle rounded-lg p-3">
          <Typography
            variant="label-lg"
            as="h4"
            className="text-text-primary flex items-center mb-2"
          >
            <Icon name="target" className="h-4 w-4 mr-1" /> Formation
          </Typography>
          <DragDropContext onDragEnd={handleFormationDragEnd}>
            <Droppable droppableId="formation-fields">
              {(provided) => (
                <dl
                  className="space-y-2 text-sm"
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
                            className={`grid grid-cols-[120px_1fr_auto] gap-3 items-center p-2 rounded-lg transition-colors ${
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
                                className={`font-medium ${
                                  isVisible
                                    ? "text-text-secondary"
                                    : "text-text-tertiary line-through"
                                }`}
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
                                toggleFieldVisibility(fieldKey, "formation")
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
                </dl>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div className="surface-subtle rounded-lg p-3">
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
                            className={`grid grid-cols-[120px_1fr_auto] gap-3 items-center p-2 rounded-lg transition-colors ${
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
                                className={`font-medium ${
                                  isVisible
                                    ? "text-text-secondary"
                                    : "text-text-tertiary line-through"
                                }`}
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
                                toggleFieldVisibility(fieldKey, "playDetails")
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

        <div className="surface-subtle rounded-lg p-3">
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
                  onSave={(value) => handleInlineSave("pref_down", value)}
                  placeholder="Preferred down"
                  allowEmpty={true}
                  emptyLabel="Any"
                  isSaving={savingFields.has("pref_down")}
                />
              </dd>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
              <dt className="text-text-secondary font-medium">Distance</dt>
              <dd>
                <InlineSelectField
                  value={optimisticPlay.pref_dis || ""}
                  options={DISTANCE_OPTIONS}
                  onSave={(value) => handleInlineSave("pref_dis", value)}
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
                  onSave={(value) => handleInlineSave("pref_hash", value)}
                  placeholder="Preferred hash"
                  allowEmpty={true}
                  emptyLabel="Any"
                  isSaving={savingFields.has("pref_hash")}
                />
              </dd>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
              <dt className="text-text-secondary font-medium">Coverage</dt>
              <dd>
                <InlineEditField
                  value={optimisticPlay.pref_cov || ""}
                  onSave={(value) => handleInlineSave("pref_cov", value)}
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
                  onSave={(value) => handleInlineSave("pref_front", value)}
                  placeholder="Preferred defensive front"
                />
              </dd>
            </div>
          </dl>
        </div>

        <div className="surface-subtle rounded-lg p-3">
          <Typography
            variant="label-lg"
            as="h4"
            className="text-text-primary flex items-center mb-2"
          >
            <Icon name="clock" className="h-4 w-4 mr-1" /> Usage & Stats
          </Typography>
          <dl className="space-y-2 text-sm">
            <div className="grid grid-cols-[120px_1fr] gap-3">
              <dt className="text-text-secondary font-medium">Times Called</dt>
              <dd className="text-text-primary">{play.times_called}</dd>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-3">
              <dt className="text-text-secondary font-medium">
                Times Successful
              </dt>
              <dd className="text-text-primary">{play.times_successful}</dd>
            </div>
            {play.last_used_at && (
              <div className="grid grid-cols-[120px_1fr] gap-3">
                <dt className="text-text-secondary font-medium">Last Used</dt>
                <dd className="text-text-primary">
                  {new Date(play.last_used_at).toLocaleDateString()}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="surface-subtle rounded-lg p-3">
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

      <div className="surface-subtle rounded-lg p-3">
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
        <div className="mt-2 flex flex-wrap gap-1">
          {summaryChips.slice(0, 8).map((chip) => (
            <span
              key={chip}
              className="px-2 py-0.5 text-[11px] rounded bg-surface-secondary text-text-primary"
            >
              {chip}
            </span>
          ))}
          {totalFlagsCount > 8 && (
            <span className="text-xs text-text-secondary">
              +{totalFlagsCount - 8} more
            </span>
          )}
        </div>
        {showTagsEditor && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <div className="text-xs text-text-secondary mb-1">Positions</div>
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
              <div className="text-xs text-text-secondary mb-1">Players</div>
              <div className="flex flex-wrap gap-1">
                {flags.players.map((pl) => (
                  <Button
                    key={pl}
                    size="xs"
                    variant="subtle"
                    className="!h-auto px-2 py-0.5 text-[11px]"
                    onClick={() => setFlags(removeFlag(play.id, "players", pl))}
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
              <div className="text-xs text-text-secondary mb-1">Flags</div>
              <div className="flex flex-wrap gap-1">
                {flags.flags.map((fl) => (
                  <Button
                    key={fl}
                    size="xs"
                    variant="subtle"
                    className="!h-auto px-2 py-0.5 text-[11px]"
                    onClick={() => setFlags(removeFlag(play.id, "flags", fl))}
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
            <Icon name="calendar" className="h-3 w-3 mr-1" /> Practice Script
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
  );
};
