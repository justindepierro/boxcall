import { create } from "zustand";
import { persist } from "zustand/middleware";

import { supabase } from "../lib/supabase";

import type { Database } from "../types/database";
import type { Session, User } from "@supabase/supabase-js";
// User profile type from our database (main profiles table with role)
type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];
import { checkRateLimit, recordFailedAuth, resetRateLimit, RequestSecurity } from "../utils/authRateLimit";
import { NetworkResilience } from "../utils/networkResilience";
import { testDatabaseConnection } from "../lib/database-helpers";
import { AuthMonitoring } from "../utils/authMonitoring";
import { emitTelemetry } from "../lib/telemetry";

// Profile cache to prevent redundant database calls
interface ProfileCache {
  data: UserProfile;
  timestamp: number;
  ttl: number;
}

let profileCache: Map<string, ProfileCache> = new Map();
const PROFILE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
  profileLoading: boolean;
  error: string | null;
  // Authentication actions
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
const initialState = {
  user: null,
  session: null,
  profile: null,
  loading: false,
  profileLoading: false,
  error: null,
};
export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,
      // Basic state setters
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setProfile: (profile) => {
        set({ profile });
        // Invalidate cache when profile is manually set
        if (profile?.id) {
          profileCache.delete(profile.id);
        }
      },
      setLoading: (loading) => set({ loading }),
      setProfileLoading: (loading) => set({ profileLoading: loading }),
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
            emitTelemetry("auth.signin.error", {
              email,
              message: userFriendlyError,
              status: error.status,
            });
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
            emitTelemetry("auth.signin.success", {
              userId: data.user.id,
              email,
            });
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
          emitTelemetry("auth.signin.exception", { email, message: errorMessage });
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
            emitTelemetry("auth.signup.error", {
              email,
              message: "Failed to create user account",
            });
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
          emitTelemetry("auth.signup.success", {
            userId: authData.user.id,
            email,
            role: userData.role,
          });
          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Sign up failed";
          // Record failed attempt for rate limiting
          recordFailedAuth(email);
          AuthMonitoring.recordNetworkError();
          AuthMonitoring.recordError("signUp", errorMessage, undefined, { email, role: userData.role });
          set({ error: errorMessage, loading: false });
          emitTelemetry("auth.signup.exception", {
            email,
            role: userData.role,
            message: errorMessage,
          });
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
          // Clear profile cache on sign out
          profileCache.clear();
          emitTelemetry("auth.signout", { userId });
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
      // Profile fetching method with caching
      fetchUserProfile: async (userId: string) => {
        // Check cache first
        const cached = profileCache.get(userId);
        const now = Date.now();
        if (cached && (now - cached.timestamp) < cached.ttl) {
          set({ profile: cached.data, profileLoading: false });
          return;
        }

        set({ profileLoading: true });
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

          if (error) {
            console.error("Error fetching user profile:", error);
            // Create a basic profile if it doesn't exist
            if (error.code === 'PGRST116') { // No rows returned
              console.log("Profile not found, creating basic profile");
              const basicProfile: UserProfile = {
                id: userId,
                full_name: 'User',
                avatar_url: null,
                role: 'player',
                bio: null,
                phone: null,
                email: null,
                display_name: null,
                address: null,
                settings: {},
                position: null,
                jersey_number: null,
                is_active: true,
                notification_preferences: { push: true, email: true, social: true },
                last_login: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              // Cache the basic profile
              profileCache.set(userId, {
                data: basicProfile,
                timestamp: now,
                ttl: PROFILE_CACHE_TTL
              });
              set({ profile: basicProfile });
              return;
            }
            // For other errors, don't set profile to null, just log the error
            return;
          }

          // Cache the fetched profile
          profileCache.set(userId, {
            data,
            timestamp: now,
            ttl: PROFILE_CACHE_TTL
          });
          set({ profile: data });
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // Don't fail completely, just log the error
        } finally {
          set({ profileLoading: false });
        }
      },
      // Cache management methods
      invalidateProfileCache: (userId: string) => {
        profileCache.delete(userId);
      },
      clearAllProfileCache: () => {
        profileCache.clear();
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
        session: state.session,
        profile: state.profile,
      }),
    }
  )
);

