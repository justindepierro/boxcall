/**
 * Formation → Diagram Template Helpers
 *
 * Utilities for importing formation player positions into diagram editor.
 * When a user selects a formation in the play builder, these functions
 * convert formation.player_positions into diagram_data.players for the canvas.
 *
 * Phase 7 of Formation System Integration
 */

import type { Formation, FormationPlayerPosition } from "../types/formation";
import type { DiagramDocument } from "../components/playbook/diagram-editor/types/DiagramTypes";
import type { Player } from "../components/playbook/diagram-editor/types/Player";
import { v4 as uuidv4 } from "uuid";

/**
 * Convert formation player positions to diagram players
 *
 * Maps formation coordinate system to diagram coordinate system:
 * - Formation: x (0-53.3 yards width), y (0-50 yards depth)
 * - Diagram: Same coordinate system (both use yards)
 * - OFFENSIVE SIDE: Bottom of field (y > 17.5, line of scrimmage around y=17.5)
 *
 * Always includes 5 offensive linemen (LT, LG, C, RG, RT) positioned on line of scrimmage.
 * Center is rendered as square (position: "center"), others as circles.
 *
 * @param formation - Formation with player_positions array
 * @returns Array of Player objects for diagram editor including O-line
 */
export function convertFormationToDiagramPlayers(
  formation: Formation
): Player[] {
  const LINE_OF_SCRIMMAGE_Y = 17.5; // Orange line in diagram

  // Standard offensive line positions (on line of scrimmage)
  const OFFENSIVE_LINE_SPACING = 2; // 2 yards between linemen
  const CENTER_X = 26.67; // Center of field (53.3 / 2)

  // Professional position depth standards (yards behind LOS)
  // Based on USA Football, Hudl, and Firstdown Playbook standards
  const POSITION_DEPTHS = {
    // Backfield
    QB: 7, // Shotgun depth (y = 24.5)
    QB_UNDER: 1, // Under center (y = 18.5)
    RB: 8, // I-formation depth (y = 25.5)
    FB: 6, // H-back depth (y = 23.5)

    // Receivers
    SLOT: 1, // 1 yard off LOS (y = 18.5)
    WING: 1, // Wing/flex position (y = 18.5)
    SPLIT_END: 0, // On LOS (y = 17.5)
    TE: 0, // On LOS (y = 17.5)

    // Motion/specialty
    MOTION: 5, // Pre-motion depth (y = 22.5)
    DEFAULT: 5, // Default depth if unknown (y = 22.5)
  };

  /**
   * Calculate professional depth for a player based on role and label
   * Uses NFL/college standard positioning depths
   */
  const calculateDepth = (player: FormationPlayerPosition): number => {
    const role = player.role?.toUpperCase() || "";
    const label = player.label?.toUpperCase() || "";

    // QB detection
    if (role === "QB" || label === "Q") {
      return label.includes("UNDER")
        ? POSITION_DEPTHS.QB_UNDER
        : POSITION_DEPTHS.QB;
    }

    // RB/FB detection
    if (role === "RB" || label === "R" || label === "H") {
      return role === "FB" ? POSITION_DEPTHS.FB : POSITION_DEPTHS.RB;
    }

    // Receiver detection (slot vs split)
    if (role === "WR" || label === "X" || label === "Y" || label === "Z") {
      // Slot if inside hash marks (x between 15-40)
      const isSlot = player.x > 15 && player.x < 40;
      return isSlot ? POSITION_DEPTHS.SLOT : POSITION_DEPTHS.SPLIT_END;
    }

    // TE on LOS
    if (role === "TE" || label === "Y") {
      return POSITION_DEPTHS.TE;
    }

    // Default: 5 yards back
    return POSITION_DEPTHS.DEFAULT;
  };

  const offensiveLine: Player[] = [
    {
      id: uuidv4(),
      x: CENTER_X - OFFENSIVE_LINE_SPACING * 2, // Left Tackle
      y: LINE_OF_SCRIMMAGE_Y,
      jerseyNumber: "LT",
      team: "offense" as const,
      role: "OL",
      position: "regular" as const,
    },
    {
      id: uuidv4(),
      x: CENTER_X - OFFENSIVE_LINE_SPACING, // Left Guard
      y: LINE_OF_SCRIMMAGE_Y,
      jerseyNumber: "LG",
      team: "offense" as const,
      role: "OL",
      position: "regular" as const,
    },
    {
      id: uuidv4(),
      x: CENTER_X, // Center (SQUARE)
      y: LINE_OF_SCRIMMAGE_Y,
      jerseyNumber: "C",
      team: "offense" as const,
      role: "OL",
      position: "center" as const, // Square shape
    },
    {
      id: uuidv4(),
      x: CENTER_X + OFFENSIVE_LINE_SPACING, // Right Guard
      y: LINE_OF_SCRIMMAGE_Y,
      jerseyNumber: "RG",
      team: "offense" as const,
      role: "OL",
      position: "regular" as const,
    },
    {
      id: uuidv4(),
      x: CENTER_X + OFFENSIVE_LINE_SPACING * 2, // Right Tackle
      y: LINE_OF_SCRIMMAGE_Y,
      jerseyNumber: "RT",
      team: "offense" as const,
      role: "OL",
      position: "regular" as const,
    },
  ];

  // Convert formation skill positions (QB, RB, WR, TE)
  // Apply professional depth standards based on player role/label
  const skillPlayers =
    formation.player_positions?.map((pos: FormationPlayerPosition) => {
      // Use position code as jersey number if not provided
      const jerseyNumber =
        pos.jerseyNumber || pos.position || pos.label || "?";

      // Calculate professional depth based on role (QB at 7 yards, RB at 8 yards, etc.)
      const depth = calculateDepth(pos);
      const adjustedY = LINE_OF_SCRIMMAGE_Y + depth;

      return {
        id: uuidv4(),
        x: pos.x,
        y: adjustedY, // Professional depth positioning!
        jerseyNumber,
        team: "offense" as const,
        role: pos.role,
        position: "regular" as const,
      };
    }) || [];

  // Return O-line + skill players
  return [...offensiveLine, ...skillPlayers];
}

