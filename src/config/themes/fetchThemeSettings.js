import { devLog } from '@utils/devLogger.js';

// src/config/themes/fetchThemeSettings.js
import { supabase } from '../../auth/supabaseClient.js';

import { DEFAULT_THEME } from './themeConstants.js';

/**
 * Fetches the user's color theme from profiles.settings (JSONB).
 * Falls back to cached or DEFAULT_THEME if nothing is found.
 *
 * @param {string} userId - Supabase user ID
 * @param {string|null} teamId - Optional team ID (future-proofing)
 * @returns {Promise<{ color: string }>}
 */
export async function fetchThemeSettings(userId, teamId = null) {
  if (!userId) {
    devLog('⚠️ No user ID provided to fetchThemeSettings()', 'warn');
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
      devLog(`❌ Supabase error fetching profile settings: ${profileError.message}`, 'error');
    }

    if (profile?.settings) {
      const normalized = normalizeTheme(profile.settings);
      devLog(`🎯 User color theme found: ${JSON.stringify(normalized)}`, 'info');
      cacheTheme(normalized);
      return normalized;
    }

    // 🧢 Team theme fallback (future-proof)
    if (teamId) {
      const { data: teamSettings, error: teamError } = await supabase
        .from('team_settings')
        .select('color_theme')
        .eq('team_id', teamId)
        .single();

      if (teamSettings && !teamError) {
        const normalized = normalizeTheme(teamSettings);
        devLog(`🎯 Team color theme found: ${JSON.stringify(normalized)}`, 'info');
        cacheTheme(normalized);
        return normalized;
      }
    }

    // 💾 Try cached fallback
    const cached = loadCachedTheme();
    if (cached) {
      devLog(`📦 Using cached color theme: ${JSON.stringify(cached)}`, 'info');
      return cached;
    }

    return getFallbackTheme('no-settings');
  } catch (err) {
    devLog(`❌ fetchThemeSettings() failed: ${err.message}`, 'error');
    return getFallbackTheme('error');
  }
}

/* -------------------------------------------------------------------------- */
/*                               Helper Methods                               */
/* -------------------------------------------------------------------------- */

/** Normalize raw settings to safe defaults */
function normalizeTheme(settings) {
  return {
    color: settings?.color_theme || DEFAULT_THEME,
  };
}

/** Save theme to localStorage */
function cacheTheme(theme) {
  try {
    const { color } = normalizeTheme(theme);
    localStorage.setItem('lastTheme', JSON.stringify({ color }));
  } catch (err) {
    devLog(`⚠️ Failed to cache theme: ${err.message}`, 'warn');
  }
}

/** Load fallback theme from cache */
function loadCachedTheme() {
  try {
    const raw = localStorage.getItem('lastTheme');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Final fallback */
function getFallbackTheme(reason = '') {
  devLog(`🛑 Using default color theme fallback: ${reason}`, 'warn');
  return { color: DEFAULT_THEME };
}
