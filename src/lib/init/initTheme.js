// src/lib/init/initTheme.js
import { applyContextualTheme } from '@config/themes/themeController.js';
import { applyTheme } from '@utils/themeManager.js';
import { DEFAULT_THEME } from '@config/themes/themeConstants.js';

/**
 * Initializes and applies the active theme.
 * Ensures fallback to DEFAULT_THEME if an error occurs.
 */
export async function initTheme() {
  try {
    const appliedTheme = await applyContextualTheme();
    if (!appliedTheme) {
      console.warn('⚠️ No theme returned, applying fallback');
      applyTheme(DEFAULT_THEME);
    }
  } catch (err) {
    console.error('🎨 Theme error, falling back to classic:', err.message);
    applyTheme(DEFAULT_THEME);
  }
}
