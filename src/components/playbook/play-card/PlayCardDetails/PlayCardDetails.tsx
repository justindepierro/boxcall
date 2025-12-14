/**
 * PlayCardDetails Component
 *
 * Expanded details view for a play card, including:
 * - Play diagram preview
 * - Phase/code badges
 * - Formation fields (draggable)
 * - Play details fields (draggable)
 * - Preferences (down, distance, hash, coverage, front)
 * - Usage stats
 * - Notes
 * - Tags & roles
 * - Diagram upload
 */

import React, { useEffect, useState } from "react";
import { getPlayFlags, type PlayFlags } from "../../../../utils/localPlayFlags";
import type { PlayCardDetailsProps } from "./types";
import {
  PlayDiagramPreview,
  PlayBadges,
  DraggableFieldSection,
  PreferencesSection,
  UsageStatsSection,
  NotesSection,
  TagsSection,
  DiagramUploadSection,
} from "./components";

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
  existingPlays: _existingPlays = [],
}) => {
  const [flags, setFlags] = useState<PlayFlags>(() => getPlayFlags(play.id));

  // Sync flags when play changes
  useEffect(() => {
    setFlags(getPlayFlags(play.id));
  }, [play.id]);

  return (
    <div
      id={`play-details-${play.id}`}
      className="mt-sm pt-sm divider-t space-y-sm"
      role="region"
      aria-label={`Details for ${play.play_name}`}
    >
      {/* Play Diagram Preview */}
      <PlayDiagramPreview
        diagramUrl={optimisticPlay.diagram_url}
        diagramImageUrl={(optimisticPlay as any).diagram_image_url}
        playName={play.play_name}
      />

      {/* Badges */}
      <PlayBadges
        phaseLabel={phaseLabel}
        oneWordPlay={optimisticPlay.one_word_play}
        showOneWordCalls={showOneWordCalls}
      />

      {/* Main grid: Formation, Play Details, Preferences, Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-md">
        {/* Formation Fields */}
        <DraggableFieldSection
          title="Formation"
          icon="target"
          droppableId="formation-fields"
          fieldOrder={formationFieldOrder}
          fields={formationFields}
          fieldVisibility={formationFieldVisibility}
          optimisticPlay={optimisticPlay}
          handleInlineSave={handleInlineSave}
          savingFields={savingFields}
          toggleFieldVisibility={(fieldKey) =>
            toggleFieldVisibility(fieldKey, "formation")
          }
          onDragEnd={handleFormationDragEnd}
        />

        {/* Play Details Fields */}
        <DraggableFieldSection
          title="Play Details"
          icon="hash"
          droppableId="play-details"
          fieldOrder={playDetailsFieldOrder}
          fields={playDetailsFields}
          fieldVisibility={playDetailsFieldVisibility}
          optimisticPlay={optimisticPlay}
          handleInlineSave={handleInlineSave}
          savingFields={savingFields}
          toggleFieldVisibility={(fieldKey) =>
            toggleFieldVisibility(fieldKey, "playDetails")
          }
          onDragEnd={handlePlayDetailsDragEnd}
        />

        {/* Preferences */}
        <PreferencesSection
          optimisticPlay={optimisticPlay}
          handleInlineSave={handleInlineSave}
          savingFields={savingFields}
        />

        {/* Usage Stats */}
        <UsageStatsSection play={play} />
      </div>

      {/* Notes */}
      <NotesSection
        notes={optimisticPlay.notes}
        handleInlineSave={handleInlineSave}
        savingFields={savingFields}
      />

      {/* Tags & Roles */}
      <TagsSection playId={play.id} flags={flags} setFlags={setFlags} />

      {/* Diagram Upload */}
      <DiagramUploadSection
        play={play}
        optimisticPlay={optimisticPlay}
        handleInlineSave={handleInlineSave}
      />
    </div>
  );
};
