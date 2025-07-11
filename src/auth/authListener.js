// src/auth/authListener.js
import { supabase } from './supabaseClient.js';

/**
 * Subscribe to Supabase auth changes (sign in/out/token refresh).
 * Useful for syncing UI, caching session, or redirecting.
 *
 * @param {Function} callback - Receives { event, session }
 * @returns {Function} unsubscribe function
 */
export function listenToAuthChanges(callback) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('🌀 Auth event:', event);
    callback({ event, session });

    // Optional: persist session to localStorage for hydration
    if (session) {
      localStorage.setItem('supabaseSession', JSON.stringify(session));
    } else {
      localStorage.removeItem('supabaseSession');
    }
  });

  // Return unsubscribe function
  return () => subscription.unsubscribe();
}

/**
 * Restore session from localStorage (if available)
 * Useful on app load before Supabase rehydrates.
 * @returns {object|null} cached session or null
 */
export function loadCachedSession() {
  try {
    const raw = localStorage.getItem('supabaseSession');
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('⚠️ Failed to parse cached session:', err);
    return null;
  }
}
