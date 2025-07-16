// src/lib/init/initUser.js

import { getCurrentUser, isLoggedIn } from '@state/authState.js';
import { getUserSettings } from '@lib/teams/user/getUserSettings.js';
import { getOverrideRole } from '@state/devToolState.js';

/**
 * Loads current user + settings into global context
 * Applies dev role override if present
 *
 * @returns {Promise<{ user: object|null, settings: object|null }>}
 */
export async function initializeUser() {
  const user = getCurrentUser();
  const settings = user ? await getUserSettings(user.id) : null;

  if (!user || !settings) {
    return { user: null, settings: null };
  }

  const overrideRole = getOverrideRole();
  if (overrideRole) {
    settings.original_role = settings.role;
    settings.role = overrideRole;
    console.log(`🧪 Dev role override active: ${overrideRole}`);
  }

  window.userSettings = { ...settings, email: user.email };

  return { user, settings };
}

/**
 * Helper to block access to protected routes
 */
export function handleAuthRedirect(currentPage, publicPages = ['login', 'signup', 'forgot']) {
  const isPublic = publicPages.includes(currentPage);
  if (!isPublic && !isLoggedIn()) {
    console.warn('🔒 Not logged in — redirecting to login...');
    window.location.hash = '#/login';
    return true;
  }
  return false;
}
