// src/auth/AuthGuard.js
import { getSession } from './auth.js';
import { navigateTo } from '../router/router.js'; // adjust path if needed

/**
 * AuthGuard
 * Wrap this around any protected route logic or page rendering.
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
      navigateTo('/login'); // adjust path if your login page differs
    }
  } catch (error) {
    console.error('⚠️ AuthGuard error:', error);
    navigateTo('/login');
  }
}
