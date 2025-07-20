// src/config/themes/themeController.js

import { applyTheme } from '@utils/themeManager.js';
import { getCurrentUser } from '@state/userState.js';

import { fetchThemeSettings } from './fetchThemeSettings.js';
import { DEFAULT_THEME, VALID_THEME_KEYS } from './themeConstants.js';

/**
 * Ensures the given theme key is valid, otherwise falls back to DEFAULT_THEME.
 * @param {string | null | undefined} key
 * @returns {string}
 */
function sanitizeThemeKey(key) {
  return VALID_THEME_KEYS.includes(key) ? key : DEFAULT_THEME;
}

/**
 * Applies a theme based on user/team settings and returns the applied theme key.
 * Priority:
 *  1. User theme (if available)
 *  2. Team theme (if available)
 *  3. Default theme (classic)
 *
 * @param {string|null} [teamId=null] - Optional team ID for theme context.
 * @returns {Promise<string>} The applied color theme key.
 */
export async function applyContextualTheme(teamId = null) {
  try {
    const user = getCurrentUser();
    const userId = user?.id || null;

    // Fetch theme settings
    const { font, color } = await fetchThemeSettings(userId, teamId);

    const safeColor = sanitizeThemeKey(color);
    const safeFont = sanitizeThemeKey(font);

    // Apply both color and font themes
    applyTheme(safeColor, safeFont);

    console.log(`🎨 Contextual theme applied: color=${safeColor}, font=${safeFont}`);
    return safeColor; // Return applied color theme
  } catch (err) {
    console.error('❌ Failed to apply contextual theme:', err);
    applyTheme(DEFAULT_THEME, DEFAULT_THEME);
    return DEFAULT_THEME;
  }
}
