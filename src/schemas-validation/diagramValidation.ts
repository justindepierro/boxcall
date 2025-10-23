/**
 * Diagram Validation
 *
 * Validates diagram documents using Zod schemas.
 * Ensures data integrity before saving to database.
 */

import { z } from "zod";
import type { DiagramDocument } from "../components/playbook/diagram-editor/types/DiagramTypes";

// Player schema - matches Player type from diagram-editor
const PlayerSchema = z.object({
  id: z.string().min(1, "Player ID required"),
  x: z
    .number()
    .min(0, "X coordinate must be >= 0")
    .max(53.333, "X coordinate must be <= 53.333 yards"),
  y: z
    .number()
    .min(0, "Y coordinate must be >= 0")
    .max(35, "Y coordinate must be <= 35 yards"),
  jerseyNumber: z.string().min(1, "Jersey number required"),
  team: z.enum(["offense", "defense"]),
  color: z.number().optional(), // Pixi.js color hex
  role: z.string().optional(), // Position role (QB, WR, RB, etc.)
  position: z.enum(["regular", "center"]).optional(), // Shape type
});

// Metadata schema
const DiagramMetaSchema = z.object({
  createdAt: z.number().positive("Created timestamp must be positive"),
  updatedAt: z.number().positive("Updated timestamp must be positive"),
});

// Diagram document schema - Version 2
const DiagramDocumentSchemaV2 = z.object({
  version: z.literal(2),
  players: z
    .array(PlayerSchema)
    .max(22, "Maximum 22 players allowed (11 offense + 11 defense)"),
  meta: DiagramMetaSchema.optional(),
});

// Future: Add route schema when routes are implemented
// const RouteSchema = z.object({
//   id: z.string(),
//   playerId: z.string(),
//   points: z.array(z.object({ x: z.number(), y: z.number() })),
//   type: z.enum(['route', 'block', 'motion']),
// });

/**
 * Validate a diagram document
 */
export function validateDiagram(
  document: unknown
): { valid: true; data: DiagramDocument } | { valid: false; error: string } {
  try {
    const validated = DiagramDocumentSchemaV2.parse(document);
    return { valid: true, data: validated as unknown as DiagramDocument };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errors = err.issues.map((e) => `${e.path.join(".")}: ${e.message}`);
      return {
        valid: false,
        error: errors.join("; "),
      };
    }
    return { valid: false, error: "Invalid diagram format" };
  }
}

/**
 * Validate player count by team
 */
export function validatePlayerCounts(document: DiagramDocument): {
  valid: boolean;
  offense: number;
  defense: number;
  error?: string;
} {
  const offensePlayers = document.players.filter((p) => p.team === "offense");
  const defensePlayers = document.players.filter((p) => p.team === "defense");

  const offense = offensePlayers.length;
  const defense = defensePlayers.length;

  if (offense > 11) {
    return {
      valid: false,
      offense,
      defense,
      error: `Too many offense players: ${offense} (max 11)`,
    };
  }

  if (defense > 11) {
    return {
      valid: false,
      offense,
      defense,
      error: `Too many defense players: ${defense} (max 11)`,
    };
  }

  return { valid: true, offense, defense };
}

/**
 * Check for overlapping players (collision detection)
 */
export function detectOverlappingPlayers(
  document: DiagramDocument,
  threshold = 2
): {
  hasOverlaps: boolean;
  overlaps: Array<{ player1: string; player2: string; distance: number }>;
} {
  const overlaps: Array<{
    player1: string;
    player2: string;
    distance: number;
  }> = [];

  for (let i = 0; i < document.players.length; i++) {
    for (let j = i + 1; j < document.players.length; j++) {
      const p1 = document.players[i];
      const p2 = document.players[j];

      const distance = Math.sqrt(
        Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
      );

      if (distance < threshold) {
        overlaps.push({
          player1: p1.jerseyNumber,
          player2: p2.jerseyNumber,
          distance,
        });
      }
    }
  }

  return {
    hasOverlaps: overlaps.length > 0,
    overlaps,
  };
}

/**
 * Validate diagram before save
 * Runs all validation checks
 */
export function validateDiagramForSave(document: unknown): {
  valid: boolean;
  data?: DiagramDocument;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Schema validation
  const schemaResult = validateDiagram(document);
  if (!schemaResult.valid) {
    errors.push(schemaResult.error);
    return { valid: false, errors, warnings };
  }

  const validated = schemaResult.data;

  // 2. Player count validation
  const countResult = validatePlayerCounts(validated);
  if (!countResult.valid) {
    errors.push(countResult.error || "Invalid player counts");
  }

  // Warn if no players
  if (validated.players.length === 0) {
    warnings.push("Diagram has no players");
  }

  // 3. Check for overlapping players
  const overlapResult = detectOverlappingPlayers(validated);
  if (overlapResult.hasOverlaps) {
    warnings.push(
      `${overlapResult.overlaps.length} player overlap(s) detected: ${overlapResult.overlaps.map((o) => `${o.player1} and ${o.player2}`).join(", ")}`
    );
  }

  return {
    valid: errors.length === 0,
    data: validated,
    errors,
    warnings,
  };
}
