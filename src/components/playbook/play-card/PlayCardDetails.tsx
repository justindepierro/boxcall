import React, { useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Typography } from "../../design-system/Typography";
import Icon from "../../ui/Icon/Icon";
import { InlineEditField } from "../../ui/InlineEditField";
import { Button } from "../../ui/Button/Button";
import { ImageUpload } from "../../ui/ImageUpload";
import { DISTANCE_OPTIONS, DOWN_OPTIONS, HASH_OPTIONS } from "./constants";
import {
  addFlag,
  getPlayFlags,
  removeFlag,
  POSITION_OPTIONS,
  type PlayFlags,
} from "../../../utils/localPlayFlags";
import type { Play as PlayType } from "../../../types/play";
import type { FieldDefinitionMap } from "./fieldDefinitions";
import { usePlayFieldValues } from "../AddNewPlayModal/hooks/usePlayFieldValues";

interface PlayCardDetailsProps {
  play: PlayType;
  optimisticPlay: PlayType;
  showOneWordCalls: boolean;
  phaseLabel: string | null;
  handleInlineSave: (
    field: keyof PlayType,
    value: string | number | boolean
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
  // NEW: For validation
  existingPlays?: PlayType[];
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
  getPlayTypeColor: _getPlayTypeColor,
  getConfidenceColor: _getConfidenceColor,
  existingPlays = [],
}) => {
  // Extract unique field values for validation
  const fieldValues = usePlayFieldValues(existingPlays);

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
      className="mt-sm pt-sm divider-t space-y-sm"
      role="region"
      aria-label={`Details for ${play.play_name}`}
    >
      {/* Only render badge row if there are badges to show */}
      {(phaseLabel || (optimisticPlay.one_word_play && !showOneWordCalls)) && (
        <div className="flex flex-wrap items-center gap-xs">
          {phaseLabel && (
            <span className="px-xs py-xs bg-warning-500 text-primary rounded-full text-2xs font-semibold uppercase border border-warning-600">
              {phaseLabel}
            </span>
          )}
          {optimisticPlay.one_word_play && !showOneWordCalls && (
            <span className="px-xs py-xs bg-electric-100 text-electric-800 border border-electric-200 rounded-full text-xs font-medium">
              Code: {optimisticPlay.one_word_play.toUpperCase()}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <div className="bg-subtle rounded-lg p-sm">
          <Typography
            variant="label-lg"
            as="h4"
            className="text-xssssssssrimary flex items-center mb-sm"
          >
            <Icon name="target" className="h-4 w-4 mr-xs" /> Formation
          </Typography>
          <DragDropContext onDragEnd={handleFormationDragEnd}>
            <Droppable droppableId="formation-fields">
              {(provided) => (
                <dl
                  className="space-y-xs text-sm"
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
                            className={`p-xs rounded transition-all duration-150 ${
                              snapshot.isDragging
                                ? "bg-surface-hover shadow-md scale-[1.02]"
                                : "hover:bg-surface-hover"
                            }`}
                          >
                            <div className="flex items-center gap-xs mb-xs">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing text-tertiary hover:text-secondary transition-colors"
                              >
                                <Icon
                                  name="grip-vertical"
                                  className="h-4 w-4"
                                />
                              </div>
                              <dt
                                className={`font-medium text-sm ${
                                  isVisible
                                    ? "text-xssssssssrimary"
                                    : "text-tertiary line-through"
                                }`}
                              >
                                {field.label}
                              </dt>
                              <button
                                onClick={() =>
                                  toggleFieldVisibility(fieldKey, "formation")
                                }
                                className="flex-shrink-0 p-xs rounded-lg hover:bg-surface-hover text-tertiary hover:text-secondary transition-colors ml-auto"
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

        <div className="bg-subtle rounded-lg p-sm">
          <Typography
            variant="label-lg"
            as="h4"
            className="text-xssssssssrimary flex items-center mb-sm"
          >
            <Icon name="hash" className="h-4 w-4 mr-xs" /> Play Details
          </Typography>
          <DragDropContext onDragEnd={handlePlayDetailsDragEnd}>
            <Droppable droppableId="play-details">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-xs text-sm"
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
                            className={`p-xs rounded transition-all duration-150 ${
                              snapshot.isDragging
                                ? "bg-surface-hover shadow-md scale-[1.02]"
                                : "hover:bg-surface-hover"
                            }`}
                          >
                            <div className="flex items-center gap-sm mb-xs">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing text-tertiary hover:text-secondary transition-colors"
                              >
                                <Icon
                                  name="grip-vertical"
                                  className="h-4 w-4"
                                />
                              </div>
                              <dt
                                className={`font-medium text-sm ${
                                  isVisible
                                    ? "text-xssssssssrimary"
                                    : "text-tertiary line-through"
                                }`}
                              >
                                {field.label}
                              </dt>
                              <button
                                onClick={() =>
                                  toggleFieldVisibility(fieldKey, "playDetails")
                                }
                                className="flex-shrink-0 p-xs rounded-lg hover:bg-surface-hover text-tertiary hover:text-secondary transition-colors ml-auto"
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

        <div className="bg-subtle rounded-lg p-sm">
          <Typography
            variant="label-lg"
            as="h4"
            className="text-xssssssssrimary flex items-center mb-sm"
          >
            <Icon name="settings" className="h-4 w-4 mr-xs" />{" "}
            Preferences
          </Typography>
          <dl className="space-y-sm text-sm">
            <div className="flex items-center gap-sm">
              <dt className="text-xssssssssrimary font-medium flex-shrink-0 w-20 text-xs">
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
            <div className="flex items-center gap-sm">
              <dt className="text-xssssssssrimary font-medium flex-shrink-0 w-20 text-xs">
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
            <div className="flex items-center gap-sm">
              <dt className="text-xssssssssrimary font-medium flex-shrink-0 w-20 text-xs">
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
            <div className="flex items-center gap-sm">
              <dt className="text-xssssssssrimary font-medium flex-shrink-0 w-20 text-xs">
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
            <div className="flex items-center gap-sm">
              <dt className="text-xssssssssrimary font-medium flex-shrink-0 w-20 text-xs">
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

        <div className="bg-subtle rounded-lg p-sm">
          <Typography
            variant="label-lg"
            as="h4"
            className="text-xssssssssrimary flex items-center mb-sm"
          >
            <Icon name="clock" className="h-4 w-4 mr-xs" /> Usage &
            Stats
          </Typography>
          <dl className="space-y-xs text-sm">
            <div className="flex items-center gap-sm">
              <dt className="text-xssssssssrimary font-medium flex-shrink-0 w-28 text-xs">
                Times Called
              </dt>
              <dd className="text-xssssssssrimary font-mono text-xs">
                {play.times_called}
              </dd>
            </div>
            <div className="flex items-center gap-sm">
              <dt className="text-xssssssssrimary font-medium flex-shrink-0 w-28 text-xs">
                Times Successful
              </dt>
              <dd className="text-xssssssssrimary font-mono text-xs">
                {play.times_successful}
              </dd>
            </div>
            {play.last_used_at && (
              <div className="flex items-center gap-sm">
                <dt className="text-xssssssssrimary font-medium flex-shrink-0 w-28 text-xs">
                  Last Used
                </dt>
                <dd className="text-xssssssssrimary font-mono text-xs">
                  {new Date(play.last_used_at).toLocaleDateString()}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="bg-subtle rounded-lg p-md">
        <Typography
          variant="label-lg"
          as="h4"
          className="text-xssssssssrimary flex items-center mb-md"
        >
          <Icon name="file" className="h-4 w-4 mr-xs" /> Notes
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

      <div className="bg-subtle rounded-lg p-sm">
        <div className="flex items-center justify-between">
          <Typography
            variant="label-lg"
            as="h4"
            className="text-xssssssssrimary mb-xs"
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
        <div className="mt-xs flex flex-wrap gap-xs">
          {summaryChips.slice(0, 8).map((chip) => (
            <span
              key={chip}
              className="px-xs py-xs text-xs rounded-lg bg-secondary text-xssssssssrimary"
            >
              {chip}
            </span>
          ))}
          {totalFlagsCount > 8 && (
            <span className="text-xsssssssss text-secondary">
              +{totalFlagsCount - 8} more
            </span>
          )}
        </div>
        {showTagsEditor && (
          <div className="mt-sm grid grid-cols-1 md:grid-cols-3 gap-sm">
            <div>
              <div className="text-xsssssssss text-secondary mb-xs">
                Positions
              </div>
              <div className="flex flex-wrap gap-xs">
                {flags.positions.map((pos) => (
                  <Button
                    key={pos}
                    size="xs"
                    variant="subtle"
                    className="!h-auto px-xs py-xs text-xs"
                    onClick={() =>
                      setFlags(removeFlag(play.id, "positions", pos))
                    }
                    title="Remove"
                  >
                    {pos} ×
                  </Button>
                ))}
              </div>
              <div className="mt-xs flex items-center gap-xs">
                <select
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  className="border-muted rounded-lg px-2 py-1 text-xsssssssss"
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
              <div className="text-xsssssssss text-secondary mb-xs">
                Players
              </div>
              <div className="flex flex-wrap gap-xs">
                {flags.players.map((pl) => (
                  <Button
                    key={pl}
                    size="xs"
                    variant="subtle"
                    className="!h-auto px-xs py-xs text-xs"
                    onClick={() => setFlags(removeFlag(play.id, "players", pl))}
                    title="Remove"
                  >
                    {pl} ×
                  </Button>
                ))}
              </div>
              <div className="mt-xs flex items-center gap-xs">
                <input
                  value={newPlayer}
                  onChange={(e) => setNewPlayer(e.target.value)}
                  placeholder="Add player (e.g., Z, WR1)"
                  className="border-muted rounded-lg px-2 py-1 text-xsssssssss flex-1"
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
              <div className="text-xsssssssss text-secondary mb-xs">
                Flags
              </div>
              <div className="flex flex-wrap gap-xs">
                {flags.flags.map((fl) => (
                  <Button
                    key={fl}
                    size="xs"
                    variant="subtle"
                    className="!h-auto px-xs py-xs text-xs"
                    onClick={() => setFlags(removeFlag(play.id, "flags", fl))}
                    title="Remove"
                  >
                    {fl} ×
                  </Button>
                ))}
              </div>
              <div className="mt-xs flex items-center gap-xs">
                <input
                  value={newFlag}
                  onChange={(e) => setNewFlag(e.target.value)}
                  placeholder="Add flag (e.g., Red Zone, 3rd&Short)"
                  className="border-muted rounded-lg px-2 py-1 text-xsssssssss flex-1"
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

      {/* Play Diagram Section */}
      <div className="mt-md">
        <Typography
          variant="label-lg"
          as="h4"
          className="text-primary flex items-center mb-sm"
        >
          <Icon name="camera" className="h-4 w-4 mr-xs" /> Play Diagram
        </Typography>
        <div className="bg-subtle rounded-lg p-sm">
          <ImageUpload
            value={optimisticPlay.diagram_image_url || undefined}
            onChange={async (url) => {
              await handleInlineSave("diagram_image_url", url || null);
            }}
            bucket="play-diagrams"
            path={`plays/${play.playbook_id}/${play.id}`}
            maxSizeBytes={5 * 1024 * 1024}
            acceptedFormats={[
              "image/jpeg",
              "image/png",
              "image/webp",
              "image/heic",
            ]}
          />
        </div>
      </div>
    </div>
  );
};
