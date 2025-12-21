import { table } from "../data/supabase/db";
import { getCurrentUserId } from "../lib/auth-helpers";
import { debug, warn, error as logError } from "../utils/logger";
import {
  readLocalBoolean01,
  readLocalJson,
  readLocalString,
  storageKeys,
} from "../utils/storage";

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

  // Cache to prevent repeated failing requests
  private static preferencesCache: {
    data: UserPreferences | null;
    timestamp: number;
    userId: string | null;
  } | null = null;
  private static readonly CACHE_DURATION = 30000; // 30 seconds

  /**
   * Clear the preferences cache (call on logout or user change)
   */
  static clearCache(): void {
    this.preferencesCache = null;
  }

  /**
   * Load all preferences for the current user from the server
   * Returns null if user is not authenticated or no profile exists
   */
  static async loadPreferences(): Promise<UserPreferences | null> {
    try {
      const userId = getCurrentUserId();

      debug("[PreferenceService] loadPreferences called, userId:", userId);

      if (!userId) {
        warn("[PreferenceService] No user authenticated");
        return null;
      }

      // Check cache first to prevent repeated requests
      if (
        this.preferencesCache &&
        this.preferencesCache.userId === userId &&
        Date.now() - this.preferencesCache.timestamp < this.CACHE_DURATION
      ) {
        debug(
          "[PreferenceService] Returning cached preferences:",
          this.preferencesCache.data
        );
        return this.preferencesCache.data;
      }

      debug("[PreferenceService] Fetching from database for userId:", userId);

      // Use maybeSingle() instead of single() to avoid 406 errors
      // when no profile exists for the user
      const { data, error } = await table("profiles")
        .select("settings")
        .eq("id", userId)
        .maybeSingle();

      debug("[PreferenceService] Database response:", { data, error });

      if (error) {
        warn("[PreferenceService] Failed to load preferences:", error);
        // Cache the failure to prevent repeated failing requests
        this.preferencesCache = {
          data: null,
          timestamp: Date.now(),
          userId,
        };
        return null;
      }

      // No profile found - cache this result
      if (!data) {
        warn("[PreferenceService] No profile found for user");
        this.preferencesCache = {
          data: {},
          timestamp: Date.now(),
          userId,
        };
        return {};
      }

      // Handle JSONB settings field - Supabase returns Json type
      // Type cast needed because Supabase query builder types don't include settings
      const settings = (data as { settings?: unknown })?.settings;

      debug("[PreferenceService] Raw settings from DB:", settings);

      const preferences =
        !settings || typeof settings !== "object" || Array.isArray(settings)
          ? {}
          : (settings as UserPreferences);

      debug("[PreferenceService] Loaded preferences:", preferences);

      // Cache the successful result
      this.preferencesCache = {
        data: preferences,
        timestamp: Date.now(),
        userId,
      };

      return preferences;
    } catch (err) {
      logError("[PreferenceService] Exception loading preferences:", err);
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

          debug("[PreferenceService] Saving batched preferences:", prefsToSave);

          try {
            const userId = getCurrentUserId();

            if (!userId) {
              warn("[PreferenceService] No user authenticated, skipping save");
              resolve(false);
              return false;
            }

            debug("[PreferenceService] Saving for userId:", userId);

            // Load existing preferences to merge
            const existing = (await this.loadPreferences()) || {};
            const merged = { ...existing, ...prefsToSave };

            debug("[PreferenceService] Merged preferences:", merged);

            // Type cast needed because settings is Json type in database
            // Use .select() to verify the update actually happened
            const { data, error } = await table("profiles")
              .update({ settings: merged } as never)
              .eq("id", userId)
              .select("id, settings")
              .maybeSingle();

            debug("[PreferenceService] Update result:", { data, error });

            if (error) {
              warn("[PreferenceService] Failed to save preferences:", error);
              resolve(false);
              return false;
            }

            // Check if any row was actually updated
            if (!data) {
              warn(
                "[PreferenceService] No profile found to update for userId:",
                userId
              );
              resolve(false);
              return false;
            }

            debug(
              "[PreferenceService] Saved preferences to server:",
              data.settings
            );
            // Invalidate cache after successful save
            this.preferencesCache = {
              data: merged,
              timestamp: Date.now(),
              userId,
            };
            resolve(true);
            return true;
          } catch (error) {
            logError(
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
    debug("[PreferenceService] Migrating localStorage to server...");

    const localPrefs: Partial<UserPreferences> = {};

    // Migrate PlayGrid preferences
    const oneword = readLocalBoolean01(storageKeys.preferences.playgridOneword);
    if (oneword !== null) localPrefs.bc_playgrid_oneword = oneword;

    const directionFormat = readLocalString(
      storageKeys.preferences.playgridDirectionFormat
    );
    if (
      directionFormat &&
      (directionFormat === "full" ||
        directionFormat === "abbrev" ||
        directionFormat === "letter")
    ) {
      localPrefs.bc_playgrid_direction_format = directionFormat;
    }

    const viewManual = readLocalBoolean01(
      storageKeys.preferences.playgridViewManual
    );
    if (viewManual !== null) localPrefs.bc_playgrid_view_manual = viewManual;

    const view = readLocalString(storageKeys.preferences.playgridView);
    if (view) {
      localPrefs.bc_playgrid_view = view as "grid" | "list";
    }

    // Migrate PlayCard field visibility
    try {
      const formationVis = readLocalJson<Record<string, boolean>>(
        storageKeys.preferences.formationFieldVisibility
      );
      if (formationVis) localPrefs.bc_formation_field_visibility = formationVis;
    } catch (error) {
      debug("[PreferenceService] Failed to parse formation visibility:", error);
    }

    try {
      const playDetailsVis = readLocalJson<Record<string, boolean>>(
        storageKeys.preferences.playDetailsFieldVisibility
      );
      if (playDetailsVis)
        localPrefs.bc_play_details_field_visibility = playDetailsVis;
    } catch (error) {
      debug(
        "[PreferenceService] Failed to parse play details visibility:",
        error
      );
    }

    // Save all migrated preferences
    if (Object.keys(localPrefs).length > 0) {
      const success = await this.savePreferences(localPrefs);
      if (success) {
        debug(
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
      debug("[PreferenceService] No localStorage preferences to migrate");
    }
  }
}
