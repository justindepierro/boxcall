// src/config/themes/themeController.js
import { fetchThemeSettings } from './fetchThemeSettings.js';
import { applyFontTheme, applyColorTheme } from './themeLoader.js';

/**
 * Applies font and color themes based on user/team session context.
 *
 * @param {string} pageKey - optional (for future use if theme varies by page)
 */
export async function applyContextualTheme() {
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

  const userId = session?.user?.id;
  const teamId = session?.team_id || null;

  if (!userId) {
    console.warn('⚠️ No user ID found in session');
    return;
  }

  const { font, color } = await fetchThemeSettings(userId, teamId);
  applyFontTheme(font);
  applyColorTheme(color);
  console.log(`🎨 Theme applied: ${font} + ${color}`);
}
