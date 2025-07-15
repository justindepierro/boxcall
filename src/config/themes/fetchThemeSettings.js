// src/config/themes/fetchThemeSettings.js
import { supabase } from '../../auth/supabaseClient.js';

export async function fetchThemeSettings(userId, teamId = null) {
  if (!userId) {
    console.warn('⚠️ No user ID provided to fetchThemeSettings()');
    return getFallbackTheme('no-user');
  }

  try {
    // 🌱 Try user settings first
    const { data: userSettings, error: userError } = await supabase
      .from('user_settings')
      .select('font_theme, color_theme')
      .eq('user_id', userId)
      .single();

    if (userSettings && !userError) {
      const result = normalizeTheme(userSettings);
      console.log('🎯 User theme settings found:', result);
      cacheTheme(result);
      return result;
    }

    // 🧢 Try team settings next if teamId is given
    if (teamId) {
      const { data: teamSettings, error: teamError } = await supabase
        .from('team_settings')
        .select('font_theme, color_theme')
        .eq('team_id', teamId)
        .single();

      if (teamSettings && !teamError) {
        const result = normalizeTheme(teamSettings);
        console.log('🎯 Team theme settings found:', result);
        cacheTheme(result);
        return result;
      }
    }

    // 💾 Try cached fallback
    const cached = loadCachedTheme();
    if (cached) {
      console.log('📦 Using cached theme:', cached);
      return cached;
    }

    // 🧱 Final fallback
    return getFallbackTheme('no-settings');
  } catch (err) {
    console.error('❌ fetchThemeSettings() failed:', err.message);
    return getFallbackTheme('error');
  }
}

// 🧼 Normalize raw settings to safe defaults
function normalizeTheme({ font_theme, color_theme }) {
  return {
    font: font_theme || 'classic',
    color: color_theme || 'classic',
  };
}

// 💾 Save theme to localStorage
function cacheTheme(theme) {
  const { font, color } = normalizeTheme(theme);
  localStorage.setItem('lastTheme', JSON.stringify({ font, color }));
}

// 📦 Load fallback theme from cache
function loadCachedTheme() {
  try {
    const raw = localStorage.getItem('lastTheme');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// 🛑 Final fallback
function getFallbackTheme(reason = '') {
  console.warn(`🛑 Using default theme fallback: ${reason}`);
  return { font: 'classic', color: 'classic' };
}
