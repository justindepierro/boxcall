/**
 * Play Schema Types
 *
 * Auto-generated types from Zod schemas.
 * These are the canonical types for play data throughout the application.
 *
 * @see src/validation-services/playSchemas.ts for schema definitions
 */

import { z } from "zod";
import {
  PlayCreateSchema,
  PlayUpdateSchema,
  PlayBulkUpdateSchema,
  DiagramDataSchema,
} from "../validation-services/playSchemas";

// ========================================
// Input Types (from Zod schemas)
// ========================================

/** Data required to create a new play */
export type PlayCreateInput = z.infer<typeof PlayCreateSchema>;

/** Data for updating an existing play (all fields optional except id) */
export type PlayUpdateInput = z.infer<typeof PlayUpdateSchema>;

/** Data for bulk updating multiple plays */
export type PlayBulkUpdateInput = z.infer<typeof PlayBulkUpdateSchema>;

/** Diagram data structure (JSONB in database) */
export type DiagramData = z.infer<typeof DiagramDataSchema>;

// Re-export for convenience
export {
  PlayCreateSchema,
  PlayUpdateSchema,
  PlayBulkUpdateSchema,
} from "../validation-services/playSchemas";

// ========================================
// Full Play Type
// ========================================

/**
 * Complete Play type (database row + computed fields)
 *
 * This extends PlayCreateInput with server-generated fields.
 * Use this type when working with plays fetched from the database.
 */
export interface PlayRecord extends PlayCreateInput {
  /** Unique identifier (UUID) */
  id: string;

  /** ISO timestamp when play was created */
  created_at: string | Date;

  /** ISO timestamp when play was last updated */
  updated_at: string | Date;

  /** User ID who created the play */
  created_by: string;

  // ========================================
  // Computed/Derived Fields
  // These come from play_executions table
  // ========================================

  /** Number of times this play has been called (from executions) */
  times_called: number;

  /** Number of successful executions (from executions) */
  times_successful: number;

  /** Calculated success rate (times_successful / times_called) */
  success_rate?: number;

  // ========================================
  // Tracking Fields
  // ========================================

  /** Complexity score for analytics (1-10) */
  complexity_score?: number;

  /** Duplicate key for uniqueness constraint */
  duplicate_key?: string;

  /** Whether play is archived (soft delete) */
  is_archived: boolean;
}

// ========================================
// Direction Types
// ========================================

/** Valid formation direction values for f_dir field */
export type FormationDirection = "L" | "R" | "Left" | "Right" | "left" | "right";

/** Canonical formation direction token */
export type FormationDirectionToken = "base" | "left" | "right";

// ========================================
// Category & Type Constants
// ========================================

/** Standard play type categories */
export const PLAY_TYPES = [
  "Run",
  "Pass",
  "Option",
  "RPO",
  "Play Action",
  "Screen",
  "Draw",
  "Boot",
  "Bootleg",
  "Rollout",
  "QB Sneak",
  "Punt",
  "Field Goal",
  "Kickoff",
  "Special",
] as const;

export type PlayType = (typeof PLAY_TYPES)[number];

/** Play categories for filtering/analytics */
export const PLAY_CATEGORIES = [
  "run",
  "pass",
  "play-action",
  "screen",
  "rpo",
  "special-teams",
  "goal-line",
  "short-yardage",
  "two-minute",
  "red-zone",
] as const;

export type PlayCategory = (typeof PLAY_CATEGORIES)[number];

// ========================================
// Form State Types
// ========================================

/**
 * Form state for AddNewPlayModal (camelCase)
 *
 * Maps to snake_case database fields.
 * @see docs/PLAY_FIELD_MAPPING.md for full mapping
 */
export interface PlayFormState {
  // Required
  formation: string;
  playName: string;

  // Play type
  playType: string;

  // Formation fields
  formationType: string;
  formationDir: string;
  formation_direction: FormationDirectionToken | "";
  backAlign: string;
  backLeftOfQb: boolean;
  backRightOfQb: boolean;
  shift: string;
  motion: string;
  formationTags: string; // Comma-separated, becomes ftag1/ftag2
  runStrength: string;
  passStrength: string;

  // Play details
  playDir: string;
  protection: string;
  checkInto: string;
  playTags: string; // Comma-separated, becomes p_tag1/p_tag2
  oneWordPlay: string;
  wristbandNumber: string;

  // Personnel
  personnel: string;

  // Preferences
  prefDown: string;
  prefDistance: string;
  prefHash: string;
  prefCoverage: string;
  prefFront: string;
  prefFieldPos: string;
  prefSituation: string;

  // Other
  confidence: number;
  description: string; // maps to notes

  // Arrays
  tags: string[];
  key_positions: string[];
  key_players: string[];
  flags: string[];

  // Diagram
  diagram_image_url?: string;
}
