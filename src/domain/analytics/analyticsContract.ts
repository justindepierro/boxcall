/**
 * Analytics Data Contract
 * Single source of truth for all analytics type definitions and validation
 *
 * This module ensures clean, professional-grade communication between:
 * - Playbook (play definitions, formations)
 * - Execution Tracking (practice/game sessions)
 * - Stats/Analytics (reports, dashboards)
 *
 * Every analytics query, write, and display should use these contracts.
 */

import { z } from "zod";

// ============================================
// CORE ANALYTICS PRIMITIVES
// ============================================

/**
 * Execution result types - the foundation of all analytics
 * These MUST match the database enum in play_executions
 */
export const ExecutionResultSchema = z.enum([
  "success",
  "failure",
  "neutral",
  "skipped",
]);
export type ExecutionResult = z.infer<typeof ExecutionResultSchema>;

/**
 * Field zone buckets - configurable per team but have defaults
 * Used for "where on the field" analytics
 */
export const FieldZoneSchema = z.enum([
  "backed_up", // Own 0-10
  "own_territory", // Own 11-49
  "plus_territory", // Opponent 40-49
  "red_zone", // Opponent 20-39
  "goal_line", // Opponent 1-19
]);
export type FieldZone = z.infer<typeof FieldZoneSchema>;

/**
 * Down-distance buckets for situational analytics
 */
export const DownDistanceBucketSchema = z.enum([
  "1st_10", // First and 10 (standard)
  "2nd_short", // 2nd and 1-3
  "2nd_medium", // 2nd and 4-7
  "2nd_long", // 2nd and 8+
  "3rd_short", // 3rd and 1-3
  "3rd_medium", // 3rd and 4-7
  "3rd_long", // 3rd and 8+
  "4th_short", // 4th and 1-3
  "4th_medium", // 4th and 4-7
  "4th_long", // 4th and 8+
]);
export type DownDistanceBucket = z.infer<typeof DownDistanceBucketSchema>;

/**
 * Hash mark position
 */
export const HashMarkSchema = z.enum(["left", "middle", "right"]);
export type HashMark = z.infer<typeof HashMarkSchema>;

// ============================================
// PLAY DATA CONTRACT (from Playbook)
// ============================================

/**
 * Minimum play fields required for analytics
 * This is what analytics expects from Playbook
 */
export const PlayAnalyticsInputSchema = z.object({
  id: z.string().uuid("Play ID must be a valid UUID"),
  playbook_id: z.string().uuid("Playbook ID must be a valid UUID"),
  play_name: z.string().min(1, "Play name is required"),
  formation: z.string().min(1, "Formation is required"),
  p_type: z.string().min(1, "Play type is required"),

  // Optional but valuable for analytics
  personnel: z.string().optional(),
  formation_id: z.string().uuid().optional().nullable(),
  confidence_base: z.number().int().min(0).max(100).default(70),

  // Preference fields for situational analysis
  pref_down: z.string().optional().nullable(),
  pref_dis: z.string().optional().nullable(),
  pref_hash: z.string().optional().nullable(),
  pref_field_pos: z.string().optional().nullable(),

  // Derived cache fields (read-only for client, maintained by DB triggers)
  times_called: z.number().int().min(0).default(0),
  times_successful: z.number().int().min(0).default(0),
});

export type PlayAnalyticsInput = z.infer<typeof PlayAnalyticsInputSchema>;

// ============================================
// EXECUTION DATA CONTRACT (from BoxCall Live)
// ============================================

/**
 * Required fields when logging a play execution
 * This is what BoxCall Live MUST provide to analytics
 */
