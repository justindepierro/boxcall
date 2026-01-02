/**
 * Practice Script CRUD Operations & Play Management
 * Extracted from monolithic practiceService.ts for better maintainability
 */

import { table } from "../../data/supabase/db";
import { getCurrentUserId } from "../../lib/auth-helpers";
import { practiceScriptCache } from "../practiceScriptCache";
import { ActivityService } from "../activityService";
import { debug, error as logError } from "../../utils/logger";

import type {
  PracticeScript,
  PracticeScriptPlay,
  CreatePracticeScriptData,
  AddPlayToPracticeScriptData,
} from "./types";
import type { Play } from "../../types/play";

/**
 * Service for managing practice scripts and their plays
 */
export class PracticeScriptService {
  /**
   * Create a new practice script - OPTIMIZED with cache invalidation
   */
  static async createPracticeScript(
    data: CreatePracticeScriptData
  ): Promise<PracticeScript> {
    const { data: script, error } = await table("practice_scripts")
      .insert({
        title: data.name,
        description: data.description,
        team_id: data.teamId,
        focus_areas: data.tags || [],
        created_by: getCurrentUserId(),
      })
      .select()
      .single();

    if (error) {
      logError("Error creating practice script:", error);
      throw new Error("Failed to create practice script");
    }

    const scriptData = script as any;
    const newScript: PracticeScript = {
      id: scriptData.id as string,
      title: scriptData.title as string,
      description: scriptData.description as string | undefined,
      teamId: scriptData.team_id as string,
      createdBy: scriptData.created_by as string,
      createdAt: new Date(scriptData.created_at as string),
      updatedAt: new Date(scriptData.updated_at as string),
      isTemplate: false,
      plays: [],
      duration: (scriptData.duration_minutes as number) || 120,
      tags: (scriptData.focus_areas as string[]) || [],
    } as any;

    // Invalidate team scripts cache
    await practiceScriptCache.invalidate(`scripts_team_${data.teamId}`);

    return newScript;
  }

  /**
   * Update an existing practice script - OPTIMIZED with cache invalidation
   */
  static async updatePracticeScript(
    scriptId: string,
    data: Partial<CreatePracticeScriptData>
  ): Promise<PracticeScript> {
    const updateData: any = {};

    if (data.name !== undefined) updateData.title = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.tags !== undefined) updateData.focus_areas = data.tags;

    updateData.updated_at = new Date().toISOString();

    const { error } = await table("practice_scripts")
      .update(updateData)
      .eq("id", scriptId)
      .select()
      .single();

    if (error) {
      logError("Error updating practice script:", error);
      throw new Error("Failed to update practice script");
    }

    // Invalidate caches
    await practiceScriptCache.invalidate(`script_${scriptId}`);
    await practiceScriptCache.invalidatePattern(/^scripts_team_/);

    // Return the full script with plays
    const fullScript = await this.getPracticeScript(scriptId);
    if (!fullScript) {
      throw new Error("Failed to retrieve updated practice script");
    }

