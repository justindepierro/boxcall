/**
 * Personnel Sync Service
 *
 * Bidirectional synchronization between personnel packages and plays.
 * Updates cascade from personnel library to all plays using that package.
 * Clean, focused, 150 lines max per design pattern.
 */

import { supabase } from "../../lib/supabase";
import type { SyncResult } from "../../types/library";

export class PersonnelSyncService {
  /**
   * Sync personnel badge customization to all plays using it
   */
  static async syncPersonnelToPlays(personnelId: string): Promise<SyncResult> {
    // Get personnel details
    const { data: personnel, error: personnelError } = await supabase
      .from("personnel_configurations")
      .select("*")
      .eq("id", personnelId)
      .single();

    if (personnelError || !personnel) {
      return {
        success: false,
        affected_plays: 0,
        errors: [{ play_id: "N/A", error: "Personnel configuration not found" }],
        warnings: [],
      };
    }

    // Get all plays using this personnel
    const { data: plays, error: playsError } = await supabase
      .from("plays")
      .select("id, personnel")
      .eq("playbook_id", personnel.playbook_id)
      .eq("personnel", personnel.name)
      .eq("is_archived", false);

    if (playsError) {
      return {
        success: false,
        affected_plays: 0,
        errors: [{ play_id: "N/A", error: playsError.message }],
        warnings: [],
      };
    }

    if (!plays || plays.length === 0) {
      return {
        success: true,
        affected_plays: 0,
        errors: [],
        warnings: ["No plays using this personnel package"],
      };
    }

    // Update usage count
    await supabase
      .from("personnel_configurations")
      .update({ usage_count: plays.length })
      .eq("id", personnelId);

    return {
      success: true,
      affected_plays: plays.length,
      errors: [],
      warnings: [],
    };
  }

  /**
   * Get plays affected by a personnel update
   */
  static async getAffectedPlays(personnelId: string): Promise<
    Array<{
      id: string;
      play_name: string;
      formation: string;
      personnel: string | null;
    }>
  > {
    // Get personnel config
    const { data: personnel } = await supabase
      .from("personnel_configurations")
      .select("name, playbook_id")
      .eq("id", personnelId)
      .single();

    if (!personnel) return [];

    const { data, error } = await supabase
      .from("plays")
      .select("id, play_name, formation, personnel")
      .eq("playbook_id", personnel.playbook_id)
      .eq("personnel", personnel.name)
      .eq("is_archived", false)
      .order("play_name");

    if (error) {
      console.error("[PersonnelSyncService] Error fetching affected plays:", error);
      return [];
    }

    return data || [];
  }

  /**
   * Update usage counts for all personnel in a playbook
   */
  static async updateAllUsageCounts(playbookId: string): Promise<{
    success: boolean;
    updated_count: number;
    errors: string[];
  }> {
    const { data: personnelConfigs } = await supabase
      .from("personnel_configurations")
      .select("id, name")
      .eq("playbook_id", playbookId);

    if (!personnelConfigs) {
      return {
        success: false,
        updated_count: 0,
        errors: ["No personnel configurations found"],
      };
    }

    let updatedCount = 0;
    const errors: string[] = [];

    for (const config of personnelConfigs) {
      // Count plays using this personnel
      const { count, error } = await supabase
        .from("plays")
        .select("id", { count: "exact", head: true })
        .eq("playbook_id", playbookId)
        .eq("personnel", config.name)
        .eq("is_archived", false);

      if (error) {
        errors.push(`${config.name}: ${error.message}`);
        continue;
      }

      // Update usage count
      await supabase
        .from("personnel_configurations")
        .update({ usage_count: count || 0 })
        .eq("id", config.id);

      updatedCount++;
    }

    return {
      success: errors.length === 0,
      updated_count: updatedCount,
      errors,
    };
  }

  /**
   * Analyze personnel usage from plays
   */
  static async analyzePersonnelUsage(playbookId: string): Promise<
    Array<{
      personnel_name: string;
      play_count: number;
      has_config: boolean;
    }>
  > {
    // Get all plays grouped by personnel
    const { data: plays } = await supabase
      .from("plays")
      .select("personnel")
      .eq("playbook_id", playbookId)
      .eq("is_archived", false)
      .not("personnel", "is", null);

    if (!plays) return [];

    // Count by personnel
    const counts = new Map<string, number>();
    for (const play of plays) {
      if (play.personnel) {
        counts.set(play.personnel, (counts.get(play.personnel) || 0) + 1);
      }
    }

    // Get existing configs
    const { data: configs } = await supabase
      .from("personnel_configurations")
      .select("name")
      .eq("playbook_id", playbookId);

    const configNames = new Set((configs || []).map((c) => c.name));

    // Build result
    return Array.from(counts.entries()).map(([name, count]) => ({
      personnel_name: name,
      play_count: count,
      has_config: configNames.has(name),
    }));
  }
}
