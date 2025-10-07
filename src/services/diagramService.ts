/**
 * Diagram Service
 * Handles diagram-related business logic and API interactions
 */

import { PlaysService } from "@services";
import type { Play } from "../types/play";
import type { DiagramDocument } from "../components/playbook/diagram-editor/types/types";
import type { DiagramMetadata } from "../components/playbook/diagram-editor/DiagramEditor";
import {
  createPlayFromWhiteboard,
  createDiagramUpdates,
  isWhiteboardMode,
} from "../utils/diagramHelpers";

export interface SaveDiagramResult {
  success: boolean;
  play?: Play;
  error?: string;
}

/**
 * Create a new play from a whiteboard diagram
 */
export async function createPlayFromDiagram(
  playbookId: string,
  doc: DiagramDocument,
  metadata: DiagramMetadata
): Promise<SaveDiagramResult> {
  try {
    const newPlay = createPlayFromWhiteboard(
      playbookId,
      metadata.play_name,
      metadata.formation,
      doc,
      {
        playType: metadata.p_type,
        personnel: metadata.personnel,
        prefFront: metadata.pref_front,
      }
    );

    const createdPlay = await PlaysService.createPlay(
      newPlay as Omit<Play, "id" | "created_at" | "updated_at">
    );

    return {
      success: true,
      play: createdPlay,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create play from diagram",
    };
  }
}

/**
 * Update an existing play's diagram
 */
export async function updatePlayDiagram(
  playId: string,
  doc: DiagramDocument,
  metadata: DiagramMetadata
): Promise<SaveDiagramResult> {
  try {
    const updates = createDiagramUpdates(
      metadata.play_name,
      metadata.formation,
      doc,
      {
        playType: metadata.p_type,
        personnel: metadata.personnel,
        prefFront: metadata.pref_front,
      }
    );

    await PlaysService.updatePlay(playId, updates);

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update diagram",
    };
  }
}

/**
 * Save a diagram - handles both create and update scenarios
 */
export async function saveDiagram(
  play: Play | null,
  playbookId: string,
  doc: DiagramDocument,
  metadata: DiagramMetadata
): Promise<SaveDiagramResult> {
  if (!play) {
    return {
      success: false,
      error: "No play provided",
    };
  }

  // Check if this is a whiteboard (new diagram without an existing play)
  if (isWhiteboardMode(play)) {
    return createPlayFromDiagram(playbookId, doc, metadata);
  }

  // Update existing play's diagram
  return updatePlayDiagram(play.id, doc, metadata);
}
