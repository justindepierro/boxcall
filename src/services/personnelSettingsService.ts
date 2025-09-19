/**
 * Personnel Settings Service - Handles personnel grouping and naming preferences
 *
 * Manages coach-specific personnel settings stored in the profiles table
 */

import { supabase } from "../lib/supabase";
import type { PersonnelSettings } from "../types/personnel";

interface ProfileSettings {
  personnel?: PersonnelSettings;
  [key: string]: unknown;
}

export class PersonnelSettingsService {
  /**
   * Load personnel settings for the current user
   */
  static async loadSettings(): Promise<PersonnelSettings | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("settings")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error loading personnel settings:", error);
        return null;
      }

      // Extract personnel settings from the settings JSONB field
      const settings = profile?.settings as ProfileSettings;
      return settings?.personnel || null;
    } catch (error) {
      console.error("Failed to load personnel settings:", error);
      return null;
    }
  }

  /**
   * Save personnel settings for the current user
   */
  static async saveSettings(settings: PersonnelSettings): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      // First, get the current settings
      const { data: currentProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("settings")
        .eq("id", user.id)
        .single();

      if (fetchError) {
        console.error("Error fetching current profile:", fetchError);
        return false;
      }

      // Merge personnel settings into existing settings
      const currentSettings =
        (currentProfile?.settings as ProfileSettings) || {};
      const updatedSettings = {
        ...currentSettings,
        personnel: settings,
      };

      // Update the profile with new settings
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          settings: updatedSettings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error saving personnel settings:", updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Failed to save personnel settings:", error);
      return false;
    }
  }

  /**
   * Get default personnel settings (fallback when no server settings exist)
   */
  static getDefaultSettings(): PersonnelSettings {
    const now = new Date();
    return {
      groupings: [
        {
          id: "default",
          name: "Default",
          positions: [
            { id: "qb", label: "QB", position: "Quarterback", isLocked: true },
            {
              id: "lot",
              label: "LOT",
              position: "Left Offensive Tackle",
              isLocked: true,
            },
            {
              id: "log",
              label: "LOG",
              position: "Left Offensive Guard",
              isLocked: true,
            },
            { id: "c", label: "C", position: "Center", isLocked: true },
            {
              id: "rog",
              label: "ROG",
              position: "Right Offensive Guard",
              isLocked: true,
            },
            {
              id: "rot",
              label: "ROT",
              position: "Right Offensive Tackle",
              isLocked: true,
            },
            { id: "rb", label: "RB", position: "Running Back" },
            { id: "te1", label: "TE 1", position: "Tight End" },
            { id: "wr1", label: "WR 1", position: "Wide Receiver" },
            { id: "wr2", label: "WR 2", position: "Wide Receiver" },
            { id: "wr3", label: "WR 3", position: "Wide Receiver" },
          ],
          isDefault: true,
          createdAt: now,
          updatedAt: now,
        },
      ],
      activeGroupingId: "default",
    };
  }
}
