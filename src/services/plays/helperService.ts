/**
 * Play Helper Utilities
 * Team/playbook auto-creation, unique values queries, formation helpers
 */

import { table } from "../../data/supabase/db";
import { getCurrentUserId } from "../../lib/auth-helpers";
import { leftRightToLegacyValue, parseLeftRight } from "../../utils/leftRight";
import { error as logError } from "../../utils/logger";

import type { Play } from "../../types/play";

/**
 * Helper utilities for play operations
 */
export class PlayHelperService {
  /**
   * Add legacy f_dir field for backward compatibility
   */
  static withLegacyFormationDir(play: Play): Play {
    const existing = (play.f_dir || "").trim();
    if (existing) return play;

    const token = parseLeftRight(
      typeof play.formation_direction === "string"
        ? play.formation_direction
        : ""
    );
    const legacy = leftRightToLegacyValue(token);
    if (!legacy) return play;

    return { ...play, f_dir: legacy };
  }

  /**
   * Add legacy f_dir to array of plays
   */
  static withLegacyFormationDirMany(plays: Play[]): Play[] {
    return plays.map((p) => PlayHelperService.withLegacyFormationDir(p));
  }

  /**
   * Auto-create a default team for a user if they don't have one
   * Creates a "Personal Playbook" team for Coach Account users
   */
  static async ensureUserHasTeam(): Promise<string> {
    try {
      // Get current user
      const userId = getCurrentUserId();
      if (!userId) throw new Error("User not authenticated");

      // Get user profile to check role
      const { data: profile } = await table("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      // Check if user already has a team they own/created
      const { data: existingTeams } = await table("teams")
        .select("id")
        .eq("created_by", userId)
        .limit(1);

      if (existingTeams && existingTeams.length > 0) {
        return existingTeams[0].id;
      }

      // Create appropriate default team based on user type
      const isCoach = profile?.role === "coach";
      const teamName = isCoach ? "Personal Playbook" : "My Team";
      const schoolName = isCoach ? "Personal Collection" : "Auto-Created Team";

      const { data: newTeam, error: teamError } = await table("teams")
        .insert({
          name: teamName,
          school_name: schoolName,
          created_by: userId,
        })
        .select("id")
        .single();

      if (teamError) throw teamError;

      // Create team membership for the user as a coach
      const { error: membershipError } = await table("team_members").insert({
        team_id: newTeam.id,
        user_id: userId,
        team_role: "coach",
      });

      if (membershipError) {
        logError("Warning: Failed to create team membership:", membershipError);
        // Don't throw here - team was created successfully
      }

      return newTeam.id;
    } catch (error) {
      logError("Failed to ensure user has team:", error);
      throw error;
    }
  }

  /**
   * Auto-create a default playbook for a user if they don't have one
   */
  static async ensureUserHasPlaybook(): Promise<string> {
    try {
      // Get current user
      const userId = getCurrentUserId();
      if (!userId) throw new Error("User not authenticated");

      // Get user profile to check role
      const { data: profile } = await table("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      // Check if user already has a playbook
      const { data: existingPlaybooks } = await table("playbooks")
        .select("id")
        .eq("created_by", userId)
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

      const { data: newPlaybook, error: playbookError } = await table(
        "playbooks"
      )
        .insert({
          name: playbookName,
          description: playbookDescription,
          team_id: teamId,
          created_by: userId,
        })
        .select("id")
        .single();

      if (playbookError) throw playbookError;
      return newPlaybook.id;
    } catch (error) {
      logError("Failed to ensure user has playbook:", error);
      throw error;
    }
  }

  /**
   * Get unique formation values for suggestions
   */
  static async getUniqueFormations(): Promise<string[]> {
    try {
      const { data, error } = await table("plays")
        .select("formation")
        .not("formation", "is", null)
        .neq("formation", "")
        .order("formation");

      if (error) {
        logError("❌ Error getting unique formations:", error);
        return [];
      }

      // Get unique values using DISTINCT-like behavior
      const uniqueFormations = [...new Set(data.map((item) => item.formation))];
      return uniqueFormations.filter(Boolean);
    } catch (error) {
      logError("❌ PlayHelperService.getUniqueFormations failed:", error);
      return [];
    }
  }

  /**
   * Get unique play names for suggestions
   */
  static async getUniquePlayNames(): Promise<string[]> {
    try {
      const { data, error } = await table("plays")
        .select("play_name")
        .not("play_name", "is", null)
        .neq("play_name", "")
        .order("play_name");

      if (error) {
        logError("❌ Error getting unique play names:", error);
        return [];
      }

      // Get unique values
      const uniqueNames = [...new Set(data.map((item) => item.play_name))];
      return uniqueNames.filter(Boolean);
    } catch (error) {
      logError("❌ PlayHelperService.getUniquePlayNames failed:", error);
      return [];
    }
  }

  /**
   * Get unique personnel values for suggestions
   */
  static async getUniquePersonnel(): Promise<string[]> {
    try {
      const { data, error } = await table("plays")
        .select("personnel")
        .not("personnel", "is", null)
        .neq("personnel", "")
        .order("personnel");

      if (error) {
        logError("❌ Error getting unique personnel:", error);
        return [];
      }

      // Get unique values
      const uniquePersonnel = [...new Set(data.map((item) => item.personnel))];
      return uniquePersonnel.filter((p): p is string => p !== null);
    } catch (error) {
      logError("❌ PlayHelperService.getUniquePersonnel failed:", error);
      return [];
    }
  }

  /**
   * Get unique play types from all plays
   */
  static async getUniquePlayTypes(): Promise<string[]> {
    try {
      const { data, error } = await table("plays")
        .select("p_type")
        .not("p_type", "is", null)
        .neq("p_type", "")
        .order("p_type");

      if (error) {
        logError("❌ Error getting unique play types:", error);
        return [];
      }

      // Get unique values
      const uniqueTypes = [...new Set(data.map((item) => item.p_type))];
      return uniqueTypes.filter(Boolean);
    } catch (error) {
      logError("❌ PlayHelperService.getUniquePlayTypes failed:", error);
      return [];
    }
  }

  /**
   * Helper: Extract base formation name (remove direction keywords)
   */
  static extractBaseFormation(formation: string): string {
    const directionKeywords = [
      "left",
      "right",
      "l",
      "r",
      "lt",
      "rt",
      "lft",
      "rgt",
      "middle",
      "mid",
      "center",
      "c",
    ];
    const words = formation.toLowerCase().split(/\s+/);
    return words.filter((word) => !directionKeywords.includes(word)).join(" ");
  }

  /**
   * Helper: Extract direction from formation name
   */
  static extractDirectionFromFormation(formation: string): string | null {
    const words = formation.toLowerCase().split(/\s+/);
    const directionKeywords = [
      "left",
      "right",
      "l",
      "r",
      "lt",
      "rt",
      "lft",
      "rgt",
    ];

    for (const word of words) {
      if (directionKeywords.includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
    }
    return null;
  }
}
