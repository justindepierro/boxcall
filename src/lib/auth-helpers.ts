/**
 * Auth Helpers - Bulletproof user ID retrieval
 *
 * Provides a synchronous way to get the current user ID from the auth store,
 * avoiding the potentially slow `supabase.auth.getUser()` network call.
 *
 * Usage:
 * ```ts
 * import { getCurrentUserId } from "../lib/auth-helpers";
 *
 * // In a service method:
 * const userId = getCurrentUserId();
 * if (!userId) {
 *   return { success: false, error: "Not authenticated" };
 * }
 * ```
 */

import {
  getCurrentProfileFromAuthStore,
  getCurrentUserFromAuthStore,
  getCurrentUserIdFromAuthStore,
  isAuthenticatedFromAuthStore,
} from "../app/auth-store";

/**
 * Get the current user ID synchronously from the auth store.
 * This is much faster than `supabase.auth.getUser()` which makes a network call.
 *
 * @returns The user ID or null if not authenticated
 */
export function getCurrentUserId(): string | null {
  return getCurrentUserIdFromAuthStore();
}

/**
 * Get the current user synchronously from the auth store.
 *
 * @returns The user object or null if not authenticated
 */
export function getCurrentUser() {
  return getCurrentUserFromAuthStore();
}

/**
 * Check if the user is currently authenticated.
 *
 * @returns true if authenticated, false otherwise
 */
export function isAuthenticated(): boolean {
  return isAuthenticatedFromAuthStore();
}

/**
 * Get the current user's profile from the auth store.
 *
 * @returns The profile object or null if not available
 */
export function getCurrentProfile() {
  return getCurrentProfileFromAuthStore();
}
