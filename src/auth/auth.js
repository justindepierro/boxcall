// src/auth/auth.js
import { supabase } from './supabaseClient.js';

/**
 * Sign up a new user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user, session, error }>}
 */
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { ...data, error };
}

/**
 * Sign in an existing user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user, session, error }>}
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { ...data, error };
}

/**
 * Sign out the current user.
 * @returns {Promise<{ error }>}
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get the current user session.
 * @returns {Promise<Session|null>}
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return error ? null : data?.session || null;
}

export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/#/login`,
  });
  return { error };
}
