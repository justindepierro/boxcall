/**
 * Plays Service
 * Handles CRUD operations for plays in Supabase database
 */

import { supabase } from "../lib/supabase";
import type { Play } from "../types/play";

export class PlaysService {
  /**
   * Create a new play in the database
   */
  static async createPlay(playData: Partial<Play>): Promise<Play> {
    try {
      // Generate a unique ID for the play
      const playId = crypto.randomUUID();

      // Set default playbook_id if not provided (for demo purposes)
      const playbookId = playData.playbook_id || "demo-playbook-id";

      // Prepare the play data for database insertion
      const newPlay: Partial<Play> = {
        id: playId,
        playbook_id: playbookId,
        play_name: playData.play_name || "Untitled Play",
        p_type: playData.p_type || "Pass",
        formation: playData.formation || "",
        notes: playData.notes || "",
        one_word_play: playData.one_word_play || "",

        // Formation details
        f_dir: playData.f_dir || "",
        ftag1: playData.ftag1 || "",
        ftag2: playData.ftag2 || "",
        back_align: playData.back_align || "",
        shift: playData.shift || "",
        motion: playData.motion || "",
        f_type: playData.f_type || "",
        personnel: playData.personnel || "",
        protection: playData.protection || "",

        // Play details
        p_tag1: playData.p_tag1 || "",
        p_tag2: playData.p_tag2 || "",
        p_dir: playData.p_dir || "",
        key_player1: playData.key_player1 || "",
        key_player2: playData.key_player2 || "",
        check_into: playData.check_into || "",
        r_str: playData.r_str || "",
        p_str: playData.p_str || "",

        // Preferences
        pref_down: playData.pref_down || "",
        pref_dis: playData.pref_dis || "",
        pref_hash: playData.pref_hash || "",
        pref_cov: playData.pref_cov || "",
        pref_front: playData.pref_front || "",

        // Performance fields
        success_rate: playData.success_rate || 0,
        confidence_base: playData.confidence_base || 70,
        times_called: playData.times_called || 0,
        times_successful: playData.times_successful || 0,
        complexity_score: playData.complexity_score || 1,

        // Media and additional
        diagram_url: playData.diagram_url || "",
        video_url: playData.video_url || "",
        tags: playData.tags || [],
        is_archived: playData.is_archived || false,

        // Custom fields
        custom_fields: playData.custom_fields || {},

        // System fields (will be set by database)
        created_by: "system", // TODO: Set from auth context
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