// Session refresh logic with improved error handling and recovery
let refreshInterval: NodeJS.Timeout | null = null;
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;
const REFRESH_RETRY_DELAY = 30000; // 30 seconds

const startSessionRefresh = () => {
  // Clear any existing interval
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  // Reset refresh attempts counter
  refreshAttempts = 0;

  // Check session every 5 minutes and refresh if needed
  refreshInterval = setInterval(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("❌ Error checking session:", error);
        AuthMonitoring.recordError("session_check", error.message, undefined, { error });
        return;
      }

      if (session) {
        const now = Date.now() / 1000; // Convert to seconds
        const expiresAt = session.expires_at;

        // If token expires within 10 minutes, refresh it
        if (expiresAt && (expiresAt - now) < 600) {
          console.log("🔄 Refreshing session before expiration");

          if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
            console.error("❌ Max refresh attempts reached, signing out user");
            AuthMonitoring.recordError("session_refresh", "Max refresh attempts exceeded", undefined, {
              attempts: refreshAttempts,
              maxAttempts: MAX_REFRESH_ATTEMPTS
            });
            await useAuth.getState().signOut();
            return;
          }

          const { data, error: refreshError } = await supabase.auth.refreshSession();

          if (refreshError) {
            console.error("❌ Error refreshing session:", refreshError);
            AuthMonitoring.recordError("session_refresh", refreshError.message, undefined, {
              attempt: refreshAttempts + 1,
              maxAttempts: MAX_REFRESH_ATTEMPTS
            });
            refreshAttempts++;

            // Schedule a retry after delay
            setTimeout(() => {
              console.log("🔄 Retrying session refresh...");
              startSessionRefresh();
            }, REFRESH_RETRY_DELAY);

            return;
          }

          if (data.session) {
            console.log("✅ Session refreshed successfully");
            AuthMonitoring.recordEvent("session_refresh_success", data.session.user.id);
            useAuth.setState({
              user: data.session.user,
              session: data.session,
              error: null
            });
            // Reset attempts on success
            refreshAttempts = 0;
          }
        }
      } else {
        console.log("🔐 No active session found during refresh check");
      }
    } catch (unexpectedError) {
      console.error("❌ Unexpected error during session refresh:", unexpectedError);
      AuthMonitoring.recordError("session_refresh_unexpected", unexpectedError instanceof Error ? unexpectedError.message : "Unknown error", undefined, {
        attempt: refreshAttempts
      });
    }
  }, 5 * 60 * 1000); // Check every 5 minutes
};

const stopSessionRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

