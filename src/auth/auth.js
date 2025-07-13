// src/auth/auth.js
import { supabase } from './supabaseClient.js';

// Internal logger toggle
const DEBUG = true;
function log(...args) {
  if (DEBUG) console.log('[🔐 AUTH]', ...args);
}

/**
 * Sign up a new user with email and password.
 * Adds default metadata for future theming and roles.
 * @returns {Promise<{ user, session, error }>}
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

  return {
    user: data?.user || null,
    session: data?.session || null,
    error,
  };
}

/**
 * Sign in an existing user.
 * @returns {Promise<{ user, session, error }>}
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  log('Sign In →', { data, error });

  return {
    user: data?.user || null,
    session: data?.session || null,
    error,
  };
}

/**
 * Sign out the current user.
 * @returns {Promise<{ error }>}
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
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

  return data?.session || null;
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

  return data?.session || null;
}

/**
 * Trigger password reset flow.
 * @returns {Promise<{ data, error }>}
 */
export async function resetPassword(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/#/reset`,
  });

  log('Reset Password →', { email, error });
  return { data, error };
}