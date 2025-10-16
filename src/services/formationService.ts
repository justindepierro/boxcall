/**
 * Formation Service
 *
 * Handles all CRUD operations for formations with:
 * - Personnel integration
 * - Left/Right variant creation
 * - Position flipping logic
 * - Usage tracking
 *
 * Everything is connected! Formations → Personnel → Plays
 */

import { supabase } from "../lib/supabase";
import type {
  Formation,
  FormationCreate,
  FormationUpdate,
  FormationPlayerPosition,
  FormationListItem,
  StrengthType,
  FormationValidation,
} from "../types/formation";

/**
 * Field width constant for position flipping
 */
const FIELD_WIDTH = 53.3; // yards (standard football field width)

/**
 * Formation Service Class
 */
export class FormationService {
  // ===================================================================
  // CREATE OPERATIONS
  // ===================================================================

  /**
   * Create a new formation
   */
  static async createFormation(data: FormationCreate): Promise<Formation> {
    // Validate before creating
    const validation = this.validateFormationData(data);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    const { data: formation, error } = await supabase
      .from("formations")
      .insert([
        {
          playbook_id: data.playbook_id,
          name: data.name,
          description: data.description || null,
          category: data.category || null,
          personnel_id: data.personnel_id || null,
          personnel_name: data.personnel_name || null,
          direction: data.direction || null,
          opposite_formation_id: data.opposite_formation_id || null,
          strength_player_position: data.strength_player_position || null,
          strength_player_label: data.strength_player_label || null,
          formation_type: data.formation_type || null,
          run_strength: data.run_strength || "balanced",
          pass_strength: data.pass_strength || "balanced",
          player_positions: data.player_positions as unknown,
          tags: data.tags || [],
          is_custom: data.is_custom !== undefined ? data.is_custom : true,
          // NEW: Creation tracking (defaults handled by DB trigger if not provided)
          creation_source: data.creation_source || "unknown",
          creation_context: data.creation_context || {},
        } as never,
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating formation:", error);
      throw new Error(`Failed to create formation: ${error.message}`);
    }

    return formation as Formation;
  }

  /**
   * Flip formation strength (left ↔ right, balanced stays balanced)
   * Used when creating opposite formations
   */
  static flipStrength(strength: StrengthType): StrengthType {
    switch (strength) {
      case "left":
        return "right";
      case "right":
        return "left";
      case "balanced":
        return "balanced";
      default:
        return "balanced";
    }
  }

  // ===================================================================
  // READ OPERATIONS
  // ===================================================================

  /**
   * Get formation by ID
   */
  static async getFormationById(id: string): Promise<Formation> {
    const { data, error } = await supabase
      .from("formations")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      throw new Error(`Formation not found: ${id}`);
    }

    return data as Formation;
  }

  /**
   * Get all formations for a playbook
   */
  static async getFormationsByPlaybook(
    playbookId: string
  ): Promise<Formation[]> {
    const { data, error } = await supabase
      .from("formations")
      .select("*")
      .eq("playbook_id", playbookId)
      .order("name", { ascending: true });

    if (error) {
      console.error("❌ [FormationService] Error fetching formations:", error);
      throw new Error(`Failed to fetch formations: ${error.message}`);
    }

    console.log(
      "✅ [FormationService] Returning",
      (data as Formation[])?.length || 0,
      "formations"
    );
    return (data as Formation[]) || [];
  }

  /**
   * Get formations list (optimized for UI display)
   */
  static async getFormationsListByPlaybook(
    playbookId: string
  ): Promise<FormationListItem[]> {
    const formations = await this.getFormationsByPlaybook(playbookId);

    return formations.map((f) => ({
      id: f.id,
      name: f.name,
      category: f.category,
      personnel_name: f.personnel_name,
      direction: f.direction,
      usage_count: f.usage_count,
      has_variants: f.opposite_formation_id !== null, // Has opposite formation
    }));
  }

  /**
   * Get formations filtered by personnel
   */
  static async getFormationsByPersonnel(
    playbookId: string,
    personnelId: string
  ): Promise<Formation[]> {
    const { data, error } = await supabase
      .from("formations")
      .select("*")
      .eq("playbook_id", playbookId)
      .eq("personnel_id", personnelId)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching formations by personnel:", error);
      throw new Error(`Failed to fetch formations: ${error.message}`);
    }

