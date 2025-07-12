// src/auth/AuthGuard.js
import { getSession } from '../auth/auth.js';
import { listenToAuthChanges } from '../auth/authListener.js';
import { navigateTo } from '../routes/router.js';
import { applyContextualTheme } from '../config/themes/themeController.js';

/**
 * AuthGuard
 * Wrap this around any protected page logic.
 * Redirects to login page if the user is not authenticated.
 *
 * @param {Function} onAuth - Callback to run if user is authenticated
 */
export async function AuthGuard(onAuth) {
  try {
    const session = await getSession();

    if (session) {
      console.log('🟢 AuthGuard: User is signed in');
      onAuth(session);
    } else {
      console.warn('🔴 AuthGuard: No active session, redirecting to login');
      navigateTo('/login');
    }
  } catch (error) {
    console.error('⚠️ AuthGuard error:', error);
    navigateTo('/login');
  }
}

/**
 * Global listener for Supabase auth events
 * - Handles sign in / sign out / token refresh
 * - Redirects or re-applies themes automatically
 */
export function initAuthListeners() {
  listenToAuthChanges(async ({ event, session }) => {
    console.log('🔄 Auth state changed:', event);

    if (!session) {
      navigateTo('/login');
    } else {
      await applyContextualTheme(); // reapply user/team theme on login
    }
  });
}
