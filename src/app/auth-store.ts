import { create } from "zustand";
import { persist } from "zustand/middleware";

import { supabase } from "../lib/supabase";

import type { Database } from "../types/database";
import type { Session, User } from "@supabase/supabase-js";
// User profile type from our database (main profiles table with role)
type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];
interface AuthState {
  // Authentication state
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  // Authentication actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
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
  // Utility actions
  clearError: () => void;
  reset: () => void;
  // Profile fetching
  fetchUserProfile: (userId: string) => Promise<void>;
}
const initialState = {
  user: null,
  session: null,
  profile: null,
  loading: false,
  error: null,
};
export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,
      // Basic state setters
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      // Authentication methods - Real Supabase implementation
      signIn: async (email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) {
// console.error("🚨 Supabase signIn error:", error);
// console.error("🚨 Error details:", {
              message: error.message,
              status: error.status,
              details: error,
            });
            set({ error: error.message, loading: false });
            return { success: false, error: error.message };
          }
          if (data.user && data.session) {
            set({
              user: data.user,
              session: data.session,
              loading: false,
            });
            // Fetch user profile
            await get().fetchUserProfile(data.user.id);
            return { success: true };
          }
          set({ loading: false });
          return { success: false, error: "No user data returned" };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Sign in failed";
          set({ error: errorMessage, loading: false });
          return { success: false, error: errorMessage };
        }
      },
      signUp: async (email: string, password: string, userData) => {
        set({ loading: true, error: null });
        try {
          // Step 1: Create auth user
          const { data: authData, error: authError } =
            await supabase.auth.signUp({
              email,
              password,
            });
          if (authError) {
            set({ error: authError.message, loading: false });
            return { success: false, error: authError.message };
          }
          if (!authData.user) {
            set({ error: "Failed to create user account", loading: false });
            return { success: false, error: "Failed to create user account" };
          }
          // Step 2: Create user profile in our database
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: authData.user.id,
              full_name: `${userData.firstName} ${userData.lastName}`,
              display_name: `${userData.firstName} ${userData.lastName}`,
              email: email,
              role: userData.role,
            });
          if (profileError) {
            set({ error: profileError.message, loading: false });
            return { success: false, error: profileError.message };
          }
          set({
            user: authData.user,
            session: authData.session,
            loading: false,
          });
          // Fetch the created profile
          if (authData.session) {
            await get().fetchUserProfile(authData.user.id);
          }
          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Sign up failed";
          set({ error: errorMessage, loading: false });
          return { success: false, error: errorMessage };
        }
      },
      signOut: async () => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) {
            set({ error: error.message, loading: false });
            return;
          }
          // Clear all auth state
          set({
            user: null,
            session: null,
            profile: null,
            loading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Sign out failed";
          set({ error: errorMessage, loading: false });
        }
      },
      resetPassword: async (email: string) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });
          if (error) {
            set({ error: error.message, loading: false });
            return { success: false, error: error.message };
          }
          set({ loading: false });
          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Password reset failed";
          set({ error: errorMessage, loading: false });
          return { success: false, error: errorMessage };
        }
      },
      // Profile fetching method
      fetchUserProfile: async (userId: string) => {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();
          if (error) {
// console.error("Error fetching user profile:", error);
            return;
          }
          set({ profile: data });
        } catch (error) {
// console.error("Error fetching user profile:", error);
        }
      },
      // Utility methods
      clearError: () => set({ error: null }),
      reset: () => set(initialState),
    }),
    {
      name: "boxcall-auth-storage",
      partialize: (state) => ({
        // Only persist non-sensitive data
        user: state.user,
        profile: state.profile,
      }),
    }
  )
);
// Selector hooks for convenience
export const useAuthUser = () => useAuth((state) => state.user);
export const useAuthProfile = () => useAuth((state) => state.profile);
export const useAuthLoading = () => useAuth((state) => state.loading);
export const useAuthError = () => useAuth((state) => state.error);
// Authentication status selectors
export const useIsAuthenticated = () => useAuth((state) => !!state.user);
export const useIsCoach = () =>
  useAuth((state) => state.profile?.role === "coach");
export const useIsPlayer = () =>
  useAuth((state) => state.profile?.role === "player");
export const useIsFamily = () =>
  useAuth((state) => state.profile?.role === "family");
export const useIsAdmin = () =>
  useAuth((state) => state.profile?.role === "admin");
