import type { User, Session } from "@supabase/supabase-js";
import type { Database } from "../../types/database";

/**
 * User profile type from database
 */
export type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Profile cache entry with TTL
 */
export interface ProfileCache {
  data: UserProfile;
  timestamp: number;
  ttl: number;
}

/**
 * Authentication state interface
 * Includes user, session, profile, loading states, and all auth actions
 */
export interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  error: string | null;

  // State setters
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setProfileLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Auth lifecycle actions
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    userData: {
      firstName: string;
      lastName: string;
      role: "coach" | "player" | "family" | "admin";
    }
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;
  refreshSession: () => Promise<{ success: boolean; error?: string }>;

  // Utility actions
  clearError: () => void;
  reset: () => void;

  // Profile fetching
  fetchUserProfile: (userId: string) => Promise<void>;

  // Cache management
  invalidateProfileCache: (userId: string) => void;
  clearAllProfileCache: () => void;

  // Offline support
  handleOfflineAuth: (operation: () => Promise<void>) => boolean;
}
