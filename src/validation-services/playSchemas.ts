/**
 * Play Validation Schemas
 *
 * Comprehensive input validation for plays using Zod
 * Prevents SQL injection, XSS, and invalid data
 */

import { z } from "zod";

// ========================================
// Base Schemas
// ========================================

// Known play types for reference (but we allow custom types too)
// This list is maintained for documentation purposes
// Actual validation uses flexible string matching
const _KNOWN_PLAY_TYPES = [
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
export type KnownPlayType = (typeof _KNOWN_PLAY_TYPES)[number];

const FormationSchema = z
  .string()
  .min(1, "Formation required")
  .max(50, "Formation name too long")
  .regex(
    /^[a-zA-Z0-9\s-]+$/,
    "Formation can only contain letters, numbers, spaces, and hyphens"
  );

const PlayNameSchema = z
  .string()
  .min(1, "Play name required")
  .max(200, "Play name too long (max 200 characters)")
  .regex(
    /^[a-zA-Z0-9\s\-.']+$/,
    "Play name can only contain letters, numbers, spaces, hyphens, periods, and apostrophes"
  );

const NotesSchema = z
  .string()
  .max(5000, "Notes too long (max 5000 characters)")
  .optional()
  .transform((val) => {
    // Basic XSS protection: strip HTML tags
    if (!val) return val;
    return val.replace(/<[^>]*>/g, "");
  });

const UUIDSchema = z.string().uuid("Invalid UUID format").min(1, "ID required");
const OptionalUUIDSchema = z.string().uuid("Invalid UUID format").optional();

// ========================================
// Diagram Data Schema
// ========================================

const PlayerPositionSchema = z.object({
  x: z.number().min(-100).max(200),
  y: z.number().min(-100).max(200),
});

const PlayerSchema = z.object({
  id: z.string().max(50),
  position: PlayerPositionSchema,
  label: z.string().max(10).optional(),
  number: z.number().min(0).max(99).optional(),
  role: z
    .enum(["qb", "rb", "wr", "te", "ol", "dl", "lb", "db", "k", "p", "ls", "h"])
    .optional(),
});

const RouteSchema = z.object({
  id: z.string().max(50),
  playerId: z.string().max(50),
  points: z.array(PlayerPositionSchema).max(50, "Route too complex"),
  type: z.enum(["route", "block", "motion", "assignment"]).optional(),
});

const DiagramDataSchema = z
  .object({
    version: z.number().min(1).max(10),
    players: z.array(PlayerSchema).max(22, "Max 22 players allowed").optional(),
    routes: z.array(RouteSchema).max(100, "Max 100 routes allowed").optional(),
    fieldType: z.enum(["offense", "defense", "special-teams"]).optional(),
    hash: z.enum(["left", "right", "middle"]).optional(),
  })
  .optional();

// ========================================
// Play CRUD Schemas
// ========================================

// Reusable text field schema with max length and XSS protection
const TextFieldSchema = (maxLen: number) =>
  z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z
      .string()
      .max(maxLen)
      .transform((val) => (val ? val.replace(/<[^>]*>/g, "") : val))
      .optional()
  );

/**
 * Schema for creating a new play
 * Includes ALL fields from the AddNewPlayModal
 */
export const PlayCreateSchema = z.object({
  // Required fields
  playbook_id: UUIDSchema,
  play_name: PlayNameSchema,
  formation: FormationSchema,
  formation_id: OptionalUUIDSchema,

  // Play type - allow any string (custom types supported)
  p_type: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().max(50).optional()
  ),

  // ========================================
  // Formation Fields
  // ========================================
  f_type: TextFieldSchema(50), // Formation type (e.g., "Shotgun", "Under Center")
  f_dir: TextFieldSchema(20), // Formation direction (L/R)
  formation_direction: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.enum(["base", "left", "right"]).optional()
  ), // Formation direction (canonical token - must match Play type)
  back_align: TextFieldSchema(50), // Back alignment
  back_left_of_qb: z.boolean().optional(),
  back_right_of_qb: z.boolean().optional(),
  shift: TextFieldSchema(100), // Shift description
  motion: TextFieldSchema(100), // Motion description
  ftag1: TextFieldSchema(50), // Formation tag 1
  ftag2: TextFieldSchema(50), // Formation tag 2
  r_str: TextFieldSchema(20), // Run strength
  p_str: TextFieldSchema(20), // Pass strength

  // ========================================
  // Play Details
  // ========================================
  p_dir: TextFieldSchema(20), // Play direction
  protection: TextFieldSchema(100), // Protection scheme
  check_into: TextFieldSchema(100), // Check/audible name
  p_tag1: TextFieldSchema(50), // Play tag 1
  p_tag2: TextFieldSchema(50), // Play tag 2
  one_word_play: TextFieldSchema(50), // One-word play call
  wristband_number: TextFieldSchema(20), // Wristband number

  // ========================================
  // Game Situation Preferences
  // ========================================
  pref_down: TextFieldSchema(20), // Preferred down(s)
  pref_dis: TextFieldSchema(20), // Preferred distance
  pref_hash: TextFieldSchema(20), // Preferred hash
  pref_cov: TextFieldSchema(50), // Preferred coverage
  pref_front: TextFieldSchema(50), // Preferred front
  pref_field_pos: TextFieldSchema(50), // Preferred field position
  pref_situation: TextFieldSchema(100), // Preferred game situation

  // ========================================
  // Personnel & Key Players
  // ========================================
  personnel: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().max(50, "Personnel name too long").optional()
  ),
  personnel_id: OptionalUUIDSchema,
  key_player1: z.string().max(50).optional(),
  key_player2: z.string().max(50).optional(),
  key_players: z
    .array(z.string().max(50))
    .max(22, "Max 22 key players")
    .optional(),
  key_positions: z
    .array(z.string().max(20))
    .max(22, "Max 22 key positions")
    .optional(),

  // ========================================
  // Notes, Tags & Flags
  // ========================================
  notes: NotesSchema,
  tags: z.array(z.string().max(50)).max(20, "Max 20 tags").optional(),
  flags: z.array(z.string().max(50)).max(10, "Max 10 flags").optional(),

  // ========================================
  // Diagram & Media
  // ========================================
  diagram_data: DiagramDataSchema,
  diagram_image_url: z.string().url().max(500).optional(),
  has_diagram: z.boolean().optional().default(false),

  // ========================================
  // Confidence & Tracking
  // ========================================
  confidence_base: z.number().min(0).max(100).optional(),
  confidence_level: z.number().min(0).max(100).optional(),

  // ========================================
  // Legacy & Categorization
  // ========================================
  play_call: z.string().max(50).optional(),
  strength: z.enum(["left", "right", "middle"]).optional(),
  hash: z.enum(["left", "right", "middle"]).optional(),
  category: z
    .enum([
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
    ])
    .optional(),

  // ========================================
  // Play Timing
  // ========================================
  expected_duration: z.number().min(0).max(60).optional(),

  // ========================================
  // AI/ML & Metadata
  // ========================================
  ai_generated: z.boolean().optional().default(false),
  ai_confidence: z.number().min(0).max(1).optional(),
  ai_model_version: z.string().max(50).optional(),
  formation_status: z.string().max(32).optional(),
  sanitized_at: z.union([z.string(), z.date()]).optional(),
});

