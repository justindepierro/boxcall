/**
 * Playbook View Presets Service
 *
 * Manages server-backed playbook view presets with CRUD operations.
 * Handles filtering, creation, updates, and archiving of presets.
 */

import { supabase } from "../lib/supabase";
import { error as logError, info } from "../utils/logger";
import type {
  ServerPlaybookViewPreset,
  CreateServerPlaybookViewPresetInput,
  UpdateServerPlaybookViewPresetInput,
} from "../types/playbookViewPreset";

const TABLE = "playbook_view_presets";

export class PlaybookViewPresetsService {
  /**
   * List all presets, optionally filtered by team
   */
  static async listPresets(
    teamId?: string | null
  ): Promise<ServerPlaybookViewPreset[]> {
    try {
      info(`[PlaybookViewPresets] Listing presets${teamId ? ` for team ${teamId}` : ""}`);

      let query = supabase
        .from(TABLE)
        .select("*")
        .order("updated_at", { ascending: false });

      if (teamId) {
        query = query.eq("team_id", teamId);
      }

      const { data, error } = await query;

      if (error) {
        logError("[PlaybookViewPresets] Failed to list presets:", error);
        throw error;
      }

      return (data as ServerPlaybookViewPreset[]) || [];
    } catch (error) {
      logError("[PlaybookViewPresets] Error listing presets:", error);
      throw error;
    }
  }

  /**
   * Create a new preset
   */
  static async createPreset(
    input: CreateServerPlaybookViewPresetInput
  ): Promise<ServerPlaybookViewPreset> {
    try {
      info("[PlaybookViewPresets] Creating new preset:", input.name);

      const { data, error } = await supabase
        .from(TABLE)
        .insert({
          name: input.name,
          filters: input.filters,
          team_id: input.team_id ?? null,
        })
        .select()
        .single();

      if (error) {
        logError("[PlaybookViewPresets] Failed to create preset:", error);
        throw error;
      }

      return data as ServerPlaybookViewPreset;
    } catch (error) {
      logError("[PlaybookViewPresets] Error creating preset:", error);
      throw error;
    }
  }

  /**
   * Update an existing preset
   */
  static async updatePreset(
    input: UpdateServerPlaybookViewPresetInput
  ): Promise<ServerPlaybookViewPreset> {
    try {
      info("[PlaybookViewPresets] Updating preset:", input.id);

      const patch: Record<string, unknown> = {};
      if (input.name !== undefined) patch.name = input.name;
      if (input.filters !== undefined) patch.filters = input.filters;
      if (input.archived !== undefined) patch.archived = input.archived;

      const { data, error } = await supabase
        .from(TABLE)
        .update(patch)
        .eq("id", input.id)
        .select()
        .single();

      if (error) {
        logError("[PlaybookViewPresets] Failed to update preset:", error);
        throw error;
      }

      return data as ServerPlaybookViewPreset;
    } catch (error) {
      logError("[PlaybookViewPresets] Error updating preset:", error);
      throw error;
    }
  }

  /**
   * Delete a preset
   */
  static async deletePreset(id: string): Promise<void> {
    try {
      info("[PlaybookViewPresets] Deleting preset:", id);

      const { error } = await supabase
        .from(TABLE)
        .delete()
        .eq("id", id);

      if (error) {
        logError("[PlaybookViewPresets] Failed to delete preset:", error);
        throw error;
      }
    } catch (error) {
      logError("[PlaybookViewPresets] Error deleting preset:", error);
      throw error;
    }
  }

  /**
   * Archive a preset (soft delete)
   */
  static async archivePreset(id: string): Promise<ServerPlaybookViewPreset> {
    try {
      info("[PlaybookViewPresets] Archiving preset:", id);

      const { data, error } = await supabase
        .from(TABLE)
        .update({ archived: true })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        logError("[PlaybookViewPresets] Failed to archive preset:", error);
        throw error;
      }

      return data as ServerPlaybookViewPreset;
    } catch (error) {
      logError("[PlaybookViewPresets] Error archiving preset:", error);
      throw error;
    }
  }
}