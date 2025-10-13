import { useAuth } from "../../auth-store";
import type { AuthState } from "../types";

/**
 * Get the current authenticated user
 */
export const useAuthUser = () => useAuth((state: AuthState) => state.user);

/**
 * Get the current user's profile
 */
export const useAuthProfile = () => useAuth((state: AuthState) => state.profile);
