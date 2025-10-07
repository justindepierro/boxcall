/**
 * Diagram Helper Utilities
 * Provides constants, types, and helper functions for diagram operations
 */

import type { Play } from "../types/play";
import type { DiagramDocument } from "../components/playbook/diagram-editor/types/types";
import type { IconName } from "../components/ui/Icon/Icon";

/**
 * Special ID used to identify whiteboard mode (diagram without an existing play)
 */
export const WHITEBOARD_TEMP_ID = "whiteboard-temp";

/**
 * Diagram operation modes
 */
export const DiagramMode = {
  CREATE: "create", // Creating diagram for existing play
  EDIT: "edit", // Editing diagram for existing play
  WHITEBOARD: "whiteboard", // Free-form whiteboard that will create a play on save
} as const;

export type DiagramModeType = (typeof DiagramMode)[keyof typeof DiagramMode];

/**
 * Check if a play is in whiteboard mode
 */
export function isWhiteboardMode(play: Play | null): boolean {
  return play?.id === WHITEBOARD_TEMP_ID;
}

/**
 * Determine the diagram mode based on the play state
 */
export function getDiagramMode(play: Play | null): DiagramModeType {
  if (!play) return DiagramMode.CREATE;
  if (isWhiteboardMode(play)) return DiagramMode.WHITEBOARD;
  return play.diagram_url ? DiagramMode.EDIT : DiagramMode.CREATE;
}

/**
 * Create a temporary whiteboard play object
 * This is used when opening the diagram editor in whiteboard mode
 */
export function createWhiteboardPlay(playbookId: string): Play {
  return {
    id: WHITEBOARD_TEMP_ID,
    playbook_id: playbookId,
    formation: "Whiteboard",
    play_name: "New Whiteboard Diagram",
    p_type: "Pass",
    confidence_base: 0,
    times_called: 0,
    times_successful: 0,
    created_by: "", // Will be set when saved
    created_at: new Date(),
    updated_at: new Date(),
  };
}

/**
 * Create a play object from whiteboard diagram data
 * Used when saving a whiteboard diagram as a new play
 */
export function createPlayFromWhiteboard(
  playbookId: string,
  playName: string,
  formation: string,
  diagramDoc: DiagramDocument,
  options?: {
    playType?: string;
    personnel?: string;
    prefFront?: string;
    confidence?: number;
  }
): Partial<Play> {
  return {
    playbook_id: playbookId,
    play_name: playName,
    formation: formation,
    p_type: options?.playType || "Pass",
    diagram_url: JSON.stringify(diagramDoc),
    confidence_base: options?.confidence ?? 50,
    ...(options?.personnel && { personnel: options.personnel }),
    ...(options?.prefFront && { pref_front: options.prefFront }),
  };
}

/**
 * Create play updates for an existing play's diagram
 */
export function createDiagramUpdates(
  playName: string,
  formation: string,
  diagramDoc: DiagramDocument,
  options?: {
    playType?: string;
    personnel?: string;
    prefFront?: string;
  }
): Partial<Play> {
  const updates: Partial<Play> = {
    play_name: playName,
    formation: formation,
    diagram_url: JSON.stringify(diagramDoc),
  };

  if (options?.playType) updates.p_type = options.playType;
  if (options?.personnel !== undefined) updates.personnel = options.personnel;
  if (options?.prefFront !== undefined)
    updates.pref_front = options.prefFront;

  return updates;
}

/**
 * Get user-friendly text for diagram operations
 */
export function getDiagramActionText(mode: DiagramModeType): {
  buttonText: string;
  successMessage: string;
  errorMessage: string;
} {
  switch (mode) {
    case DiagramMode.WHITEBOARD:
      return {
        buttonText: "Create Play from Diagram",
        successMessage: "Play created from whiteboard!",
        errorMessage: "Failed to create play from whiteboard",
      };
    case DiagramMode.CREATE:
      return {
        buttonText: "Save Diagram",
        successMessage: "Diagram created!",
        errorMessage: "Failed to create diagram",
      };
    case DiagramMode.EDIT:
      return {
        buttonText: "Save Changes",
        successMessage: "Diagram updated!",
        errorMessage: "Failed to update diagram",
      };
    default:
      return {
        buttonText: "Save",
        successMessage: "Saved successfully",
        errorMessage: "Failed to save",
      };
  }
}

/**
 * Get the appropriate icon for diagram button based on state
 */
export function getDiagramButtonIcon(hasDiagram: boolean): IconName {
  return hasDiagram ? "edit" : "image";
}

/**
 * Get the appropriate button text for diagram actions
 */
export function getDiagramButtonText(hasDiagram: boolean): string {
  return hasDiagram ? "Edit Diagram" : "Create Diagram";
}