    return (data as Formation[]) || [];
  }

  // ===================================================================
  // OPPOSITE FORMATION OPERATIONS (Simplified System)
  // ===================================================================

  /**
   * Check if formation has an opposite-side variant
   * @returns true if formation has opposite linked
   */
  static async hasOppositeFormation(formationId: string): Promise<boolean> {
    const formation = await this.getFormationById(formationId);
    return formation.opposite_formation_id !== null;
  }

  /**
   * Get opposite-side formation (if exists)
   * @returns opposite formation or null
   */
  static async getOppositeFormation(
    formationId: string
  ): Promise<Formation | null> {
    const formation = await this.getFormationById(formationId);

    if (!formation.opposite_formation_id) {
      return null;
    }

    return this.getFormationById(formation.opposite_formation_id);
  }

  /**
   * Create opposite-side formation
   * Automatically flips positions and strengths
   * @returns newly created opposite formation
   */
  static async createOppositeFormation(
    formationId: string
  ): Promise<Formation> {
    const original = await this.getFormationById(formationId);

    // Check if opposite already exists
    if (original.opposite_formation_id) {
      throw new Error("Formation already has an opposite");
    }

    // Determine directions
    const originalDirection = original.direction || "left";
    const oppositeDirection = originalDirection === "left" ? "right" : "left";

    // Flip positions
    const flippedPositions = this.flipPositions(original.player_positions);

    // Create opposite formation
    const opposite = await this.createFormation({
      playbook_id: original.playbook_id,
      name: original.name,
      description: original.description || undefined,
      category: original.category || undefined,
      personnel_id: original.personnel_id || undefined,
      personnel_name: original.personnel_name || undefined,
      personnel_packages: original.personnel_packages,
      direction: oppositeDirection,
      formation_type: original.formation_type || undefined,
      run_strength: this.flipStrength(original.run_strength),
      pass_strength: this.flipStrength(original.pass_strength),
      player_positions: flippedPositions,
      tags: original.tags,
      is_custom: original.is_custom,
      creation_source: "formation_builder", // Created via automatic prompt
      creation_context: {
        source_formation_id: original.id,
        auto_created: true,
      },
    });

    // Link both formations using database RPC function (bidirectional)
    const { error } = await supabase.rpc("link_formations_bidirectional", {
      formation1_id: original.id,
      formation2_id: opposite.id,
      formation1_direction: originalDirection,
      formation2_direction: oppositeDirection,
    } as never);

    if (error) {
      // Clean up created formation if linking fails
      await this.deleteFormation(opposite.id);
      throw new Error(`Failed to link formations: ${error.message}`);
    }

    return opposite;
  }

  /**
   * Mark formation as standalone (no opposite needed)
   * Sets direction to NULL
   */
  static async markAsStandalone(formationId: string): Promise<void> {
    const { error } = await supabase
      .from("formations")
      .update({
        direction: null,
        opposite_formation_id: null,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", formationId);

    if (error) {
      throw new Error(`Failed to mark as standalone: ${error.message}`);
    }
  }

  /**
   * Link two existing formations as opposites
   * Uses database RPC function for atomic bidirectional linking
   */
  static async linkExistingFormations(
    formation1Id: string,
    formation2Id: string
  ): Promise<void> {
    const f1 = await this.getFormationById(formation1Id);
    const f2 = await this.getFormationById(formation2Id);

    // Validation
    if (f1.playbook_id !== f2.playbook_id) {
      throw new Error("Formations must be in same playbook");
    }

    if (f1.opposite_formation_id || f2.opposite_formation_id) {
      throw new Error("One or both formations already linked");
    }

    // Determine directions (infer or use existing)
    const f1Direction = f1.direction || "left";
    const f2Direction = f2.direction || "right";

    // Ensure opposite directions
    if (f1Direction === f2Direction) {
      throw new Error("Formations must have opposite directions to link");
    }

    // Use database RPC for atomic linking
    const { error } = await supabase.rpc("link_formations_bidirectional", {
      formation1_id: formation1Id,
      formation2_id: formation2Id,
      formation1_direction: f1Direction,
      formation2_direction: f2Direction,
    } as never);

    if (error) {
      throw new Error(`Failed to link formations: ${error.message}`);
    }
  }

  /**
   * Unlink formation from its opposite
   * Uses database RPC function for atomic bidirectional unlinking
   */
  static async unlinkFormation(formationId: string): Promise<void> {
    const formation = await this.getFormationById(formationId);

    if (!formation.opposite_formation_id) {
      throw new Error("Formation is not linked");
    }

    // Use database RPC for atomic unlinking
    const { error } = await supabase.rpc("unlink_formations_bidirectional", {
      formation_id: formationId,
    } as never);

    if (error) {
      throw new Error(`Failed to unlink formation: ${error.message}`);
    }
  }

  // ===================================================================
  // UPDATE OPERATIONS
  // ===================================================================

  /**
   * Update formation
   */
  static async updateFormation(
    id: string,
    updates: FormationUpdate
  ): Promise<Formation> {
    const { data, error } = await supabase
      .from("formations")
      .update(updates as never)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating formation:", error);
      throw new Error(`Failed to update formation: ${error.message}`);
    }

    return data as Formation;
  }

  /**
   * Update player positions
   */
  static async updatePlayerPositions(
    id: string,
    positions: FormationPlayerPosition[]
  ): Promise<Formation> {
    return this.updateFormation(id, { player_positions: positions });
  }

  /**
   * Set strength player
   */
  static async setStrengthPlayer(
    id: string,
    position: string,
    label: string
  ): Promise<Formation> {
    // First, clear isStrengthSetter from all players
    const formation = await this.getFormationById(id);
    const updatedPositions = formation.player_positions.map((p) => ({
      ...p,
      isStrengthSetter: p.position === position,
    }));

    return this.updateFormation(id, {
      strength_player_position: position,
      strength_player_label: label,
      player_positions: updatedPositions,
    });
  }

  /**
   * Link formation to personnel
   */
  static async linkToPersonnel(
    formationId: string,
    personnelId: string,
    personnelName: string
  ): Promise<Formation> {
    return this.updateFormation(formationId, {
      personnel_id: personnelId,
      personnel_name: personnelName,
    });
  }

  // ===================================================================
  // DELETE OPERATIONS
  // ===================================================================

  /**
   * Check where a formation is being used
   * Returns count of plays referencing this formation
   * @param id - Formation UUID
   * @returns Object with playsCount
   */
  static async checkFormationUsage(
    id: string
  ): Promise<{ playsCount: number }> {
    try {
      // Check plays using this formation (via formation_id FK)
      const { count: playsCount, error: playsError } = await supabase
        .from("plays")
        .select("*", { count: "exact", head: true })
        .eq("formation_id", id);

      if (playsError) throw playsError;

      return {
        playsCount: playsCount || 0,
      };
    } catch (error) {
      console.error("Failed to check formation usage:", error);
      throw error;
    }
  }

  /**
   * Delete formation
   * Note: Will cascade delete variants if deleting base formation
   */
  static async deleteFormation(id: string): Promise<void> {
    const { error } = await supabase.from("formations").delete().eq("id", id);

    if (error) {
      console.error("Error deleting formation:", error);
      throw new Error(`Failed to delete formation: ${error.message}`);
    }
  }

  /**
   * Delete formation and its opposite (if linked)
   */
  static async deleteFormationWithOpposite(
    formationId: string
  ): Promise<void> {
    // Get the formation
    const formation = await this.getFormationById(formationId);

    // If it has an opposite, delete opposite first
    if (formation.opposite_formation_id) {
      await this.deleteFormation(formation.opposite_formation_id);
    }

    // Delete the formation itself
    await this.deleteFormation(formationId);
  }

  // ===================================================================
  // UTILITY OPERATIONS
  // ===================================================================

  /**
   * Duplicate formation
   */
  static async duplicateFormation(
    id: string,
    newName: string
  ): Promise<Formation> {
    const original = await this.getFormationById(id);

    return this.createFormation({
      playbook_id: original.playbook_id,
      name: newName,
      description: original.description || undefined,
      category: original.category || undefined,
      personnel_id: original.personnel_id || undefined,
      personnel_name: original.personnel_name || undefined,
      direction: null, // New duplicate is standalone (no opposite)
      strength_player_position: original.strength_player_position || undefined,
      strength_player_label: original.strength_player_label || undefined,
      player_positions: JSON.parse(JSON.stringify(original.player_positions)), // Deep clone
      tags: [...original.tags],
      is_custom: true,
    });
  }

  /**
   * Flip formation positions horizontally
   * Used for creating Left/Right variants
   */
  static flipPositions(
    positions: FormationPlayerPosition[]
  ): FormationPlayerPosition[] {
    return positions.map((p) => ({
      ...p,
      x: FIELD_WIDTH - p.x, // Flip X coordinate
    }));
  }

  /**
   * Validate formation data before save
   */
  static validateFormationData(data: FormationCreate): FormationValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!data.playbook_id) errors.push("playbook_id is required");
    if (!data.name || data.name.trim() === "") errors.push("name is required");
    if (!data.player_positions || data.player_positions.length === 0) {
      errors.push("player_positions cannot be empty");
    }

    // Name validation
    if (data.name && data.name.length > 100) {
      errors.push("name cannot exceed 100 characters");
    }

    // Player position validation
    if (data.player_positions) {
      data.player_positions.forEach((p, index) => {
        if (!p.position)
          errors.push(`Player ${index + 1}: position is required`);
        if (p.x < 0 || p.x > FIELD_WIDTH) {
          errors.push(
            `Player ${index + 1}: x must be between 0 and ${FIELD_WIDTH}`
          );
        }
        if (p.y < 0 || p.y > 50) {
          errors.push(`Player ${index + 1}: y must be between 0 and 50`);
        }
      });

      // Check for duplicate positions
      const positions = data.player_positions.map((p) => p.position);
      const duplicates = positions.filter((p, i) => positions.indexOf(p) !== i);
      if (duplicates.length > 0) {
        warnings.push(`Duplicate position codes: ${duplicates.join(", ")}`);
      }
    }

    // Strength player validation
    if (data.strength_player_position) {
      const hasStrengthPlayer = data.player_positions.some(
        (p) => p.position === data.strength_player_position
      );
      if (!hasStrengthPlayer) {
        errors.push(
          `Strength player position "${data.strength_player_position}" not found in player_positions`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ===================================================================
  // BULK OPERATIONS
  // ===================================================================

  /**
   * Import formations from existing plays
   *
   * Creates formation records from unique formation names in the plays table.
   * Useful for migrating legacy data where plays have formation text but no formation records.
   *
   * @param teamIdOrPlaybookId - Can be either team_id or playbook_id
   * @param createdBy - User ID of the creator
   * @returns Number of formations created
   */
  static async importFormationsFromPlays(
    teamIdOrPlaybookId: string,
    createdBy: string
  ): Promise<{ created: number; existing: number; formations: Formation[] }> {
    console.log("📦 importFormationsFromPlays called with:", {
      teamIdOrPlaybookId,
      createdBy,
    });

    // First, try to find the playbook for this team
    let playbookId = teamIdOrPlaybookId;

    // Check if this is a team_id by trying to find a playbook
    const { data: playbooks } = await supabase
      .from("playbooks")
      .select("id")
      .eq("team_id", teamIdOrPlaybookId)
      .eq("is_active", true)
      .limit(1);

    console.log("🔍 Playbook lookup result:", playbooks);

    if (playbooks && playbooks.length > 0) {
      // @ts-ignore - Supabase type inference
      playbookId = playbooks[0].id;
      console.log("✅ Found playbook ID:", playbookId);
    } else {
      console.log("ℹ️ No playbook found for team, using ID as-is:", playbookId);
    }

    // Get all plays for this playbook to extract formation names
    const { data: plays, error: playsError } = await supabase
      .from("plays")
      .select("formation, personnel")
      .eq("playbook_id", playbookId);

    if (playsError) {
      throw new Error(`Failed to load plays: ${playsError.message}`);
    }

    if (!plays || plays.length === 0) {
      // No plays found, return empty result
      return {
        created: 0,
        existing: 0,
        formations: [],
      };
    }

    // @ts-ignore - Supabase type inference
    const uniqueFormations = [
      ...new Set(plays?.map((p: any) => p.formation).filter(Boolean)),
    ] as string[];

    // Check which formations already exist
    const { data: existingFormations } = await supabase
      .from("formations")
      .select("name")
      .eq("playbook_id", playbookId)
      .in("name", uniqueFormations);

    // @ts-ignore - Supabase type inference
    const existingNames = new Set(existingFormations?.map((f) => f.name) || []);
    const formationsToCreate = uniqueFormations.filter(
      (name) => !existingNames.has(name)
    );

    if (formationsToCreate.length === 0) {
      // All formations already exist
      const { data: allFormations } = await supabase
        .from("formations")
        .select("*")
        .eq("playbook_id", playbookId)
        .in("name", uniqueFormations);

      return {
        created: 0,
        existing: uniqueFormations.length,
        formations: (allFormations || []) as Formation[],
      };
    }

    // Create new formations
    const newFormations = formationsToCreate.map((name) => ({
      name,
      playbook_id: playbookId,
      created_by: createdBy,
      direction: "base" as const,
      category: "spread", // Default category (valid options: spread, pro, power, special, goal_line, short_yardage)
      description: `Imported from plays (${name})`,
      positions: [], // No positions initially
    }));

    const { data: _created, error: createError } = await supabase
      .from("formations")
      // @ts-ignore - Supabase type inference issue
      .insert(newFormations)
      .select();

    if (createError) {
      throw new Error(`Failed to create formations: ${createError.message}`);
    }

    // Get all formations (existing + newly created)
    const { data: allFormations } = await supabase
      .from("formations")
      .select("*")
      .eq("playbook_id", playbookId)
      .in("name", uniqueFormations);

    return {
      created: formationsToCreate.length,
      existing: existingNames.size,
      formations: (allFormations || []) as Formation[],
    };
  }
}
