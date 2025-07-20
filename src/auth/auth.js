// src/auth/auth.js

// Absolute imports
import { renderPublicAppShell } from '@render/renderAppShell.js';
import { navigateTo, handleRouting } from '@routes/router.js';
import { showToast } from '@render/UIZones.js';
import { devError, devLog } from '@utils/devLogger.js';

// Relative imports
import { supabase } from './supabaseClient.js';

/**
 * @typedef {import('@supabase/supabase-js').Session} Session
 * @typedef {import('@supabase/supabase-js').User} User
 */

/**
 * Saves session data to localStorage for persistence.
 * @param {Session|null} session
 */
function persistSession(session) {
  if (session) {
    localStorage.setItem('supabaseSession', JSON.stringify(session));
    devLog(`Session persisted → ${JSON.stringify(session)}`);
  } else {
    localStorage.removeItem('supabaseSession');
    devLog('Session cleared.');
  }
}

/**
 * Sign up a new user with email and password.
 * @returns {Promise<{ user: User|null, session: Session|null, error: Error|null }>}
 */
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        theme_pref: 'classic',
        font_pref: 'coach',
        role: 'player',
      },
    },
  });

  devLog(`Sign Up → data=${JSON.stringify(data)} error=${error?.message || 'none'}`);
  persistSession(data?.session || null);

  return { user: data?.user || null, session: data?.session || null, error };
}

/**
 * Sign in an existing user.
 * @returns {Promise<{ user: User|null, session: Session|null, error: Error|null }>}
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  devLog(`Sign In → data=${JSON.stringify(data)} error=${error?.message || 'none'}`);
  persistSession(data?.session || null);

  return { user: data?.user || null, session: data?.session || null, error };
}

/**
 * Sign out the current user and clear the local session.
 * @returns {Promise<{ error: Error|null }>}
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  persistSession(null);
  devLog(`Sign Out → ${error ? error.message : 'no error'}`);
  return { error };
}

/**
 * Get the current session.
 * @returns {Promise<Session|null>}
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    devError(`Get Session ❌ ${error.message}`);
    return null;
  }

  const session = data?.session || null;
  persistSession(session);
  return session;
}

/**
 * Get the current authenticated user.
 * @returns {Promise<User|null>}
 */
export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    devError(`Get User ❌ ${error.message}`);
    return null;
  }
  return data?.user || null;
}

/**
 * Refresh the user session manually.
 * @returns {Promise<Session|null>}
 */
export async function refreshSession() {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) {
    devError(`Refresh Session ❌ ${error.message}`);
    return null;
  }

  persistSession(data?.session || null);
  return data?.session || null;
}

/**
 * Trigger password reset flow.
 * @returns {Promise<{ data: any, error: Error|null }>}
 */
export async function resetPassword(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/#/reset`,
  });

  devLog(`Reset Password → email=${email} error=${error?.message || 'none'}`);
  return { data, error };
}

/**
 * Logs out the user, resets the UI to public mode, and navigates to login.
 * @returns {Promise<{ error: Error|null }>}
 */
export async function handleLogout() {
  const { error } = await signOut();
  if (error) {
    devError(`❌ handleLogout(): Logout failed → ${error.message}`);
    showToast(`❌ Logout failed: ${error.message}`, 'error');
    return { error };
  }

  showToast('👋 Logged out successfully!', 'info');

  // Reset layout to public shell
  renderPublicAppShell();

  // Navigate to login and refresh routing
  navigateTo('login');
  await handleRouting();

  return { error: null };
}
