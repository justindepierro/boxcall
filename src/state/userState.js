// src/state/userState.js
import { getUser, getSession } from '../auth/auth.js';

let user = null;
let session = null;
let userSettings = null; // <-- Local variable instead of window.userSettings

/**
 * Initializes auth state once on page load or login.
 */
export async function initAuthState() {
  session = await getSession();
  user = await getUser();
  console.log('🔐 Auth initialized:', { session, user });
}

/**
 * Returns current user object (may be null if not logged in).
 */
export function getCurrentUser() {
  return user;
}

/**
 * Returns current session object (may be null if expired).
 */
export function getCurrentSession() {
  return session;
}

/**
 * Returns true if user is logged in.
 */
export function isLoggedIn() {
  return !!user && !!session;
}

/**
 * Clears auth state (e.g., on logout).
 */
export function clearAuthState() {
  user = null;
  session = null;
  userSettings = null;
  console.log('🔒 Auth state cleared');
}

/* -------------------------------------------------------------------------- */
/*                            USER SETTINGS MANAGEMENT                        */
/* -------------------------------------------------------------------------- */

/**
 * Set the current user's settings.
 * @param {object} settings - User settings object
 */
export function setUserSettings(settings) {
  userSettings = settings;
  console.log('⚙️ userSettings updated:', userSettings);
}

/**
 * Get the current user's settings.
 * @returns {object|null} User settings
 */
export function getUserSettings() {
  return userSettings;
}
