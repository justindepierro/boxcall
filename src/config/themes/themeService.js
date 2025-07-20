import { supabase } from '@auth/supabaseClient.js';
import { applyTheme } from '@utils/themeManager.js';
import { devLog } from '@utils/devLogger.js';

import { fetchThemeSettings } from './fetchThemeSettings.js';
import { DEFAULT_THEME } from './themeConstants.js';

/* -------------------------------------------------------------------------- */
/*                               Public Methods                               */
/* -------------------------------------------------------------------------- */

/**
 * Loads and applies the user's current theme (color only).
 * Falls back to DEFAULT_THEME if none are found.
 *
 * @param {string|null} userId - Supabase user ID
 * @param {string|null} teamId - Optional team ID
 * @param {string} fallback - Fallback theme key (default = DEFAULT_THEME)
 * @returns {Promise<{ color: string }>}
 */
export async function loadAndApplyTheme(userId, teamId = null, fallback = DEFAULT_THEME) {
  try {
    let theme = await fetchThemeSettings(userId, teamId);

    if (!theme?.color) {
      devLog(`⚠️ No valid theme returned. Using fallback: ${fallback}`, 'warn');
      theme = { color: fallback };
    }

    const normalized = normalizeTheme(theme);

    // Apply color theme
    applyTheme(normalized.color);

    // Cache applied theme
    cacheTheme(normalized);

    devLog(`🎨 Theme applied via themeService: ${JSON.stringify(normalized)}`, 'info');
    return normalized;
  } catch (err) {
    devLog(`❌ loadAndApplyTheme() failed. Using fallback theme: ${err.message}`, 'error');
    const fallbackTheme = { color: fallback };
    applyTheme(fallback);
    cacheTheme(fallbackTheme);
    return fallbackTheme;
  }
}

/**
 * Updates the user's theme settings in `profiles.settings`.
 * Automatically caches and applies the new theme.
 *
 * @param {string} userId - Supabase user ID
 * @param {object} updates - { color?: string }
 * @returns {Promise<{ color: string }>}
 */
export async function updateThemeSettings(userId, updates) {
  try {
    if (!userId) throw new Error('User ID is required to update theme.');

    // Fetch current settings
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', userId)
      .single();

    if (profileError) throw new Error(`Failed to fetch current settings: ${profileError.message}`);

    const currentSettings = profile?.settings || {};
    const newSettings = { ...currentSettings, ...updates };

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ settings: newSettings })
      .eq('id', userId);

    if (updateError) throw new Error(`Failed to update theme: ${updateError.message}`);

    const normalized = normalizeTheme(newSettings);
    cacheTheme(normalized);
    applyTheme(normalized.color);

    devLog(`✅ Theme updated successfully: ${JSON.stringify(normalized)}`, 'info');
    return normalized;
  } catch (err) {
    devLog(`❌ updateThemeSettings() failed: ${err.message}`, 'error');
    return getFallbackTheme('update-error');
  }
}

/**
 * Resets the theme to default.
 *
 * @param {string} userId - Supabase user ID
 */
export async function resetThemeToDefault(userId) {
  return updateThemeSettings(userId, { color: DEFAULT_THEME });
}

/* -------------------------------------------------------------------------- */
/*                               Helper Methods                               */
/* -------------------------------------------------------------------------- */

function normalizeTheme(settings) {
  return {
    color: settings?.color_theme || settings?.color || DEFAULT_THEME,
  };
}

function cacheTheme(theme) {
  try {
    const { color } = normalizeTheme(theme);
    localStorage.setItem('lastTheme', JSON.stringify({ color }));
  } catch (err) {
    devLog(`⚠️ Failed to cache theme: ${err.message}`, 'warn');
  }
}

function getFallbackTheme(reason = '') {
  devLog(`🛑 Using default theme fallback: ${reason}`, 'warn');
  return { color: DEFAULT_THEME };
}