// Initialize auth state on app start with improved error handling
const initializeAuth = async () => {
  try {
    console.log("🔐 Initializing auth state...");

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error("❌ Error getting initial session:", error);
      AuthMonitoring.recordError("auth_init", error.message, undefined, { phase: "get_session" });
      useAuth.setState({
        loading: false,
        error: "Failed to initialize authentication. Please refresh the page."
      });
      return;
    }

    if (session) {
      console.log("🔐 Session restored on app start:", session.user.id);
      AuthMonitoring.recordEvent("auth_init_success", session.user.id, { hasSession: true });

      useAuth.setState({
        user: session.user,
        session: session,
        loading: false,
        error: null
      });

      // Fetch user profile with error handling
      try {
        await useAuth.getState().fetchUserProfile(session.user.id);
        console.log("✅ User profile loaded successfully");
      } catch (profileError) {
        console.error("❌ Error loading user profile:", profileError);
        AuthMonitoring.recordError("auth_init", profileError instanceof Error ? profileError.message : "Profile fetch failed", session.user.id, {
          phase: "fetch_profile"
        });
        // Don't fail auth init completely if profile fetch fails
      }

      // Test authenticated database connection
      try {
        const dbConnectionOk = await testDatabaseConnection();
        if (dbConnectionOk) {
          console.log("✅ Authenticated database connection verified");
        } else {
          console.warn("⚠️ Authenticated database connection test failed");
        }
      } catch (dbError) {
        console.error("❌ Error testing authenticated database connection:", dbError);
        // Don't fail auth init if DB test fails
      }

      // Start session refresh monitoring
      startSessionRefresh();
    } else {
      console.log("🔐 No session found on app start");
      AuthMonitoring.recordEvent("auth_init_success", undefined, { hasSession: false });
      useAuth.setState({ loading: false });
    }
  } catch (unexpectedError) {
    console.error("❌ Unexpected error during auth initialization:", unexpectedError);
    AuthMonitoring.recordError("auth_init_unexpected", unexpectedError instanceof Error ? unexpectedError.message : "Unknown error", undefined, {
      phase: "unexpected"
    });
    useAuth.setState({
      loading: false,
      error: "Authentication initialization failed. Please refresh the page."
    });
  }
};

// Initialize auth state
initializeAuth();

// Enhanced auth state change listener with better error handling
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log(`🔐 Auth state changed: ${event}`, session?.user?.id || 'no user');

  try {
    switch (event) {
      case 'SIGNED_IN':
        if (session) {
          AuthMonitoring.recordEvent("auth_state_change", session.user.id, { event, hasSession: true });
          useAuth.setState({
            user: session.user,
            session: session,
            error: null
          });

          // Fetch profile for new sign-ins
          try {
            await useAuth.getState().fetchUserProfile(session.user.id);
          } catch (profileError) {
            console.error("❌ Error fetching profile on sign in:", profileError);
            AuthMonitoring.recordError("auth_state_change", profileError instanceof Error ? profileError.message : "Profile fetch failed", session.user.id, { event });
          }

          // Test database connection after successful sign-in
          try {
            const dbConnectionOk = await testDatabaseConnection();
            if (dbConnectionOk) {
              console.log("✅ Database connection verified after sign-in");
            }
          } catch (dbError) {
            console.warn("⚠️ Database connection test failed after sign-in:", dbError);
          }

          startSessionRefresh();
        }
        break;

      case 'SIGNED_OUT':
        AuthMonitoring.recordEvent("auth_state_change", undefined, { event, hasSession: false });
        stopSessionRefresh();
        // Clear all auth state
        useAuth.setState({
          user: null,
          session: null,
          profile: null,
          error: null
        });
        // Clear profile cache
        profileCache.clear();
        break;

      case 'TOKEN_REFRESHED':
        if (session) {
          AuthMonitoring.recordEvent("auth_state_change", session.user.id, { event, hasSession: true });
          useAuth.setState({
            user: session.user,
            session: session,
            error: null
          });
          console.log("✅ Auth token refreshed");
        }
        break;

      case 'USER_UPDATED':
        if (session) {
          AuthMonitoring.recordEvent("auth_state_change", session.user.id, { event, hasSession: true });
          useAuth.setState({
            user: session.user,
            session: session,
            error: null
          });
          console.log("✅ User updated");
        }
        break;

      default:
        console.log(`ℹ️ Unhandled auth event: ${event}`);
    }
  } catch (error) {
    console.error("❌ Error handling auth state change:", error);
    AuthMonitoring.recordError("auth_state_change", error instanceof Error ? error.message : "Unknown error", session?.user?.id, { event });
  }
});

// Selector hooks for convenience
export const useAuthUser = () => useAuth((state) => state.user);
export const useAuthProfile = () => useAuth((state) => state.profile);
export const useAuthLoading = () => useAuth((state) => state.loading);
export const useAuthProfileLoading = () => useAuth((state) => state.profileLoading);
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
