/**
 * Formation Audit Utilities
 *
 * Identifies formations needing direction attention:
 * - Formations without opposite variants
 * - Incomplete formations from play builder
 * - Playbook completion statistics
 *
 * Part of Formation Direction Comprehensive Solution
 */

import { table } from "../data/supabase/db";
import type { Formation } from "../types/formation";
import { error as logError, warn, info } from "./logger";

/**
 * Issue types for formation direction audit
 */
export type FormationIssueType =
  | "missing_opposite" // Has direction but no opposite
  | "missing_direction" // Has opposite but no direction (edge case)
  | "both"; // Missing both direction and opposite

/**
 * Priority levels based on formation usage
 */
export type AuditPriority = "high" | "medium" | "low";

/**
 * Result of formation direction audit
 */
export interface FormationAuditResult {
  id: string;
  name: string;
  direction: string | null;
  opposite_formation_id: string | null;
  usage_count: number;
  player_positions: unknown[];
  issue: FormationIssueType;
  severity: AuditPriority;
}

/**
 * Playbook completion statistics for gamification
 */
export interface FormationCompletionStats {
  total: number;
  complete: number;
  needs_work: number;
  incomplete: number;
  with_directions: number;
  with_opposites: number;
  completionPercentage: number;
}

/**
 * Audit all formations in playbook for direction issues
 *
 * Returns formations that:
 * - Have direction but missing opposite variant
 * - Have opposite but missing direction (edge case)
 * - Missing both direction and opposite
 *
 * Results are sorted by usage count (high priority first)
 *
 * @param playbookId - UUID of playbook to audit
 * @returns Array of formations needing attention, sorted by priority
 */
export async function auditFormationDirections(
  playbookId: string
): Promise<FormationAuditResult[]> {
  // Fetch all formations with relevant fields
  const { data: formations, error } = await table("formations")
    .select(
      "id, name, direction, opposite_formation_id, usage_count, player_positions"
    )
    .eq("playbook_id", playbookId)
    .order("usage_count", { ascending: false });

  if (error) {
    logError("[FormationAudit] Failed to fetch formations:", error);
    throw new Error(`Audit failed: ${error.message}`);
  }

  if (!formations) {
    warn("[FormationAudit] No formations found for playbook:", playbookId);
    return [];
  }

  const results: FormationAuditResult[] = [];

  // Type assertion for Supabase result
  type FormationRow = {
    id: string;
    name: string;
    direction: string | null;
    opposite_formation_id: string | null;
    usage_count: number;
    player_positions: unknown[];
  };

  for (const formation of formations as unknown as FormationRow[]) {
    // NOTE: Temporarily disabled position check for testing
    // In production, you may want to skip formations without positions
    // const hasPositions = Array.isArray(formation.player_positions) &&
    //                     formation.player_positions.length > 0;
    //
    // if (!hasPositions) {
    //   debug('⏭️ [FormationAudit] Skipping empty formation:', formation.name);
    //   continue;
    // }

    const hasDirection = formation.direction !== null;
    const hasOpposite = formation.opposite_formation_id !== null;

    // Determine severity based on usage count
    let severity: AuditPriority = "low";
    if (formation.usage_count >= 10) {
      severity = "high";
    } else if (formation.usage_count >= 3) {
      severity = "medium";
    }

    // Identify issues
    // Case 1: Has direction but no opposite (most common)
    if (hasDirection && !hasOpposite) {
      results.push({
        id: formation.id,
        name: formation.name,
        direction: formation.direction,
        opposite_formation_id: formation.opposite_formation_id,
        usage_count: formation.usage_count,
        player_positions: formation.player_positions,
        issue: "missing_opposite",
        severity,
      });
    }
    // Case 2: Has opposite but no direction (edge case - shouldn't happen)
    else if (!hasDirection && hasOpposite) {
      results.push({
        id: formation.id,
        name: formation.name,
        direction: formation.direction,
        opposite_formation_id: formation.opposite_formation_id,
        usage_count: formation.usage_count,
        player_positions: formation.player_positions,
        issue: "missing_direction",
        severity,
      });
    }
    // Case 3: Missing both direction and opposite
    else if (!hasDirection && !hasOpposite) {
      results.push({
        id: formation.id,
        name: formation.name,
        direction: formation.direction,
        opposite_formation_id: formation.opposite_formation_id,
        usage_count: formation.usage_count,
        player_positions: formation.player_positions,
        issue: "both",
        severity,
      });
    }
    // Case 4: Has both direction and opposite - no issue!
  }

  info(
    `[FormationAudit] Found ${results.length} formations needing attention`,
    {
      high: results.filter((r) => r.severity === "high").length,
      medium: results.filter((r) => r.severity === "medium").length,
      low: results.filter((r) => r.severity === "low").length,
    }
  );

  return results;
}

