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

const PlayTypeEnum = z.enum([
  "run",
  "pass",
  "rpo",
  "play-action",
  "screen",
  "draw",
  "bootleg",
  "rollout",
  "qb-sneak",
  "punt",
  "field-goal",
  "kickoff",
  "special",
]);

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
  .max(100, "Play name too long")
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

const UUIDSchema = z
  .string()
  .uuid("Invalid UUID format")
  .min(1, "ID required");

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
    .enum([
      "qb",
      "rb",
      "wr",
      "te",
      "ol",
      "dl",
      "lb",
      "db",
      "k",
      "p",
      "ls",
      "h",
    ])
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
    players: z
      .array(PlayerSchema)
      .max(22, "Max 22 players allowed")
      .optional(),
    routes: z.array(RouteSchema).max(100, "Max 100 routes allowed").optional(),
    fieldType: z.enum(["offense", "defense", "special-teams"]).optional(),
    hash: z.enum(["left", "right", "middle"]).optional(),
  })
  .optional();

// ========================================
// Play CRUD Schemas
// ========================================

/**
 * Schema for creating a new play
 */
export const PlayCreateSchema = z.object({
  // Required fields
  playbook_id: UUIDSchema,
  play_name: PlayNameSchema,
  formation: FormationSchema,
  p_type: PlayTypeEnum,

  // Optional descriptive fields
  play_call: z.string().max(50).optional(),
  strength: z.enum(["left", "right", "middle"]).optional(),
  hash: z.enum(["left", "right", "middle"]).optional(),
  notes: NotesSchema,
  tags: z.array(z.string().max(50)).max(20, "Max 20 tags").optional(),

  // Play categorization
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

  // Personnel
  personnel: z
    .string()
    .max(20)
    .regex(/^\d{2}$/, "Personnel must be 2 digits (e.g., '11', '12', '21')")
    .optional(),

  // Key players (legacy - validate as strings for now)
  key_player1: z.string().max(50).optional(),
  key_player2: z.string().max(50).optional(),

  // Diagram data (JSON)
  diagram_data: DiagramDataSchema,
  has_diagram: z.boolean().optional().default(false),

  // Audible/check-into system
  check_into: z.string().uuid().optional(),

  // Confidence & success tracking
  confidence_level: z.number().min(0).max(100).optional(),
  times_called: z.number().min(0).optional().default(0),
  times_successful: z.number().min(0).optional().default(0),

  // Play timing
  expected_duration: z.number().min(0).max(60).optional(),

  // AI/ML features
  ai_generated: z.boolean().optional().default(false),
  ai_confidence: z.number().min(0).max(1).optional(),
  ai_model_version: z.string().max(50).optional(),
});

/**
 * Schema for updating an existing play
 * All fields optional except id
 */
export const PlayUpdateSchema = z.object({
  id: UUIDSchema,

  // All other fields optional for partial updates
  play_name: PlayNameSchema.optional(),
  formation: FormationSchema.optional(),
  p_type: PlayTypeEnum.optional(),
  play_call: z.string().max(50).optional(),
  strength: z.enum(["left", "right", "middle"]).optional(),
  hash: z.enum(["left", "right", "middle"]).optional(),
  notes: NotesSchema,
  tags: z.array(z.string().max(50)).max(20).optional(),
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
  personnel: z
    .string()
    .max(20)
    .regex(/^\d{2}$/)
    .optional(),
  key_player1: z.string().max(50).optional(),
  key_player2: z.string().max(50).optional(),
  diagram_data: DiagramDataSchema,
  has_diagram: z.boolean().optional(),
  check_into: z.string().uuid().optional(),
  confidence_level: z.number().min(0).max(100).optional(),
  times_called: z.number().min(0).optional(),
  times_successful: z.number().min(0).optional(),
  expected_duration: z.number().min(0).max(60).optional(),
});

/**
 * Schema for bulk play operations
 */
export const PlayBulkUpdateSchema = z.object({
  playIds: z.array(UUIDSchema).min(1, "At least one play required").max(100, "Max 100 plays at once"),
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