export const ExecutionCreateSchema = z
  .object({
    // Required identifiers
    play_id: z.string().uuid("Play ID must be a valid UUID"),
    team_id: z.string().uuid("Team ID must be a valid UUID"),

    // Session reference (exactly one required)
    practice_session_id: z.string().uuid().optional().nullable(),
    game_session_id: z.string().uuid().optional().nullable(),

    // Core execution data
    result: ExecutionResultSchema,
    executed_at: z
      .string()
      .datetime()
      .or(z.date())
      .default(() => new Date().toISOString()),

    // Game context (required for game sessions)
    yards_gained: z.number().int().optional().nullable(),
    down: z.number().int().min(1).max(4).optional().nullable(),
    distance: z.number().int().min(1).optional().nullable(),
    yard_line: z.number().int().min(0).max(100).optional().nullable(),
    hash_mark: HashMarkSchema.optional().nullable(),
    quarter: z.number().int().min(1).max(5).optional().nullable(),
    time_remaining: z.string().optional().nullable(),

    // Practice context (required for practice sessions)
    rep_number: z.number().int().min(1).optional().nullable(),

    // Optional enrichment
    formation_id: z.string().uuid().optional().nullable(),
    recorded_by: z.string().uuid().optional().nullable(),
    notes: z.string().optional().nullable(),
  })
  .refine(
    (data) =>
      Boolean(data.practice_session_id) !== Boolean(data.game_session_id),
    {
      message:
        "Exactly one of practice_session_id or game_session_id must be provided",
      path: ["practice_session_id"],
    }
  );

export type ExecutionCreate = z.infer<typeof ExecutionCreateSchema>;

// ============================================
// ANALYTICS OUTPUT CONTRACT (for Dashboards)
// ============================================

/**
 * Stats summary for a single play
 */
export const PlayStatsSchema = z.object({
  play_id: z.string().uuid(),
  play_name: z.string(),

  // Aggregate counts
  times_called: z.number().int().min(0),
  times_successful: z.number().int().min(0),

  // Calculated metrics
  success_rate: z.number().min(0).max(100),
  avg_yards: z.number().nullable(),

  // Sample size indicator (for confidence in stats)
  sample_size: z.enum(["insufficient", "limited", "reliable", "strong"]),

  // Last execution timestamp
  last_executed_at: z.string().datetime().optional().nullable(),
});

export type PlayStats = z.infer<typeof PlayStatsSchema>;

/**
 * Situational breakdown analytics
 */
export const SituationalStatsSchema = z.object({
  bucket: z.string(), // e.g., "3rd_short", "red_zone"
  attempts: z.number().int().min(0),
  successes: z.number().int().min(0),
  success_rate: z.number().min(0).max(100),
  avg_yards: z.number().nullable(),
  sample_size: z.enum(["insufficient", "limited", "reliable", "strong"]),
});

export type SituationalStats = z.infer<typeof SituationalStatsSchema>;

/**
 * Formation effectiveness analytics
 */
export const FormationStatsSchema = z.object({
  formation: z.string(),
  formation_id: z.string().uuid().optional().nullable(),
  total_plays: z.number().int().min(0),
  success_rate: z.number().min(0).max(100),
  avg_yards: z.number().nullable(),
  play_type_breakdown: z.record(z.string(), z.number().int().min(0)),
  personnel_breakdown: z.record(z.string(), z.number().int().min(0)),
});

export type FormationStats = z.infer<typeof FormationStatsSchema>;

/**
 * Comprehensive dashboard data
 */
export const AnalyticsDashboardSchema = z.object({
  // Summary metrics
  total_plays: z.number().int().min(0),
  total_executions: z.number().int().min(0),
  overall_success_rate: z.number().min(0).max(100),
  total_yards: z.number().int(),
  avg_yards_per_play: z.number(),

  // Top performers
  top_plays: z.array(PlayStatsSchema).max(10),
  top_formations: z.array(FormationStatsSchema).max(5),

  // Situational breakdowns
  by_down_distance: z.array(SituationalStatsSchema),
  by_field_zone: z.array(SituationalStatsSchema),
  by_play_type: z.array(SituationalStatsSchema),

  // Data freshness
  last_updated_at: z.string().datetime(),
  data_range: z.object({
    from: z.string().datetime().optional().nullable(),
    to: z.string().datetime().optional().nullable(),
    total_sessions: z.number().int().min(0),
  }),
});

export type AnalyticsDashboard = z.infer<typeof AnalyticsDashboardSchema>;

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Calculate sample size category for statistical confidence
 * @param n - Number of observations
 */
