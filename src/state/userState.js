// src/state/authState.js
import { getUser, getSession } from '../auth/auth.js'; // 🔁 adjust path as needed

let user = null;
let session = null;

/**
 * Initializes auth state once on page load or login.
 * Optionally re-fetches user metadata and session.
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
  console.log('🔒 Auth state cleared');
}
