/**
 * Plays Service
 * Handles CRUD operations for plays         // P        // Performance fields (only include fields that exist in database)
        confidence_base: playData.confidence_base || 70,
        times_called: playData.times_called || 0,
        times_successful: playData.times_successful || 0,
        complexity_score: playData.complexity_score || 1,

        // Metadata 
        is_archived: playData.is_archived || false,

        // System fields
        created_by: "demo-coach", // Use demo coach name (TEXT field, not UUID)
        created_at: new Date(),
        updated_at: new Date(),nly include fields that exist in database)
        confidence_base: playData.confidence_base || 70,
        times_called: playData.times_called || 0,
        times_successful: playData.times_successful || 0,
        complexity_score: playData.complexity_score || 1,

        // Metadata 
        is_archived: playData.is_archived || false,

        // System fields
        created_by: "demo-coach", // Use demo coach name (TEXT field, not UUID)
        created_at: new Date(),
        updated_at: new Date(),
 */

import { supabase } from "../lib/supabase";
import type { Play } from "../types/play";

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
        f_type: playData.f_type || "",
        f_dir: playData.f_dir || "",
        protection: playData.protection || "",
        p_dir: playData.p_dir || "",
        r_str: playData.r_str || "",
        p_str: playData.p_str || "",
        ftag1: playData.ftag1 || "",
        ftag2: playData.ftag2 || "",
        p_tag1: playData.p_tag1 || "",
        p_tag2: playData.p_tag2 || "",
        back_align: playData.back_align || "",
        shift: playData.shift || "",
        motion: playData.motion || "",
        key_player1: playData.key_player1 || "",
        key_player2: playData.key_player2 || "",
        check_into: playData.check_into || "",

        // Preference fields
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
        created_by: "demo-coach",
        created_at: new Date(),
        updated_at: new Date(),
      };

      console.log("🎯 Creating play in database:", newPlay);

      // Insert into Supabase
      const { data, error } = await supabase
        .from("plays")
        .insert([newPlay])
        .select()
        .single();

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
   * Update an existing play in the database
   */
  static async updatePlay(
    playId: string,
    playData: Partial<Play>
  ): Promise<Play> {
    try {
      const updatedPlay = {
        ...playData,
        updated_at: new Date(),
      };

      const { data, error } = await supabase
        .from("plays")
        .update(updatedPlay)
        .eq("id", playId)
        .select()
        .single();

      if (error) {
        console.error("❌ Error updating play:", error);
        throw new Error(`Failed to update play: ${error.message}`);
      }

      if (!data) {
        throw new Error("No data returned from play update");
      }

      console.log("✅ Play updated successfully:", data);
      return data as Play;
    } catch (error) {
      console.error("❌ PlaysService.updatePlay failed:", error);
      throw error;
    }
  }

  /**
   * Delete a play from the database
   */
  static async deletePlay(playId: string): Promise<void> {
    try {
      const { error } = await supabase.from("plays").delete().eq("id", playId);

      if (error) {
        console.error("❌ Error deleting play:", error);
        throw new Error(`Failed to delete play: ${error.message}`);
      }

      console.log("✅ Play deleted successfully");
    } catch (error) {
      console.error("❌ PlaysService.deletePlay failed:", error);
      throw error;
    }
  }

  /**
   * Get a single play by ID
   */
  static async getPlay(playId: string): Promise<Play | null> {
    try {
      const { data, error } = await supabase
        .from("plays")
        .select("*")
        .eq("id", playId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Play not found
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
}
