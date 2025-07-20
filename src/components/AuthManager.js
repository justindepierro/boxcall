// src/components/AuthManager.js
import { supabase } from '@auth/supabaseClient.js';
import { setSupabaseUser, clearAuthState } from '@state/userState.js';
import { navigateTo } from '@routes/router.js';
import { applyContextualTheme } from '@config/themes/themeController.js';
import { showToast } from '@utils/toast.js';
import { resetAppToPublic } from '@render/appReset';
import { devLog } from '@utils/devLogger.js'; // Centralized logger

/**
 * Starts Supabase auth change listeners.
 */
export function initAuthListeners() {
  devLog('🔄 AuthManager: Initializing auth state listeners...', 'debug');

  supabase.auth.onAuthStateChange(async (event, session) => {
    devLog(`🔄 AuthManager: Auth state changed → ${event}`, 'debug');
    if (session) devLog(`Session User: ${JSON.stringify(session.user)}`, 'debug');

    if (!session) {
      devLog('🚪 Logged out — redirecting to login', 'warn');
      clearAuthState();
      showToast('👋 You have been logged out.', 'info');

      // Reset layout to public (removes sidebar)
      await resetAppToPublic('login');
      return;
    }

    // User signed in or token refreshed
    setSupabaseUser(session.user);
    await applyContextualTheme();
  });
}

/**
 * Helper to check if a user is authenticated.
 * Redirects to login if not.
 */
export async function ensureAuthenticated() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      devLog('🔒 ensureAuthenticated(): User not logged in, redirecting.', 'warn');
      navigateTo('login');
      return false;
    }
    return true;
  } catch (err) {
    devLog(`⚠️ ensureAuthenticated(): Error checking user: ${err.message}`, 'error');
    navigateTo('login');
    return false;
  }
}
