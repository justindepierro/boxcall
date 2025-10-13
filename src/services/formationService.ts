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

import { supabase } from '../lib/supabase';
import type {
  Formation,
  FormationCreate,
  FormationUpdate,
  FormationPlayerPosition,
  FormationWithVariants,
  FormationListItem,
  FormationValidation,
} from '../types/formation';

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
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const { data: formation, error } = await supabase
      .from('formations')
      .insert([
        {
          playbook_id: data.playbook_id,
          name: data.name,
          description: data.description || null,
          category: data.category || null,
          personnel_id: data.personnel_id || null,
          personnel_name: data.personnel_name || null,
          direction: data.direction || 'base',
          base_formation_id: data.base_formation_id || null,
          strength_player_position: data.strength_player_position || null,
          strength_player_label: data.strength_player_label || null,
          formation_type: data.formation_type || null,
          run_strength: data.run_strength || 'balanced',
          pass_strength: data.pass_strength || 'balanced',
          player_positions: data.player_positions as unknown,
          tags: data.tags || [],
          is_custom: data.is_custom !== undefined ? data.is_custom : true,
        } as never,
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating formation:', error);
      throw new Error(`Failed to create formation: ${error.message}`);
    }

    return formation as Formation;
  }

  /**
   * Create Left variant of a base formation
   * Flips all player positions horizontally
   */
  static async createLeftVariant(baseFormationId: string): Promise<Formation> {
    // Get base formation
    const baseFormation = await this.getFormationById(baseFormationId);

    if (baseFormation.direction !== 'base') {
      throw new Error('Can only create variants from base formation');
    }

    // Flip positions
    const flippedPositions = this.flipPositions(baseFormation.player_positions);

    // Create left variant
    return this.createFormation({
      playbook_id: baseFormation.playbook_id,
      name: `${baseFormation.name} - Left`,
      description: `Left-side variant of ${baseFormation.name}`,
      category: baseFormation.category || undefined,
      personnel_id: baseFormation.personnel_id || undefined,
      personnel_name: baseFormation.personnel_name || undefined,
      direction: 'left',
      base_formation_id: baseFormation.id,
      strength_player_position: baseFormation.strength_player_position || undefined,
      strength_player_label: baseFormation.strength_player_label || undefined,
      player_positions: flippedPositions,
      tags: baseFormation.tags,
      is_custom: baseFormation.is_custom,
    });
  }

  /**
   * Create Right variant of a base formation
   * Flips all player positions horizontally
   */
  static async createRightVariant(baseFormationId: string): Promise<Formation> {
    // Get base formation
    const baseFormation = await this.getFormationById(baseFormationId);

    if (baseFormation.direction !== 'base') {
      throw new Error('Can only create variants from base formation');
    }

    // Flip positions
    const flippedPositions = this.flipPositions(baseFormation.player_positions);

    // Create right variant
    return this.createFormation({
      playbook_id: baseFormation.playbook_id,
      name: `${baseFormation.name} - Right`,
      description: `Right-side variant of ${baseFormation.name}`,
      category: baseFormation.category || undefined,
      personnel_id: baseFormation.personnel_id || undefined,
      personnel_name: baseFormation.personnel_name || undefined,
      direction: 'right',
      base_formation_id: baseFormation.id,
      strength_player_position: baseFormation.strength_player_position || undefined,
      strength_player_label: baseFormation.strength_player_label || undefined,
      player_positions: flippedPositions,
      tags: baseFormation.tags,
      is_custom: baseFormation.is_custom,
    });
  }

  /**
   * Create both Left and Right variants
   */
  static async createBothVariants(
    baseFormationId: string
  ): Promise<{ left: Formation; right: Formation }> {
    const left = await this.createLeftVariant(baseFormationId);
    const right = await this.createRightVariant(baseFormationId);
    return { left, right };
  }

  // ===================================================================
  // READ OPERATIONS
  // ===================================================================

  /**
   * Get formation by ID
   */
  static async getFormationById(id: string): Promise<Formation> {
    const { data, error } = await supabase
      .from('formations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new Error(`Formation not found: ${id}`);
    }

    return data as Formation;
  }

  /**
   * Get all formations for a playbook
   */
  static async getFormationsByPlaybook(playbookId: string): Promise<Formation[]> {
    console.log('🔍 [FormationService] getFormationsByPlaybook called with:', {
      playbookId,
      playbookIdType: typeof playbookId,
      playbookIdLength: playbookId?.length
    });
    
    const { data, error } = await supabase
      .from('formations')
      .select('*')
      .eq('playbook_id', playbookId)
      .order('name', { ascending: true });

    console.log('📊 [FormationService] Query result:', {
      dataLength: data?.length || 0,
      error: error?.message || null,
      data: data?.map(d => ({ id: d.id, name: d.name, playbook_id: d.playbook_id })) || []
    });

    if (error) {
      console.error('❌ [FormationService] Error fetching formations:', error);
      throw new Error(`Failed to fetch formations: ${error.message}`);
    }

    console.log('✅ [FormationService] Returning', (data as Formation[])?.length || 0, 'formations');
    return (data as Formation[]) || [];
  }

  /**
   * Get formation variants (base + left + right)
   */
  static async getFormationVariants(formationId: string): Promise<FormationWithVariants> {
    const { data, error } = await supabase.rpc('get_formation_variants', {
      formation_id: formationId,
    } as never);

    if (error) {
      console.error('Error fetching formation variants:', error);
      throw new Error(`Failed to fetch variants: ${error.message}`);
    }

    const variants = data as Formation[];
    const base = variants.find((v) => v.direction === 'base');
    const left = variants.find((v) => v.direction === 'left');
    const right = variants.find((v) => v.direction === 'right');

    if (!base) {
      throw new Error('Base formation not found');
    }

    return { base, left, right };
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
      has_variants: f.direction === 'base', // Base formations can have variants
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
      .from('formations')
      .select('*')
      .eq('playbook_id', playbookId)
      .eq('personnel_id', personnelId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching formations by personnel:', error);
      throw new Error(`Failed to fetch formations: ${error.message}`);
    }

    return (data as Formation[]) || [];
  }

  // ===================================================================
  // UPDATE OPERATIONS
  // ===================================================================

  /**
   * Update formation
   */
  static async updateFormation(id: string, updates: FormationUpdate): Promise<Formation> {
    const { data, error } = await supabase
      .from('formations')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating formation:', error);
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
    const { error } = await supabase.from('formations').delete().eq('id', id);

    if (error) {
      console.error('Error deleting formation:', error);
      throw new Error(`Failed to delete formation: ${error.message}`);
    }
  }

  /**
   * Delete formation and all its variants
   */
  static async deleteFormationWithVariants(baseFormationId: string): Promise<void> {
    // Get all variants
    const variants = await this.getFormationVariants(baseFormationId);

    // Delete in order: variants first, then base
    if (variants.left) await this.deleteFormation(variants.left.id);
    if (variants.right) await this.deleteFormation(variants.right.id);
    await this.deleteFormation(variants.base.id);
  }

  // ===================================================================
  // UTILITY OPERATIONS
  // ===================================================================

  /**
   * Duplicate formation
   */
  static async duplicateFormation(id: string, newName: string): Promise<Formation> {
    const original = await this.getFormationById(id);

    return this.createFormation({
      playbook_id: original.playbook_id,
      name: newName,
      description: original.description || undefined,
      category: original.category || undefined,
      personnel_id: original.personnel_id || undefined,
      personnel_name: original.personnel_name || undefined,
      direction: 'base', // Always create as new base
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
  static flipPositions(positions: FormationPlayerPosition[]): FormationPlayerPosition[] {
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
    if (!data.playbook_id) errors.push('playbook_id is required');
    if (!data.name || data.name.trim() === '') errors.push('name is required');
    if (!data.player_positions || data.player_positions.length === 0) {
      errors.push('player_positions cannot be empty');
    }

    // Name validation
    if (data.name && data.name.length > 100) {
      errors.push('name cannot exceed 100 characters');
    }

    // Player position validation
    if (data.player_positions) {
      data.player_positions.forEach((p, index) => {
        if (!p.position) errors.push(`Player ${index + 1}: position is required`);
        if (p.x < 0 || p.x > FIELD_WIDTH) {
          errors.push(`Player ${index + 1}: x must be between 0 and ${FIELD_WIDTH}`);
        }
        if (p.y < 0 || p.y > 50) {
          errors.push(`Player ${index + 1}: y must be between 0 and 50`);
        }
      });

      // Check for duplicate positions
      const positions = data.player_positions.map((p) => p.position);
      const duplicates = positions.filter((p, i) => positions.indexOf(p) !== i);
      if (duplicates.length > 0) {
        warnings.push(`Duplicate position codes: ${duplicates.join(', ')}`);
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
  // FORMATION MATCHING OPERATIONS
  // ===================================================================

  /**
   * Link formations as variants
   * Sets base_formation_id and direction on variant formations
   * 
   * @param baseFormationId - The base formation ID
   * @param leftFormationId - Optional left variant formation ID
   * @param rightFormationId - Optional right variant formation ID
   */
  /**
   * Link formations as left/right variants
   * 
   * Special handling:
   * - If leftFormationId === rightFormationId: Creates duplicate for right side
   * - Always sets direction to 'left'/'right' (or 'Lt'/'Rt' for same formation)
   * - Base formation gets direction = 'base'
   * 
   * @param baseFormationId - The base formation ID (left side becomes base)
   * @param leftFormationId - Formation for left side (optional, will use baseFormationId if not provided)
   * @param rightFormationId - Formation for right side (will duplicate if same as left)
   * @param personnelPackages - Optional array of personnel configuration IDs that can run this formation
   */
  static async linkFormations(
    baseFormationId: string,
    leftFormationId?: string,
    rightFormationId?: string,
    personnelPackages?: string[]
  ): Promise<void> {
    // Validate base formation exists
    const { data: baseFormation, error: baseError} = await supabase
      .from('formations')
      .select('*')
      .eq('id', baseFormationId)
      .single();

    if (baseError || !baseFormation) {
      throw new Error('Base formation not found');
    }

    // @ts-ignore - Supabase type inference issue
    // Base formation should not have a base_formation_id (must be the base)
    if (baseFormation.base_formation_id !== null) {
      throw new Error('Cannot link to a formation that is already a variant. Choose the base formation.');
    }

    // SPECIAL CASE: Same formation selected for both sides
    // Create a duplicate for the right side, and make original the left side
    let actualRightFormationId = rightFormationId;
    let isSameFormationLink = false;
    
    if (leftFormationId && rightFormationId && leftFormationId === rightFormationId) {
      isSameFormationLink = true;
      // @ts-ignore - Supabase type inference issue
      const sourceFormation = baseFormation;
      
      // Create duplicate with same properties for RIGHT side
      const { data: duplicate, error: duplicateError } = await supabase
        .from('formations')
        .insert([{
          name: sourceFormation.name,
          playbook_id: sourceFormation.playbook_id,
          personnel_id: sourceFormation.personnel_id,
          personnel_packages: personnelPackages || [],
          category: sourceFormation.category,
          description: sourceFormation.description ? `${sourceFormation.description} (Right variant)` : 'Right variant',
          positions: sourceFormation.positions,
          created_by: sourceFormation.created_by,
          direction: 'right' as 'base' | 'left' | 'right',
          base_formation_id: baseFormationId, // Points to original as base
        }])
        .select()
        .single();

      if (duplicateError || !duplicate) {
        throw new Error(`Failed to create right variant: ${duplicateError?.message || 'Unknown error'}`);
      }

      // @ts-ignore - Supabase type inference issue
      actualRightFormationId = duplicate.id;
      
      // Update original formation to be LEFT side (it's the base, but shows as 'left')
      // @ts-ignore - Supabase type inference issue
      const { error: leftUpdateError } = await supabase
        .from('formations')
        .update({
          direction: 'left' as 'base' | 'left' | 'right',
          base_formation_id: null, // This is the base formation
          personnel_packages: personnelPackages || [],
        })
        .eq('id', baseFormationId);

      if (leftUpdateError) {
        throw new Error(`Failed to update left variant: ${leftUpdateError.message}`);
      }
    }

    // Link left variant (update direction) - ONLY for different formation linking
    if (!isSameFormationLink && leftFormationId && leftFormationId !== baseFormationId) {
      // @ts-ignore - Supabase type inference issue
      const { error: leftError } = await supabase
        .from('formations')
        .update({
          base_formation_id: baseFormationId,
          direction: 'left' as 'base' | 'left' | 'right',
          personnel_packages: personnelPackages || [],
        })
        .eq('id', leftFormationId);

      if (leftError) {
        throw new Error(`Failed to link left variant: ${leftError.message}`);
      }
    }

    // Link right variant (update direction) - ONLY for different formation linking
    if (!isSameFormationLink && actualRightFormationId) {
      // @ts-ignore - Supabase type inference issue
      const { error: rightError } = await supabase
        .from('formations')
        .update({
          base_formation_id: baseFormationId,
          direction: 'right' as 'base' | 'left' | 'right',
          personnel_packages: personnelPackages || [],
        })
        .eq('id', actualRightFormationId);

      if (rightError) {
        throw new Error(`Failed to link right variant: ${rightError.message}`);
      }
    }

    // Update base formation direction - ONLY for different formation linking
    if (!isSameFormationLink) {
      // @ts-ignore - Supabase type inference issue
      const { error: baseUpdateError } = await supabase
        .from('formations')
        .update({ 
          direction: 'base' as 'base' | 'left' | 'right',
          personnel_packages: personnelPackages || [],
        })
        .eq('id', baseFormationId);

      if (baseUpdateError) {
        throw new Error(`Failed to update base formation: ${baseUpdateError.message}`);
      }
    }
  }

  /**
   * Unlink a variant formation (make it independent)
   * Sets base_formation_id to NULL and direction to 'base'
   * 
   * @param formationId - The formation ID to unlink
   */
  static async unlinkVariant(formationId: string): Promise<void> {
    // @ts-ignore - Supabase type inference issue
    const { error } = await supabase
      .from('formations')
      .update({
        base_formation_id: null,
        direction: 'base' as 'base' | 'left' | 'right',
      })
      .eq('id', formationId);

    if (error) {
      throw new Error(`Failed to unlink variant: ${error.message}`);
    }
  }

  /**
   * Get suggested formation matches
   * Returns formations in the same playbook with same personnel
   * that could be potential left/right variants
   * 
   * @param formationId - The formation to find matches for
   * @returns Array of potential matching formations
   */
  static async getSuggestedMatches(formationId: string): Promise<Formation[]> {
    // Get the source formation
    const { data: sourceFormation, error: sourceError } = await supabase
      .from('formations')
      .select('*')
      .eq('id', formationId)
      .single();

    if (sourceError || !sourceFormation) {
      throw new Error('Formation not found');
    }

    // Query formations in same playbook with same personnel
    // @ts-ignore - Supabase type inference issue
    const { data: matches, error: matchError } = await supabase
      .from('formations')
      .select('*')
      .eq('playbook_id', sourceFormation.playbook_id)
      .eq('personnel_id', sourceFormation.personnel_id)
      .neq('id', formationId) // Exclude self
      .order('name');

    if (matchError) {
      throw new Error(`Failed to get suggested matches: ${matchError.message}`);
    }

    // Filter out formations that are already linked to a different base
    // (unless they're linked to THIS formation as base)
    // @ts-ignore - Supabase type inference issue
    const baseFormationId = sourceFormation.base_formation_id || sourceFormation.id;
    
    const filtered = (matches || []).filter((f: Formation) => {
      // Include if no base (independent formation)
      if (!f.base_formation_id) return true;
      
      // Include if already linked to this formation's base
      if (f.base_formation_id === baseFormationId) return true;
      
      // Exclude if linked to different base
      return false;
    });

    return filtered;
  }

  /**
   * Get all variants for a formation (base + left + right)
   * Returns the complete variant family
   * 
   * @param formationId - Formation ID (can be base or variant)
   * @returns Object with base, left, and right formations
   */
  static async getFormationVariantFamily(
    formationId: string
  ): Promise<{
    base: Formation | null;
    left: Formation | null;
    right: Formation | null;
  }> {
    // Get the formation to determine base_formation_id
    const { data: formation, error: formationError } = await supabase
      .from('formations')
      .select('*')
      .eq('id', formationId)
      .single();

    if (formationError || !formation) {
      throw new Error('Formation not found');
    }

    // Determine the base formation ID
    // @ts-ignore - Supabase type inference issue
    const baseFormationId = formation.base_formation_id || formation.id;

    // Query all formations in the variant family
    const { data: allVariants, error: variantError } = await supabase
      .from('formations')
      .select('*')
      .or(`id.eq.${baseFormationId},base_formation_id.eq.${baseFormationId}`);

    if (variantError) {
      throw new Error(`Failed to get variant family: ${variantError.message}`);
    }

    const variants = (allVariants || []) as Formation[];

    return {
      base: variants.find((f: Formation) => f.direction === 'base') || null,
      left: variants.find((f: Formation) => f.direction === 'left') || null,
      right: variants.find((f: Formation) => f.direction === 'right') || null,
    };
  }

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
    console.log('📦 importFormationsFromPlays called with:', { teamIdOrPlaybookId, createdBy });
    
    // First, try to find the playbook for this team
    let playbookId = teamIdOrPlaybookId;
    
    // Check if this is a team_id by trying to find a playbook
    const { data: playbooks } = await supabase
      .from('playbooks')
      .select('id')
      .eq('team_id', teamIdOrPlaybookId)
      .eq('is_active', true)
      .limit(1);
    
    console.log('🔍 Playbook lookup result:', playbooks);
    
    if (playbooks && playbooks.length > 0) {
      // @ts-ignore - Supabase type inference
      playbookId = playbooks[0].id;
      console.log('✅ Found playbook ID:', playbookId);
    } else {
      console.log('ℹ️ No playbook found for team, using ID as-is:', playbookId);
    }
    
    // Get all plays for this playbook to extract formation names
    const { data: plays, error: playsError } = await supabase
      .from('plays')
      .select('formation, personnel')
      .eq('playbook_id', playbookId);

    console.log('🎮 Plays query result:', { plays: plays?.length, error: playsError });

    if (playsError) {
      throw new Error(`Failed to load plays: ${playsError.message}`);
    }

    if (!plays || plays.length === 0) {
      console.log('⚠️ No plays found for playbook:', playbookId);
      // No plays found, return empty result
      return {
        created: 0,
        existing: 0,
        formations: [],
      };
    }

    // @ts-ignore - Supabase type inference
    const uniqueFormations = [...new Set(plays?.map(p => p.formation).filter(Boolean))] as string[];
    
    console.log('📋 Unique formations found:', uniqueFormations);

    // Check which formations already exist
    const { data: existingFormations } = await supabase
      .from('formations')
      .select('name')
      .eq('playbook_id', playbookId)
      .in('name', uniqueFormations);

    // @ts-ignore - Supabase type inference
    const existingNames = new Set(existingFormations?.map(f => f.name) || []);
    const formationsToCreate = uniqueFormations.filter(name => !existingNames.has(name));

    if (formationsToCreate.length === 0) {
      // All formations already exist
      const { data: allFormations } = await supabase
        .from('formations')
        .select('*')
        .eq('playbook_id', playbookId)
        .in('name', uniqueFormations);

      return {
        created: 0,
        existing: uniqueFormations.length,
        formations: (allFormations || []) as Formation[],
      };
    }

    // Create new formations
    const newFormations = formationsToCreate.map(name => ({
      name,
      playbook_id: playbookId,
      created_by: createdBy,
      direction: 'base' as const,
      category: 'spread', // Default category (valid options: spread, pro, power, special, goal_line, short_yardage)
      description: `Imported from plays (${name})`,
      positions: [], // No positions initially
    }));

    const { data: created, error: createError } = await supabase
      .from('formations')
      .insert(newFormations)
      .select();

    if (createError) {
      throw new Error(`Failed to create formations: ${createError.message}`);
    }

    // Get all formations (existing + newly created)
    const { data: allFormations } = await supabase
      .from('formations')
      .select('*')
      .eq('playbook_id', playbookId)
      .in('name', uniqueFormations);

    return {
      created: formationsToCreate.length,
      existing: existingNames.size,
      formations: (allFormations || []) as Formation[],
    };
  }
}
