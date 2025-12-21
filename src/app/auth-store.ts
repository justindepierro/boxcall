/**
 * BoxCall Auth Store - SIMPLIFIED VERSION
 *
 * This replaces the 1,310-line monster with a clean, maintainable ~200 line implementation
 * that follows Supabase best practices.
 *
 * Key principles:
 * 1. Let Supabase manage sessions internally (don't manually cache)
 * 2. Use onAuthStateChange as single source of truth
 * 3. Minimal state - only what's needed for UI
 * 4. No complex caching layers or race conditions
 *
 * @see https://supabase.com/docs/guides/auth/quickstarts/react
 */

import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { table } from "../data/supabase/db";
import type { Session, User } from "@supabase/supabase-js";
import type { Database } from "../types/database";
import { auth as logAuth, debug, warn, logError } from "../utils/logger";
import { createSameOriginRedirectTo } from "../utils/redirectUtils";
import { ROUTES } from "../routes/paths";

// Types
type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthState {
  // Core state
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  error: string | null;

  // Actions
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    metadata?: Record<string, unknown>,
    redirectTo?: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;
  fetchUserProfile: (userId: string) => Promise<void>;
  clearError: () => void;
}

// Profile cache (simple, in-memory only)
let profileCache: { data: UserProfile; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function isCacheValid(): boolean {
  return (
    profileCache !== null && Date.now() - profileCache.timestamp < CACHE_TTL
  );
}

// Create the store
export const useAuth = create<AuthState>((set, _get) => ({
  // Initial state
  user: null,
  session: null,
  profile: null,
  loading: true,
  profileLoading: false,
  error: null,

  // Sign in with email/password
  signIn: async (email, password) => {
    set({ error: null });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const message = getErrorMessage(error);
      set({ error: message });
      return { success: false, error: message };
    }

    // onAuthStateChange will handle setting user/session
    return { success: true };
  },

  // Sign up with email/password
  signUp: async (email, password, metadata, redirectTo) => {
    set({ error: null });

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: redirectTo
          ? createSameOriginRedirectTo(redirectTo)
          : undefined,
      },
    });

    if (error) {
      const message = getErrorMessage(error);
      set({ error: message });
      return { success: false, error: message };
    }

    return { success: true };
  },

  // Sign out
  signOut: async () => {
    await supabase.auth.signOut();
    profileCache = null;
    set({ user: null, session: null, profile: null, error: null });
  },

  // Reset password
  resetPassword: async (email) => {
    set({ error: null });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: createSameOriginRedirectTo(ROUTES.RESET_PASSWORD),
    });

    if (error) {
      const message = getErrorMessage(error);
      set({ error: message });
      return { success: false, error: message };
    }

    return { success: true };
  },

  // Fetch user profile
  fetchUserProfile: async (userId) => {
    // Return cached if valid
    if (isCacheValid() && profileCache?.data.id === userId) {
      set({ profile: profileCache.data, profileLoading: false });
      return;
    }

    set({ profileLoading: true });

    const { data, error } = await table("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      logError("[Auth] Profile fetch error:", error.message);
      set({ profileLoading: false });
      return;
    }

    if (data) {
      profileCache = { data, timestamp: Date.now() };
      set({ profile: data, profileLoading: false });
    } else {
      set({ profileLoading: false });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

// Error message helper
function getErrorMessage(error: { message?: string; status?: number }): string {
  const msg = error.message?.toLowerCase() || "";

  if (msg.includes("invalid login credentials")) {
    return "Invalid email or password. Please check your credentials.";
  }
  if (msg.includes("email not confirmed")) {
    return "Please verify your email before signing in.";
  }
  if (msg.includes("too many requests") || error.status === 429) {
    return "Too many attempts. Please wait a few minutes.";
  }
  if (msg.includes("user not found")) {
    return "No account found with this email.";
  }

  return error.message || "Authentication failed. Please try again.";
}

// ============================================================================
// INITIALIZATION - runs once when module loads
// ============================================================================

let initialized = false;

async function initializeAuth() {
  if (initialized) return;
  initialized = true;

  logAuth("[Auth] Initializing...");

  // Get initial session
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    warn("[Auth] Session error:", error.message);
    useAuth.setState({ loading: false });
    return;
  }

  if (session) {
    logAuth("[Auth] Session found:", session.user.email);
    useAuth.setState({
      user: session.user,
      session,
      loading: false,
    });

    // Fetch profile in background
    useAuth.getState().fetchUserProfile(session.user.id);
  } else {
    debug("[Auth] No session");
    useAuth.setState({ loading: false });
  }
}

// Listen for auth changes
supabase.auth.onAuthStateChange(async (event, session) => {
  debug("[Auth] State changed:", event, session?.user?.email || "no user");

  if (session) {
    useAuth.setState({
      user: session.user,
      session,
      loading: false,
      error: null,
    });

    // Fetch profile on sign in
    if (event === "SIGNED_IN") {
      useAuth.getState().fetchUserProfile(session.user.id);
    }
  } else {
    profileCache = null;
    useAuth.setState({
      user: null,
      session: null,
      profile: null,
      loading: false,
    });
  }
});

// Initialize
initializeAuth();

// ============================================================================
// EXPORTS
// ============================================================================

// Selector hooks for optimized re-renders
export const useAuthUser = () => useAuth((state) => state.user);
export const useAuthProfile = () => useAuth((state) => state.profile);
export const useAuthLoading = () => useAuth((state) => state.loading);
export const useAuthProfileLoading = () =>
  useAuth((state) => state.profileLoading);
export const useAuthError = () => useAuth((state) => state.error);
export const useIsAuthenticated = () => useAuth((state) => !!state.user);
export const useIsCoach = () =>
  useAuth((state) => state.profile?.role === "coach");
export const useIsPlayer = () =>
  useAuth((state) => state.profile?.role === "player");
export const useIsFamily = () =>
  useAuth((state) => state.profile?.role === "family");
export const useIsAdmin = () =>
  useAuth((state) => state.profile?.role === "admin");

// Synchronous snapshot helpers (avoid ad-hoc getState usage in utilities/services)
export function getCurrentUserIdFromAuthStore(): string | null {
  try {
    return useAuth.getState().user?.id ?? null;
  } catch {
    return null;
  }
}

export function getCurrentUserFromAuthStore() {
  try {
    return useAuth.getState().user ?? null;
  } catch {
    return null;
  }
}

export function isAuthenticatedFromAuthStore(): boolean {
  try {
    return !!useAuth.getState().user;
  } catch {
    return false;
  }
}

export function getCurrentProfileFromAuthStore() {
  try {
    return useAuth.getState().profile ?? null;
  } catch {
    return null;
  }
}

export type { AuthState, UserProfile };
