// src/lib/teams/user/updateThemeSettings.js
import { supabase } from '@auth/supabaseClient.js';

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
    console.warn('⚠️ updateThemeSettings(): Missing userId');
    return;
  }

  try {
    const { font_theme, color_theme } = themeUpdates;
    if (!font_theme && !color_theme) {
      console.warn('⚠️ No theme updates provided');
      return;
    }

    const patch = {};
    if (font_theme) patch.font_theme = font_theme;
    if (color_theme) patch.color_theme = color_theme;

    // Use Postgres function jsonb_merge_patch to merge updates
    const { error } = await supabase.from('profiles').update({ settings: patch }).eq('id', userId);

    if (error) throw new Error(`Failed to update theme settings: ${error.message}`);

    console.log('🎨 Theme settings updated:', { userId, patch });
  } catch (err) {
    console.error('❌ updateThemeSettings() failed:', err.message);
  }
}
