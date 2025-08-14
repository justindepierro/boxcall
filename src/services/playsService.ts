/**
 * Plays Service
 * Handles CRUD operations for plays with database-aligned fields
 */

import { supabase } from "../lib/supabase";
import type { Play } from "../types/play";
import { DatabaseDebug } from "../utils/databaseDebug";
import { normalizePlayName, normalizeText } from "../utils/textNormalization";

export class PlaysService {
  /**
   * Auto-create a default team for a user if they don't have one
   * Creates a "Personal Playbook" team for Coach Account users
   */
  private static async ensureUserHasTeam(): Promise<string> {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get user profile to check role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      // Check if user already has a team they own/created
      const { data: existingTeams } = await supabase
        .from("teams")
        .select("id")
        .eq("created_by", user.id)
        .limit(1);

      if (existingTeams && existingTeams.length > 0) {
        return existingTeams[0].id;
      }

      // Create appropriate default team based on user type
      const isCoach = profile?.role === "coach";
      const teamName = isCoach ? "Personal Playbook" : "My Team";
      const schoolName = isCoach ? "Personal Collection" : "Auto-Created Team";

      const { data: newTeam, error: teamError } = await supabase
        .from("teams")
        .insert({
          name: teamName,
          school_name: schoolName,
          created_by: user.id,
        })
        .select("id")
        .single();

      if (teamError) throw teamError;

      // Create team membership for the user as a coach
      const { error: membershipError } = await supabase
        .from("team_members")
        .insert({
          team_id: newTeam.id,
          user_id: user.id,
          role: "coach",
          is_active: true,
        });

      if (membershipError) {
        console.error(
          "Warning: Failed to create team membership:",
          membershipError
        );
        // Don't throw here - team was created successfully
      }

      return newTeam.id;
    } catch (error) {
      console.error("Failed to ensure user has team:", error);
      throw error;
    }
  }

  /**
   * Auto-create a default playbook for a user if they don't have one
   */
  static async ensureUserHasPlaybook(): Promise<string> {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get user profile to check role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      // Check if user already has a playbook
      const { data: existingPlaybooks } = await supabase
        .from("playbooks")
        .select("id")
        .eq("created_by", user.id)
        .limit(1);

      if (existingPlaybooks && existingPlaybooks.length > 0) {
        return existingPlaybooks[0].id;
      }

      // Create default playbook for user
      const teamId = await this.ensureUserHasTeam();

      // Create appropriate playbook based on user type
      const isCoach = profile?.role === "coach";
      const playbookName = isCoach ? "Personal Playbook" : "My Playbook";
      const playbookDescription = isCoach
        ? "Personal collection of plays and concepts - ready to apply to any program"
        : "Default playbook created automatically";

      const { data: newPlaybook, error: playbookError } = await supabase
        .from("playbooks")
        .insert({
          name: playbookName,
          description: playbookDescription,
          team_id: teamId,
          created_by: user.id,
        })
        .select("id")
        .single();

      if (playbookError) throw playbookError;
      return newPlaybook.id;
    } catch (error) {
      console.error("Failed to ensure user has playbook:", error);
      throw error;
    }
  }

  /**
   * Create a new play in the database
   * Only saves fields that exist in the database schema
   */
  static async createPlay(playData: Partial<Play>): Promise<Play> {
    try {
      // Get current user for created_by field
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Generate a unique ID for the play
      const playId = crypto.randomUUID();

      // Ensure user has a playbook (auto-create if needed)
      const playbookId =
        playData.playbook_id || (await this.ensureUserHasPlaybook());

      // Prepare ONLY database-valid fields for insertion
      const newPlay = {
        id: playId,
        playbook_id: playbookId,

        // Core required fields
        play_name: normalizePlayName(playData.play_name || "Untitled Play"),
        p_type: playData.p_type || "Pass",
        formation: normalizeText(playData.formation || ""),

        // Optional text fields (all exist in database)
        one_word_play: playData.one_word_play
          ? normalizeText(playData.one_word_play)
          : "",
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
        created_by: user.id, // Use actual authenticated user ID
        created_at: new Date(),
        updated_at: new Date(),
        // Duplicate key supplied by domain layer when enforcing canonical uniqueness (optional)
        duplicate_key:
          typeof (playData as unknown as { duplicate_key?: string })
            .duplicate_key === "string"
            ? (playData as unknown as { duplicate_key?: string }).duplicate_key
            : undefined,

  // Media
  diagram_url: playData.diagram_url || null,
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
        if (error.code === "23505") {
          const dupErr = new Error("Duplicate play (name + formation) exists.");
          (dupErr as { code?: string }).code = "23505";
          throw dupErr;
        }
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
        play_name: updates.play_name
          ? normalizePlayName(updates.play_name)
          : undefined,
        p_type: updates.p_type,
        formation: updates.formation
          ? normalizeText(updates.formation)
          : undefined,

        // Optional fields
        one_word_play: updates.one_word_play
          ? normalizeText(updates.one_word_play)
          : updates.one_word_play,
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

  // Media
  diagram_url: updates.diagram_url,
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

  /**
   * Batch archive multiple plays in one request for efficiency
   */
  static async deletePlays(ids: string[]): Promise<void> {
    if (!ids.length) return;
    try {
      const { error } = await supabase
        .from("plays")
        .update({ is_archived: true, updated_at: new Date() })
        .in("id", ids);

      if (error) {
        console.error("❌ Error batch archiving plays:", error);
        throw new Error(`Failed to archive plays: ${error.message}`);
      }
    } catch (error) {
      console.error("❌ PlaysService.deletePlays failed:", error);
      throw error;
    }
  }

  /** Restore previously archived plays */
  static async restorePlays(ids: string[]): Promise<void> {
    if (!ids.length) return;
    try {
      const { error } = await supabase
        .from("plays")
        .update({ is_archived: false, updated_at: new Date() })
        .in("id", ids);
      if (error) {
        console.error("❌ Error restoring plays:", error);
        throw new Error(`Failed to restore plays: ${error.message}`);
      }
    } catch (error) {
      console.error("❌ PlaysService.restorePlays failed:", error);
      throw error;
    }
  }
}
