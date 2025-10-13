/**
 * Formation Flip Utilities
 *
 * Utilities for flipping formations and diagram positions when duplicating plays.
 * Used for rapid play creation: duplicate "Power Right" → auto-create "Power Left"
 */

import type { Formation } from "../types/formation";
import { FormationService } from "../services/formationService";

/**
 * Get the opposite formation variant
 *
 * Rules:
 * - Left → Right
 * - Right → Left
 * - Base → Base (no flip)
 *
 * @param formationId - Current formation ID
 * @returns Promise<Formation | null> - Opposite variant or null if not found
 */
export async function getOppositeFormationVariant(
  formationId: string | null | undefined
): Promise<Formation | null> {
  if (!formationId) return null;

  try {
    // Get the current formation
    const currentFormation =
      await FormationService.getFormationById(formationId);
    if (!currentFormation) return null;

    // If it's a base formation, return the same formation (no flip)
    if (currentFormation.direction === "base") {
      return currentFormation;
    }

    // Determine the opposite direction
    const oppositeDirection =
      currentFormation.direction === "left" ? "right" : "left";

    // Get the base formation ID
    const baseFormationId =
      currentFormation.base_formation_id || currentFormation.id;

    // Get all variants for this formation
    const allFormations = await FormationService.getFormationsByPlaybook(
      currentFormation.playbook_id
    );

    // Find the opposite variant
    const oppositeVariant = allFormations.find(
      (f) =>
        (f.id === baseFormationId || f.base_formation_id === baseFormationId) &&
        f.direction === oppositeDirection
    );

    return oppositeVariant || null;
  } catch (error) {
    console.error("Failed to get opposite formation variant:", error);
    return null;
  }
}

/**
 * Flip diagram positions horizontally
 *
 * @param diagramData - Diagram data JSONB (DiagramDocument)
 * @param fieldWidth - Field width in yards (default: 53.3)
 * @returns Flipped diagram data or null if input was null
 */
export function flipDiagramPositions(
  diagramData: Record<string, any> | null | undefined,
  fieldWidth: number = 53.3
): Record<string, any> | null {
  if (!diagramData) return null;

  try {
    // Clone the data
    const flipped = JSON.parse(JSON.stringify(diagramData));

    // Flip players array if it exists
    if (Array.isArray(flipped.players)) {
      flipped.players = flipped.players.map((player: any) => ({
        ...player,
        x: fieldWidth - player.x, // Flip x coordinate
        // y stays the same (vertical position unchanged)
      }));
    }

    // Flip routes array if it exists
    if (Array.isArray(flipped.routes)) {
      flipped.routes = flipped.routes.map((route: any) => ({
        ...route,
        points: route.points?.map((point: any) => ({
          ...point,
          x: fieldWidth - point.x,
          // y stays the same
        })),
      }));
    }

    // Flip any x coordinates in objects
    Object.keys(flipped).forEach((key) => {
      if (key === "x" && typeof flipped[key] === "number") {
        flipped[key] = fieldWidth - flipped[key];
      }
    });

    return flipped;
  } catch (error) {
    console.error("Failed to flip diagram positions:", error);
    return null;
  }
}

/**
 * Flip play name direction if it contains Left/Right
 *
 * Examples:
 * - "Power Right" → "Power Left"
 * - "Slant Left" → "Slant Right"
 * - "Inside Zone" → "Inside Zone" (no change)
 *
 * @param playName - Original play name
 * @returns Flipped play name
 */
export function flipPlayName(playName: string): string {
  if (playName.toLowerCase().includes("right")) {
    return playName.replace(/right/gi, "Left");
  } else if (playName.toLowerCase().includes("left")) {
    return playName.replace(/left/gi, "Right");
  }
  return playName;
}

/**
 * Flip formation direction string (f_dir field)
 *
 * @param direction - Current direction ("Left", "Right", etc.)
 * @returns Flipped direction
 */
export function flipFormationDirection(
  direction: string | null | undefined
): string {
  if (!direction) return "";
  if (direction.toLowerCase() === "left") return "Right";
  if (direction.toLowerCase() === "right") return "Left";
  return direction;
}
