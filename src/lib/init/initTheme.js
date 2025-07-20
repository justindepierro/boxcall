import { loadAndApplyTheme } from '@config/themes/themeService.js';
import { getCurrentUser } from '@state/userState.js';
import { DEFAULT_THEME } from '@config/themes/themeConstants.js';

/**
 * Initializes the active theme for the app.
 * - Fetches user-specific theme from Supabase (via themeService).
 * - Falls back to DEFAULT_THEME if no theme is found or an error occurs.
 */
export async function initTheme() {
  try {
    const user = getCurrentUser();
    const userId = user?.id || null;

    // Load user/team theme or fallback to DEFAULT_THEME
    await loadAndApplyTheme(userId, null, DEFAULT_THEME);

    console.log('🎨 Theme initialization complete.');
  } catch (err) {
    console.error('❌ initTheme() failed. Falling back to default theme:', err.message);
    await loadAndApplyTheme(null, null, DEFAULT_THEME);
  }
}