/**
 * Get incomplete formations created via AddNewPlayModal
 *
 * Returns formations with:
 * - creation_source = 'play_builder'
 * - metadata_quality in ('needs_work', 'incomplete')
 *
 * Sorted by most recently created first
 *
 * @param playbookId - UUID of playbook to query
 * @returns Array of incomplete formations
 */
export async function getIncompleteFormations(
  playbookId: string
): Promise<Formation[]> {
  // PERFORMANCE: Only select fields needed for Incomplete panel display
  const { data, error } = await table("formations")
    .select(
      `
      id,
      name,
      direction,
      category,
      personnel_name,
      personnel_packages,
      formation_type,
      tags,
      description,
      usage_count,
      metadata_quality,
      created_at
    `
    )
    .eq("playbook_id", playbookId)
    .eq("creation_source", "play_builder")
    .in("metadata_quality", ["needs_work", "incomplete"])
    .order("created_at", { ascending: false });

  if (error) {
    logError("[FormationAudit] Failed to fetch incomplete formations:", error);
    throw new Error(`Failed to fetch incomplete formations: ${error.message}`);
  }

  info(`[FormationAudit] Found ${data?.length || 0} incomplete formations`);

  return (data as unknown as Formation[]) || [];
}

/**
 * Calculate playbook completion statistics for gamification
 *
 * Returns aggregate stats:
 * - Total formations
 * - Count by metadata quality (complete, needs_work, incomplete)
 * - Count with directions
 * - Count with opposite variants
 * - Overall completion percentage
 *
 * @param playbookId - UUID of playbook to analyze
 * @returns Completion statistics object
 */
export async function getFormationCompletionStats(
  playbookId: string
): Promise<FormationCompletionStats> {
  const { data: formations, error } = await table("formations")
    .select("metadata_quality, direction, opposite_formation_id")
    .eq("playbook_id", playbookId);

  if (error) {
    logError("[FormationAudit] Failed to fetch stats:", error);
    throw new Error(`Stats calculation failed: ${error.message}`);
  }

  // Type assertion for Supabase result
  type StatsRow = {
    metadata_quality: string | null;
    direction: string | null;
    opposite_formation_id: string | null;
  };

  // Calculate counts
  const total = formations?.length || 0;
  const complete =
    (formations as unknown as StatsRow[])?.filter(
      (f) => f.metadata_quality === "complete"
    ).length || 0;
  const needs_work =
    (formations as unknown as StatsRow[])?.filter(
      (f) => f.metadata_quality === "needs_work"
    ).length || 0;
  const incomplete =
    (formations as unknown as StatsRow[])?.filter(
      (f) => f.metadata_quality === "incomplete"
    ).length || 0;
  const with_directions =
    (formations as unknown as StatsRow[])?.filter((f) => f.direction !== null)
      .length || 0;
  const with_opposites =
    (formations as unknown as StatsRow[])?.filter(
      (f) => f.opposite_formation_id !== null
    ).length || 0;

  // Calculate completion percentage
  const completionPercentage =
    total > 0 ? Math.round((complete / total) * 100) : 0;

  const stats: FormationCompletionStats = {
    total,
    complete,
    needs_work,
    incomplete,
    with_directions,
    with_opposites,
    completionPercentage,
  };

  info("[FormationAudit] Completion stats:", stats);

  return stats;
}

/**
 * Get formations grouped by priority for UI display
 *
 * Convenience function that groups audit results by severity
 *
 * @param playbookId - UUID of playbook to audit
 * @returns Object with formations grouped by priority level
 */
export async function getFormationsByPriority(playbookId: string): Promise<{
  high: FormationAuditResult[];
  medium: FormationAuditResult[];
  low: FormationAuditResult[];
}> {
  const results = await auditFormationDirections(playbookId);

  return {
    high: results.filter((r) => r.severity === "high"),
    medium: results.filter((r) => r.severity === "medium"),
    low: results.filter((r) => r.severity === "low"),
  };
}

/**
 * Check if a specific formation needs direction attention
 *
 * @param formationId - UUID of formation to check
 * @returns true if formation needs attention, false otherwise
 */
export async function formationNeedsAttention(
  formationId: string
): Promise<boolean> {
  const { data: formation, error } = await table("formations")
    .select("direction, opposite_formation_id, player_positions")
    .eq("id", formationId)
    .single();

  if (error || !formation) {
    return false;
  }

  // Type assertion for Supabase result
  type CheckRow = {
    direction: string | null;
    opposite_formation_id: string | null;
    player_positions: unknown[];
  };

  const formationData = formation as unknown as CheckRow;

  // Check if has positions (not empty)
  const hasPositions =
    Array.isArray(formationData.player_positions) &&
    formationData.player_positions.length > 0;

  if (!hasPositions) {
    return false;
  }

  // Needs attention if has direction but no opposite
  const hasDirection = formationData.direction !== null;
  const hasOpposite = formationData.opposite_formation_id !== null;

  return hasDirection && !hasOpposite;
}
