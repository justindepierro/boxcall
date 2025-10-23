/**
 * Diagram Service
 * Handles diagram-related business logic and API interactions
 *
 * Centralized service for all diagram operations:
 * - Save/load diagram documents
 * - Update existing play diagrams
 * - Validate diagram data
 * - Handle diagram versions
 * - Abstract Supabase calls
 */

import { PlaysService } from "@services";
import { supabase } from "../lib/supabase";
import type { Play } from "../types/play";
import type { DiagramDocument } from "../components/playbook/diagram-editor/types/types";
import type { DiagramMetadata } from "../components/playbook/diagram-editor/DiagramEditor";
import type { Player } from "../components/playbook/diagram-editor/types/Player";
import {
  createPlayFromWhiteboard,
  createDiagramUpdates,
  isWhiteboardMode,
} from "../utils/diagramHelpers";
import { validateDiagram } from "../schemas-validation/diagramValidation";

export interface SaveDiagramResult {
  success: boolean;
  play?: Play;
  error?: string;
}

export interface LoadDiagramResult {
  success: boolean;
  document?: DiagramDocument;
  error?: string;
}

export interface UpdateDiagramResult {
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

/**
 * Load diagram from a play
 */
export async function loadDiagram(playId: string): Promise<LoadDiagramResult> {
  try {
    const { data, error } = await supabase
      .from("plays")
      .select("diagram_data, diagram_version, personnel, playbook_id")
      .eq("id", playId)
      .single();

    if (error) {
      console.error("❌ Failed to load diagram:", error);
      return { success: false, error: error.message };
    }

    // Type assertion for Supabase data
    const play = data as any;

    if (!play?.diagram_data) {
      return { success: false, error: "No diagram data found" };
    }

    // Return the diagram document
    return {
      success: true,
      document: play.diagram_data as DiagramDocument,
    };
  } catch (err) {
    console.error("❌ LoadDiagram error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Update only the diagram data for an existing play
 * Used by autosave and manual saves
 */
export async function updateDiagramData(
  playId: string,
  document: DiagramDocument,
  options?: {
    updateFormation?: boolean;
  }
): Promise<UpdateDiagramResult> {
  try {
    // Validate diagram before saving
    const validation = validateDiagram(document);
    if (!validation.valid) {
      return {
        success: false,
        error: `Validation failed: ${validation.error}`,
      };
    }

    // Prepare update payload
    const updateData: Partial<Play> = {
      diagram_data: document,
      diagram_version: document.version || 2,
    };

    // Auto-detect formation if requested
    if (options?.updateFormation && document.players) {
      updateData.formation = detectFormation(document.players);
    }

    const { data, error } = await supabase
      .from("plays")
      .update(updateData as never)
      .eq("id", playId)
      .select()
      .single();

    if (error) {
      console.error("❌ Failed to update diagram data:", error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      play: data as Play,
    };
  } catch (err) {
    console.error("❌ UpdateDiagramData error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Delete diagram from a play
 */
export async function deleteDiagram(
  playId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("plays")
      .update({
        diagram_data: null,
        diagram_version: null,
        diagram_url: null,
      } as never)
      .eq("id", playId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Detect formation from players
 * Simple detection based on player count and positions
 */
function detectFormation(players: Player[]): string {
  const offensivePlayers = players.filter((p) => p.team === "offense");

  if (offensivePlayers.length === 0) return "Unknown";
  if (offensivePlayers.length === 11) return "11 Personnel";
  if (offensivePlayers.length === 5) {
    // Check for common 5-player formations
    const positions = offensivePlayers.map((p) => p.role).sort();
    if (positions.includes("QB") && positions.includes("RB")) {
      return "Pistol";
    }
    if (
      positions.includes("QB") &&
      positions.filter((p) => p === "WR").length >= 2
    ) {
      return "Shotgun";
    }
  }

  return `${offensivePlayers.length} Players`;
}

/**
 * Validate diagram and return comprehensive results
 */
export function validateDiagramDocument(document: DiagramDocument): {
  isValid: boolean;
  error?: string;
} {
  const validation = validateDiagram(document);
  return {
    isValid: validation.valid,
    error: validation.valid ? undefined : validation.error,
  };
}
