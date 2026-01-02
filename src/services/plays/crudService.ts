/**
 * Play CRUD Operations
 * Create, Read, Update, Delete operations for plays
 */

import { table } from "../../data/supabase/db";
import { getCurrentUserId } from "../../lib/auth-helpers";
import { ActivityService } from "../activityService";
import { debug, error as logError, warn } from "../../utils/logger";
import { buildNewPlayData, buildPlayUpdateData } from "../playDataBuilders";
import { PlayHelperService } from "./helperService";

import type { Play } from "../../types/play";
import type { PlayQueryOptions, MergePlaybooksResult } from "./types";

/**
 * Service for play CRUD operations
 */
export class PlayCrudService {
  /**
   * Create a new play in the database
   * Only saves fields that exist in the database schema
   *
   * NOTE: Validation is handled by SecurePlaysService using Zod schemas.
   * This method assumes data has already been validated.
   */
  static async createPlay(playData: Partial<Play>): Promise<Play> {
    try {
      // Get current user for created_by field
      const userId = getCurrentUserId();
      if (!userId) throw new Error("User not authenticated");

      // Generate a unique ID for the play
      const playId = crypto.randomUUID();

      // Ensure user has a playbook (auto-create if needed)
      const playbookId =
        playData.playbook_id ||
        (await PlayHelperService.ensureUserHasPlaybook());

      // Build database-valid fields using helper
      const newPlay = buildNewPlayData(playData, playId, playbookId, userId);

      debug("[PlayCrudService] Creating play in database", newPlay);

      // Insert into Supabase
      let { data, error } = await table("plays")
        .insert([newPlay as any])
        .select()
        .single();

      // If we get a foreign key error, try to create the demo playbook
      if (
        error &&
        error.code === "23503" &&
        error.message.includes("playbook_id")
      ) {
        debug("[PlayCrudService] Playbook missing; resolving user's playbook");
        const fallbackPlaybookId =
          await PlayHelperService.ensureUserHasPlaybook();

        // Update the play with a valid playbook ID and retry
        newPlay.playbook_id = fallbackPlaybookId;
        debug(
          "[PlayCrudService] Retrying play creation with resolved playbook"
        );

        const retryResult = await table("plays")
          .insert([newPlay as any])
          .select()
          .single();

        data = retryResult.data;
        error = retryResult.error;
      }

      if (error) {
        if (error.code === "23505") {
          const dupErr = new Error("Duplicate play (name + formation) exists.");
          (dupErr as { code?: string }).code = "23505";
          throw dupErr;
        }
        logError("❌ Error creating play:", error);
        throw new Error(`Failed to create play: ${error.message}`);
      }

      if (!data) {
        throw new Error("No data returned from play creation");
      }

      debug("[PlayCrudService] Play created successfully", data);

      // Record activity for the created play
      await ActivityService.recordActivity({
        type: "created",
        playId: data.id,
        playName: data.play_name,
        teamId: undefined,
      });

      return data as unknown as Play;
    } catch (error) {
      logError("❌ PlayCrudService.createPlay failed:", error);
      throw error;
    }
  }

