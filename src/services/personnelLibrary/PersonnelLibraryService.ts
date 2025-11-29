/**
 * Personnel Library Service
 *
 * CRUD operations for personnel package management.
 * Clean, focused, 200 lines max per design pattern.
 */

import { supabase } from "../../lib/supabase";
import type {
  PersonnelConfiguration,
  CreatePersonnelConfiguration,
} from "../../types/personnel";
import type {
  LibraryFilterOptions,
  PaginatedLibraryResponse,
} from "../../types/library";

export class PersonnelLibraryService {
  /**
   * Get all personnel configurations for a playbook
   */
  static async getPersonnelConfigs(
    playbookId: string,
    filters?: LibraryFilterOptions
  ): Promise<PaginatedLibraryResponse<PersonnelConfiguration>> {
    let query = supabase
      .from("personnel_configurations")
      .select("*, players:personnel_players(*)", { count: "exact" })
      .eq("playbook_id", playbookId);

    // Apply filters
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    if (filters?.min_usage) {
      query = query.gte("usage_count", filters.min_usage);
    }

    if (filters?.confidence_min) {
      query = query.gte("confidence_score", filters.confidence_min);
    }

    // Sorting
    const sortBy = filters?.sort_by || "name";
    const sortOrder = filters?.sort_order || "asc";
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    // Pagination
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error(
        "[PersonnelLibraryService] Error fetching personnel:",
        error
      );
      throw new Error(`Failed to fetch personnel: ${error.message}`);
    }

    return {
      items: (data || []) as PersonnelConfiguration[],
      meta: {
        total: count || 0,
        limit,
        offset,
        has_more: (count || 0) > offset + limit,
      },
    };
  }

  /**
   * Get single personnel configuration by ID
   */
  static async getPersonnelById(
    id: string
  ): Promise<PersonnelConfiguration | null> {
    const { data, error } = await supabase
      .from("personnel_configurations")
      .select("*, players:personnel_players(*)")
      .eq("id", id)
      .single();

    if (error) {
      console.error(
        "[PersonnelLibraryService] Error fetching personnel:",
        error
      );
      throw new Error(`Failed to fetch personnel: ${error.message}`);
    }

    return data as PersonnelConfiguration | null;
  }

  /**
   * Create new personnel configuration
   */
  static async createPersonnel(
    config: CreatePersonnelConfiguration
  ): Promise<PersonnelConfiguration> {
    // Create configuration
    const { data: configData, error: configError } = await supabase
      .from("personnel_configurations")
      .insert({
        playbook_id: config.playbook_id,
        name: config.name,
        description: config.description || null,
        badgeCustomization: config.badgeCustomization || null,
        confidence_score: 0,
        analysis_play_count: 0,
        usage_count: 0,
      })
      .select()
      .single();

    if (configError) {
      console.error(
        "[PersonnelLibraryService] Error creating personnel:",
        configError
      );
      throw new Error(`Failed to create personnel: ${configError.message}`);
    }

    // Create players if provided
    if (config.players && config.players.length > 0) {
      const playersToInsert = config.players.map((p) => ({
        config_id: configData.id,
        player_position: p.player_position,
        label: p.label,
        sort_order: p.sort_order,
        is_wildcat_qb: p.is_wildcat_qb || false,
      }));

      const { error: playersError } = await supabase
        .from("personnel_players")
        .insert(playersToInsert);

      if (playersError) {
        console.error(
          "[PersonnelLibraryService] Error creating players:",
          playersError
        );
        // Rollback config creation
        await supabase
          .from("personnel_configurations")
          .delete()
          .eq("id", configData.id);
        throw new Error(`Failed to create players: ${playersError.message}`);
      }
    }

    // Fetch complete config with players
    return this.getPersonnelById(
      configData.id
    ) as Promise<PersonnelConfiguration>;
  }

  /**
   * Update personnel configuration
   */
  static async updatePersonnel(
    id: string,
    updates: Partial<CreatePersonnelConfiguration>
  ): Promise<PersonnelConfiguration> {
    const updateData: any = {
      name: updates.name,
      description: updates.description,
      badgeCustomization: updates.badgeCustomization,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("personnel_configurations")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(
        "[PersonnelLibraryService] Error updating personnel:",
        error
      );
      throw new Error(`Failed to update personnel: ${error.message}`);
    }

    // Update players if provided
    if (updates.players) {
      // Delete existing players
      await supabase.from("personnel_players").delete().eq("config_id", id);

      // Insert new players
      if (updates.players.length > 0) {
        const playersToInsert = updates.players.map((p) => ({
          config_id: id,
          player_position: p.player_position,
          label: p.label,
          sort_order: p.sort_order,
          is_wildcat_qb: p.is_wildcat_qb || false,
        }));

        await supabase.from("personnel_players").insert(playersToInsert);
      }
    }

    return this.getPersonnelById(id) as Promise<PersonnelConfiguration>;
  }

  /**
   * Delete personnel configuration
   */
  static async deletePersonnel(id: string): Promise<void> {
    const { error } = await supabase
      .from("personnel_configurations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        "[PersonnelLibraryService] Error deleting personnel:",
        error
      );
      throw new Error(`Failed to delete personnel: ${error.message}`);
    }
  }

  /**
   * Get plays using a personnel package
   */
  static async getPersonnelPlays(
    personnelName: string,
    playbookId: string,
    limit = 10
  ) {
    const { data, error } = await supabase
      .from("plays")
      .select("id, play_name, p_type, formation, personnel")
      .eq("playbook_id", playbookId)
      .eq("personnel", personnelName)
      .eq("is_archived", false)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error(
        "[PersonnelLibraryService] Error fetching personnel plays:",
        error
      );
      throw new Error(`Failed to fetch personnel plays: ${error.message}`);
    }

    return data || [];
  }
}