/**
 * Create diagram document from formation
 *
 * Generates a complete DiagramDocument with formation players pre-populated.
 * User can then add routes, annotations, defense, etc.
 *
 * @param formation - Formation to import
 * @returns Complete DiagramDocument ready for editor
 */
export function importFormationAsTemplate(
  formation: Formation
): DiagramDocument {
  const players = convertFormationToDiagramPlayers(formation);

  return {
    version: 2,
    players,
    meta: {
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  };
}

/**
 * Merge formation players into existing diagram
 *
 * Adds formation players to an existing diagram without removing
 * existing players (e.g., defense, custom offense additions).
 *
 * Use case: User has already drawn defense, then selects a formation
 *
 * @param existingDiagram - Current diagram document
 * @param formation - Formation to merge in
 * @returns Updated DiagramDocument with formation players added
 */
export function mergeFormationIntoDiagram(
  existingDiagram: DiagramDocument,
  formation: Formation
): DiagramDocument {
  const formationPlayers = convertFormationToDiagramPlayers(formation);

  // Remove existing offense players, keep defense
  const nonOffensePlayers = existingDiagram.players.filter(
    (p) => p.team !== "offense"
  );

  return {
    ...existingDiagram,
    players: [...formationPlayers, ...nonOffensePlayers],
    meta: {
      createdAt: existingDiagram.meta?.createdAt || Date.now(),
      updatedAt: Date.now(),
    },
  };
}

/**
 * Check if diagram already has formation players
 *
 * Helper to detect if diagram was populated from a formation.
 * Useful for UI decisions (show "Replace" vs "Import" button).
 *
 * @param diagram - Diagram document to check
 * @returns True if diagram has offense players
 */
export function diagramHasFormation(diagram: DiagramDocument): boolean {
  return diagram.players.some((p) => p.team === "offense");
}

/**
 * Clear formation players from diagram
 *
 * Removes all offense players, keeps defense/annotations.
 * Useful for "Reset Formation" functionality.
 *
 * @param diagram - Current diagram document
 * @returns Updated diagram with offense players removed
 */
export function clearFormationFromDiagram(
  diagram: DiagramDocument
): DiagramDocument {
  return {
    ...diagram,
    players: diagram.players.filter((p) => p.team !== "offense"),
    meta: {
      createdAt: diagram.meta?.createdAt || Date.now(),
      updatedAt: Date.now(),
    },
  };
}

/**
 * Get formation player count from diagram
 *
 * @param diagram - Diagram document
 * @returns Number of offense players in diagram
 */
export function getFormationPlayerCount(diagram: DiagramDocument): number {
  return diagram.players.filter((p) => p.team === "offense").length;
}
