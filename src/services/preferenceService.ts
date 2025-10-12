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

  // Quick Wins: Recently viewed plays
  bc_recently_viewed_plays?: string[]; // Play IDs, max 10

  // Quick Wins: Favorite plays
  bc_favorite_plays?: string[]; // Play IDs

  // Expandable for future preferences
  [key: string]: unknown;
}

export class PreferenceService {
  private static saveQueue: Promise<boolean> = Promise.resolve(true);
  private static pendingPreferences: Partial<UserPreferences> = {};
  private static saveTimer: NodeJS.Timeout | null = null;

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
   * Uses debouncing to prevent race conditions from simultaneous saves
   */
  static async savePreferences(
    preferences: Partial<UserPreferences>
  ): Promise<boolean> {
    // Accumulate preferences to save
    this.pendingPreferences = { ...this.pendingPreferences, ...preferences };

    // Clear existing timer
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    // Debounce: wait 100ms for more preference changes before saving
    return new Promise((resolve) => {
      this.saveTimer = setTimeout(async () => {
        // Chain saves to prevent overlapping requests
        this.saveQueue = this.saveQueue.then(async () => {
          const prefsToSave = { ...this.pendingPreferences };
          this.pendingPreferences = {}; // Clear pending
          
          console.log(
            "[PreferenceService] Saving batched preferences:",
            prefsToSave
          );

          try {
            const {
              data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
              console.log(
                "[PreferenceService] No user authenticated, skipping save"
              );
              resolve(false);
              return false;
            }

            // Load existing preferences to merge
            const existing = (await this.loadPreferences()) || {};
            const merged = { ...existing, ...prefsToSave };

            // Type cast needed because settings is Json type in database
            const { error } = await supabase
              .from("profiles")
              .update({ settings: merged } as never)
              .eq("id", user.id);

            if (error) {
              console.error(
                "[PreferenceService] Failed to save preferences:",
                error
              );
              resolve(false);
              return false;
            }

            console.log(
              "[PreferenceService] Saved preferences to server:",
              merged
            );
            resolve(true);
            return true;
          } catch (error) {
            console.error(
              "[PreferenceService] Exception saving preferences:",
              error
            );
            resolve(false);
            return false;
          }
        });
      }, 100); // 100ms debounce
    });
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
