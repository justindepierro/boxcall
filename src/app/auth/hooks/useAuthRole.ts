import { useAuth } from "../../auth-store";
import type { AuthState } from "../types";

/**
 * Check if user is authenticated
 */
export const useIsAuthenticated = () =>
  useAuth((state: AuthState) => !!state.user);

/**
 * Check if user is a coach
 */
export const useIsCoach = () =>
  useAuth((state: AuthState) => state.profile?.role === "coach");

/**
 * Check if user is a player
 */
export const useIsPlayer = () =>
  useAuth((state: AuthState) => state.profile?.role === "player");

/**
 * Check if user is a family member
 */
export const useIsFamily = () =>
  useAuth((state: AuthState) => state.profile?.role === "family");

/**
 * Check if user is an admin
 */
export const useIsAdmin = () =>
  useAuth((state: AuthState) => state.profile?.role === "admin");
