// src/config/themes/themeController.js
import { fetchThemeSettings } from './fetchThemeSettings.js';
import { applyFontTheme, applyColorTheme } from './themeLoader.js';

// Prevents reapplying the theme multiple times during session
let themeApplied = false;

/**
 * Applies the user's font + color theme from Supabase.
 * Only runs once per session to prevent duplicate fetches.
 */
export async function applyContextualTheme() {
  if (themeApplied) {
    console.info('🎨 Theme already applied, skipping reapply.');
    return;
  }

  // 🧠 Load session from localStorage
  const sessionRaw = localStorage.getItem('session');
  if (!sessionRaw) {
    console.warn('⚠️ No session in localStorage');
    return;
  }

  let session;
  try {
    session = JSON.parse(sessionRaw);
  } catch (err) {
    console.error('⚠️ Failed to parse session JSON:', err);
    return;
  }

  // ✅ Get user and team ID
  const userId = session?.user?.id;
  const teamId = session?.team_id || null;

  if (!userId) {
    console.warn('⚠️ No user ID found in session');
    return;
  }

  // 🎯 Fetch font/color from Supabase
  const { font, color } = await fetchThemeSettings(userId, teamId);

  // 🖋️ Apply the font + color themes
  applyFontTheme(font);
  applyColorTheme(color);

  // 🛑 Mark theme as applied to prevent duplicates
  themeApplied = true;

  console.log(`🎨 Theme applied: ${font} + ${color}`);
}
