/**
 * Formation Sync Service
 *
 * Bidirectional synchronization between formations and plays.
 * Updates cascade from formation library to all plays using that formation.
 * Clean, focused, 200 lines max per design pattern.
 */

import { supabase } from "../../lib/supabase";
import { debug, error as logError } from "../../utils/logger";
import type { SyncResult } from "../../types/library";

interface PlayUpdate {
  formation?: string;
  f_type?: string;
  r_str?: string;
  p_str?: string;
  formation_id?: string | null;
}

export class FormationSyncService {
  /**
   * Sync formation metadata to all plays using it
   * Called when formation is updated in library
   */
  static async syncFormationToPlays(formationId: string): Promise<SyncResult> {
    // Get formation details including name for matching plays
    const { data: formation, error: formationError } = await supabase
      .from("formations")
      .select("*")
      .eq("id", formationId)
      .single();

    if (formationError || !formation) {
      return {
        success: false,
        affected_plays: 0,
        errors: [{ play_id: "N/A", error: "Formation not found" }],
        warnings: [],
      };
    }

    // Get all plays using this formation (match by name)
    const { data: plays, error: playsError } = await supabase
      .from("plays")
      .select("id, f_type, r_str, p_str")
      .eq("formation", formation.name)
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
        warnings: ["No plays using this formation"],
      };
    }

    // Prepare updates
    const updates: PlayUpdate = {};
    if (formation.formation_type) updates.f_type = formation.formation_type;
    if (formation.run_strength) updates.r_str = formation.run_strength;
    if (formation.pass_strength) updates.p_str = formation.pass_strength;

    // Update all plays
    const errors: Array<{ play_id: string; error: string }> = [];
    const warnings: string[] = [];

    for (const play of plays) {
      const { error } = await supabase
        .from("plays")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", play.id);

      if (error) {
        errors.push({ play_id: play.id, error: error.message });
      }
    }

    // Update usage count
    await supabase
      .from("formations")
      .update({ usage_count: plays.length })
      .eq("id", formationId);

    return {
      success: errors.length === 0,
      affected_plays: plays.length - errors.length,
      errors,
      warnings,
    };
  }

  /**
   * Sync play back to formation (update formation metadata from play changes)
   */
  static async syncPlayToFormation(playId: string): Promise<void> {
    // Get play details
    const { data: play, error: playError } = await supabase
      .from("plays")
      .select("formation, f_type, r_str, p_str")
      .eq("id", playId)
      .single();

    if (playError || !play || !play.formation) {
      return; // Nothing to sync
    }

    // Find formation by name
    const { data: formation } = await supabase
      .from("formations")
      .select("id")
      .eq("name", play.formation)
      .maybeSingle();

    if (formation) {
      // This could trigger re-analysis, but for now just log
      debug(
        `[FormationSyncService] Play ${playId} updated, may affect formation ${formation.id} intelligence`
      );
    }
  }

  /**
   * Get plays affected by a formation update
   */
  static async getAffectedPlays(formationId: string): Promise<
    Array<{
      id: string;
      play_name: string;
      formation: string;
      personnel: string | null;
    }>
  > {
    // Get formation name first
    const { data: formation, error: formationError } = await supabase
      .from("formations")
      .select("name")
      .eq("id", formationId)
      .single();

    if (formationError || !formation) {
      return [];
    }

    // Match plays by formation name
    const { data, error } = await supabase
      .from("plays")
      .select("id, play_name, formation, personnel")
      .eq("formation", formation.name)
      .eq("is_archived", false)
      .order("play_name");

    if (error) {
      logError("[FormationSyncService] Error fetching affected plays:", error);
      return [];
    }

    return data || [];
  }

  /**
   * Validate sync integrity (check for mismatches)
   */
  static async validateSync(formationId: string): Promise<{
    valid: boolean;
    mismatches: Array<{
      play_id: string;
      play_name: string;
      field: string;
      play_value: string;
      formation_value: string;
    }>;
  }> {
    // Get formation
    const { data: formation } = await supabase
      .from("formations")
      .select("formation_type, run_strength, pass_strength")
      .eq("id", formationId)
      .single();

    if (!formation) {
      return { valid: false, mismatches: [] };
    }

    // Get plays
    const { data: plays } = await supabase
      .from("plays")
      .select("id, play_name, f_type, r_str, p_str")
      .eq("formation_id", formationId)
      .eq("is_archived", false);

    if (!plays) {
      return { valid: true, mismatches: [] };
    }

    const mismatches: Array<{
      play_id: string;
      play_name: string;
      field: string;
      play_value: string;
      formation_value: string;
    }> = [];

    for (const play of plays) {
      // Check f_type
      if (
        formation.formation_type &&
        play.f_type &&
        play.f_type !== formation.formation_type
      ) {
        mismatches.push({
          play_id: play.id,
          play_name: play.play_name,
          field: "formation_type",
          play_value: play.f_type,
          formation_value: formation.formation_type,
        });
      }

      // Check run_strength
      if (
        formation.run_strength &&
        play.r_str &&
        play.r_str !== formation.run_strength
      ) {
        mismatches.push({
          play_id: play.id,
          play_name: play.play_name,
          field: "run_strength",
          play_value: play.r_str,
          formation_value: formation.run_strength,
        });
      }

      // Check pass_strength
      if (
        formation.pass_strength &&
        play.p_str &&
        play.p_str !== formation.pass_strength
      ) {
        mismatches.push({
          play_id: play.id,
          play_name: play.play_name,
          field: "pass_strength",
          play_value: play.p_str,
          formation_value: formation.pass_strength,
        });
      }
    }

    return {
      valid: mismatches.length === 0,
      mismatches,
    };
  }

  /**
   * Bulk sync all formations in a playbook
   */
  static async syncAllFormations(playbookId: string): Promise<{
    success: boolean;
    synced_formations: number;
    total_plays_updated: number;
    errors: string[];
  }> {
    const { data: formations } = await supabase
      .from("formations")
      .select("id, name")
      .eq("playbook_id", playbookId);

    if (!formations) {
      return {
        success: false,
        synced_formations: 0,
        total_plays_updated: 0,
        errors: ["No formations found"],
      };
    }

    let syncedCount = 0;
    let totalPlaysUpdated = 0;
    const errors: string[] = [];

    for (const formation of formations) {
      const result = await this.syncFormationToPlays(formation.id);
      if (result.success) {
        syncedCount++;
        totalPlaysUpdated += result.affected_plays;
      } else {
        errors.push(
          `${formation.name}: ${result.errors[0]?.error || "Unknown error"}`
        );
      }
    }

    return {
      success: errors.length === 0,
      synced_formations: syncedCount,
      total_plays_updated: totalPlaysUpdated,
      errors,
    };
  }
}