export function getSampleSizeCategory(
  n: number
): "insufficient" | "limited" | "reliable" | "strong" {
  if (n < 3) return "insufficient"; // Not enough data
  if (n < 10) return "limited"; // Use with caution
  if (n < 30) return "reliable"; // Good for trends
  return "strong"; // Statistically significant
}

/**
 * Calculate success rate with validation
 * @param successes - Number of successful executions
 * @param total - Total executions (must be >= successes)
 */
export function calculateSuccessRate(successes: number, total: number): number {
  if (total === 0) return 0;
  if (successes > total) {
    throw new Error(
      `Invalid: successes (${successes}) cannot exceed total (${total})`
    );
  }
  return Math.round((successes / total) * 1000) / 10; // Round to 1 decimal
}

/**
 * Bucket a down/distance combination
 * @param down - Down number (1-4)
 * @param distance - Yards to go
 */
export function bucketDownDistance(
  down: number,
  distance: number
): DownDistanceBucket {
  // Categorize distance
  let distanceCategory: "short" | "medium" | "long";
  if (distance <= 3) {
    distanceCategory = "short";
  } else if (distance <= 7) {
    distanceCategory = "medium";
  } else {
    distanceCategory = "long";
  }

  switch (down) {
    case 1:
      return "1st_10";
    case 2:
      return `2nd_${distanceCategory}` as DownDistanceBucket;
    case 3:
      return `3rd_${distanceCategory}` as DownDistanceBucket;
    case 4:
      return `4th_${distanceCategory}` as DownDistanceBucket;
    default:
      return "1st_10";
  }
}

/**
 * Bucket a yard line into field zone
 * @param yardLine - Yard line (0 = own goal line, 100 = opponent goal line)
 */
export function bucketFieldZone(yardLine: number): FieldZone {
  if (yardLine <= 10) return "backed_up";
  if (yardLine <= 49) return "own_territory";
  if (yardLine <= 60) return "plus_territory";
  if (yardLine <= 80) return "red_zone";
  return "goal_line";
}

/**
 * Validate an execution create payload
 * @param data - Raw execution data
 * @returns Validated ExecutionCreate or throws ZodError
 */
export function validateExecutionCreate(data: unknown): ExecutionCreate {
  return ExecutionCreateSchema.parse(data);
}

/**
 * Validate play data for analytics
 * @param data - Raw play data
 * @returns Validated PlayAnalyticsInput or throws ZodError
 */
export function validatePlayForAnalytics(data: unknown): PlayAnalyticsInput {
  return PlayAnalyticsInputSchema.parse(data);
}

// ============================================
// TYPE GUARDS
// ============================================

export function isValidExecutionResult(
  value: unknown
): value is ExecutionResult {
  return ExecutionResultSchema.safeParse(value).success;
}

export function isValidFieldZone(value: unknown): value is FieldZone {
  return FieldZoneSchema.safeParse(value).success;
}

export function isValidDownDistanceBucket(
  value: unknown
): value is DownDistanceBucket {
  return DownDistanceBucketSchema.safeParse(value).success;
}

// ============================================
// EXPORT ANALYTICS CONSTANTS
// ============================================

export const ANALYTICS_CONSTANTS = {
  /** Minimum executions before showing success rate */
  MIN_SAMPLE_FOR_RATE: 3,

  /** Executions needed for "reliable" analytics */
  RELIABLE_SAMPLE_SIZE: 10,

  /** Executions needed for "strong" confidence */
  STRONG_SAMPLE_SIZE: 30,

  /** Default confidence base for new plays */
  DEFAULT_CONFIDENCE: 70,

  /** Max plays to show in "top performers" */
  MAX_TOP_PLAYS: 10,

  /** Field zone thresholds (default, team can override) */
  DEFAULT_FIELD_ZONES: {
    backed_up: { min: 0, max: 10 },
    own_territory: { min: 11, max: 49 },
    plus_territory: { min: 50, max: 60 },
    red_zone: { min: 61, max: 80 },
    goal_line: { min: 81, max: 100 },
  },

  /** Distance thresholds for down/distance bucketing */
  DISTANCE_THRESHOLDS: {
    short: { min: 1, max: 3 },
    medium: { min: 4, max: 7 },
    long: { min: 8, max: Infinity },
  },
} as const;
