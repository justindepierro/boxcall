/**
 * Formation Library Service
 *
 * CRUD operations for formation management in the library system.
 * Clean, focused, 200 lines max per design pattern.
 */

import { supabase } from "../../lib/supabase";
import { logError } from "../../utils/logger";
import type { Json } from "../../types/database";
import type {
  Formation,
  FormationCreate,
  FormationUpdate,
} from "../../types/formation";
import type {
  LibraryFilterOptions,
  PaginatedLibraryResponse,
} from "../../types/library";

export class FormationLibraryService {
  private static applyFilters(
    query: any,
    filters: LibraryFilterOptions | undefined
  ): any {
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    if (filters?.min_usage) {
      query = query.gte("usage_count", filters.min_usage);
    }

    if (filters?.has_opposite !== undefined) {
      query = filters.has_opposite
        ? query.not("opposite_formation_id", "is", null)
        : query.is("opposite_formation_id", null);
    }

    if (filters?.confidence_min) {
      query = query.gte("confidence_score", filters.confidence_min);
    }

    return query;
  }

  private static applySorting(
    query: any,
    filters: LibraryFilterOptions | undefined
  ): any {
    let sortBy: string = filters?.sort_by || "name";
    if (sortBy === "usage") sortBy = "usage_count";
    if (sortBy === "confidence") sortBy = "confidence_score";

    const sortOrder = filters?.sort_order || "asc";
    return query.order(sortBy, { ascending: sortOrder === "asc" });
  }

  private static applyPagination(
    query: any,
    filters: LibraryFilterOptions | undefined
  ): { query: any; limit: number; offset: number } {
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    return {
      query: query.range(offset, offset + limit - 1),
      limit,
      offset,
    };
  }

  /**
   * Get all formations for a playbook
   */
  static async getFormations(
    playbookId: string,
    filters?: LibraryFilterOptions
  ): Promise<PaginatedLibraryResponse<Formation>> {
    let query = supabase
      .from("formations")
      .select("*", { count: "exact" })
      .eq("playbook_id", playbookId);

    query = FormationLibraryService.applyFilters(query, filters);
    query = FormationLibraryService.applySorting(query, filters);
    const pagination = FormationLibraryService.applyPagination(query, filters);
    query = pagination.query;
    const { limit, offset } = pagination;

    const { data, count, error } = await query;

    if (error) {
      logError("[FormationLibraryService] Error fetching formations:", error);
      throw new Error(`Failed to fetch formations: ${error.message}`);
    }

    return {
      items: (data || []) as Formation[],
      meta: {
        total: count || 0,
        limit,
        offset,
        has_more: (count || 0) > offset + limit,
      },
    };
  }

  /**
   * Get single formation by ID
   */
  static async getFormationById(id: string): Promise<Formation | null> {
    const { data, error } = await supabase
      .from("formations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      logError("[FormationLibraryService] Error fetching formation:", error);
      throw new Error(`Failed to fetch formation: ${error.message}`);
    }

    return data as Formation | null;
  }

  /**
   * Create new formation
   */
  static async createFormation(formation: FormationCreate): Promise<Formation> {
    const { data, error } = await supabase
      .from("formations")
      .insert({
        playbook_id: formation.playbook_id,
        name: formation.name,
        description: formation.description || null,
        formation_type: formation.formation_type || null,
        direction: formation.direction || null,
        run_strength: formation.run_strength || null,
        pass_strength: formation.pass_strength || null,
        strength_player_position: formation.strength_player_position || null,
        opposite_formation_id: formation.opposite_formation_id || null,
        is_standalone: formation.direction === null,
        player_positions: (formation.player_positions || []) as unknown as Json,
        personnel_packages: formation.personnel_packages || [],
        confidence_score: 0,
        analysis_play_count: 0,
      })
      .select()
      .single();

    if (error) {
      logError("[FormationLibraryService] Error creating formation:", error);
      throw new Error(`Failed to create formation: ${error.message}`);
    }

    return data as Formation;
  }

  /**
   * Update existing formation
   */
  static async updateFormation(
    id: string,
    updates: FormationUpdate
  ): Promise<Formation> {
    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Auto-set is_standalone based on direction
    if ("direction" in updates) {
      updateData.is_standalone = updates.direction === null;
    }

    const { data, error } = await supabase
      .from("formations")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logError("[FormationLibraryService] Error updating formation:", error);
      throw new Error(`Failed to update formation: ${error.message}`);
    }

    return data as Formation;
  }

  /**
   * Delete formation
   */
  static async deleteFormation(id: string): Promise<void> {
    const { error } = await supabase.from("formations").delete().eq("id", id);

    if (error) {
      logError("[FormationLibraryService] Error deleting formation:", error);
      throw new Error(`Failed to delete formation: ${error.message}`);
    }
  }

  /**
   * Link two formations as opposites
   */
  static async linkOpposites(
    formationId: string,
    oppositeId: string
  ): Promise<void> {
    // Update both formations to point to each other
    const { error: error1 } = await supabase
      .from("formations")
      .update({ opposite_formation_id: oppositeId })
      .eq("id", formationId);

    if (error1) {
      logError("[FormationLibraryService] Error linking formation:", error1);
      throw new Error(`Failed to link formation: ${error1.message}`);
    }

    const { error: error2 } = await supabase
      .from("formations")
      .update({ opposite_formation_id: formationId })
      .eq("id", oppositeId);

    if (error2) {
      logError("[FormationLibraryService] Error linking opposite:", error2);
      throw new Error(`Failed to link opposite formation: ${error2.message}`);
    }
  }

  /**
   * Unlink opposite formations
   */
  static async unlinkOpposites(formationId: string): Promise<void> {
    // Get the opposite formation ID first
    const formation = await this.getFormationById(formationId);
    if (!formation || !formation.opposite_formation_id) {
      return; // Nothing to unlink
    }

    const oppositeId = formation.opposite_formation_id;

    // Clear both links
    await Promise.all([
      supabase
        .from("formations")
        .update({ opposite_formation_id: null })
        .eq("id", formationId),
      supabase
        .from("formations")
        .update({ opposite_formation_id: null })
        .eq("id", oppositeId),
    ]);
  }

  /**
   * Get plays using a formation
   */
  static async getFormationPlays(formationId: string, limit = 10) {
    const { data, error } = await supabase
      .from("plays")
      .select("id, play_name, p_type, formation, personnel")
      .eq("formation_id", formationId)
      .eq("is_archived", false)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      logError(
        "[FormationLibraryService] Error fetching formation plays:",
        error
      );
      throw new Error(`Failed to fetch formation plays: ${error.message}`);
    }

    return data || [];
  }
}