/**
 * Schema for updating an existing play
 * All fields optional except id
 * Mirrors PlayCreateSchema for consistency
 */
export const PlayUpdateSchema = z.object({
  id: UUIDSchema,

  // Core fields
  play_name: PlayNameSchema.optional(),
  formation: FormationSchema.optional(),
  formation_id: OptionalUUIDSchema,

  // Play type - allow any string (custom types supported)
  p_type: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().max(50).optional()
  ),

  // ========================================
  // Formation Fields
  // ========================================
  f_type: TextFieldSchema(50),
  f_dir: TextFieldSchema(20),
  formation_direction: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.enum(["base", "left", "right"]).optional()
  ),
  back_align: TextFieldSchema(50),
  back_left_of_qb: z.boolean().optional(),
  back_right_of_qb: z.boolean().optional(),
  shift: TextFieldSchema(100),
  motion: TextFieldSchema(100),
  ftag1: TextFieldSchema(50),
  ftag2: TextFieldSchema(50),
  r_str: TextFieldSchema(20),
  p_str: TextFieldSchema(20),

  // ========================================
  // Play Details
  // ========================================
  p_dir: TextFieldSchema(20),
  protection: TextFieldSchema(100),
  check_into: TextFieldSchema(100),
  p_tag1: TextFieldSchema(50),
  p_tag2: TextFieldSchema(50),
  one_word_play: TextFieldSchema(50),
  wristband_number: TextFieldSchema(20),

  // ========================================
  // Game Situation Preferences
  // ========================================
  pref_down: TextFieldSchema(20),
  pref_dis: TextFieldSchema(20),
  pref_hash: TextFieldSchema(20),
  pref_cov: TextFieldSchema(50),
  pref_front: TextFieldSchema(50),
  pref_field_pos: TextFieldSchema(50),
  pref_situation: TextFieldSchema(100),

  // ========================================
  // Personnel & Key Players
  // ========================================
  personnel: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().max(50, "Personnel name too long").optional()
  ),
  personnel_id: OptionalUUIDSchema,
  key_player1: z.string().max(50).optional(),
  key_player2: z.string().max(50).optional(),
  key_players: z.array(z.string().max(50)).max(22).optional(),
  key_positions: z.array(z.string().max(20)).max(22).optional(),

  // ========================================
  // Notes, Tags & Flags
  // ========================================
  notes: NotesSchema,
  tags: z.array(z.string().max(50)).max(20).optional(),
  flags: z.array(z.string().max(50)).max(10).optional(),

  // ========================================
  // Diagram & Media
  // ========================================
  diagram_data: DiagramDataSchema,
  diagram_image_url: z.string().url().max(500).optional(),
  has_diagram: z.boolean().optional(),

  // ========================================
  // Confidence & Tracking
  // ========================================
  confidence_base: z.number().min(0).max(100).optional(),
  confidence_level: z.number().min(0).max(100).optional(),

  // ========================================
  // Legacy & Categorization
  // ========================================
  play_call: z.string().max(50).optional(),
  strength: z.enum(["left", "right", "middle"]).optional(),
  hash: z.enum(["left", "right", "middle"]).optional(),
  category: z
    .enum([
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
    ])
    .optional(),

  // ========================================
  // Play Timing
  // ========================================
  expected_duration: z.number().min(0).max(60).optional(),

  // ========================================
  // Metadata
  // ========================================
  formation_status: z.string().max(32).optional(),
  sanitized_at: z.union([z.string(), z.date()]).optional(),
});

