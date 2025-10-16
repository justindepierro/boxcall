/**
 * Formation Quality Utilities
 *
 * Helper functions for calculating and managing formation metadata quality.
 * These match the database trigger logic for consistency.
 */

import type {
  Formation,
  FormationMetadataQuality,
} from "../types/formation";

/**
 * Calculate quality level from completeness percentage
 * This matches the database trigger logic
 */
export function calculateQuality(
  completeness: number
): FormationMetadataQuality {
  if (completeness >= 100) return "complete";
  if (completeness >= 75) return "good";
  if (completeness >= 50) return "needs_work";
  return "incomplete";
}

/**
 * Calculate metadata completeness score (0-100)
 * This matches the database trigger logic
 *
 * Scoring breakdown:
 * - Player positions: 20 points (critical - double weight)
 * - Personnel: 10 points
 * - Formation type: 10 points
 * - Category: 10 points
 * - Tags: 10 points
 * - Directionality type: 10 points
 * - Description: 5 points
 * - Run strength: 5 points
 * - Pass strength: 5 points
 * - Strength player: 5 points
 * Total: 100 points
 */
export function calculateCompleteness(formation: Partial<Formation>): number {
  let score = 0;

  // Player positions (20 points - critical, double weight)
  if (formation.player_positions && formation.player_positions.length > 0) {
    score += 20;
  }

  // Personnel (10 points)
  if (formation.personnel_id) score += 10;

  // Formation type (10 points)
  if (formation.formation_type) score += 10;

  // Category (10 points)
  if (formation.category) score += 10;

  // Tags (10 points)
  if (formation.tags && formation.tags.length > 0) score += 10;

  // Description (5 points)
  if (formation.description && formation.description.trim().length > 0) {
    score += 5;
  }

  // Run strength (5 points)
  if (formation.run_strength && formation.run_strength !== "balanced") {
    score += 5;
  }

  // Pass strength (5 points)
  if (formation.pass_strength && formation.pass_strength !== "balanced") {
    score += 5;
  }

  // Directionality type (10 points)
  if (
    formation.directionality_type &&
    formation.directionality_type !== "unspecified"
  ) {
    score += 10;
  }

  // Strength player (5 points)
  if (formation.strength_player_position) score += 5;

  return score;
}

/**
 * Get list of missing fields
 */
export function getMissingFields(formation: Partial<Formation>): string[] {
  const missing: string[] = [];

  if (!formation.player_positions || formation.player_positions.length === 0) {
    missing.push("player_positions");
  }
  if (!formation.personnel_id) missing.push("personnel");
  if (!formation.formation_type) missing.push("formation_type");
  if (!formation.category) missing.push("category");
  if (!formation.tags || formation.tags.length === 0) missing.push("tags");
  if (!formation.description || formation.description.trim().length === 0) {
    missing.push("description");
  }
  if (!formation.run_strength || formation.run_strength === "balanced") {
    missing.push("run_strength");
  }
  if (!formation.pass_strength || formation.pass_strength === "balanced") {
    missing.push("pass_strength");
  }
  if (
    !formation.directionality_type ||
    formation.directionality_type === "unspecified"
  ) {
    missing.push("directionality_type");
  }
  if (!formation.strength_player_position) {
    missing.push("strength_player");
  }

  return missing;
}

/**
 * Format field names for display
 */
export function formatFieldName(field: string): string {
  return field
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
