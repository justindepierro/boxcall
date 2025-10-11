import { supabase } from "../lib/supabase";

/**
 * Service for managing user preferences stored in profiles.settings JSONB column
 * Handles syncing preferences between client and server
 */

export interface UserPreferences {
  // PlayGrid preferences
  bc_playgrid_oneword?: boolean;
  bc_playgrid_direction_format?: "full" | "abbrev" | "letter";
  bc_playgrid_view_manual?: boolean;
  bc_playgrid_view?: "grid" | "list";

  // PlayCard field visibility preferences
  bc_formation_field_visibility?: Record<string, boolean>;
  bc_play_details_field_visibility?: Record<string, boolean>;

  // Expandable for future preferences
  [key: string]: unknown;
}

export class PreferenceService {
  /**
   * Load all preferences for the current user from the server
   * Returns null if user is not authenticated
   */
  static async loadPreferences(): Promise<UserPreferences | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("[PreferenceService] No user authenticated");
        return null;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("settings")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("[PreferenceService] Failed to load preferences:", error);
        return null;
      }

      // Handle JSONB settings field - Supabase returns Json type
      // Type cast needed because Supabase query builder types don't include settings
      const settings = (data as { settings?: unknown })?.settings;
      
      console.log(
        "[PreferenceService] Loaded preferences from server:",
        settings
      );

      if (
        !settings ||
        typeof settings !== "object" ||
        Array.isArray(settings)
      ) {
        return {};
      }

      return settings as UserPreferences;
    } catch (error) {
      console.error(
        "[PreferenceService] Exception loading preferences:",
        error
      );
      return null;
    }
  }

  /**
   * Save preferences to the server for the current user
   * Merges with existing preferences rather than replacing
   */
  static async savePreferences(
    preferences: Partial<UserPreferences>
  ): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("[PreferenceService] No user authenticated, skipping save");
        return false;
      }

      // Load existing preferences to merge
      const existing = (await this.loadPreferences()) || {};
      const merged = { ...existing, ...preferences };

      // Type cast needed because settings is Json type in database
      const { error } = await supabase
        .from("profiles")
        .update({ settings: merged } as never)
        .eq("id", user.id);

      if (error) {
        console.error("[PreferenceService] Failed to save preferences:", error);
        return false;
      }

      console.log("[PreferenceService] Saved preferences to server:", merged);
      return true;
    } catch (error) {
      console.error("[PreferenceService] Exception saving preferences:", error);
      return false;
    }
  }

  /**
   * Save a single preference value
   */
  static async savePreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ): Promise<boolean> {
    return this.savePreferences({ [key]: value });
  }

  /**
   * Get a single preference value
   */
  static async getPreference<K extends keyof UserPreferences>(
    key: K
  ): Promise<UserPreferences[K] | undefined> {
    const prefs = await this.loadPreferences();
    return prefs?.[key];
  }

  /**
   * Migrate localStorage preferences to server
   * Call this once on login to sync existing local preferences
   */
  static async migrateFromLocalStorage(): Promise<void> {
    console.log("[PreferenceService] Migrating localStorage to server...");

    const localPrefs: Partial<UserPreferences> = {};

    // Migrate PlayGrid preferences
    const oneword = localStorage.getItem("bc_playgrid_oneword");
    if (oneword !== null) {
      localPrefs.bc_playgrid_oneword = oneword === "1";
    }

    const directionFormat = localStorage.getItem(
      "bc_playgrid_direction_format"
    );
    if (
      directionFormat &&
      (directionFormat === "full" ||
        directionFormat === "abbrev" ||
        directionFormat === "letter")
    ) {
      localPrefs.bc_playgrid_direction_format = directionFormat;
    }

    const viewManual = localStorage.getItem("bc_playgrid_view_manual");
    if (viewManual !== null) {
      localPrefs.bc_playgrid_view_manual = viewManual === "1";
    }

    const view = localStorage.getItem("bc_playgrid_view");
    if (view) {
      localPrefs.bc_playgrid_view = view as "grid" | "list";
    }

    // Migrate PlayCard field visibility
    try {
      const formationVis = localStorage.getItem(
        "bc_formation_field_visibility"
      );
      if (formationVis) {
        localPrefs.bc_formation_field_visibility = JSON.parse(formationVis);
      }
    } catch (error) {
      console.warn(
        "[PreferenceService] Failed to parse formation visibility:",
        error
      );
    }

    try {
      const playDetailsVis = localStorage.getItem(
        "bc_play_details_field_visibility"
      );
      if (playDetailsVis) {
        localPrefs.bc_play_details_field_visibility =
          JSON.parse(playDetailsVis);
      }
    } catch (error) {
      console.warn(
        "[PreferenceService] Failed to parse play details visibility:",
        error
      );
    }

    // Save all migrated preferences
    if (Object.keys(localPrefs).length > 0) {
      const success = await this.savePreferences(localPrefs);
      if (success) {
        console.log(
          "[PreferenceService] Successfully migrated preferences:",
          localPrefs
        );
        // Optionally clear localStorage after successful migration
        // Uncomment if you want to clean up after migration
        /*
        localStorage.removeItem("bc_playgrid_oneword");
        localStorage.removeItem("bc_playgrid_direction_format");
        localStorage.removeItem("bc_playgrid_view_manual");
        localStorage.removeItem("bc_playgrid_view");
        localStorage.removeItem("bc_formation_field_visibility");
        localStorage.removeItem("bc_play_details_field_visibility");
        */
      }
    } else {
      console.log("[PreferenceService] No localStorage preferences to migrate");
    }
  }
}
