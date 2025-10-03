/**
 * Unified Play Service
 * 
 * Consolidates play management + playbook search from:
 * - playsService.ts (CRUD operations, database interaction)
 * - playbookSearchService.ts (fuzzy search, filters, suggestions)
 */

import { supabase } from "../lib/supabase";
import { DatabaseDebug } from "../utils/databaseDebug";
import { normalizePlayName, normalizeText } from "../utils/textNormalization";
import Fuse from "fuse.js";

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

      console.info("🎯 Creating play in database:", newPlay);

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
        console.info("📚 Playbook doesn't exist, creating demo playbook...");
        await DatabaseDebug.checkPlaybooks();

        const createdPlaybookId = await DatabaseDebug.createDemoPlaybook();
        if (createdPlaybookId) {
          // Update the play with the new playbook ID and try again
          newPlay.playbook_id = createdPlaybookId;
          console.info("🔄 Retrying play creation with new playbook...");

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

      console.info("✅ Play created successfully:", data);
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
        console.error("❌ Error getting unique formations:", error);
        return [];
      }

      // Get unique values
      const uniqueFormations = [...new Set(data.map(item => item.formation))];
      return uniqueFormations.filter(Boolean);
    } catch (error) {
      console.error("❌ PlaysService.getUniqueFormations failed:", error);
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
        console.error("❌ Error getting unique play names:", error);
        return [];
      }

      // Get unique values
      const uniqueNames = [...new Set(data.map(item => item.play_name))];
      return uniqueNames.filter(Boolean);
    } catch (error) {
      console.error("❌ PlaysService.getUniquePlayNames failed:", error);
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
        console.error("❌ Error getting unique personnel:", error);
        return [];
      }

      // Get unique values
      const uniquePersonnel = [...new Set(data.map(item => item.personnel))];
      return uniquePersonnel.filter(Boolean);
    } catch (error) {
      console.error("❌ PlaysService.getUniquePersonnel failed:", error);
      return [];
    }
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
      "slant", "fade", "curl", "comeback", "hitch", "dig", "post", "go",
      "screen", "draw", "power", "sweep", "dive", "counter", "toss",
      "shotgun", "pistol", "i-form", "singleback", "twins", "trips",
      "play action", "rollout", "bootleg", "quick game", "deep ball",
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
      const saved = localStorage.getItem("playbook_search_history");
      if (saved) {
        this.searchHistory = JSON.parse(saved);
      }
    } catch (error) {
      console.warn("Failed to load search history:", error);
      this.searchHistory = [];
    }
  }

  /**
   * Save search history to localStorage
   */
  private saveSearchHistory(): void {
    try {
      localStorage.setItem(
        "playbook_search_history",
        JSON.stringify(this.searchHistory)
      );
    } catch (error) {
      console.warn("Failed to save search history:", error);
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
