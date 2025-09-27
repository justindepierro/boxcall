import { create } from "zustand";
import { persist } from "zustand/middleware";

import { supabase } from "../lib/supabase";

import type { Database } from "../types/database";
import type { Session, User } from "@supabase/supabase-js";
// User profile type from our database (main profiles table with role)
type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];
import { checkRateLimit, recordFailedAuth, resetRateLimit, RequestSecurity, NetworkResilience } from "../utils/authRateLimit";
import { AuthMonitoring } from "../utils/authMonitoring";

// Convert Supabase auth errors to user-friendly messages
function getAuthErrorMessage(error: any): string {
  if (!error) return "An unexpected error occurred";

  const message = error.message?.toLowerCase() || "";

  if (message.includes("invalid login credentials")) {
    return "Invalid email or password. Please check your credentials and try again.";
  }
  if (message.includes("email not confirmed")) {
    return "Please check your email and click the confirmation link before signing in.";
  }
  if (message.includes("too many requests")) {
    return "Too many login attempts. Please wait a few minutes before trying again.";
  }
  if (message.includes("user not found")) {
    return "No account found with this email address.";
  }
  if (message.includes("weak password")) {
    return "Password is too weak. Please choose a stronger password.";
  }
  if (message.includes("signup disabled")) {
    return "New account registration is currently disabled.";
  }
  if (message.includes("email address is invalid")) {
    return "Please enter a valid email address.";
  }
  if (message.includes("password should be at least")) {
    return "Password must be at least 6 characters long.";
  }

  // Return the original message if we don't have a specific mapping
  return error.message || "Authentication failed. Please try again.";
}

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
  refreshSession: () => Promise<{ success: boolean; error?: string }>;
  // Utility actions
  clearError: () => void;
  reset: () => void;
  // Profile fetching
  fetchUserProfile: (userId: string) => Promise<void>;
  // Offline support
  handleOfflineAuth: (operation: () => Promise<void>) => boolean;
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
        AuthMonitoring.recordSignInAttempt();

        // Security checks
        if (!RequestSecurity.validateOrigin()) {
          const errorMsg = "Request origin validation failed";
          AuthMonitoring.recordSecurityViolation();
          AuthMonitoring.recordError("signIn", errorMsg, undefined, { reason: "origin_validation" });
          set({ error: errorMsg, loading: false });
          return { success: false, error: errorMsg };
        }

        if (RequestSecurity.detectSuspiciousActivity()) {
          const errorMsg = "Suspicious activity detected";
          AuthMonitoring.recordSecurityViolation();
          AuthMonitoring.recordError("signIn", errorMsg, undefined, { reason: "suspicious_activity" });
          set({ error: errorMsg, loading: false });
          return { success: false, error: errorMsg };
        }

        // Check client-side rate limiting
        const rateLimitCheck = checkRateLimit(email);
        if (!rateLimitCheck.allowed) {
          AuthMonitoring.recordRateLimitHit();
          AuthMonitoring.recordError("signIn", "Rate limit exceeded", undefined, { email, delayMs: rateLimitCheck.delayMs });
          const delaySeconds = Math.ceil(rateLimitCheck.delayMs / 1000);
          const errorMsg = `Too many failed attempts. Please wait ${delaySeconds} seconds before trying again.`;
          set({ error: errorMsg, loading: false });
          return { success: false, error: errorMsg };
        }

        // Check if offline and queue operation
        const offlineOperation = async () => {
          AuthMonitoring.recordOfflineQueuedOperation();
          AuthMonitoring.recordEvent("offline_signin_queued", undefined, { email });

          // Re-attempt the sign-in when back online
          const { data, error } = await NetworkResilience.retryWithBackoff(
            () => supabase.auth.signInWithPassword({
              email,
              password,
            }),
            3, // max retries
            1000, // base delay
            10000 // max delay
          );
          if (error) {
            AuthMonitoring.recordNetworkError();
            AuthMonitoring.recordError("offline_signin", error.message, undefined, { email });
            console.error("🚨 Queued sign-in failed:", error);
            return;
          }
          if (data.user && data.session) {
            // Reset rate limiting on successful login
            resetRateLimit(email);
            set({
              user: data.user,
              session: data.session,
              loading: false,
            });
            // Fetch user profile
            await get().fetchUserProfile(data.user.id);
            AuthMonitoring.recordSignInSuccess();
            AuthMonitoring.recordEvent("offline_signin_success", data.user.id, { email });
            console.log("🔄 Queued sign-in operation completed successfully");
          }
        };

        if (get().handleOfflineAuth(offlineOperation)) {
          return { success: false, error: "Queued for when back online" };
        }

        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) {
            console.error("🚨 Supabase signIn error:", error);
            console.error("🚨 Error details:", {
              message: error.message,
              status: error.status,
              details: error,
            });
            // Record failed attempt for rate limiting
            recordFailedAuth(email);
            AuthMonitoring.recordNetworkError();
            AuthMonitoring.recordError("signIn", error.message, undefined, { email, status: error.status });
            const userFriendlyError = getAuthErrorMessage(error);
            set({ error: userFriendlyError, loading: false });
            return { success: false, error: userFriendlyError };
          }
          if (data.user && data.session) {
            // Reset rate limiting on successful login
            resetRateLimit(email);
            set({
              user: data.user,
              session: data.session,
              loading: false,
            });
            // Fetch user profile asynchronously (don't block login on this)
            get().fetchUserProfile(data.user.id);
            AuthMonitoring.recordSignInSuccess();
            AuthMonitoring.recordEvent("signin_success", data.user.id, { email });
            return { success: true };
          }
          set({ loading: false });
          return { success: false, error: "No user data returned" };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Sign in failed";
          // Record failed attempt for rate limiting
          recordFailedAuth(email);
          AuthMonitoring.recordNetworkError();
          AuthMonitoring.recordError("signIn", errorMessage, undefined, { email });
          set({ error: errorMessage, loading: false });
          return { success: false, error: errorMessage };
        }
      },
      signUp: async (email: string, password: string, userData) => {
        AuthMonitoring.recordSignUpAttempt();

        // Security checks
        if (!RequestSecurity.validateOrigin()) {
          const errorMsg = "Request origin validation failed";
          AuthMonitoring.recordSecurityViolation();
          AuthMonitoring.recordError("signUp", errorMsg, undefined, { reason: "origin_validation" });
          set({ error: errorMsg, loading: false });
          return { success: false, error: errorMsg };
        }

        if (RequestSecurity.detectSuspiciousActivity()) {
          const errorMsg = "Suspicious activity detected";
          AuthMonitoring.recordSecurityViolation();
          AuthMonitoring.recordError("signUp", errorMsg, undefined, { reason: "suspicious_activity" });
          set({ error: errorMsg, loading: false });
          return { success: false, error: errorMsg };
        }

        // Check client-side rate limiting for signups too
        const rateLimitCheck = checkRateLimit(email);
        if (!rateLimitCheck.allowed) {
          AuthMonitoring.recordRateLimitHit();
          AuthMonitoring.recordError("signUp", "Rate limit exceeded", undefined, { email, delayMs: rateLimitCheck.delayMs });
          const delaySeconds = Math.ceil(rateLimitCheck.delayMs / 1000);
          const errorMsg = `Too many attempts. Please wait ${delaySeconds} seconds before trying again.`;
          set({ error: errorMsg, loading: false });
          return { success: false, error: errorMsg };
        }

        // Check if offline and queue operation
        const offlineOperation = async () => {
          AuthMonitoring.recordOfflineQueuedOperation();
          AuthMonitoring.recordEvent("offline_signup_queued", undefined, { email, role: userData.role });

          // Re-attempt the sign-up when back online
          const authData = await NetworkResilience.retryWithBackoff(
            async () => {
              const { data, error } = await supabase.auth.signUp({
                email,
                password,
              });
              if (error) throw error;
              return data;
            },
            3, // max retries
            1000, // base delay
            10000 // max delay
          );

          if (!authData.user) {
            AuthMonitoring.recordError("offline_signup", "No user data returned", undefined, { email });
            console.error("🚨 Queued sign-up failed: No user data");
            return;
          }

          // Create user profile in our database with retry
          await NetworkResilience.retryWithBackoff(
            async () => {
              const { error: profileError } = await supabase
                .from("profiles")
                .insert({
                  id: authData.user!.id,
                  full_name: `${userData.firstName} ${userData.lastName}`,
                  display_name: `${userData.firstName} ${userData.lastName}`,
                  email: email,
                  role: userData.role,
                });
              if (profileError) throw profileError;
            },
            3, // max retries
            1000, // base delay
            10000 // max delay
          );

          set({
            user: authData.user,
            session: authData.session,
            loading: false,
          });
          // Fetch the created profile
          if (authData.session) {
            await get().fetchUserProfile(authData.user!.id);
          }
          AuthMonitoring.recordSignUpSuccess();
          AuthMonitoring.recordEvent("offline_signup_success", authData.user!.id, { email, role: userData.role });
          console.log("🔄 Queued sign-up operation completed successfully");
        };

        if (get().handleOfflineAuth(offlineOperation)) {
          return { success: false, error: "Queued for when back online" };
        }

        set({ loading: true, error: null });
        try {
          // Step 1: Create auth user with retry
          const authData = await NetworkResilience.retryWithBackoff(
            async () => {
              const { data, error } = await supabase.auth.signUp({
                email,
                password,
              });
              if (error) throw error;
              return data;
            },
            3, // max retries
            1000, // base delay
            10000 // max delay
          );

          if (!authData.user) {
            set({ error: "Failed to create user account", loading: false });
            return { success: false, error: "Failed to create user account" };
          }

          // Step 2: Create user profile in our database with retry
          await NetworkResilience.retryWithBackoff(
            async () => {
              const { error: profileError } = await supabase
                .from("profiles")
                .insert({
                  id: authData.user!.id,
                  full_name: `${userData.firstName} ${userData.lastName}`,
                  display_name: `${userData.firstName} ${userData.lastName}`,
                  email: email,
                  role: userData.role,
                });
              if (profileError) throw profileError;
            },
            3, // max retries
            1000, // base delay
            10000 // max delay
          );

          set({
            user: authData.user,
            session: authData.session,
            loading: false,
          });
          // Fetch the created profile
          if (authData.session) {
            await get().fetchUserProfile(authData.user.id);
          }
          AuthMonitoring.recordSignUpSuccess();
          AuthMonitoring.recordEvent("signup_success", authData.user.id, { email, role: userData.role });
          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Sign up failed";
          // Record failed attempt for rate limiting
          recordFailedAuth(email);
          AuthMonitoring.recordNetworkError();
          AuthMonitoring.recordError("signUp", errorMessage, undefined, { email, role: userData.role });
          set({ error: errorMessage, loading: false });
          return { success: false, error: errorMessage };
        }
      },
      signOut: async () => {
        const userId = get().user?.id;
        AuthMonitoring.recordSignOut();
        AuthMonitoring.recordEvent("signout", userId);

        set({ loading: true, error: null });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) {
            AuthMonitoring.recordError("signOut", error.message, userId);
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
          AuthMonitoring.recordError("signOut", errorMessage, userId);
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
      refreshSession: async () => {
        const userId = get().user?.id;
        AuthMonitoring.recordSessionRefresh();
        AuthMonitoring.recordEvent("session_refresh_attempt", userId);

        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase.auth.refreshSession();
          if (error) {
            console.error("Session refresh failed:", error);
            AuthMonitoring.recordError("refreshSession", error.message, userId);
            const userFriendlyError = getAuthErrorMessage(error);
            set({ error: userFriendlyError, loading: false });
            return { success: false, error: userFriendlyError };
          }
          if (data.session) {
            set({
              user: data.session.user,
              session: data.session,
              loading: false,
            });
            // Refresh profile data as well
            await get().fetchUserProfile(data.session.user.id);
            AuthMonitoring.recordEvent("session_refresh_success", data.session.user.id);
            return { success: true };
          }
          set({ loading: false });
          return { success: false, error: "No session data returned" };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Session refresh failed";
          console.error("Session refresh error:", error);
          AuthMonitoring.recordError("refreshSession", errorMessage, userId);
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
            console.error("Error fetching user profile:", error);
            return;
          }
          set({ profile: data });
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      },
      // Offline support methods
      handleOfflineAuth: (operation: () => Promise<void>) => {
        if (!NetworkResilience.isOnline()) {
          NetworkResilience.queueForOnline(operation);
          set({ error: "You're currently offline. This action will be performed when you're back online.", loading: false });
          return true; // Indicates operation was queued
        }
        return false; // Operation should proceed normally
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