  /**
   * Get plays by playbook ID
   */
  static async getPlaysByPlaybook(
    playbookId: string,
    options?: PlayQueryOptions
  ): Promise<Play[]> {
    try {
      let query = table("plays")
        .select("*")
        .eq("playbook_id", playbookId)
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 100) - 1
        );
      }

      const { data, error } = await query;

      if (error) {
        logError("❌ Error fetching plays:", error);
        throw new Error(`Failed to fetch plays: ${error.message}`);
      }

      return PlayHelperService.withLegacyFormationDirMany(
        ((data as unknown as Play[]) || []).slice()
      );
    } catch (error) {
      logError("❌ PlayCrudService.getPlaysByPlaybook failed:", error);
      throw error;
    }
  }

  /**
   * Get a single play by ID
   */
  static async getPlay(id: string): Promise<Play | null> {
    try {
      const { data, error } = await table("plays")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows found
          return null;
        }
        logError("❌ Error fetching play:", error);
        throw new Error(`Failed to fetch play: ${error.message}`);
      }

      return PlayHelperService.withLegacyFormationDir(data as unknown as Play);
    } catch (error) {
      logError("❌ PlayCrudService.getPlay failed:", error);
      throw error;
    }
  }

  /**
   * Get multiple plays by their IDs
   */
  static async getPlaysByIds(ids: string[]): Promise<Play[]> {
    try {
      if (ids.length === 0) return [];

      const { data, error } = await table("plays").select("*").in("id", ids);

      if (error) {
        logError("❌ Error fetching plays by IDs:", error);
        throw new Error(`Failed to fetch plays: ${error.message}`);
      }

      return PlayHelperService.withLegacyFormationDirMany(
        ((data || []) as unknown as Play[]).slice()
      );
    } catch (error) {
      logError("❌ PlayCrudService.getPlaysByIds failed:", error);
      throw error;
    }
  }

  /**
   * Update an existing play
   * Uses buildPlayUpdateData helper for consistent field handling
   */
  static async updatePlay(id: string, updates: Partial<Play>): Promise<Play> {
    try {
      // Use helper function for consistent field mapping
      const validUpdates = buildPlayUpdateData(updates);

      const { data, error } = await table("plays")
        .update(validUpdates)
        .eq("id", id)
        .select()
        .maybeSingle(); // Use maybeSingle() to avoid 406 error when RLS blocks or row missing

      if (error) {
        logError("❌ Error updating play:", error);
        throw new Error(`Failed to update play: ${error.message}`);
      }

      if (!data) {
        throw new Error(
          "Play not found or you don't have permission to update it"
        );
      }

      // Record activity for the updated play
      await ActivityService.recordActivity({
        type: "updated",
        playId: data.id,
        playName: data.play_name,
        teamId: undefined,
      });

      return data as unknown as Play;
    } catch (error) {
      logError("❌ PlayCrudService.updatePlay failed:", error);
      throw error;
    }
  }

  /**
   * Delete a play (archive it)
   */
  static async deletePlay(id: string): Promise<void> {
    try {
      // First, get the play data for activity recording
      const { data: play } = await table("plays")
        .select("id, play_name")
        .eq("id", id)
        .single();

      const { error } = await table("plays")
        .update({
          is_archived: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        logError("❌ Error archiving play:", error);
        throw new Error(`Failed to archive play: ${error.message}`);
      }

      // Record activity for the deleted play
      if (play) {
        await ActivityService.recordActivity({
          type: "deleted",
          playId: play.id,
          playName: play.play_name,
          teamId: undefined,
        });
      }
    } catch (error) {
      logError("❌ PlayCrudService.deletePlay failed:", error);
      throw error;
    }
  }

  /**
   * Batch archive multiple plays in one request for efficiency
   */
  static async deletePlays(ids: string[]): Promise<void> {
    if (!ids.length) return;
    try {
      const { error } = await table("plays")
        .update({ is_archived: true, updated_at: new Date().toISOString() })
        .in("id", ids);

      if (error) {
        logError("❌ Error batch archiving plays:", error);
        throw new Error(`Failed to archive plays: ${error.message}`);
      }
    } catch (error) {
      logError("❌ PlayCrudService.deletePlays failed:", error);
      throw error;
    }
  }

  /** Restore previously archived plays */
  static async restorePlays(ids: string[]): Promise<void> {
    if (!ids.length) return;
    try {
      const { error } = await table("plays")
        .update({ is_archived: false, updated_at: new Date().toISOString() })
        .in("id", ids);
      if (error) {
        logError("❌ Error restoring plays:", error);
        throw new Error(`Failed to restore plays: ${error.message}`);
      }
    } catch (error) {
      logError("❌ PlayCrudService.restorePlays failed:", error);
      throw error;
    }
  }

  /**
   * Merge multiple playbooks into a NEW playbook
   * Creates a new playbook and copies all plays from source playbooks
   * Original playbooks remain untouched
   *
   * @param sourcePlaybookIds - Array of playbook IDs to merge
   * @param newName - Name for the new merged playbook
   * @param newDescription - Optional description for the new playbook
   * @param teamId - Team ID for the new playbook
   * @returns The newly created playbook with copied plays
   */
  static async mergePlaybooks(
    sourcePlaybookIds: string[],
    newName: string,
    newDescription?: string,
    teamId?: string
  ): Promise<MergePlaybooksResult> {
    if (sourcePlaybookIds.length < 2) {
      throw new Error("At least 2 playbooks are required to merge");
    }

    try {
      const userId = getCurrentUserId();
      if (!userId) throw new Error("User not authenticated");

      // Get team ID if not provided
      const resolvedTeamId =
        teamId || (await PlayHelperService.ensureUserHasTeam());

      debug("[PlayCrudService] Merging playbooks", {
        sourcePlaybookIds,
        newName,
        teamId: resolvedTeamId,
      });

      // Step 1: Create the new playbook
      const { data: newPlaybook, error: createError } = await table("playbooks")
        .insert({
          name: newName,
          description:
            newDescription ||
            `Merged from ${sourcePlaybookIds.length} playbooks`,
          team_id: resolvedTeamId,
          created_by: userId,
          is_active: true,
          play_count: 0,
        })
        .select("id")
        .single();

      if (createError || !newPlaybook) {
        throw new Error(
          `Failed to create merged playbook: ${createError?.message}`
        );
      }

      // Step 2: Fetch all plays from source playbooks
      const { data: sourcePlays, error: fetchError } = await table("plays")
        .select("*")
        .in("playbook_id", sourcePlaybookIds)
        .eq("is_archived", false);

      if (fetchError) {
        throw new Error(`Failed to fetch source plays: ${fetchError.message}`);
      }

      if (!sourcePlays || sourcePlays.length === 0) {
        debug("[PlayCrudService] No plays to merge");
        return { playbookId: newPlaybook.id, playCount: 0 };
      }

      // Step 3: Copy plays to the new playbook with new IDs
      // Note: formation_id and personnel_id are cleared because they reference
      // formations/personnel specific to the original playbook
      const copiedPlays = sourcePlays.map((play: any) => {
        // Generate new ID and update playbook reference
        const {
          id: _oldId,
          created_at: _createdAt,
          updated_at: _updatedAt,
          formation_id: _formationId, // Clear - references original playbook's formations
          personnel_id: _personnelId, // Clear - references original playbook's personnel
          ...playData
        } = play;
        return {
          ...playData,
          id: crypto.randomUUID(),
          playbook_id: newPlaybook.id,
          formation_id: null, // Clear foreign key reference
          personnel_id: null, // Clear foreign key reference
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: userId,
          // Add merge context
          creation_source: "bulk_import" as const,
          creation_context: {
            merged_from: sourcePlaybookIds,
            original_play_id: play.id,
            original_formation_id: play.formation_id || null,
            original_personnel_id: play.personnel_id || null,
            merge_date: new Date().toISOString(),
          },
        };
      });

      // Step 4: Batch insert the copied plays
      const { error: insertError } = await table("plays").insert(copiedPlays);

      if (insertError) {
        // Clean up the playbook if insert fails
        await table("playbooks").delete().eq("id", newPlaybook.id);
        throw new Error(`Failed to copy plays: ${insertError.message}`);
      }

      // Step 5: Update the play count on the new playbook
      const { error: updateError } = await table("playbooks")
        .update({ play_count: copiedPlays.length })
        .eq("id", newPlaybook.id);

      if (updateError) {
        warn("Failed to update play count after merge:", updateError);
      }

      debug("[PlayCrudService] Merge complete", {
        newPlaybookId: newPlaybook.id,
        playCount: copiedPlays.length,
      });

      return { playbookId: newPlaybook.id, playCount: copiedPlays.length };
    } catch (error) {
      logError("❌ PlayCrudService.mergePlaybooks failed:", error);
      throw error;
    }
  }
}
