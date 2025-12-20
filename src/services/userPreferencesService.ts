/**
 * User Preferences Service - Handles user settings and preferences
 *
 * Manages user preferences like confirmation dialogs, UI settings, etc.
 */

import { logError, warn } from "../utils/logger";

export interface UserPreferences {
  csvImport: {
    skipMissingFieldsConfirmation: boolean;
    skipQualityWarnings: boolean;
  };
  ui: {
    showTooltips: boolean;
    compactMode: boolean;
    showConfetti: boolean; // Show celebratory confetti on first successful save per day
  };
}

export class UserPreferencesService {
  private static readonly STORAGE_KEY = "boxcall_user_preferences";

  /**
   * Get default preferences
   */
  private static getDefaultPreferences(): UserPreferences {
    return {
      csvImport: {
        skipMissingFieldsConfirmation: false,
        skipQualityWarnings: false,
      },
      ui: {
        showTooltips: true,
        compactMode: false,
        showConfetti: true,
      },
    };
  }

  /**
   * Load user preferences from localStorage
   */
  static loadPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return this.getDefaultPreferences();
      }

      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all properties exist
      return {
        ...this.getDefaultPreferences(),
        ...parsed,
        csvImport: {
          ...this.getDefaultPreferences().csvImport,
          ...(parsed.csvImport || {}),
        },
        ui: {
          ...this.getDefaultPreferences().ui,
          ...(parsed.ui || {}),
        },
      };
    } catch (error) {
      warn("Failed to load user preferences, using defaults:", error);
      return this.getDefaultPreferences();
    }
  }

  /**
   * Save user preferences to localStorage
   */
  static savePreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      logError("Failed to save user preferences:", error);
    }
  }

  /**
   * Update a specific preference
   */
  static updatePreference<
    T extends keyof UserPreferences,
    K extends keyof UserPreferences[T],
  >(category: T, key: K, value: UserPreferences[T][K]): void {
    const preferences = this.loadPreferences();
    preferences[category][key] = value;
    this.savePreferences(preferences);
  }

  /**
   * Get a specific preference value
   */
  static getPreference<T extends keyof UserPreferences>(
    category: T,
    key: keyof UserPreferences[T]
  ): UserPreferences[T][keyof UserPreferences[T]] {
    const preferences = this.loadPreferences();
    return preferences[category][key];
  }

  /**
   * Reset all preferences to defaults
   */
  static resetPreferences(): void {
    this.savePreferences(this.getDefaultPreferences());
  }

  /**
   * Check if CSV missing fields confirmation should be skipped
   */
  static shouldSkipCSVMissingFieldsConfirmation(): boolean {
    return this.getPreference("csvImport", "skipMissingFieldsConfirmation");
  }

  /**
   * Set CSV missing fields confirmation preference
   */
  static setSkipCSVMissingFieldsConfirmation(skip: boolean): void {
    this.updatePreference("csvImport", "skipMissingFieldsConfirmation", skip);
  }

  /**
   * Check if CSV quality warnings should be skipped
   */
  static shouldSkipCSVQualityWarnings(): boolean {
    return this.getPreference("csvImport", "skipQualityWarnings");
  }

  /**
   * Set CSV quality warnings preference
   */
  static setSkipCSVQualityWarnings(skip: boolean): void {
    this.updatePreference("csvImport", "skipQualityWarnings", skip);
  }
}
