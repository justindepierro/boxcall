// src/components/AuthManager.js
import { supabase } from '@auth/supabaseClient.js';
import { setSupabaseUser, clearAuthState } from '@state/userState.js';
import { navigateTo } from '@routes/router.js';
import { applyContextualTheme } from '@config/themes/themeController.js';
import { showToast } from '@utils/toast.js';
import { resetAppToPublic } from '@render/appReset';

/**
 * Starts Supabase auth change listeners.
 */
export function initAuthListeners() {
  console.log('🔄 AuthManager: Initializing auth state listeners...');

  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔄 AuthManager: Auth state changed →', event, session);

    // ...

    if (!session) {
      console.warn('🚪 Logged out — redirecting to login');
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
export function ensureAuthenticated() {
  const user = supabase.auth.getUser();
  if (!user) {
    console.warn('🔒 ensureAuthenticated(): User not logged in, redirecting.');
    navigateTo('login');
    return false;
  }
  return true;
}