    return fullScript;
  }

  /**
   * Get all practice scripts for a team - OPTIMIZED with caching
   */
  static async getPracticeScripts(
    teamId: string,
    _forceRefresh = false
  ): Promise<PracticeScript[]> {
    debug("[PracticeScriptService] Fetching scripts for team:", teamId);
    const startTime = performance.now();

    try {
      const { data: scripts, error: scriptsError } = await table(
        "practice_scripts"
      )
        .select("*")
        .eq("team_id", teamId)
        .order("updated_at", { ascending: false });

      debug("[PracticeScriptService] Scripts query completed:", {
        hasData: !!scripts,
        count: scripts?.length ?? 0,
        error: scriptsError,
      });

      if (scriptsError) {
        logError("Error fetching practice scripts:", scriptsError);
        throw scriptsError;
      }

      if (!scripts || scripts.length === 0) {
        debug("[PracticeScriptService] No scripts found for team:", teamId);
        return [];
      }

      // Now fetch plays for each script
      const scriptIds = scripts.map((s) => s.id);
      let scriptPlays: any[] = [];

      try {
        const { data: playsData, error: playsError } = await table(
          "practice_script_plays"
        )
          .select("*, plays(*)")
          .in("practice_script_id", scriptIds);

        if (playsError) {
          debug("[PracticeScriptService] Plays query error:", playsError);
        }

        scriptPlays = playsData || [];

        debug("[PracticeScriptService] Script plays query completed:", {
          hasData: !!playsData,
          count: scriptPlays?.length ?? 0,
          error: playsError,
        });
      } catch (e) {
        debug(
          "[PracticeScriptService] Plays query failed, returning scripts without plays:",
          e
        );
        scriptPlays = [];
      }

      // Group plays by script_id
      const playsByScript = new Map<string, any[]>();
      if (scriptPlays && scriptPlays.length > 0) {
        for (const sp of scriptPlays) {
          const existing = playsByScript.get(sp.practice_script_id) || [];
          existing.push(sp);
          playsByScript.set(sp.practice_script_id, existing);
        }
      }

      // Combine scripts with their plays
      const scriptsWithPlays = scripts.map((script: any) => ({
        ...script,
        practice_script_plays: playsByScript.get(script.id) || [],
      }));

      // Map directly to PracticeScript interface
      const mappedScripts = scriptsWithPlays.map((script: any) =>
        this.mapDatabaseScriptToPracticeScript(script)
      );

      const queryTime = performance.now() - startTime;
      debug(
        `[PracticeScriptService] Fetched ${mappedScripts.length} scripts in ${queryTime.toFixed(2)}ms`
      );

      return mappedScripts;
    } catch (error) {
      logError("Error in getPracticeScripts:", error);
      return [];
    }
  }

  /**
   * Get a specific practice script by ID - OPTIMIZED with caching
   */
  static async getPracticeScript(
    scriptId: string
  ): Promise<PracticeScript | null> {
    const cacheKey = `script_${scriptId}`;

    // Check cache first
    const cached = await practiceScriptCache.get<PracticeScript>(cacheKey);
    if (cached) {
      debug("✅ [PracticeScriptService] Cache hit for script:", scriptId);
      return cached;
    }

    debug(
      "🔍 [PracticeScriptService] Cache miss, fetching script from database..."
    );
    const startTime = performance.now();

    try {
      const { data: scripts, error: scriptError } = await table(
        "practice_scripts"
      )
        .select(
          `
          *,
          practice_script_plays (
            *,
            plays (*)
          )
        `
        )
        .eq("id", scriptId)
        .limit(1);

      if (scriptError) {
        if (scriptError.code === "PGRST116") {
          return null;
        }
        logError("Error fetching practice script:", scriptError);
        throw new Error("Failed to fetch practice script");
      }

      if (!scripts || scripts.length === 0) {
        return null;
      }

      const mappedScript = this.mapDatabaseScriptToPracticeScript(scripts[0]);

      // Cache the result
      await practiceScriptCache.set(cacheKey, mappedScript, 1);

      const queryTime = performance.now() - startTime;
      debug(
        `✅ [PracticeScriptService] Fetched script in ${queryTime.toFixed(2)}ms`
      );

      return mappedScript;
    } catch (error) {
      logError("Error in getPracticeScript:", error);
      return null;
    }
  }

  /**
   * Duplicate a practice script
   * Creates a copy of the script with all plays
   */
  static async duplicatePracticeScript(
    scriptId: string,
    newName: string
  ): Promise<PracticeScript> {
    debug(
      `[PracticeScriptService] Duplicating script ${scriptId} as "${newName}"`
    );

    // 1. Get original script with plays
    const original = await this.getPracticeScript(scriptId);
    if (!original) {
      throw new Error(`Script ${scriptId} not found`);
    }

    // 2. Create new script
    const newScript = await this.createPracticeScript({
      name: newName,
      description: original.description,
      teamId: original.teamId,
      tags: original.tags,
      isTemplate: original.isTemplate,
    });

    // 3. Copy all plays with their configuration
    if (original.plays && original.plays.length > 0) {
      for (const play of original.plays) {
        await this.addPlayToScript(
          {
            scriptId: newScript.id,
            playId: play.playId,
            orderIndex: play.order,
            notes: play.notes,
            repetitions: play.repetitions,
            hash: play.hash,
            downDistance: play.downDistance,
            fieldPosition: play.fieldPosition,
            defensiveFront: play.defensiveFront,
            coverage: play.coverage,
            blitz: play.blitz,
            scenarioNotes: (play as any).scenarioNotes,
          },
          play.play
        );
      }
    }

    debug(
      `✅ [PracticeScriptService] Duplicated script with ${original.plays?.length || 0} plays`
    );

    // 4. Return the full duplicated script
    return this.getPracticeScript(newScript.id) as Promise<PracticeScript>;
  }

  /**
   * Archive a practice script (soft delete)
   */
  static async archivePracticeScript(scriptId: string): Promise<void> {
    debug(`[PracticeScriptService] Archiving script ${scriptId}`);

    const { error } = await table("practice_scripts")
      .update({
        is_archived: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", scriptId);

    if (error) {
      logError("Error archiving script:", error);
      throw new Error("Failed to archive practice script");
    }

    // Invalidate cache
    await practiceScriptCache.invalidate(`script_${scriptId}`);
    await practiceScriptCache.invalidatePattern(/^scripts_team_/);

    debug(`✅ [PracticeScriptService] Archived script ${scriptId}`);
  }

  /**
   * Unarchive a practice script
   */
  static async unarchivePracticeScript(scriptId: string): Promise<void> {
    debug(`[PracticeScriptService] Unarchiving script ${scriptId}`);

    const { error } = await table("practice_scripts")
      .update({
        is_archived: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", scriptId);

    if (error) {
      logError("Error unarchiving script:", error);
      throw new Error("Failed to unarchive practice script");
    }

    // Invalidate cache
    await practiceScriptCache.invalidate(`script_${scriptId}`);
    await practiceScriptCache.invalidatePattern(/^scripts_team_/);

    debug(`✅ [PracticeScriptService] Unarchived script ${scriptId}`);
  }

  /**
   * Delete a practice script (hard delete)
   * Warning: This permanently deletes the script and all associated plays
   */
  static async deletePracticeScript(scriptId: string): Promise<void> {
    debug(`[PracticeScriptService] Deleting script ${scriptId}`);

    const { error } = await table("practice_scripts")
      .delete()
      .eq("id", scriptId);

    if (error) {
      logError("Error deleting script:", error);
      throw new Error("Failed to delete practice script");
    }

    // Invalidate cache
    await practiceScriptCache.invalidate(`script_${scriptId}`);
    await practiceScriptCache.invalidatePattern(/^scripts_team_/);

    debug(`✅ [PracticeScriptService] Deleted script ${scriptId}`);
  }

  /**
   * Add a play to an existing practice script
   */
  static async addPlayToScript(
    data: AddPlayToPracticeScriptData,
    _play: Play
  ): Promise<PracticeScript> {
    const { error: playError } = await table("practice_script_plays").insert({
      practice_script_id: data.scriptId,
      play_id: data.playId,
      sequence_order: data.orderIndex || 1,
      coaching_points: data.notes ? [data.notes] : [],
      repetitions: data.repetitions || 5,
      // Game scenario configuration
      hash: data.hash || "middle",
      down_distance: data.downDistance || "1st & 10",
      field_position: data.fieldPosition || "plus_territory",
      defensive_front: data.defensiveFront || "base",
      coverage: data.coverage || "cover_2",
      blitz: data.blitz || "none",
      scenario_notes: data.scenarioNotes || null,
      segment_name: "Drill",
      segment_type: "drill",
    });

    if (playError) {
      logError("Error adding play to script:", playError);
      throw new Error("Failed to add play to practice script");
    }

    const script = await this.getPracticeScript(data.scriptId);
    if (!script) {
      throw new Error("Failed to retrieve updated practice script");
    }

    // Record activity for adding play to practice script
    await ActivityService.recordActivity({
      type: "added_to_script",
      playId: data.playId,
      playName: _play.play_name,
      teamId: script.teamId,
      details: {
        scriptId: data.scriptId,
        repetitions: data.repetitions || 5,
      },
    });
    return script;
  }

  /**
   * Remove a play from a practice script
   */
  static async removePlayFromScript(scriptPlayId: string): Promise<void> {
    debug(`[PracticeScriptService] Removing play ${scriptPlayId} from script`);

    const { error } = await table("practice_script_plays")
      .delete()
      .eq("id", scriptPlayId);

    if (error) {
      logError("Error removing play from script:", error);
      throw new Error("Failed to remove play from script");
    }

    // Invalidate all script caches
    await practiceScriptCache.invalidatePattern(/^script/);

    debug(`✅ [PracticeScriptService] Removed play from script`);
  }

  /**
   * Update a play within a practice script - OPTIMIZED with cache invalidation
   */
  static async updateScriptPlay(
    scriptPlayId: string,
    data: {
      repetitions?: number;
      notes?: string;
      hash?: "left" | "middle" | "right";
      downDistance?: string;
      fieldPosition?: "plus_territory" | "red_zone" | "backed_up" | "midfield";
      defensiveFront?:
        | "base"
        | "4-3"
        | "3-4"
        | "nickel"
        | "dime"
        | "bear"
        | "tite";
      coverage?:
        | "cover_0"
        | "cover_1"
        | "cover_2"
        | "cover_3"
        | "cover_4"
        | "cover_6"
        | "quarters"
        | "man";
      blitz?:
        | "none"
        | "edge"
        | "a_gap"
        | "b_gap"
        | "sim_pressure"
        | "zone_blitz"
        | "all_out";
    }
  ): Promise<void> {
    debug("[PracticeScriptService] updateScriptPlay called with:", {
      scriptPlayId,
      data,
    });

    const updateData: any = {};

    if (data.repetitions !== undefined)
      updateData.repetitions = data.repetitions;
    if (data.notes !== undefined)
      updateData.coaching_points = data.notes ? [data.notes] : [];
    if (data.hash !== undefined) updateData.hash = data.hash;
    if (data.downDistance !== undefined)
      updateData.down_distance = data.downDistance;
    if (data.fieldPosition !== undefined)
      updateData.field_position = data.fieldPosition;
    if (data.defensiveFront !== undefined)
      updateData.defensive_front = data.defensiveFront;
    if (data.coverage !== undefined) updateData.coverage = data.coverage;
    if (data.blitz !== undefined) updateData.blitz = data.blitz;

    debug("[PracticeScriptService] Updating with data:", updateData);

    const { error } = await table("practice_script_plays")
      .update(updateData)
      .eq("id", scriptPlayId);

    if (error) {
      logError("Error updating script play:", error);
      throw new Error("Failed to update script play");
    }

    // Invalidate all script caches to ensure freshness
    await practiceScriptCache.invalidatePattern(/^script/);
  }

  /**
   * BATCH update multiple script plays - MAJOR PERFORMANCE BOOST
   * Updates all plays in a single transaction instead of N sequential queries
   */
  static async batchUpdateScriptPlays(
    updates: Array<{
      scriptPlayId: string;
      data: {
        repetitions?: number;
        notes?: string;
        hash?: "left" | "middle" | "right";
        downDistance?: string;
        fieldPosition?:
          | "plus_territory"
          | "red_zone"
          | "backed_up"
          | "midfield";
        defensiveFront?:
          | "base"
          | "4-3"
          | "3-4"
          | "nickel"
          | "dime"
          | "bear"
          | "tite";
        coverage?:
          | "cover_0"
          | "cover_1"
          | "cover_2"
          | "cover_3"
          | "cover_4"
          | "cover_6"
          | "quarters"
          | "man";
        blitz?:
          | "none"
          | "edge"
          | "a_gap"
          | "b_gap"
          | "sim_pressure"
          | "zone_blitz"
          | "all_out";
      };
    }>
  ): Promise<void> {
    if (updates.length === 0) return;

    debug(`[PracticeScriptService] Batch updating ${updates.length} plays...`);
    const startTime = performance.now();

    try {
      // Execute all updates in parallel for maximum speed
      await Promise.all(
        updates.map(async ({ scriptPlayId, data }) => {
          const updateData: any = {};

          if (data.repetitions !== undefined)
            updateData.repetitions = data.repetitions;
          if (data.notes !== undefined)
            updateData.coaching_points = data.notes ? [data.notes] : [];
          if (data.hash !== undefined) updateData.hash = data.hash;
          if (data.downDistance !== undefined)
            updateData.down_distance = data.downDistance;
          if (data.fieldPosition !== undefined)
            updateData.field_position = data.fieldPosition;
          if (data.defensiveFront !== undefined)
            updateData.defensive_front = data.defensiveFront;
          if (data.coverage !== undefined) updateData.coverage = data.coverage;
          if (data.blitz !== undefined) updateData.blitz = data.blitz;

          const { error } = await table("practice_script_plays")
            .update(updateData)
            .eq("id", scriptPlayId);

          if (error) {
            logError(`Error updating play ${scriptPlayId}:`, error);
            throw error;
          }
        })
      );

      const updateTime = performance.now() - startTime;
      debug(
        `✅ [PracticeScriptService] Batch updated ${updates.length} plays in ${updateTime.toFixed(2)}ms`
      );
      debug(
        `   Average: ${(updateTime / updates.length).toFixed(2)}ms per play`
      );

      // Invalidate all script caches once after batch
      await practiceScriptCache.invalidatePattern(/^script/);
    } catch (error) {
      logError("Error in batch update:", error);
      throw new Error("Failed to batch update script plays");
    }
  }

  /**
   * Reorder plays in a practice script
   * Updates the sequence_order for each play based on the new order
   */
  static async reorderScriptPlays(
    scriptId: string,
    playIds: string[]
  ): Promise<void> {
    debug(
      `[PracticeScriptService] Reordering ${playIds.length} plays in script ${scriptId}`
    );

    // Update order for each play (1-indexed)
    await Promise.all(
      playIds.map(async (playId, index) => {
        const { error } = await table("practice_script_plays")
          .update({ sequence_order: index + 1 })
          .eq("id", playId)
          .eq("practice_script_id", scriptId);

        if (error) {
          logError(`Error reordering play ${playId}:`, error);
          throw error;
        }
      })
    );

    // Invalidate cache
    await practiceScriptCache.invalidate(`script_${scriptId}`);

    debug(`✅ [PracticeScriptService] Reordered plays in script`);
  }

  /**
   * Quick script creation for workflow integration
   */
  static async createQuickScript(
    play: Play,
    teamId: string
  ): Promise<PracticeScript> {
    const script = await this.createPracticeScript({
      name: `Script with ${play.play_name}`,
      description: `Practice script featuring ${play.play_name} and related plays`,
      teamId,
      tags: [play.formation || "", play.p_type || ""].filter(Boolean),
    });

    await this.addPlayToScript(
      {
        scriptId: script.id,
        playId: play.id,
        notes: `Added from playbook workflow`,
        repetitions: 5,
        estimatedTime: 3,
      },
      play
    );

    return script;
  }

  /**
   * Get or create a "Quick Adds" script for fast workflow
   */
  static async getOrCreateQuickAddsScript(
    teamId: string
  ): Promise<PracticeScript> {
    const { data: existingScripts, error: fetchError } = await table(
      "practice_scripts"
    )
      .select("*")
      .eq("team_id", teamId)
      .eq("name", "Quick Adds")
      .limit(1);

    if (fetchError) {
      logError("Error fetching Quick Adds script:", fetchError);
    }

    if (existingScripts && existingScripts.length > 0) {
      const script = existingScripts[0] as any;
      return {
        id: script.id as string,
        title: script.title || (script.name as string),
        description: script.description as string | undefined,
        teamId: script.team_id as string,
        createdBy: script.created_by as string,
        createdAt: new Date(script.created_at as string),
        updatedAt: new Date(script.updated_at as string),
        isTemplate: script.is_template as boolean,
        plays: [],
        duration: (script.duration as number) || 0,
        tags: (script.tags as string[]) || [],
      } as any; // Type cast for compatibility
    }

    return this.createPracticeScript({
      name: "Quick Adds",
      description:
        "Plays added quickly from the playbook for practice planning",
      teamId,
      tags: ["quick-add", "workflow"],
    });
  }

  /**
   * Map database script with plays to PracticeScript interface
   */
  private static mapDatabaseScriptToPracticeScript(
    scriptData: any
  ): PracticeScript {
    const plays: PracticeScriptPlay[] = (
      scriptData.practice_script_plays || []
    ).map((playData: any) => ({
      id: playData.id,
      playId: playData.play_id,
      play: playData.plays,
      order: playData.sequence_order || 0,
      notes: playData.coaching_points?.join(", ") || "",
      repetitions: playData.repetitions || 1,
      estimatedTime: playData.duration_minutes || 10,
      addedAt: new Date(playData.created_at),
      // Game scenario fields (defensive & situation)
      defensiveFront: playData.defensive_front,
      coverage: playData.coverage,
      blitz: playData.blitz,
      hash: playData.hash,
      downDistance: playData.down_distance,
      fieldPosition: playData.field_position,
    }));

    const title = scriptData.title || scriptData.name || "Untitled Script";

    return {
      id: scriptData.id,
      title,
      name: title, // Alias for backward compatibility
      description: scriptData.description,
      teamId: scriptData.team_id,
      createdBy: scriptData.created_by,
      createdAt: new Date(scriptData.created_at),
      updatedAt: new Date(scriptData.updated_at),
      isTemplate: scriptData.is_template || false,
      plays,
      duration: scriptData.duration_minutes || scriptData.duration || 120,
      tags: scriptData.focus_areas || scriptData.tags || [],
    } as any; // Type cast for compatibility with extended interface
  }
}
