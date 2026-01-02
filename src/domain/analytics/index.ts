/**
 * Analytics Domain Module
 *
 * Professional-grade analytics for football coaches.
 * This module provides:
 *
 * 1. Data Contracts (analyticsContract.ts)
 *    - Zod schemas for all analytics data
 *    - Validation helpers
 *    - Type-safe interfaces
 *
 * 2. Health Service (analyticsHealthService.ts)
 *    - Data integrity checks
 *    - Orphan detection
 *    - Counter sync validation
 *    - Readiness checks
 *
 * 3. Coach Analytics (coachAnalytics.ts)
 *    - Tendency reports
 *    - Sample size warnings
 *    - Confidence indicators
 *    - Export-ready data
 *
 * Usage:
 * ```typescript
 * import {
 *   validateExecutionCreate,
 *   AnalyticsHealthService,
 *   CoachAnalytics,
 * } from '@domain/analytics';
 *
 * // Validate before writing
 * const validated = validateExecutionCreate(rawData);
 *
 * // Check data health
 * const health = await AnalyticsHealthService.runHealthCheck(teamId);
 *
 * // Get coach-ready insights
 * const tendencies = await CoachAnalytics.getTendencyReport(teamId);
 * ```
 */

// Data contracts and validation
export {
  // Schemas
  ExecutionResultSchema,
  FieldZoneSchema,
  DownDistanceBucketSchema,
  HashMarkSchema,
  PlayAnalyticsInputSchema,
  ExecutionCreateSchema,
  PlayStatsSchema,
  SituationalStatsSchema,
  FormationStatsSchema,
  AnalyticsDashboardSchema,
  // Types
  type ExecutionResult,
  type FieldZone,
  type DownDistanceBucket,
  type HashMark,
  type PlayAnalyticsInput,
  type ExecutionCreate,
  type PlayStats,
  type SituationalStats,
  type FormationStats,
  type AnalyticsDashboard,
  // Helpers
  getSampleSizeCategory,
  calculateSuccessRate,
  bucketDownDistance,
  bucketFieldZone,
  validateExecutionCreate,
  validatePlayForAnalytics,
  // Type guards
  isValidExecutionResult,
  isValidFieldZone,
  isValidDownDistanceBucket,
  // Constants
  ANALYTICS_CONSTANTS,
} from "./analyticsContract";
