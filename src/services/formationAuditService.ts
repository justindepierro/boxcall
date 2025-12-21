/**
 * Formation Audit Service
 *
 * Provides formation auditing capabilities for playbooks:
 * - Identifies formations missing direction/opposite variants
 * - Analyzes formation usage patterns
 * - Provides audit results for playbook health
 */

import { table } from "../data/supabase/db";
import { error as logError, warn, info } from "../utils/logger";

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
  formationId: string;
  formationName: string;
  issueType: FormationIssueType;
  priority: AuditPriority;
  usageCount: number;
  hasDirection: boolean;
  hasOpposite: boolean;
  suggestions?: string[];
}

/**
 * Summary of formation audit results
 */
export interface FormationAuditSummary {
  totalFormations: number;
  issuesFound: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  needsMapping: number;
}

export class FormationAuditService {
  /**
   * Audit formation directions for a playbook
   *
   * Identifies formations that:
   * - Have direction but missing opposite variant
   * - Have opposite but missing direction (edge case)
   * - Missing both direction and opposite
   *
   * Results are sorted by usage count (high priority first)
   *
   * @param playbookId - UUID of playbook to audit
   * @returns Array of formations needing attention, sorted by priority
   */
  static async auditFormationDirections(
    playbookId: string
  ): Promise<FormationAuditResult[]> {
    info(`[FormationAudit] Starting audit for playbook: ${playbookId}`);

    // Fetch all formations with relevant fields (using current schema)
    const { data: formations, error } = await table("formations")
      .select(
        "id, name, diagram_data, personnel_packages, playbook_id, created_at"
      )
      .eq("playbook_id", playbookId)
      .order("created_at", { ascending: false }); // No usage_count in current schema

    if (error) {
      logError("[FormationAudit] Failed to fetch formations:", error);
      throw new Error(`Audit failed: ${error.message}`);
    }

    if (!formations) {
      warn("[FormationAudit] No formations found for playbook:", playbookId);
      return [];
    }

    const results: FormationAuditResult[] = [];

    for (const formation of formations) {
      // Current schema doesn't have direction/opposite fields
      // For now, we'll mark all formations as having both (no issues)
      // TODO: Implement proper audit once direction/opposite fields are added to schema
      const hasDirection = true; // Placeholder
      const hasOpposite = true; // Placeholder

      // Skip formations that have both direction and opposite (all for now)
      if (hasDirection && hasOpposite) {
        continue;
      }

      // Determine issue type (won't trigger with current placeholders)
      let issueType: FormationIssueType;
      if (!hasDirection && !hasOpposite) {
        issueType = "both";
      } else if (hasDirection && !hasOpposite) {
        issueType = "missing_opposite";
      } else {
        issueType = "missing_direction";
      }

      // Determine severity based on creation date (newer = higher priority)
      // TODO: Replace with usage_count once added to schema
      const daysSinceCreation =
        (Date.now() - new Date(formation.created_at || Date.now()).getTime()) /
        (1000 * 60 * 60 * 24);
      let priority: AuditPriority = "low";
      if (daysSinceCreation < 7) {
        // Created within last week
        priority = "high";
      } else if (daysSinceCreation < 30) {
        // Created within last month
        priority = "medium";
      }

      results.push({
        formationId: formation.id,
        formationName: formation.name,
        issueType,
        priority,
        usageCount: 0, // TODO: Add usage_count to schema
        hasDirection,
        hasOpposite,
        suggestions: this.generateSuggestions(issueType, formation.name),
      });
    }

    // Sort by priority (high first), then by usage count
    results.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.usageCount - a.usageCount;
    });

    info(`[FormationAudit] Completed audit: ${results.length} issues found`);
    return results;
  }

  /**
   * Get audit summary for a playbook
   */
  static async getAuditSummary(
    playbookId: string
  ): Promise<FormationAuditSummary> {
    const results = await this.auditFormationDirections(playbookId);

    const summary: FormationAuditSummary = {
      totalFormations: 0, // We'll need to fetch this separately
      issuesFound: results.length,
      highPriority: results.filter((r) => r.priority === "high").length,
      mediumPriority: results.filter((r) => r.priority === "medium").length,
      lowPriority: results.filter((r) => r.priority === "low").length,
      needsMapping: results.filter((r) => r.issueType === "both").length,
    };

    // Get total formations count
    const { count } = await table("formations")
      .select("*", { count: "exact", head: true })
      .eq("playbook_id", playbookId);

    summary.totalFormations = count || 0;

    return summary;
  }

  /**
   * Generate suggestions for fixing formation issues
   */
  private static generateSuggestions(
    issueType: FormationIssueType,
    formationName: string
  ): string[] {
    const suggestions: string[] = [];

    switch (issueType) {
      case "missing_opposite":
        suggestions.push(`Create opposite variant of "${formationName}"`);
        suggestions.push("Use Formation Builder to create mirrored formation");
        break;
      case "missing_direction":
        suggestions.push(`Add direction to "${formationName}" (left/right)`);
        suggestions.push("Specify which side this formation is for");
        break;
      case "both":
        suggestions.push(
          `Complete "${formationName}" with direction and opposite`
        );
        suggestions.push("Use Formation Builder to create both variants");
        break;
    }

    return suggestions;
  }
}
