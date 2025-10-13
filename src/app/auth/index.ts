/**
 * Auth Module - Extracted Utilities
 *
 * This module provides reusable authentication utilities extracted from auth-store.ts.
 * These can be used independently throughout the application.
 */

// Type exports
export type { UserProfile, ProfileCache, AuthState } from "./types";

// Constants
export * from "./constants";

// Utility functions
export { getAuthErrorMessage } from "./utils/errorMessages";
export {
  getCachedProfile,
  cacheProfile,
  invalidateProfileCache,
  clearAllProfileCache,
} from "./utils/profileCache";
export {
  startSessionRefresh,
  stopSessionRefresh,
} from "./utils/sessionRefresh";

// Selector hooks
export { useAuthUser, useAuthProfile } from "./hooks/useAuthUser";
export {
  useAuthLoading,
  useAuthProfileLoading,
  useAuthError,
} from "./hooks/useAuthLoading";
export {
  useIsAuthenticated,
  useIsCoach,
  useIsPlayer,
  useIsFamily,
  useIsAdmin,
} from "./hooks/useAuthRole";
