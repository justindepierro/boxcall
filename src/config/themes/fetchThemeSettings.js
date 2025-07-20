// src/config/themes/fetchThemeSettings.js
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

    if (profile?.settings) {
      const normalized = normalizeTheme(profile.settings);
      console.log('🎯 User theme settings found:', normalized);
      cacheTheme(normalized);
      return normalized;
    }

    // 🧢 Team theme fallback (future-proof)
    if (teamId) {
      const { data: teamSettings, error: teamError } = await supabase
        .from('team_settings')
        .select('font_theme, color_theme')
        .eq('team_id', teamId)
        .single();

      if (teamSettings && !teamError) {
        const normalized = normalizeTheme(teamSettings);
        console.log('🎯 Team theme settings found:', normalized);
        cacheTheme(normalized);
        return normalized;
      }
    }

    // 💾 Try cached fallback
    const cached = loadCachedTheme();
    if (cached) {
      console.log('📦 Using cached theme:', cached);
      return cached;
    }

    return getFallbackTheme('no-settings');
  } catch (err) {
    console.error('❌ fetchThemeSettings() failed:', err.message);
    return getFallbackTheme('error');
  }
}

/* -------------------------------------------------------------------------- */
/*                               Helper Methods                               */
/* -------------------------------------------------------------------------- */

/** Normalize raw settings to safe defaults */
function normalizeTheme(settings) {
  return {
    font: settings?.font_theme || 'classic',
    color: settings?.color_theme || 'classic',
  };
}

/** Save theme to localStorage */
function cacheTheme(theme) {
  try {
    const { font, color } = normalizeTheme(theme);
    localStorage.setItem('lastTheme', JSON.stringify({ font, color }));
  } catch (err) {
    console.warn('⚠️ Failed to cache theme:', err.message);
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
  console.warn(`🛑 Using default theme fallback: ${reason}`);
  return { font: 'classic', color: 'classic' };
}
