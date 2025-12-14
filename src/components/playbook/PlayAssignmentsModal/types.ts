/**
 * PlayAssignmentsModal Type Definitions
 */

import type { Play } from "../../../types/play";
import type { PersonnelConfiguration } from "../../../types/personnel";

// ============================================================================
// Component Props
// ============================================================================

export interface PlayAssignmentsModalProps {
  play: Play;
  isOpen: boolean;
  onClose: () => void;
  userRole?: "coach" | "player";
  currentPlayerPosition?: string;
  personnelConfigurations?: PersonnelConfiguration[];
}

// ============================================================================
// Data Types
// ============================================================================

export interface AssignmentData {
  id?: string;
  position: string;
  assignment_text: string;
}

// ============================================================================
// State Types
// ============================================================================

export interface PlayAssignmentsState {
  assignments: Map<string, AssignmentData>;
  playNotes: string;
  loading: boolean;
  saving: boolean;
  hasChanges: boolean;
  justSaved: boolean;
  selectedPersonnelId: string | null;
  customPositions: string[];
  isEditingPositions: boolean;
  editingLabel: string | null;
  viewMode: "coach" | "player";
  previewPosition: string | null;
}

// ============================================================================
// Component Props
// ============================================================================

export interface PositionCardProps {
  position: string;
  index: number;
  assignment?: AssignmentData;
  isCurrentPlayer: boolean;
  isEditing: boolean;
  isEditingPositions: boolean;
  canEdit: boolean;
  positions: string[];
  onUpdateAssignment: (position: string, text: string) => void;
  onRenamePosition: (oldLabel: string, newLabel: string) => void;
  onSetEditingLabel: (label: string | null) => void;
  onSetCustomPositions: (positions: string[]) => void;
}

export interface AssignmentsHeaderProps {
  play: Play;
  isCoach: boolean;
  viewMode: "coach" | "player";
  hasChanges: boolean;
  canEdit: boolean;
  onToggleViewMode: () => void;
}

export interface PlayerPreviewSelectorProps {
  positions: string[];
  previewPosition: string | null;
  onSelectPosition: (position: string | null) => void;
}

export interface PersonnelSelectorProps {
  personnelConfigurations: PersonnelConfiguration[];
  selectedPersonnelId: string | null;
  selectedPersonnel?: PersonnelConfiguration | null;
  playPersonnel?: string;
  canEdit: boolean;
  onSelectPersonnel: (id: string | null) => void;
}

export interface PlayNotesProps {
  playNotes: string;
  canEdit: boolean;
  onUpdateNotes: (notes: string) => void;
}

export interface AssignmentsFooterProps {
  canEdit: boolean;
  hasChanges: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
}
