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
import { debug, info, error as logError } from "../utils/logger";
import { FormationValidationService } from "../validations/formationValidation";
import { offlineDataManager } from "./offlineDataManager";
import type {
  Formation,
  StrengthType,
  FormationCreate,
  FormationUpdate,
  FormationListItem,
  FormationPlayerPosition,
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
    // Validate before creating (both client and server-side)
    const validation = await FormationValidationService.validateFormationServer(data);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(", ")}`);
    }

    // If offline, queue the operation
    if (!navigator.onLine) {
      await offlineDataManager.queueSyncAction("create", `formations`, data);
      // Return a temporary formation object for UI purposes
      return {
        id: `temp-${Date.now()}`,
        playbook_id: data.playbook_id,
        name: data.name,
        description: data.description,
        category: data.category,
        personnel_id: data.personnel_id,
        personnel_name: data.personnel_name,
        direction: data.direction,
        opposite_formation_id: data.opposite_formation_id,
        strength_player_position: data.strength_player_position,
        strength_player_label: data.strength_player_label,
        formation_type: data.formation_type,
        run_strength: data.run_strength,
        pass_strength: data.pass_strength,
        player_positions: data.player_positions,
        tags: data.tags,
        is_custom: data.is_custom,
        usage_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: null,
      } as Formation;
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
      logError("[FormationService] Error creating formation:", error);
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
    playbookId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<Formation[]> {
    try {
      let query = supabase
        .from("formations")
        .select("*")
        .eq("playbook_id", playbookId)
        .order("name", { ascending: true });

      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 100) - 1);
      }

      const { data, error } = await query;

      if (error) {
        // Try to get from offline storage if online request fails
        const offlineData = await offlineDataManager.getOfflineData("formation", `playbook-${playbookId}`);
        if (offlineData.length > 0) {
          info("[FormationService] Using offline data for formations");
          return offlineData.map(item => item.data) as Formation[];
        }
        throw error;
      }

      // Store successful response offline for future use
      if (data && data.length > 0) {
        await offlineDataManager.storeOfflineData("formation", `playbook-${playbookId}`, data);
      }

      info(
        "[FormationService] Returning",
        (data as Formation[])?.length || 0,
        "formations"
      );
      return (data as Formation[]) || [];
    } catch (error) {
      logError("[FormationService] Error fetching formations:", error);
      throw error;
    }
  }

  /**
   * Get formations list (optimized for UI display)
   * PERFORMANCE: Only fetches essential fields (no heavy player_positions JSON)
   */
  static async getFormationsListByPlaybook(
    playbookId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<FormationListItem[]> {
    let query = supabase
      .from("formations")
      .select(`
        id,
        name,
        direction,
        category,
        personnel_name,
        formation_type,
        usage_count,
        opposite_formation_id,
        metadata_quality,
        tags,
        created_at
      `)
      .eq("playbook_id", playbookId)
      .order("name", { ascending: true });

    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 100) - 1);
    }

    const { data, error } = await query;

    if (error) {
      logError("[FormationService] Error fetching formation list:", error);
      throw new Error(`Failed to fetch formation list: ${error.message}`);
    }

    const formations = (data || []) as unknown as Formation[];

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
      logError("[FormationService] Error fetching formations by personnel:", error);
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
    formationId: string,
    customName?: string // Optional custom name for the opposite formation
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

    // Use custom name if provided, otherwise use original name
    const oppositeName = customName || original.name;

    // Create opposite formation
    const opposite = await this.createFormation({
      playbook_id: original.playbook_id,
      name: oppositeName, // Use custom name or original
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
        custom_name_used: !!customName, // Track if custom name was used
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
   * Uses database RPC function for atomic bidirectional linking.
   * Also normalizes f_dir values in associated plays to "R" or "L".
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

    // After linking, normalize f_dir values in plays table for consistency
    // This ensures all plays use "R" or "L" format regardless of how they were originally entered
    await this.normalizePlaysFormationDirection(f1.playbook_id, f1.name);
    await this.normalizePlaysFormationDirection(f2.playbook_id, f2.name);
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

  /**
   * Get suggested matches for manual linking
   * Uses 240-point scoring system:
   * - Name match: 100 points (exact) or 50-60 (similar)
   * - Direction match: 80 points (perfect opposite)
   * - Personnel match: 40 points (same personnel)
   * - Category match: 20 points (same category)
   *
   * @param formationId - Formation to find matches for
   * @param limit - Maximum number of suggestions (default: 5)
   * @returns Top matching formations with scores
   */
  static async getSuggestedMatches(
    formationId: string,
    limit: number = 5
  ): Promise<
    Array<{
      formation: Formation;
      score: number;
      nameMatch: "exact" | "similar" | "different";
      directionMatch: "perfect" | "compatible" | "none";
      personnelMatch: boolean;
      categoryMatch: boolean;
    }>
  > {
    const formation = await this.getFormationById(formationId);
    const allFormations = await this.getFormationsByPlaybook(
      formation.playbook_id
    );

    // Score each formation
    const matches = allFormations
      .filter((f) => f.id !== formationId) // Exclude self
      .filter((f) => !f.opposite_formation_id) // Only show unlinked formations
      .map((candidate) => {
        let score = 0;
        let nameMatch: "exact" | "similar" | "different" = "different";
        let directionMatch: "perfect" | "compatible" | "none" = "none";
        const personnelMatch = formation.personnel_id === candidate.personnel_id;
        const categoryMatch = formation.category === candidate.category;

        // Name match (100 points max)
        if (formation.name === candidate.name) {
          score += 100;
          nameMatch = "exact";
        } else if (
          formation.name.toLowerCase().includes(candidate.name.toLowerCase()) ||
          candidate.name.toLowerCase().includes(formation.name.toLowerCase())
        ) {
          score += 60;
          nameMatch = "similar";
        } else {
          // Check for similar words (e.g., "Trips" vs "Trio")
          const formationWords = formation.name.toLowerCase().split(/\s+/);
          const candidateWords = candidate.name.toLowerCase().split(/\s+/);
          const commonWords = formationWords.filter((word) =>
            candidateWords.includes(word)
          );
          if (commonWords.length > 0) {
            score += 50;
            nameMatch = "similar";
          }
        }

        // Direction match (80 points max)
        if (formation.direction && candidate.direction) {
          // Perfect opposite (left ↔ right)
          if (
            (formation.direction === "left" &&
              candidate.direction === "right") ||
            (formation.direction === "right" && candidate.direction === "left")
          ) {
            score += 80;
            directionMatch = "perfect";
          }
        } else if (!formation.direction && !candidate.direction) {
          // Both standalone - not ideal for linking but compatible
          score += 40;
          directionMatch = "compatible";
        } else if (!formation.direction || !candidate.direction) {
          // One standalone, one directional - can be linked
          score += 60;
          directionMatch = "compatible";
        }

        // Personnel match (40 points)
        if (personnelMatch) {
          score += 40;
        }

        // Category match (20 points)
        if (categoryMatch) {
          score += 20;
        }

        return {
          formation: candidate,
          score,
          nameMatch,
          directionMatch,
          personnelMatch,
          categoryMatch,
        };
      })
      .filter((match) => match.score >= 50) // Only show decent matches
      .sort((a, b) => b.score - a.score) // Sort by score (highest first)
      .slice(0, limit); // Limit results

    return matches;
  }

  /**
   * Get unpaired formations (have direction but no opposite)
   * Useful for Formation Health dashboard
   */
  static async getUnpairedFormations(
    playbookId: string
  ): Promise<Formation[]> {
    const formations = await this.getFormationsByPlaybook(playbookId);

    return formations.filter(
      (f) => f.direction !== null && f.opposite_formation_id === null
    );
  }

  /**
   * Get standalone formations (direction = null, no opposite needed)
   * Useful for Formation Health dashboard
   */
  static async getStandaloneFormations(
    playbookId: string
  ): Promise<Formation[]> {
    const formations = await this.getFormationsByPlaybook(playbookId);

    return formations.filter((f) => f.direction === null);
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
      logError("[FormationService] Error updating formation:", error);
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
      logError("[FormationService] Failed to check formation usage:", error);
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
      logError("[FormationService] Error deleting formation:", error);
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
    debug("[FormationService] importFormationsFromPlays called with:", {
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

    debug("[FormationService] Playbook lookup result:", playbooks);

    if (playbooks && playbooks.length > 0) {
      // @ts-ignore - Supabase type inference
      playbookId = playbooks[0].id;
      info(`[FormationService] Found playbook ID: ${playbookId}`);
    } else {
      debug(`[FormationService] No playbook found for team, using ID as-is: ${playbookId}`);
    }

    // Get all plays for this playbook to extract formation names AND directions
    const { data: plays, error: playsError } = await supabase
      .from("plays")
      .select("formation, personnel, f_dir")
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

    // Extract unique (formation, direction) combinations
    interface FormationVariant {
      name: string;
      direction: "left" | "right" | null;
    }

    const formationVariants = new Map<string, FormationVariant>();

    plays.forEach((play: any) => {
      if (!play.formation) return;

      let formationName = play.formation.trim();
      let direction: "left" | "right" | null = null;
      
      // Method 1: Check f_dir field first
      if (play.f_dir) {
        const dirLower = play.f_dir.toLowerCase().trim();
        if (dirLower === "left" || dirLower === "lt" || dirLower === "l") {
          direction = "left";
        } else if (dirLower === "right" || dirLower === "rt" || dirLower === "r") {
          direction = "right";
        }
      }
      
      // Method 2: Parse direction from formation name itself
      // Examples: "Trips Rt", "Twins Lt", "I Form Right"
      if (!direction) {
        const nameLower = formationName.toLowerCase();
        
        // Check for "Rt" / "Right" at the end
        if (nameLower.match(/\b(rt|right)\b$/)) {
          direction = "right";
          // Remove direction from name
          formationName = formationName.replace(/\s+(Rt|Right|rt|right)$/i, '').trim();
        }
        // Check for "Lt" / "Left" at the end  
        else if (nameLower.match(/\b(lt|left)\b$/)) {
          direction = "left";
          // Remove direction from name
          formationName = formationName.replace(/\s+(Lt|Left|lt|left)$/i, '').trim();
        }
      }

      // Create a unique key for this combination
      const key = `${formationName}:${direction || "none"}`;
      
      if (!formationVariants.has(key)) {
        formationVariants.set(key, {
          name: formationName,
          direction,
        });
      }
    });

    info(`[FormationService] Found ${formationVariants.size} unique formation variants`);

    // Check which formations already exist (by name AND direction)
    const uniqueNames = [...new Set([...formationVariants.values()].map(v => v.name))];
    const { data: existingFormations } = await supabase
      .from("formations")
      .select("name, direction")
      .eq("playbook_id", playbookId)
      .in("name", uniqueNames);

    // Create a set of existing (name, direction) combinations
    const existingKeys = new Set(
      existingFormations?.map((f: any) => 
        `${f.name}:${f.direction || "none"}`
      ) || []
    );

    // Filter to only formations that don't exist yet
    const formationsToCreate = [...formationVariants.values()].filter(
      variant => !existingKeys.has(`${variant.name}:${variant.direction || "none"}`)
    );

    if (formationsToCreate.length === 0) {
      // All formations already exist
      const { data: allFormations } = await supabase
        .from("formations")
        .select("*")
        .eq("playbook_id", playbookId)
        .in("name", uniqueNames);

      info(`[FormationService] All formations already exist`);

      return {
        created: 0,
        existing: formationVariants.size,
        formations: (allFormations || []) as Formation[],
      };
    }

    info(`[FormationService] Creating ${formationsToCreate.length} new formation variants`);

    // Create new formations with proper direction
    const newFormations = formationsToCreate.map((variant) => ({
      name: variant.name,
      playbook_id: playbookId,
      created_by: createdBy,
      direction: variant.direction,
      category: "spread", // Default category (valid options: spread, pro, power, special, goal_line, short_yardage)
      description: variant.direction 
        ? `Imported from plays (${variant.name} ${variant.direction})`
        : `Imported from plays (${variant.name})`,
      player_positions: [], // No positions initially
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
      .in("name", uniqueNames);

    info(`[FormationService] Import complete: ${formationsToCreate.length} created, ${existingKeys.size} existed`);

    return {
      created: formationsToCreate.length,
      existing: existingKeys.size,
      formations: (allFormations || []) as Formation[],
    };
  }

  // ===================================================================
  // BULK OPERATIONS
  // ===================================================================

  /**
   * Bulk update metadata for multiple formations
   * Supports replace and merge modes for tags
   */
  static async bulkUpdateMetadata(
    formationIds: string[],
    updates: Partial<Pick<Formation, "category" | "personnel_name" | "tags" | "formation_type">>,
    mode: "replace" | "merge"
  ): Promise<{ updated: number }> {
    if (formationIds.length === 0) {
      return { updated: 0 };
    }

    // For merge mode with tags, we need to fetch existing data and merge
    if (mode === "merge" && updates.tags) {
      const { data: existing, error: fetchError } = await supabase
        .from("formations")
        .select("id, tags")
        .in("id", formationIds);

      if (fetchError) {
        throw new Error(`Failed to fetch formations: ${fetchError.message}`);
      }

      // Merge tags for each formation individually
      for (const formation of existing || []) {
        const existingTags = (formation as Formation).tags || [];
        const mergedTags = [...new Set([...existingTags, ...(updates.tags || [])])];
        const { error: updateError } = await supabase
          .from("formations")
          .update({ tags: mergedTags } as never)
          .eq("id", (formation as Formation).id);

        if (updateError) {
          throw new Error(`Failed to update formation ${(formation as any).id}: ${updateError.message}`);
        }
      }

      return { updated: formationIds.length };
    } else {
      // Replace mode - simple batch update
      const { error } = await supabase
        .from("formations")
        .update(updates as never)
        .in("id", formationIds);

      if (error) {
        throw new Error(`Bulk update failed: ${error.message}`);
      }

      return { updated: formationIds.length };
    }
  }

  /**
   * Bulk set direction with optional opposite formation creation
   */
  static async bulkSetDirection(
    _playbookId: string,
    formationIds: string[],
    direction: "left" | "right" | "both",
    autoCreateOpposites: boolean
  ): Promise<{ updated: number; created: number }> {
    if (formationIds.length === 0) {
      return { updated: 0, created: 0 };
    }

    let created = 0;

    if (direction === "both" && autoCreateOpposites) {
      // Fetch formations to check for opposites and create if needed
      const { data: formations, error: fetchError } = await supabase
        .from("formations")
        .select("*")
        .in("id", formationIds);

      if (fetchError) {
        throw new Error(`Failed to fetch formations: ${fetchError.message}`);
      }

      // Create opposites for formations that don't have them
      for (const formation of formations || []) {
        const f = formation as any;
        if (!f.opposite_formation_id) {
          try {
            await this.createOppositeFormation(f.id);
            created++;
          } catch (error) {
            logError(`[FormationService] Failed to create opposite for ${f.name}:`, error);
            // Continue with other formations even if one fails
          }
        } else {
          // Formation already has an opposite, just ensure direction is set to 'both'
          const { error: updateError } = await supabase
            .from("formations")
            .update({ direction: "both" } as never)
            .eq("id", f.id);

          if (updateError) {
            logError(`[FormationService] Failed to update direction for ${f.name}:`, updateError);
          }
        }
      }

      return { updated: formationIds.length, created };
    } else {
      // Simple direction update without opposite creation
      const { error } = await supabase
        .from("formations")
        .update({ direction } as never)
        .in("id", formationIds);

      if (error) {
        throw new Error(`Bulk direction update failed: ${error.message}`);
      }

      return { updated: formationIds.length, created: 0 };
    }
  }

  /**
   * Bulk delete formations with option to delete linked opposites
   */
  static async bulkDelete(
    formationIds: string[],
    deleteOpposites: boolean
  ): Promise<{ count: number }> {
    if (formationIds.length === 0) {
      return { count: 0 };
    }

    if (deleteOpposites) {
      // Fetch opposite IDs
      const { data: formations, error: fetchError } = await supabase
        .from("formations")
        .select("opposite_formation_id")
        .in("id", formationIds);

      if (fetchError) {
        throw new Error(`Failed to fetch formations: ${fetchError.message}`);
      }

      // Collect all IDs to delete (selected + their opposites)
      const oppositeIds = formations
        ?.map((f) => (f as any).opposite_formation_id)
        .filter((id): id is string => id !== null) || [];

      const allIds = [...new Set([...formationIds, ...oppositeIds])];

      const { error } = await supabase.from("formations").delete().in("id", allIds);

      if (error) {
        throw new Error(`Bulk delete failed: ${error.message}`);
      }

      return { count: allIds.length };
    } else {
      // Delete only selected formations, unlink opposites
      // First, unlink the opposites
      const { error: unlinkError } = await supabase
        .from("formations")
        .update({ opposite_formation_id: null } as never)
        .in("opposite_formation_id", formationIds);

      if (unlinkError) {
        logError("[FormationService] Failed to unlink opposites:", unlinkError);
      }

      // Then delete the selected formations
      const { error } = await supabase.from("formations").delete().in("id", formationIds);

      if (error) {
        throw new Error(`Bulk delete failed: ${error.message}`);
      }

      return { count: formationIds.length };
    }
  }

  /**
   * Get formations by IDs (for undo functionality)
   */
  static async getFormationsByIds(formationIds: string[]): Promise<Formation[]> {
    const { data, error } = await supabase
      .from("formations")
      .select("*")
      .in("id", formationIds);

    if (error) {
      throw new Error(`Failed to fetch formations: ${error.message}`);
    }

    return (data || []) as Formation[];
  }

  /**
   * Normalize f_dir values in plays table for a given formation
   * 
   * Converts all variations of direction (Left, Lt, L, Right, Rt, R) to the
   * standard format ("L" or "R") for consistent database storage.
   * 
   * This is called after linking formations to ensure data consistency.
   * 
   * @param playbookId - Playbook containing the plays
   * @param formationName - Name of the formation to normalize
   */
  static async normalizePlaysFormationDirection(
    playbookId: string,
    formationName: string
  ): Promise<void> {
    try {
      // Get all plays with this formation
      const { data: plays, error: fetchError } = await supabase
        .from("plays")
        .select("id, f_dir")
        .eq("playbook_id", playbookId)
        .eq("formation", formationName);

      if (fetchError) {
        logError("[FormationService] Failed to fetch plays for normalization:", fetchError);
        return;
      }

      if (!plays || plays.length === 0) {
        return; // No plays to normalize
      }

      // Normalize each play's f_dir value
      const updates = plays
        .map((play: any) => {
          if (!play.f_dir) return null;

          const normalized = this.normalizeDirection(play.f_dir);
          
          // Only update if the value changed
          if (normalized && normalized !== play.f_dir) {
            return {
              id: play.id as string,
              f_dir: normalized as "R" | "L",
            };
          }

          return null;
        })
        .filter((update): update is { id: string; f_dir: "R" | "L" } => update !== null);

      // Bulk update the plays
      if (updates.length > 0) {
        for (const update of updates) {
          const { error: updateError } = await supabase
            .from("plays")
            .update({ f_dir: update.f_dir } as never)
            .eq("id", update.id);

          if (updateError) {
            logError(
              `[FormationService] Failed to normalize f_dir for play ${update.id}:`,
              updateError
            );
          }
        }

        info(
          `[FormationService] Normalized f_dir for ${updates.length} plays with formation "${formationName}"`
        );
      }
    } catch (error) {
      logError("[FormationService] Error during f_dir normalization:", error);
    }
  }

  /**
   * Normalize a direction string to standard format
   * 
   * @param direction - Raw direction string (Left, Lt, L, Right, Rt, R, etc.)
   * @returns Normalized direction ("R" or "L") or null if invalid
   */
  private static normalizeDirection(direction: string | null | undefined): "R" | "L" | null {
    if (!direction || direction.trim() === "") return null;

    const normalized = direction.trim().toLowerCase();

    // Right variants
    if (normalized === "right" || normalized === "r" || normalized === "rt") {
      return "R";
    }

    // Left variants
    if (normalized === "left" || normalized === "l" || normalized === "lt") {
      return "L";
    }

    // Unknown format - return null
    return null;
  }

  // ===================================================================
  // AUTO-CREATION & LINKING (Phase 1)
  // ===================================================================

  /**
   * Get existing formation by name or create new one
   * Handles bidirectional opposite linking automatically
   * 
   * @param formationName - Name of the formation to get or create
   * @param personnelId - Optional personnel configuration ID
   * @param oppositeFormationName - Optional opposite formation name for bidirectional linking
   * @param playbookId - Optional playbook ID (if creating formation within playbook context)
   * @returns The existing or newly created formation
   */
  static async getOrCreateFormation(
    formationName: string,
    playbookId: string,
    personnelId?: string,
    oppositeFormationName?: string
  ): Promise<Formation> {
    try {
      // 1. Check if formation exists (case-insensitive)
      const existing = await this.getFormationByName(formationName);
      if (existing) {
        info(`[FormationService] Found existing formation: ${formationName}`);
        return existing;
      }
      
      info(`[FormationService] Creating new formation: ${formationName}`);
      
      // 2. Create new formation
      const newFormation = await this.createFormation({
        name: formationName,
        playbook_id: playbookId,
        personnel_id: personnelId,
        player_positions: [], // Required field, can be empty for auto-created
        creation_source: 'play_builder',
        creation_context: { 
          triggeredBy: 'play-creation',
          timestamp: new Date().toISOString()
        }
      });
      
      // 3. Handle opposite formation if provided
      if (oppositeFormationName) {
        // Recursively create opposite (without creating opposite's opposite to prevent infinite recursion)
        const opposite = await this.getOrCreateFormation(
          oppositeFormationName,
          playbookId,
          personnelId,
          undefined // Don't create opposite's opposite
        );
        
        // Link bidirectionally
        await this.linkOppositeFormations(newFormation.id, opposite.id);
        
        info(`[FormationService] Linked "${formationName}" ↔ "${oppositeFormationName}"`);
        
        // Refresh to get updated opposite_formation_id
        const refreshed = await this.getFormationById(newFormation.id);
        return refreshed;
      }
      
      return newFormation;
      
    } catch (err) {
      logError('[FormationService] Error in getOrCreateFormation:', err);
      throw new Error(`Failed to get or create formation: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /**
   * Find formation by name (case-insensitive, handles spacing variations)
   * 
   * @param name - Formation name to search for
   * @returns The found formation or null
   */
  static async getFormationByName(name: string): Promise<Formation | null> {
    try {
      // Normalize for comparison (lowercase, remove extra spaces)
      const normalized = name.toLowerCase().trim().replace(/\s+/g, '');
      
      // Get all formations
      const { data: formations, error } = await supabase
        .from('formations')
        .select('*');
      
      if (error) throw error;
      if (!formations || formations.length === 0) return null;
      
      // Find exact match (case-insensitive, spacing-insensitive)
      const exactMatch = (formations as Formation[]).find(
        f => f.name.toLowerCase().trim().replace(/\s+/g, '') === normalized
      );
      
      if (exactMatch) {
        debug(`[FormationService] Found formation by name: ${name} → ${exactMatch.name}`);
      }
      
      return exactMatch || null;
      
    } catch (err) {
      logError('[FormationService] Error finding formation by name:', err);
      return null;
    }
  }

  /**
   * Link two formations as opposites (bidirectional)
   * 
   * @param formationId - First formation ID
   * @param oppositeId - Second formation ID (opposite of first)
   */
  static async linkOppositeFormations(
    formationId: string,
    oppositeId: string
  ): Promise<void> {
    try {
      // Update both formations to point to each other
      const { error: error1 } = await supabase
        .from('formations')
        .update({ opposite_formation_id: oppositeId } as never)
        .eq('id', formationId);
      
      const { error: error2 } = await supabase
        .from('formations')
        .update({ opposite_formation_id: formationId } as never)
        .eq('id', oppositeId);
      
      if (error1 || error2) {
        throw new Error(`Failed to link opposite formations: ${error1?.message || error2?.message}`);
      }
      
      info(`[FormationService] Linked formations as opposites: ${formationId} ↔ ${oppositeId}`);
      
    } catch (err) {
      logError('[FormationService] Error linking opposite formations:', err);
      throw err;
    }
  }
}
