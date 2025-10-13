import { useAuth } from "../../auth-store";
import type { AuthState } from "../types";

/**
 * Get loading state for authentication operations
 */
export const useAuthLoading = () =>
  useAuth((state: AuthState) => state.loading);

/**
 * Get loading state for profile fetching
 */
export const useAuthProfileLoading = () =>
  useAuth((state: AuthState) => state.profileLoading);

/**
 * Get current authentication error
 */
export const useAuthError = () => useAuth((state: AuthState) => state.error);
