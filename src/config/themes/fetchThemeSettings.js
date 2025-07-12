// src/config/themes/fetchThemeSettings.js
import { supabase } from '../../auth/supabaseClient.js';

export async function fetchThemeSettings(userId, teamId = null) {
  try {
    if (!userId) {
      console.warn('⚠️ No user ID provided to fetchThemeSettings()');
      return { font: 'classic', color: 'classic' };
    }

    // ✅ FIXED QUERY ORDER
const { data: userSettings, error: userError } = await supabase
  .from('user_settings')
  .select(' * ')
  .eq({ user_id: userId })  // more reliable than .eq()
  .maybeSingle();

    

    if (userSettings && !userError) {
        console.warn('⚠️ Theme fetch error:', userError.message);
      cacheTheme(userSettings);
      return {
        font: userSettings.font_theme || 'classic',
        color: userSettings.color_theme || 'classic',
      };
    }

    if (teamId) {
      const { data: teamSettings, error: teamError } = await supabase
        .from('team_settings')
        .select( '*' )
        .eq('team_id', teamId)
        .maybeSingle();

      if (teamSettings && !teamError) {
        cacheTheme(teamSettings);
        return {
          font: teamSettings.font_theme || 'classic',
          color: teamSettings.color_theme || 'classic',
        };
      }
    }

    const cached = loadCachedTheme();
    if (cached) return cached;

    return { font: 'classic', color: 'classic' };
  } catch (err) {
    console.error('⚠️ fetchThemeSettings error:', err.message);
    return { font: 'classic', color: 'classic' };
  }
}

function cacheTheme({ font_theme, color_theme }) {
  const toCache = {
    font: font_theme || 'classic',
    color: color_theme || 'classic',
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