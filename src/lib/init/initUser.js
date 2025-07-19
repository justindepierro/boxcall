// src/lib/init/initUser.js

import { getCurrentUser, setUserSettings } from '@state/userState.js';
import { getUserSettings as fetchUserSettings } from '@lib/teams/user/getUserSettings.js';
import { getOverrideRole } from '@state/devToolState.js';
import { getSession } from '@auth/auth.js';

/**
 * Loads the current user's settings and applies dev overrides if needed.
 *
 * @returns {Promise<{ user: object|null, settings: object|null }>}
 */
export async function initializeUser() {
  let user = getCurrentUser();

  // 🚀 Try restoring from localStorage if user is not already in state
  if (!user) {
    const storedSession = localStorage.getItem('supabaseSession');
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        user = parsed?.user || null;
        console.log('♻️ Restored user from localStorage:', user);
      } catch (err) {
        console.warn('⚠️ Failed to parse local session:', err);
      }
    }
  }

  // 🔄 If still no user, fetch session from Supabase
  if (!user) {
    const session = await getSession();
    user = session?.user || null;
    if (user) {
      console.log('🌐 User loaded from Supabase session:', user);
    }
  }

  // Fetch user settings from DB
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

  // Store settings in centralized state
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
