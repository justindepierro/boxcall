// src/config/themes/themeController.js

import { applyTheme } from '@utils/themeManager.js';
import { getCurrentUser } from '@state/userState.js';

import { fetchThemeSettings } from './fetchThemeSettings.js';
import { DEFAULT_THEME } from './themeConstants.js';

/**
 * Applies a theme based on the current user and team context.
 * Fallback order:
 *  1. User theme (if available)
 *  2. Team theme (if available)
 *  3. Default theme (DEFAULT_THEME)
 *
 * @param {string|null} teamId - Optional team ID (future feature)
 */
export async function applyContextualTheme(teamId = null) {
  try {
    const user = getCurrentUser();
    const userId = user?.id || null;

    // Fetch user/team theme settings (color only)
    const theme = await fetchThemeSettings(userId, teamId);
    const color = theme?.color || DEFAULT_THEME;

    // Apply color theme
    applyTheme(color);

    console.log(`🎨 Contextual theme applied: color=${color}`);
  } catch (err) {
    console.error('❌ Failed to apply contextual theme:', err);
    applyTheme(DEFAULT_THEME); // fallback
  }
}
