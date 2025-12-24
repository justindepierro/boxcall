/**
 * PlayCardDetails Types
 *
 * Type definitions for the PlayCardDetails component and its subcomponents.
 */

import type { Play as PlayType } from "../../../../types/play";
import type { FieldDefinitionMap } from "../fieldDefinitions";
import type { PlayFlags } from "../../../../utils/localPlayFlags";

/**
 * Props for the main PlayCardDetails component
 */
export interface PlayCardDetailsProps {
  play: PlayType;
  optimisticPlay: PlayType;
  showOneWordCalls: boolean;
  phaseLabel: string | null;
  handleInlineSave: (
    field: keyof PlayType,
    value: string | number | boolean | null | string[]
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
  existingPlays?: PlayType[];
}

/**
 * Props for the PlayDiagramPreview section
 */
export interface PlayDiagramPreviewProps {
  diagramUrl: string | null | undefined;
  diagramImageUrl: string | null | undefined;
  playName: string;
}

/**
 * Props for the PlayBadges section
 */
export interface PlayBadgesProps {
  phaseLabel: string | null;
  oneWordPlay: string | null | undefined;
  showOneWordCalls: boolean;
}

/**
 * Props for the DraggableFieldSection component
 */
export interface DraggableFieldSectionProps {
  title: string;
  icon: string;
  droppableId: string;
  fieldOrder: string[];
  fields: FieldDefinitionMap;
  fieldVisibility: Record<string, boolean>;
  optimisticPlay: PlayType;
  handleInlineSave: PlayCardDetailsProps["handleInlineSave"];
  savingFields: Set<string>;
  toggleFieldVisibility: (fieldKey: string) => void;
  onDragEnd: (result: any) => void;
}

/**
 * Props for the PreferencesSection component
 */
export interface PreferencesSectionProps {
  optimisticPlay: PlayType;
  handleInlineSave: PlayCardDetailsProps["handleInlineSave"];
  savingFields: Set<string>;
}

/**
 * Props for the UsageStatsSection component
 */
export interface UsageStatsSectionProps {
  play: PlayType;
}

/**
 * Props for the NotesSection component
 */
export interface NotesSectionProps {
  notes: string | null | undefined;
  handleInlineSave: PlayCardDetailsProps["handleInlineSave"];
  savingFields: Set<string>;
}

/**
 * Props for the TagsSection component
 */
export interface TagsSectionProps {
  playId: string;
  flags: PlayFlags;
  setFlags: React.Dispatch<React.SetStateAction<PlayFlags>>;
}

/**
 * Props for the DiagramUploadSection component
 */
export interface DiagramUploadSectionProps {
  play: PlayType;
  optimisticPlay: PlayType;
  handleInlineSave: PlayCardDetailsProps["handleInlineSave"];
}

/**
 * Internal state shape for the PlayCardDetails component
 */
export interface PlayCardDetailsState {
  flags: PlayFlags;
  newFlag: string;
  newPlayer: string;
  newPosition: string;
  showTagsEditor: boolean;
}
