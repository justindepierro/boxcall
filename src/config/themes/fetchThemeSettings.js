// src/config/themes/fetchThemeSettings.js
import { supabase } from '../../auth/supabaseClient.js';

// src/config/themes/fetchThemeSettings.js
export async function fetchThemeSettings(userId, teamId = null) {
  try {
    if (!userId) {
      console.warn('⚠️ No user ID provided to fetchThemeSettings()');
      return { font: 'classic', color: 'classic' };
    }

    const { data: userSettings, error: userError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    console.log('🧪 Raw userSettings:', userSettings);
    console.log('🧪 Supabase userError:', userError);

    if (userSettings && !userError) {
      const result = {
        font: userSettings.font_theme || 'classic',
        color: userSettings.color_theme || 'classic',
      };
      console.log('🎯 Fetched user theme settings:', result);
      cacheTheme(result);
      return result;
    }

    if (teamId) {
      const { data: teamSettings, error: teamError } = await supabase
        .from('team_settings')
        .select('*')
        .eq('team_id', teamId)
        .maybeSingle();

      console.log('🧪 Raw teamSettings:', teamSettings);
      console.log('🧪 Supabase teamError:', teamError);

      if (teamSettings && !teamError) {
        const result = {
          font: teamSettings.font_theme || 'classic',
          color: teamSettings.color_theme || 'classic',
        };
        console.log('🎯 Fetched team theme settings:', result);
        cacheTheme(result);
        return result;
      }
    }

    const cached = loadCachedTheme();
    if (cached) {
      console.log('📦 Loaded cached theme:', cached);
      return cached;
    }

    return { font: 'classic', color: 'classic' };
  } catch (err) {
    console.error('⚠️ fetchThemeSettings error:', err.message);
    return { font: 'classic', color: 'classic' };
  }
}

// ✅ FIXED: Correctly destructures cached font/color keys
function cacheTheme({ font, color }) {
  const toCache = {
    font: font || 'classic',
    color: color || 'classic',
  };
  localStorage.setItem('lastTheme', JSON.stringify(toCache));
}

function loadCachedTheme() {
  try {
    const raw = localStorage.getItem('lastTheme');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
