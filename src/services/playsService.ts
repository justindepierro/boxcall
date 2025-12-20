/**
 * Unified Play Service
 *
 * Consolidates play management + playbook search from:
 * - playsService.ts (CRUD operations, database interaction)
 * - playbookSearchService.ts (fuzzy search, filters, suggestions)
 */

import { supabase } from "../lib/supabase";
import { getCurrentUserId } from "../lib/auth-helpers";
import { normalizePlayName, normalizeText } from "../utils/textNormalization";
import Fuse from "fuse.js";
import { ActivityService } from "./activityService";
import { PlayValidationService } from "../validation-services/playValidation";
import { debug, error as logError, warn } from "../utils/logger";
import { readLocalJson, storageKeys, writeLocalJson } from "../utils/storage";
import { buildNewPlayData } from "./playDataBuilders";

import type { Play } from "../types/play";
import type { FuseResultMatch, IFuseOptions } from "fuse.js";

export class PlaysService {
  /**
   * Auto-create a default team for a user if they don't have one
   * Creates a "Personal Playbook" team for Coach Account users
   */
  private static async ensureUserHasTeam(): Promise<string> {
    try {
      // Get current user
      const userId = getCurrentUserId();
      if (!userId) throw new Error("User not authenticated");

      // Get user profile to check role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      // Check if user already has a team they own/created
      const { data: existingTeams } = await supabase
        .from("teams")
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

      const { data: newTeam, error: teamError } = await supabase
        .from("teams")
        .insert({
          name: teamName,
          school_name: schoolName,
          created_by: userId,
        })
        .select("id")
        .single();

      if (teamError) throw teamError;

      // Create team membership for the user as a coach
      const { error: membershipError } = await supabase
        .from("team_members")
        .insert({
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
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      // Check if user already has a playbook
      const { data: existingPlaybooks } = await supabase
        .from("playbooks")
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

      const { data: newPlaybook, error: playbookError } = await supabase
        .from("playbooks")
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
   * Create a new play in the database
   * Only saves fields that exist in the database schema
   */
  static async createPlay(playData: Partial<Play>): Promise<Play> {
    try {
      // Validate play data
      const validation =
        await PlayValidationService.validatePlayServer(playData);
      if (!validation.valid) {
        throw new Error(
          `Validation failed: ${validation.errors.map((e) => e.message).join(", ")}`
        );
      }

      // Get current user for created_by field
      const userId = getCurrentUserId();
      if (!userId) throw new Error("User not authenticated");

      // Generate a unique ID for the play
      const playId = crypto.randomUUID();

      // Ensure user has a playbook (auto-create if needed)
      const playbookId =
        playData.playbook_id || (await this.ensureUserHasPlaybook());

      // Build database-valid fields using helper
      const newPlay = buildNewPlayData(playData, playId, playbookId, userId);

      debug("[PlaysService] Creating play in database", newPlay);

      // Insert into Supabase
      let { data, error } = await supabase
        .from("plays")
        .insert([newPlay as any])
        .select()
        .single();

      // If we get a foreign key error, try to create the demo playbook
      if (
        error &&
        error.code === "23503" &&
        error.message.includes("playbook_id")
      ) {
        debug("[PlaysService] Playbook missing; resolving user's playbook");
        const fallbackPlaybookId = await this.ensureUserHasPlaybook();

        // Update the play with a valid playbook ID and retry
        newPlay.playbook_id = fallbackPlaybookId;
        debug("[PlaysService] Retrying play creation with resolved playbook");

        const retryResult = await supabase
          .from("plays")
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

      debug("[PlaysService] Play created successfully", data);

      // Record activity for the created play
      await ActivityService.recordActivity({
        type: "created",
        playId: data.id,
        playName: data.play_name,
        teamId: undefined,
      });

      return data as unknown as Play;
    } catch (error) {
      logError("❌ PlaysService.createPlay failed:", error);
      throw error;
    }
  }

  /**
   * Get plays by playbook ID
   */
  static async getPlaysByPlaybook(
    playbookId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<Play[]> {
    try {
      let query = supabase
        .from("plays")
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

      return (data as unknown as Play[]) || [];
    } catch (error) {
      logError("❌ PlaysService.getPlaysByPlaybook failed:", error);
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
        logError("❌ Error fetching play:", error);
        throw new Error(`Failed to fetch play: ${error.message}`);
      }

      return data as unknown as Play;
    } catch (error) {
      logError("❌ PlaysService.getPlay failed:", error);
      throw error;
    }
  }

  /**
   * Get multiple plays by their IDs
   */
  static async getPlaysByIds(ids: string[]): Promise<Play[]> {
    try {
      if (ids.length === 0) return [];

      const { data, error } = await supabase
        .from("plays")
        .select("*")
        .in("id", ids);

      if (error) {
        logError("❌ Error fetching plays by IDs:", error);
        throw new Error(`Failed to fetch plays: ${error.message}`);
      }

      return (data || []) as unknown as Play[];
    } catch (error) {
      logError("❌ PlaysService.getPlaysByIds failed:", error);
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
        formation_id: updates.formation_id,
        formation_status: updates.formation_status,
        sanitized_at: updates.sanitized_at,

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
        updated_at: new Date().toISOString(),

        // Diagram data (v2 system with JSONB storage)
        diagram_data: updates.diagram_data,
        diagram_version: updates.diagram_version,
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
      logError("❌ PlaysService.updatePlay failed:", error);
      throw error;
    }
  }

  /**
   * Delete a play (archive it)
   */
  static async deletePlay(id: string): Promise<void> {
    try {
      // First, get the play data for activity recording
      const { data: play } = await supabase
        .from("plays")
        .select("id, play_name")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("plays")
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
      logError("❌ PlaysService.deletePlay failed:", error);
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
        .update({ is_archived: true, updated_at: new Date().toISOString() })
        .in("id", ids);

      if (error) {
        logError("❌ Error batch archiving plays:", error);
        throw new Error(`Failed to archive plays: ${error.message}`);
      }
    } catch (error) {
      logError("❌ PlaysService.deletePlays failed:", error);
      throw error;
    }
  }

  /** Restore previously archived plays */
  static async restorePlays(ids: string[]): Promise<void> {
    if (!ids.length) return;
    try {
      const { error } = await supabase
        .from("plays")
        .update({ is_archived: false, updated_at: new Date().toISOString() })
        .in("id", ids);
      if (error) {
        logError("❌ Error restoring plays:", error);
        throw new Error(`Failed to restore plays: ${error.message}`);
      }
    } catch (error) {
      logError("❌ PlaysService.restorePlays failed:", error);
      throw error;
    }
  }

  /**
   * Get unique formation values for suggestions
   */
  static async getUniqueFormations(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("plays")
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
      logError("❌ PlaysService.getUniqueFormations failed:", error);
      return [];
    }
  }

  /**
   * Get unique play names for suggestions
   */
  static async getUniquePlayNames(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("plays")
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
      logError("❌ PlaysService.getUniquePlayNames failed:", error);
      return [];
    }
  }

  /**
   * Get unique personnel values for suggestions
   */
  static async getUniquePersonnel(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("plays")
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
      logError("❌ PlaysService.getUniquePersonnel failed:", error);
      return [];
    }
  }

  /**
   * Get unique play types from all plays
   */
  static async getUniquePlayTypes(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("plays")
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
      logError("❌ PlaysService.getUniquePlayTypes failed:", error);
      return [];
    }
  }

  /**
   * AI-POWERED SUGGESTIONS
   * Get smart formation suggestions based on play patterns
   */
  static async getAISuggestedFormations(
    currentFormation?: string,
    playbookId?: string,
    limit = 5
  ): Promise<string[]> {
    try {
      let query = supabase
        .from("plays")
        .select("formation, play_name, p_type")
        .not("formation", "is", null)
        .neq("formation", "");

      // Filter by playbook if specified
      if (playbookId) {
        query = query.eq("playbook_id", playbookId);
      }

      const { data, error } = await query.limit(1000);

      if (error || !data) {
        logError("❌ Error getting formation data:", error);
        return [];
      }

      // Analyze formation patterns
      const formationStats = new Map<
        string,
        { count: number; playTypes: Set<string> }
      >();

      (data as any[]).forEach((play: any) => {
        const formation = play.formation;
        if (!formationStats.has(formation)) {
          formationStats.set(formation, { count: 0, playTypes: new Set() });
        }
        const stats = formationStats.get(formation)!;
        stats.count++;
        if (play.p_type) stats.playTypes.add(play.p_type);
      });

      // Sort formations by usage frequency and versatility
      const sortedFormations = Array.from(formationStats.entries())
        .sort((a, b) => {
          const scoreA = a[1].count + a[1].playTypes.size * 2; // Bonus for versatility
          const scoreB = b[1].count + b[1].playTypes.size * 2;
          return scoreB - scoreA;
        })
        .map(([formation]) => formation);

      // If current formation provided, prioritize similar formations
      if (currentFormation) {
        const baseCurrent = this.extractBaseFormation(currentFormation);
        const similarFormations = sortedFormations.filter(
          (f) =>
            this.extractBaseFormation(f) === baseCurrent &&
            f !== currentFormation
        );
        const otherFormations = sortedFormations.filter(
          (f) => this.extractBaseFormation(f) !== baseCurrent
        );
        return [...similarFormations, ...otherFormations].slice(0, limit);
      }

      return sortedFormations.slice(0, limit);
    } catch (error) {
      logError("❌ PlaysService.getAISuggestedFormations failed:", error);
      return [];
    }
  }

  /**
   * Get AI-suggested play names based on formation and context
   */
  static async getAISuggestedPlayNames(
    formation?: string,
    playType?: string,
    playbookId?: string,
    limit = 5
  ): Promise<string[]> {
    try {
      let query = supabase
        .from("plays")
        .select("play_name, formation, p_type")
        .not("play_name", "is", null)
        .neq("play_name", "");

      // Filter by playbook if specified
      if (playbookId) {
        query = query.eq("playbook_id", playbookId);
      }

      // Filter by formation if specified
      if (formation) {
        const baseFormation = this.extractBaseFormation(formation);
        query = query.ilike("formation", `%${baseFormation}%`);
      }

      // Filter by play type if specified
      if (playType) {
        query = query.eq("p_type", playType);
      }

      const { data, error } = await query.limit(500);

      if (error || !data) {
        logError("❌ Error getting play name data:", error);
        return [];
      }

      // Count frequency of each play name
      const nameCounts = new Map<string, number>();
      (data as any[]).forEach((play: any) => {
        const count = nameCounts.get(play.play_name) || 0;
        nameCounts.set(play.play_name, count + 1);
      });

      // Sort by frequency
      return Array.from(nameCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name]) => name)
        .slice(0, limit);
    } catch (error) {
      logError("❌ PlaysService.getAISuggestedPlayNames failed:", error);
      return [];
    }
  }

  /**
   * Get smart personnel suggestions based on formation patterns
   */
  static async getAISuggestedPersonnel(
    formation?: string,
    playbookId?: string,
    limit = 5
  ): Promise<string[]> {
    try {
      let query = supabase
        .from("plays")
        .select("personnel, formation")
        .not("personnel", "is", null)
        .neq("personnel", "");

      // Filter by playbook if specified
      if (playbookId) {
        query = query.eq("playbook_id", playbookId);
      }

      // Filter by formation if specified
      if (formation) {
        const baseFormation = this.extractBaseFormation(formation);
        query = query.ilike("formation", `%${baseFormation}%`);
      }

      const { data, error } = await query.limit(500);

      if (error || !data) {
        logError("❌ Error getting personnel data:", error);
        return [];
      }

      // Count frequency of each personnel grouping
      const personnelCounts = new Map<string, number>();
      (data as any[]).forEach((play: any) => {
        const count = personnelCounts.get(play.personnel) || 0;
        personnelCounts.set(play.personnel, count + 1);
      });

      // Sort by frequency
      return Array.from(personnelCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([personnel]) => personnel)
        .slice(0, limit);
    } catch (error) {
      logError("❌ PlaysService.getAISuggestedPersonnel failed:", error);
      return [];
    }
  }

  /**
   * Generate contextual play name suggestions based on formation and play type
   */
  static generatePlayNameSuggestions(
    formation?: string,
    playType?: string,
    existingNames: string[] = []
  ): string[] {
    const suggestions: string[] = [];

    if (!formation) return suggestions;

    const baseFormation = this.extractBaseFormation(formation);
    const direction = this.extractDirectionFromFormation(formation);

    // Common play patterns by formation type
    const playPatterns: Record<string, string[]> = {
      shotgun: ["Shotgun", "Shotgun Spread", "Shotgun Trips", "Shotgun Empty"],
      pistol: ["Pistol", "Pistol Power", "Pistol Read", "Pistol Counter"],
      "under center": ["Power", "Counter", "Trap", "Draw", "Keeper"],
      trips: [
        "Trips",
        "Trips Wheel",
        "Trips Corner",
        "Trips Smash",
        "Trips Out",
      ],
      bunch: ["Bunch", "Bunch Slants", "Bunch Crossers", "Bunch Outs"],
      empty: ["Empty", "Empty Slants", "Empty Wheels", "Empty Corners"],
      ace: ["Ace", "Ace Slants", "Ace Outs", "Ace Crossers"],
      doubles: [
        "Doubles",
        "Doubles Slants",
        "Doubles Outs",
        "Doubles Crossers",
      ],
      trio: ["Trio", "Trio Slants", "Trio Outs", "Trio Crossers"],
    };

    // Find matching formation patterns
    const matchingPatterns = Object.entries(playPatterns)
      .filter(([key]) => baseFormation.toLowerCase().includes(key))
      .flatMap(([, patterns]) => patterns);

    // Add direction-specific suggestions
    if (direction) {
      matchingPatterns.forEach((pattern) => {
        if (!pattern.includes(direction)) {
          suggestions.push(`${pattern} ${direction}`);
        }
      });
    }

    // Add base patterns
    suggestions.push(...matchingPatterns);

    // Add play type specific suggestions
    if (playType) {
      const typePrefixes: Record<string, string[]> = {
        run: ["Power", "Counter", "Trap", "Draw", "Keeper", "Read"],
        pass: ["Slants", "Outs", "Crossers", "Corners", "Wheels", "Posts"],
        screen: ["Screen", "Bubble Screen", "Slip Screen"],
        "play action": ["Play Action", "PA Boot", "PA Rollout"],
      };

      const prefixes = typePrefixes[playType.toLowerCase()] || [];
      prefixes.forEach((prefix) => {
        suggestions.push(`${baseFormation} ${prefix}`);
        if (direction) {
          suggestions.push(`${baseFormation} ${prefix} ${direction}`);
        }
      });
    }

    // Filter out existing names and limit results
    return suggestions
      .filter((name) => !existingNames.includes(name))
      .slice(0, 8);
  }

  /**
   * Helper: Extract base formation name (remove direction keywords)
   */
  private static extractBaseFormation(formation: string): string {
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
  private static extractDirectionFromFormation(
    formation: string
  ): string | null {
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

// ============================================
// PLAYBOOK SEARCH
// (Consolidated from playbookSearchService.ts)
// ============================================

export interface SearchResult<T> {
  item: T;
  score?: number;
  matches?: readonly FuseResultMatch[];
}

export interface QuickFilter {
  id: string;
  label: string;
  description: string;
  filter: (play: Play) => boolean;
  color: "red" | "blue" | "green" | "orange" | "purple";
  icon: string;
}

export interface SearchPreset {
  id: string;
  name: string;
  query: string;
  filters: string[];
  description: string;
}

export class PlaybookSearchService {
  private fuse: Fuse<Play>;
  private searchHistory: string[] = [];
  private maxHistorySize = 20;

  // Quick filter definitions
  public quickFilters: QuickFilter[] = [
    {
      id: "red-zone",
      label: "Red Zone",
      description: "Plays designed for red zone (inside 20 yard line)",
      filter: (play) =>
        play.ftag1?.toLowerCase().includes("red-zone") ||
        play.ftag2?.toLowerCase().includes("red-zone") ||
        play.p_tag1?.toLowerCase().includes("red-zone") ||
        play.p_tag2?.toLowerCase().includes("red-zone") ||
        play.notes?.toLowerCase().includes("red zone") ||
        play.play_name.toLowerCase().includes("goal"),
      color: "red",
      icon: "target",
    },
    {
      id: "goal-line",
      label: "Goal Line",
      description: "Short yardage plays for goal line situations",
      filter: (play) =>
        play.ftag1?.toLowerCase().includes("goal-line") ||
        play.ftag2?.toLowerCase().includes("goal-line") ||
        play.p_tag1?.toLowerCase().includes("goal-line") ||
        play.p_tag2?.toLowerCase().includes("goal-line") ||
        play.notes?.toLowerCase().includes("goal line") ||
        play.pref_dis === "1-2",
      color: "green",
      icon: "football",
    },
    {
      id: "two-minute",
      label: "2-Minute",
      description: "Hurry-up offense for 2-minute drill",
      filter: (play) =>
        play.ftag1?.toLowerCase().includes("two-minute") ||
        play.ftag2?.toLowerCase().includes("two-minute") ||
        play.p_tag1?.toLowerCase().includes("two-minute") ||
        play.p_tag2?.toLowerCase().includes("two-minute") ||
        (play.notes?.toLowerCase().includes("hurry") ?? false) ||
        (play.notes?.toLowerCase().includes("2-minute") ?? false),
      color: "orange",
      icon: "clock",
    },
    {
      id: "third-down",
      label: "3rd Down",
      description: "Third down conversion plays",
      filter: (play) =>
        play.pref_down === "3" ||
        play.ftag1?.toLowerCase().includes("third-down") ||
        play.ftag2?.toLowerCase().includes("third-down") ||
        play.p_tag1?.toLowerCase().includes("third-down") ||
        play.p_tag2?.toLowerCase().includes("third-down") ||
        (play.notes?.toLowerCase().includes("3rd") ?? false),
      color: "blue",
      icon: "refresh",
    },
    {
      id: "high-success",
      label: "High Success",
      description: "Plays with high success rates (>80%)",
      filter: (play) => {
        if (play.times_called > 0) {
          const successRate = (play.times_successful / play.times_called) * 100;
          return successRate > 80;
        }
        return play.confidence_base > 85;
      },
      color: "green",
      icon: "star",
    },
    {
      id: "play-action",
      label: "Play Action",
      description: "Play action passing plays",
      filter: (play) => play.p_type === "Play Action",
      color: "purple",
      icon: "users",
    },
  ];

  // Search presets for common situations
  public searchPresets: SearchPreset[] = [
    {
      id: "my-favorites",
      name: "My Favorites",
      query: "",
      filters: ["high-success"],
      description: "Your most successful plays",
    },
    {
      id: "short-yardage",
      name: "Short Yardage",
      query: "power dive",
      filters: ["goal-line"],
      description: "1-2 yards to go situations",
    },
    {
      id: "long-yardage",
      name: "Long Yardage",
      query: "",
      filters: ["third-down"],
      description: "3rd & 7+ situations",
    },
    {
      id: "scoring-plays",
      name: "Scoring Plays",
      query: "",
      filters: ["red-zone", "goal-line"],
      description: "Red zone and goal line plays",
    },
  ];

  constructor(plays: Play[]) {
    // Configure Fuse.js for optimal football play searching
    const fuseOptions: IFuseOptions<Play> = {
      keys: [
        { name: "play_name", weight: 0.4 },
        { name: "formation", weight: 0.3 },
        { name: "p_type", weight: 0.2 },
        { name: "notes", weight: 0.1 },
      ],
      threshold: 0.4,
      distance: 100,
      minMatchCharLength: 2,
      includeScore: true,
      includeMatches: true,
      findAllMatches: true,
    };

    this.fuse = new Fuse(plays, fuseOptions);
    this.loadSearchHistory();
  }

  /**
   * Perform fuzzy search with typo tolerance
   */
  search(query: string): SearchResult<Play>[] {
    if (!query.trim()) {
      return [];
    }

    this.addToHistory(query);
    const results = this.fuse.search(query);

    return results.map((result) => ({
      item: result.item,
      score: result.score,
      matches: result.matches,
    }));
  }

  /**
   * Apply quick filters to plays
   */
  applyQuickFilters(plays: Play[], activeFilters: string[]): Play[] {
    if (activeFilters.length === 0) {
      return plays;
    }

    return plays.filter((play) => {
      return activeFilters.every((filterId) => {
        const filter = this.quickFilters.find((f) => f.id === filterId);
        return filter ? filter.filter(play) : true;
      });
    });
  }

  /**
   * Get search suggestions based on history and common terms
   */
  getSearchSuggestions(query: string, limit: number = 5): string[] {
    if (!query.trim()) {
      return this.searchHistory.slice(0, limit);
    }

    const queryLower = query.toLowerCase();

    // Common football terms for suggestions
    const commonTerms = [
      "slant",
      "fade",
      "curl",
      "comeback",
      "hitch",
      "dig",
      "post",
      "go",
      "screen",
      "draw",
      "power",
      "sweep",
      "dive",
      "counter",
      "toss",
      "shotgun",
      "pistol",
      "i-form",
      "singleback",
      "twins",
      "trips",
      "play action",
      "rollout",
      "bootleg",
      "quick game",
      "deep ball",
    ];

    const suggestions = [...this.searchHistory, ...commonTerms]
      .filter((term) => term.toLowerCase().includes(queryLower))
      .filter((term, index, arr) => arr.indexOf(term) === index)
      .slice(0, limit);

    return suggestions;
  }

  /**
   * Get plays by preset
   */
  getPlaysByPreset(preset: SearchPreset, plays: Play[]): Play[] {
    let filteredPlays = plays;

    if (preset.filters.length > 0) {
      filteredPlays = this.applyQuickFilters(plays, preset.filters);
    }

    if (preset.query.trim()) {
      const searchResults = this.search(preset.query);
      const searchPlayIds = new Set(searchResults.map((r) => r.item.id));
      filteredPlays = filteredPlays.filter((play) =>
        searchPlayIds.has(play.id)
      );
    }

    return filteredPlays;
  }

  /**
   * Add query to search history
   */
  private addToHistory(query: string): void {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || trimmedQuery.length < 2) {
      return;
    }

    this.searchHistory = this.searchHistory.filter((q) => q !== trimmedQuery);
    this.searchHistory.unshift(trimmedQuery);
    this.searchHistory = this.searchHistory.slice(0, this.maxHistorySize);
    this.saveSearchHistory();
  }

  /**
   * Load search history from localStorage
   */
  private loadSearchHistory(): void {
    try {
      const saved = readLocalJson<string[]>(storageKeys.playbook.searchHistory);
      if (saved) this.searchHistory = saved;
    } catch (error) {
      warn("Failed to load search history:", error);
      this.searchHistory = [];
    }
  }

  /**
   * Save search history to localStorage
   */
  private saveSearchHistory(): void {
    try {
      writeLocalJson(storageKeys.playbook.searchHistory, this.searchHistory);
    } catch (error) {
      warn("Failed to save search history:", error);
    }
  }

  /**
   * Clear search history
   */
  clearHistory(): void {
    this.searchHistory = [];
    this.saveSearchHistory();
  }

  /**
   * Update plays data (when new plays are added/modified)
   */
  updatePlays(plays: Play[]): void {
    this.fuse.setCollection(plays);
  }
}
