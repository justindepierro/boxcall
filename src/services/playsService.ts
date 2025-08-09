/**
 * Plays Service
 * Handles CRUD operations for plays with database-aligned fields
 */

import { supabase } from "../lib/supabase";
import type { Play } from "../types/play";
import { DatabaseDebug } from "../utils/databaseDebug";

export class PlaysService {
  /**
   * Create a new play in the database
   * Only saves fields that exist in the database schema
   */
  static async createPlay(playData: Partial<Play>): Promise<Play> {
    try {
      // Generate a unique ID for the play
      const playId = crypto.randomUUID();

      // Use the correct demo playbook UUID from our database seeds
      const playbookId =
        playData.playbook_id || "550e8400-e29b-41d4-a716-446655440001";

      // Prepare ONLY database-valid fields for insertion
      const newPlay = {
        id: playId,
        playbook_id: playbookId,

        // Core required fields
        play_name: playData.play_name || "Untitled Play",
        p_type: playData.p_type || "Pass",
        formation: playData.formation || "",

        // Optional text fields (all exist in database)
        one_word_play: playData.one_word_play || "",
        notes: playData.notes || "",
        personnel: playData.personnel || "",

        // Formation details
        f_type: playData.f_type || "",
        f_dir: playData.f_dir || "",

        // Play details
        protection: playData.protection || "",
        p_dir: playData.p_dir || "",
        r_str: playData.r_str || "",
        p_str: playData.p_str || "",

        // Tags (new system - database uses ftag1, ftag2, p_tag1, p_tag2)
        ftag1: playData.ftag1 || "",
        ftag2: playData.ftag2 || "",
        p_tag1: playData.p_tag1 || "",
        p_tag2: playData.p_tag2 || "",

        // Additional play data
        back_align: playData.back_align || "",
        shift: playData.shift || "",
        motion: playData.motion || "",
        key_player1: playData.key_player1 || "",
        key_player2: playData.key_player2 || "",
        check_into: playData.check_into || "",

        // Preferences
        pref_down: playData.pref_down || "",
        pref_dis: playData.pref_dis || "",
        pref_hash: playData.pref_hash || "",
        pref_cov: playData.pref_cov || "",
        pref_front: playData.pref_front || "",

        // Performance fields (integers)
        confidence_base: playData.confidence_base || 70,
        times_called: playData.times_called || 0,
        times_successful: playData.times_successful || 0,
        complexity_score: playData.complexity_score || 1,

        // Metadata
        is_archived: playData.is_archived || false,
        created_by: "00000000-0000-0000-0000-000000000001", // Demo coach UUID
        created_at: new Date(),
        updated_at: new Date(),
      };

      console.log("🎯 Creating play in database:", newPlay);

      // Insert into Supabase
      let { data, error } = await supabase
        .from("plays")
        .insert([newPlay])
        .select()
        .single();

      // If we get a foreign key error, try to create the demo playbook
      if (
        error &&
        error.code === "23503" &&
        error.message.includes("playbook_id")
      ) {
        console.log("📚 Playbook doesn't exist, creating demo playbook...");
        await DatabaseDebug.checkPlaybooks();

        const createdPlaybookId = await DatabaseDebug.createDemoPlaybook();
        if (createdPlaybookId) {
          // Update the play with the new playbook ID and try again
          newPlay.playbook_id = createdPlaybookId;
          console.log("🔄 Retrying play creation with new playbook...");

          const retryResult = await supabase
            .from("plays")
            .insert([newPlay])
            .select()
            .single();

          data = retryResult.data;
          error = retryResult.error;
        }
      }

      if (error) {
        console.error("❌ Error creating play:", error);
        throw new Error(`Failed to create play: ${error.message}`);
      }

      if (!data) {
        throw new Error("No data returned from play creation");
      }

      console.log("✅ Play created successfully:", data);
      return data as Play;
    } catch (error) {
      console.error("❌ PlaysService.createPlay failed:", error);
      throw error;
    }
  }

  /**
   * Get plays by playbook ID
   */
  static async getPlaysByPlaybook(playbookId: string): Promise<Play[]> {
    try {
      const { data, error } = await supabase
        .from("plays")
        .select("*")
        .eq("playbook_id", playbookId)
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching plays:", error);
        throw new Error(`Failed to fetch plays: ${error.message}`);
      }

      return (data as Play[]) || [];
    } catch (error) {
      console.error("❌ PlaysService.getPlaysByPlaybook failed:", error);
      throw error;
    }
  }

  /**
   * Get a single play by ID
   */
  static async getPlay(id: string): Promise<Play | null> {
    try {
      const { data, error } = await supabase
        .from("plays")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows found
          return null;
        }
        console.error("❌ Error fetching play:", error);
        throw new Error(`Failed to fetch play: ${error.message}`);
      }

      return data as Play;
    } catch (error) {
      console.error("❌ PlaysService.getPlay failed:", error);
      throw error;
    }
  }

  /**
   * Update an existing play
   */
  static async updatePlay(id: string, updates: Partial<Play>): Promise<Play> {
    try {
      // Prepare updates with only database-valid fields
      const validUpdates = {
        // Core fields
        play_name: updates.play_name,
        p_type: updates.p_type,
        formation: updates.formation,

        // Optional fields
        one_word_play: updates.one_word_play,
        notes: updates.notes,
        personnel: updates.personnel,
        f_type: updates.f_type,
        f_dir: updates.f_dir,
        protection: updates.protection,
        p_dir: updates.p_dir,
        r_str: updates.r_str,
        p_str: updates.p_str,

        // Tags
        ftag1: updates.ftag1,
        ftag2: updates.ftag2,
        p_tag1: updates.p_tag1,
        p_tag2: updates.p_tag2,

        // Additional data
        back_align: updates.back_align,
        shift: updates.shift,
        motion: updates.motion,
        key_player1: updates.key_player1,
        key_player2: updates.key_player2,
        check_into: updates.check_into,

        // Preferences
        pref_down: updates.pref_down,
        pref_dis: updates.pref_dis,
        pref_hash: updates.pref_hash,
        pref_cov: updates.pref_cov,
        pref_front: updates.pref_front,

        // Performance
        confidence_base: updates.confidence_base,
        times_called: updates.times_called,
        times_successful: updates.times_successful,
        complexity_score: updates.complexity_score,

        // Metadata
        is_archived: updates.is_archived,
        updated_at: new Date(),
      };

      // Remove undefined values
      const cleanUpdates = Object.fromEntries(
        Object.entries(validUpdates).filter(([_, value]) => value !== undefined)
      );

      const { data, error } = await supabase
        .from("plays")
        .update(cleanUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("❌ Error updating play:", error);
        throw new Error(`Failed to update play: ${error.message}`);
      }

      if (!data) {
        throw new Error("No data returned from play update");
      }

      return data as Play;
    } catch (error) {
      console.error("❌ PlaysService.updatePlay failed:", error);
      throw error;
    }
  }

  /**
   * Delete a play (archive it)
   */
  static async deletePlay(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("plays")
        .update({
          is_archived: true,
          updated_at: new Date(),
        })
        .eq("id", id);

      if (error) {
        console.error("❌ Error archiving play:", error);
        throw new Error(`Failed to archive play: ${error.message}`);
      }
    } catch (error) {
      console.error("❌ PlaysService.deletePlay failed:", error);
      throw error;
    }
  }
}
