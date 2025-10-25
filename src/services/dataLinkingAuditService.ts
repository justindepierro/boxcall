/**
 * Data Linking Audit Service
 *
 * Provides access to database audit views and consistency checks
 * for formation-personnel linking integrity.
 */

import { supabase } from "../lib/supabase";

export interface PlayMissingFormationLink {
  id: string;
  play_name: string;
  formation_text: string;
  playbook_id: string;
  matching_formation_id: string | null;
  matching_formation_name: string | null;
}

export interface PlayMissingPersonnelLink {
  id: string;
  play_name: string;
  personnel_text: string;
  playbook_id: string;
  matching_personnel_id: string | null;
  matching_personnel_name: string | null;
}

export interface FormationMissingPersonnel {
  id: string;
  name: string;
  playbook_id: string;
  category: string | null;
  direction: string | null;
  usage_count: number;
}

export interface OrphanedPersonnelConfig {
  id: string;
  name: string;
  playbook_id: string;
  play_count: number;
  formation_count: number;
}

export interface FormationVariantIssue {
  formation_id: string;
  formation_name: string;
  issue_type: "broken_link" | "personnel_mismatch" | "missing_opposite";
  issue_description: string;
}

export interface BatchLinkResult {
  play_id: string;
  play_name: string;
  formation_text: string;
  matched_formation_id: string;
  matched_formation_name: string;
  action: "WOULD UPDATE" | "UPDATED";
}

/**
 * Data Linking Audit Service
 */
export class DataLinkingAuditService {
  /**
   * Get plays missing formation_id link
   */
  static async getPlaysMissingFormationLink(
    playbookId?: string
  ): Promise<PlayMissingFormationLink[]> {
    let query = supabase.from("plays_missing_formation_link").select("*");

    if (playbookId) {
      query = query.eq("playbook_id", playbookId);
    }

    const { data, error } = await query;

    if (error) {
      console.error(
        "[DataLinkingAudit] Failed to fetch plays missing formation link:",
        error
      );
      return [];
    }

    return data as PlayMissingFormationLink[];
  }

  /**
   * Get plays missing personnel_id link
   */
  static async getPlaysMissingPersonnelLink(
    playbookId?: string
  ): Promise<PlayMissingPersonnelLink[]> {
    let query = supabase.from("plays_missing_personnel_link").select("*");

    if (playbookId) {
      query = query.eq("playbook_id", playbookId);
    }

    const { data, error } = await query;

    if (error) {
      console.error(
        "[DataLinkingAudit] Failed to fetch plays missing personnel link:",
        error
      );
      return [];
    }

    return data as PlayMissingPersonnelLink[];
  }

  /**
   * Get formations without personnel link
   */
  static async getFormationsMissingPersonnel(
    playbookId?: string
  ): Promise<FormationMissingPersonnel[]> {
    let query = supabase.from("formations_missing_personnel").select("*");

    if (playbookId) {
      query = query.eq("playbook_id", playbookId);
    }

    const { data, error } = await query;

    if (error) {
      console.error(
        "[DataLinkingAudit] Failed to fetch formations missing personnel:",
        error
      );
      return [];
    }

    return data as FormationMissingPersonnel[];
  }

  /**
   * Get orphaned personnel configurations
   */
  static async getOrphanedPersonnelConfigs(
    playbookId?: string
  ): Promise<OrphanedPersonnelConfig[]> {
    let query = supabase.from("orphaned_personnel_configs").select("*");

    if (playbookId) {
      query = query.eq("playbook_id", playbookId);
    }

    const { data, error } = await query;

    if (error) {
      console.error(
        "[DataLinkingAudit] Failed to fetch orphaned personnel configs:",
        error
      );
      return [];
    }

    return data as OrphanedPersonnelConfig[];
  }

  /**
   * Check formation variant consistency
   */
  static async checkFormationVariantConsistency(): Promise<
    FormationVariantIssue[]
  > {
    const { data, error } = await supabase.rpc(
      "check_formation_variant_consistency"
    );

    if (error) {
      console.error(
        "[DataLinkingAudit] Failed to check formation variant consistency:",
        error
      );
      return [];
    }

    return data as FormationVariantIssue[];
  }

  /**
   * Fix broken formation variant links
   */
  static async fixFormationVariantLinks(): Promise<
    {
      fixed_formation_id: string;
      fixed_formation_name: string;
      fix_description: string;
    }[]
  > {
    const { data, error } = await supabase.rpc("fix_formation_variant_links");

    if (error) {
      console.error(
        "[DataLinkingAudit] Failed to fix formation variant links:",
        error
      );
      throw error;
    }

    return data as {
      fixed_formation_id: string;
      fixed_formation_name: string;
      fix_description: string;
    }[];
  }

  /**
   * Batch link plays to formations (preview or apply)
   */
  static async batchLinkPlaysToFormations(
    playbookId: string | null = null,
    dryRun: boolean = true
  ): Promise<BatchLinkResult[]> {
    // @ts-expect-error - RPC function not in generated types yet
    const { data, error } = await supabase.rpc(
      "batch_link_plays_to_formations",
      {
        p_playbook_id: playbookId,
        dry_run: dryRun,
      }
    );

    if (error) {
      console.error(
        "[DataLinkingAudit] Failed to batch link plays to formations:",
        error
      );
      throw error;
    }

    return data as BatchLinkResult[];
  }

  /**
   * Batch link plays to personnel (preview or apply)
   */
  static async batchLinkPlaysToPersonnel(
    playbookId: string | null = null,
    dryRun: boolean = true
  ): Promise<BatchLinkResult[]> {
    // @ts-expect-error - RPC function not in generated types yet
    const { data, error } = await supabase.rpc(
      "batch_link_plays_to_personnel",
      {
        p_playbook_id: playbookId,
        dry_run: dryRun,
      }
    );

    if (error) {
      console.error(
        "[DataLinkingAudit] Failed to batch link plays to personnel:",
        error
      );
      throw error;
    }

    return data as BatchLinkResult[];
  }

  /**
   * Get comprehensive audit summary for a playbook
   */
  static async getAuditSummary(playbookId: string) {
    const [
      playsMissingFormation,
      playsMissingPersonnel,
      formationsMissingPersonnel,
      orphanedPersonnel,
      formationIssues,
    ] = await Promise.all([
      this.getPlaysMissingFormationLink(playbookId),
      this.getPlaysMissingPersonnelLink(playbookId),
      this.getFormationsMissingPersonnel(playbookId),
      this.getOrphanedPersonnelConfigs(playbookId),
      this.checkFormationVariantConsistency(),
    ]);

    // Filter formation issues by playbook
    const playbookFormationIssues = formationIssues.filter(() => {
      // We'd need to check if formation belongs to this playbook
      // For now, return all
      return true;
    });

    const totalIssues =
      playsMissingFormation.length +
      playsMissingPersonnel.length +
      formationsMissingPersonnel.length +
      orphanedPersonnel.length +
      playbookFormationIssues.length;

    return {
      totalIssues,
      playsMissingFormation,
      playsMissingPersonnel,
      formationsMissingPersonnel,
      orphanedPersonnel,
      formationIssues: playbookFormationIssues,
      hasIssues: totalIssues > 0,
    };
  }
}
