// src/lib/init/initUser.js

import { getCurrentUser, setUserSettings } from '@state/userState.js';
import { getUserSettings as fetchUserSettings } from '@lib/teams/user/getUserSettings.js';
import { getOverrideRole } from '@state/devToolState.js';

/**
 * Loads the current user's settings and applies dev overrides if needed.
 *
 * @returns {Promise<{ user: object|null, settings: object|null }>}
 */
export async function initializeUser() {
  const user = getCurrentUser();
  const settings = user ? await fetchUserSettings(user.id) : null;

  if (!user || !settings) {
    console.warn('⚠️ No user or settings found during initialization.');
    return { user: null, settings: null };
  }

  // Apply dev override role
  const overrideRole = getOverrideRole();
  if (overrideRole) {
    settings.original_role = settings.role;
    settings.role = overrideRole;
    console.log(`🧪 Dev role override active: ${overrideRole}`);
  }

  // Store settings in our centralized user state
  setUserSettings({ ...settings, email: user.email });

  console.log('✅ User settings initialized:', settings);
  return { user, settings };
}

/**
 * Redirect to login if not authorized for current page.
 *
 * @param {string} currentPage
 * @param {string[]} publicPages
 * @returns {boolean} True if redirected
 */
export function handleAuthRedirect(currentPage, publicPages = ['login', 'signup', 'forgot']) {
  const isPublic = publicPages.includes(currentPage);
  if (!isPublic && !getCurrentUser()) {
    console.warn('🔒 Not logged in — redirecting to login...');
    window.location.hash = '#/login';
    return true;
  }
  return false;
}