/**
 * Schema for bulk play operations
 */
export const PlayBulkUpdateSchema = z.object({
  playIds: z
    .array(UUIDSchema)
    .min(1, "At least one play required")
    .max(100, "Max 100 plays at once"),
  updates: z.object({
    tags: z.array(z.string().max(50)).max(20).optional(),
    category: z.string().max(50).optional(),
    confidence_level: z.number().min(0).max(100).optional(),
  }),
});

// ========================================
// Helper Functions
// ========================================

/**
 * Validate play creation data
 */
export function validatePlayCreate(data: unknown) {
  return PlayCreateSchema.parse(data);
}

/**
 * Validate play update data
 */
export function validatePlayUpdate(data: unknown) {
  return PlayUpdateSchema.parse(data);
}

/**
 * Validate bulk update data
 */
export function validatePlayBulkUpdate(data: unknown) {
  return PlayBulkUpdateSchema.parse(data);
}

/**
 * Safe parse (returns { success, data, error })
 */
export function safeValidatePlayCreate(data: unknown) {
  return PlayCreateSchema.safeParse(data);
}

export function safeValidatePlayUpdate(data: unknown) {
  return PlayUpdateSchema.safeParse(data);
}

// ========================================
// Type Exports
// ========================================

export type PlayCreateInput = z.infer<typeof PlayCreateSchema>;
export type PlayUpdateInput = z.infer<typeof PlayUpdateSchema>;
export type PlayBulkUpdateInput = z.infer<typeof PlayBulkUpdateSchema>;
export type DiagramData = z.infer<typeof DiagramDataSchema>;
