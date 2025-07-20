// src/config/themes/fetchThemeSettings.js
import { DEFAULT_THEME } from '@config/themes/themeConstants.js';

import { supabase } from '../../auth/supabaseClient.js';

/**
 * Fetches theme settings for a user (from profiles.settings JSONB)
 * or falls back to cached/default themes.
 *
 * @param {string} userId - Supabase user ID
 * @param {string|null} teamId - Optional team ID (future-proofing)
 * @returns {Promise<{ font: string, color: string }>}
 */
export async function fetchThemeSettings(userId, teamId = null) {
  if (!userId) {
    console.warn('⚠️ No user ID provided to fetchThemeSettings()');
    return getFallbackTheme('no-user');
  }

  try {
    // 🌱 Fetch theme from `profiles.settings`
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('❌ Supabase error fetching profile settings:', profileError.message);
    }

    const safeSettings = normalizeTheme(profile?.settings || {});
    console.log('🎯 Using theme settings:', safeSettings);
    cacheTheme(safeSettings);
    return safeSettings;
  } catch (err) {
    console.error('❌ fetchThemeSettings() failed:', err.message);
    return getFallbackTheme('error');
  }
}

/* -------------------------------------------------------------------------- */
/*                               Helper Methods                               */
/* -------------------------------------------------------------------------- */

/**
 * Ensures font & color always have values.
 * @param {object} settings
 * @returns {{ font: string, color: string }}
 */
function normalizeTheme(settings) {
  return {
    font: settings?.font_theme || settings?.font || DEFAULT_THEME,
    color: settings?.color_theme || settings?.color || DEFAULT_THEME,
  };
}

function cacheTheme(theme) {
  try {
    localStorage.setItem('lastTheme', JSON.stringify(theme));
  } catch (err) {
    console.warn('⚠️ Failed to cache theme:', err.message);
  }
}

function getFallbackTheme(reason = '') {
  console.warn(`🛑 Using default theme fallback: ${reason}`);
  return { font: DEFAULT_THEME, color: DEFAULT_THEME };
}
