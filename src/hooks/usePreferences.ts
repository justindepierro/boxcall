import { useState, useEffect, useCallback, useRef } from "react";

import { supabase } from "../lib/supabase";
import {
  PreferenceService,
  type UserPreferences,
} from "../services/preferenceService";

/**
 * Hook for managing user preferences with server sync
 * Falls back to localStorage when offline or not authenticated
 *
 * @param key - The preference key
 * @param defaultValue - Default value if preference not found
 * @param debounceMs - Milliseconds to debounce server saves (default: 500ms)
 */
export function usePreference<K extends keyof UserPreferences>(
  key: K,
  defaultValue: UserPreferences[K],
  debounceMs: number = 500
): [
  UserPreferences[K],
  (
    value:
      | UserPreferences[K]
      | ((prev: UserPreferences[K]) => UserPreferences[K])
  ) => void,
  boolean,
] {
  // OPTIMIZATION: Load from localStorage synchronously to prevent flash
  // This gives instant render, then we sync with server in background
  const initialValue = getFromLocalStorage(key, defaultValue);
  const [value, setValue] = useState<UserPreferences[K]>(initialValue);
  const [isLoading, setIsLoading] = useState(false); // Changed to false - we have a value immediately
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isMountedRef = useRef(true);

  // Sync with server in background (non-blocking)
  useEffect(() => {
    let cancelled = false;

    async function syncWithServer() {
      try {
        // Check if user is authenticated
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user && !cancelled) {
          // User is authenticated - load from server and update if different
          const serverValue = await PreferenceService.getPreference(key);

          if (serverValue !== undefined && !cancelled) {
            // Only update if server value is different from current value
            // This prevents unnecessary re-renders
            if (JSON.stringify(serverValue) !== JSON.stringify(value)) {
              console.log(
                `[usePreference] Synced ${String(key)} from server:`,
                serverValue
              );
              setValue(serverValue);
              // Also update localStorage cache for next load
              saveToLocalStorage(key, serverValue);
            }
          } else if (!cancelled) {
            // Server has no value but we have a localStorage value - migrate it
            const localValue = getFromLocalStorage(key, defaultValue);
            if (localValue !== defaultValue) {
              console.log(
                `[usePreference] Migrating ${String(key)} to server:`,
                localValue
              );
              await PreferenceService.savePreference(key, localValue);
            }
          }
        }
      } catch (error) {
        console.error(`[usePreference] Error syncing ${String(key)}:`, error);
        // Keep using localStorage value on error
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    syncWithServer();

    return () => {
      cancelled = true;
    };
  }, [key, defaultValue, value]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Update value with debounced server sync
  const updateValue = useCallback(
    (
      newValueOrUpdater:
        | UserPreferences[K]
        | ((prev: UserPreferences[K]) => UserPreferences[K])
    ) => {
      // Handle both direct values and updater functions (like React setState)
      const newValue =
        typeof newValueOrUpdater === "function"
          ? (
              newValueOrUpdater as (
                prev: UserPreferences[K]
              ) => UserPreferences[K]
            )(value)
          : newValueOrUpdater;

      setValue(newValue);

      // Save to localStorage immediately for offline support
      saveToLocalStorage(key, newValue);

      // Debounce server save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user && isMountedRef.current) {
            console.log(
              `[usePreference] Saving ${String(key)} to server:`,
              newValue
            );
            const success = await PreferenceService.savePreference(
              key,
              newValue
            );
            if (!success) {
              console.warn(
                `[usePreference] Failed to save ${String(key)} to server, kept in localStorage`
              );
            }
          }
        } catch (error) {
          console.error(
            `[usePreference] Error saving ${String(key)} to server:`,
            error
          );
        }
      }, debounceMs);
    },
    [key, debounceMs, value]
  );

  return [value, updateValue, isLoading];
}

/**
 * Helper to get value from localStorage with proper parsing
 */
function getFromLocalStorage<K extends keyof UserPreferences>(
  key: K,
  defaultValue: UserPreferences[K]
): UserPreferences[K] {
  try {
    // Handle legacy localStorage keys that map to our preference keys
    const localStorageKey = getLegacyLocalStorageKey(key);
    const stored = localStorage.getItem(localStorageKey);

    if (stored === null) {
      return defaultValue;
    }

    // Handle different value types
    if (key === "bc_playgrid_oneword" || key === "bc_playgrid_view_manual") {
      return (stored === "1") as UserPreferences[K];
    }

    if (
      key === "bc_formation_field_visibility" ||
      key === "bc_play_details_field_visibility" ||
      key === "bc_recently_viewed_plays" ||
      key === "bc_favorite_plays"
    ) {
      return JSON.parse(stored) as UserPreferences[K];
    }

    // For string values like direction format and view mode
    return stored as UserPreferences[K];
  } catch (error) {
    console.error(`[usePreference] Error reading ${String(key)}:`, error);
    return defaultValue;
  }
}

/**
 * Helper to save value to localStorage with proper serialization
 */
function saveToLocalStorage<K extends keyof UserPreferences>(
  key: K,
  value: UserPreferences[K]
): void {
  try {
    const localStorageKey = getLegacyLocalStorageKey(key);

    // Handle different value types
    if (key === "bc_playgrid_oneword" || key === "bc_playgrid_view_manual") {
      localStorage.setItem(localStorageKey, value ? "1" : "0");
      return;
    }

    if (
      key === "bc_formation_field_visibility" ||
      key === "bc_play_details_field_visibility" ||
      key === "bc_recently_viewed_plays" ||
      key === "bc_favorite_plays"
    ) {
      localStorage.setItem(localStorageKey, JSON.stringify(value));
      return;
    }

    // For string values
    localStorage.setItem(localStorageKey, String(value));
  } catch (error) {
    console.error(`[usePreference] Error saving ${String(key)}:`, error);
  }
}

/**
 * Map preference keys to legacy localStorage keys for backward compatibility
 */
function getLegacyLocalStorageKey(key: keyof UserPreferences): string {
  // Already using the right format
  return String(key);
}
