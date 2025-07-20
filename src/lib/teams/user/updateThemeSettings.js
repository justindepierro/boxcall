// src/lib/teams/user/updateThemeSettings.js
import { supabase } from '@auth/supabaseClient.js';
import { devLog } from '@utils/devLogger';

/**
 * Updates the theme settings (font_theme, color_theme) for a given user.
 * Safely merges these into the `profiles.settings` JSONB field.
 *
 * @param {string} userId - Supabase user ID
 * @param {{ font_theme?: string, color_theme?: string }} themeUpdates - Theme keys to update.
 * @returns {Promise<void>}
 */
export async function updateThemeSettings(userId, themeUpdates) {
  if (!userId) {
    devLog('⚠️ updateThemeSettings(): Missing userId', 'warn');
    return;
  }

  try {
    const { font_theme, color_theme } = themeUpdates;
    if (!font_theme && !color_theme) {
      devLog('⚠️ No theme updates provided', 'warn');
      return;
    }

    const patch = {};
    if (font_theme) patch.font_theme = font_theme;
    if (color_theme) patch.color_theme = color_theme;

    // Use Postgres function jsonb_merge_patch to merge updates
    const { error } = await supabase.from('profiles').update({ settings: patch }).eq('id', userId);

    if (error) throw new Error(`Failed to update theme settings: ${error.message}`);

    devLog(`🎨 Theme settings updated for user ${userId}: ${JSON.stringify(patch)}`);
  } catch (err) {
    devLog(`❌ updateThemeSettings() failed: ${err.message}`, 'error');
  }
}
