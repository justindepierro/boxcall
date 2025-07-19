// src/auth/auth.js
import { supabase } from './supabaseClient.js';
import { renderAppShell } from '@render/renderAppShell.js';
import { navigateTo, handleRouting } from '@routes/router.js';
import { showToast } from '@render/UIZones.js';

/**
 * @typedef {import('@supabase/supabase-js').Session} Session
 * @typedef {import('@supabase/supabase-js').User} User
 */

// Internal logger toggle
const DEBUG = true;
function log(...args) {
  if (DEBUG) console.log('[🔐 AUTH]', ...args);
}

/**
 * Saves session data to localStorage for persistence.
 * @param {Session|null} session
 */
function persistSession(session) {
  if (session) {
    localStorage.setItem('supabaseSession', JSON.stringify(session));
    log('Session persisted →', session);
  } else {
    localStorage.removeItem('supabaseSession');
    log('Session cleared.');
  }
}

/**
 * Sign up a new user with email and password.
 * Adds default metadata for future theming and roles.
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

  log('Sign Up →', { data, error });
  persistSession(data?.session || null);

  return {
    user: data?.user || null,
    session: data?.session || null,
    error,
  };
}

/**
 * Sign in an existing user.
 * Automatically persists the session.
 * @returns {Promise<{ user: User|null, session: Session|null, error: Error|null }>}
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  log('Sign In →', { data, error });
  persistSession(data?.session || null);

  return {
    user: data?.user || null,
    session: data?.session || null,
    error,
  };
}

/**
 * Sign out the current user.
 * Clears the local session.
 * @returns {Promise<{ error: Error|null }>}
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  persistSession(null);
  log('Sign Out →', { error });
  return { error };
}

/**
 * Get the current session (if logged in).
 * @returns {Promise<Session|null>}
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    log('Get Session ❌', error.message);
    return null;
  }

  const session = data?.session || null;
  persistSession(session); // Keep local storage in sync
  return session;
}

/**
 * Get the current authenticated user + metadata.
 * @returns {Promise<User|null>}
 */
export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    log('Get User ❌', error.message);
    return null;
  }

  return data?.user || null;
}

/**
 * Refresh the user session manually.
 * Useful after long idle periods.
 * @returns {Promise<Session|null>}
 */
export async function refreshSession() {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) {
    log('Refresh Session ❌', error.message);
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

  log('Reset Password →', { email, error });
  return { data, error };
}

/**
 * Logs out the user, resets the UI to public mode, and navigates to login.
 * @returns {Promise<{ error: Error|null }>}
 */
export async function handleLogout() {
  const { error } = await signOut();
  if (error) {
    console.error('❌ handleLogout(): Logout failed', error);
    showToast(`❌ Logout failed: ${error.message}`, 'error');
    return { error };
  }

  showToast('👋 Logged out successfully!', 'info');

  // Reset layout to public shell
  renderAppShell(true);

  // Navigate to login and refresh routing
  navigateTo('login');
  await handleRouting();

  return { error: null };
}
