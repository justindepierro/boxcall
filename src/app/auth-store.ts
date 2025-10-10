import { create } from "zustand";
import { persist } from "zustand/middleware";

import { supabase } from "../lib/supabase";

import type { Database } from "../types/database";
import type { Session, User } from "@supabase/supabase-js";
// User profile type from our database (main profiles table with role)
type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];
import {
  checkRateLimit,
  recordFailedAuth,
  resetRateLimit,
  RequestSecurity,
} from "../utils/authRateLimit";
import { NetworkResilience } from "../utils/networkResilience";
import { testDatabaseConnection } from "../lib/database-helpers";
import { AuthMonitoring } from "../utils/authMonitoring";
import { emitTelemetry } from "../lib/telemetry";
import {
  auth as logAuth,
  success,
  error as logError,
  warn,
  info,
  debug,
} from "../utils/logger";
import {
  PROFILE_CACHE_TTL,
  MAX_REFRESH_ATTEMPTS,
  REFRESH_RETRY_DELAY,
  SESSION_CHECK_INTERVAL,
  SESSION_REFRESH_THRESHOLD,
  MS_PER_SECOND,
  NETWORK_MAX_RETRIES,
  NETWORK_BASE_DELAY,
  NETWORK_MAX_DELAY,
  POSTGRES_NO_ROWS_CODE,
} from "../utils/authConstants";

// Profile cache to prevent redundant database calls
interface ProfileCache {
  data: UserProfile;
  timestamp: number;
  ttl: number;
}

let profileCache: Map<string, ProfileCache> = new Map();

/**
 * Convert Supabase auth errors to user-friendly, actionable messages
 *
 * Provides context-aware error messages with clear next steps for users
 *
 * @param error - The error object from Supabase auth operations
 * @returns A user-friendly error message with actionable guidance
 */
function getAuthErrorMessage(error: any): string {
  if (!error) {
    return "An unexpected error occurred. Please refresh the page and try again.";
  }

  const message = error.message?.toLowerCase() || "";
  const status = error.status;

  // Invalid credentials - most common auth error
  if (message.includes("invalid login credentials")) {
    return "Invalid email or password. Please double-check your credentials and try again. Forgot your password? Use the reset link below.";
  }

  // Email not confirmed - user needs to take action
  if (message.includes("email not confirmed")) {
    return "Email not verified yet. Please check your inbox for the confirmation email. Can't find it? Check your spam folder or request a new confirmation email.";
  }

  // Rate limiting - time-based lockout
  if (message.includes("too many requests") || status === 429) {
    return "Too many login attempts detected. For security, please wait 5-10 minutes before trying again. This helps protect your account from unauthorized access.";
  }

  // User not found - might be typo or wrong account
  if (message.includes("user not found")) {
    return "No account found with this email address. Please check the email for typos, or create a new account if you haven't registered yet.";
  }

  // Weak password - needs stronger password
  if (message.includes("weak password")) {
    return "Password is too weak. Please choose a stronger password with at least 8 characters, including uppercase, lowercase, numbers, and symbols.";
  }

  // Signup disabled - system-level restriction
  if (message.includes("signup disabled")) {
    return "New registrations are temporarily disabled. Please contact support if you need access, or try again later.";
  }

  // Invalid email format
  if (message.includes("email address is invalid")) {
    return "The email address format is invalid. Please enter a valid email like: user@example.com";
  }

  // Password length requirement
  if (message.includes("password should be at least")) {
    return "Password must be at least 6 characters long. For better security, we recommend using 8+ characters with a mix of letters, numbers, and symbols.";
  }

  // Network errors - connectivity issues
  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("timeout")
  ) {
    return "Network connection issue detected. Please check your internet connection and try again. If the problem persists, try refreshing the page.";
  }

  // Session expired - user needs to re-authenticate
  if (
    message.includes("session") &&
    (message.includes("expired") || message.includes("invalid"))
  ) {
    return "Your session has expired for security reasons. Please sign in again to continue.";
  }

  // Fallback with original message for debugging
  const originalMessage = error.message || "Authentication failed";
  return `${originalMessage}. If this problem continues, please contact support with error code: ${status || "UNKNOWN"}`;
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
          AuthMonitoring.recordError("signIn", errorMsg, undefined, {
            reason: "origin_validation",
          });
          set({ error: errorMsg, loading: false });
          return { success: false, error: errorMsg };
        }

        if (RequestSecurity.detectSuspiciousActivity()) {
          const errorMsg = "Suspicious activity detected";
          AuthMonitoring.recordSecurityViolation();
          AuthMonitoring.recordError("signIn", errorMsg, undefined, {
            reason: "suspicious_activity",
          });
          set({ error: errorMsg, loading: false });
          return { success: false, error: errorMsg };
        }

        // Check client-side rate limiting
        const rateLimitCheck = checkRateLimit(email);
        if (!rateLimitCheck.allowed) {
          AuthMonitoring.recordRateLimitHit();
          AuthMonitoring.recordError(
            "signIn",
            "Rate limit exceeded",
            undefined,
            { email, delayMs: rateLimitCheck.delayMs }
          );
          const delaySeconds = Math.ceil(rateLimitCheck.delayMs / 1000);
          const errorMsg = `Too many failed attempts. Please wait ${delaySeconds} seconds before trying again.`;
          set({ error: errorMsg, loading: false });
          return { success: false, error: errorMsg };
        }

        // Check if offline and queue operation
        const offlineOperation = async () => {
          AuthMonitoring.recordOfflineQueuedOperation();
          AuthMonitoring.recordEvent("offline_signin_queued", undefined, {
            email,
          });

          // Re-attempt the sign-in when back online
          const { data, error } = await NetworkResilience.retryWithBackoff(
            () =>
              supabase.auth.signInWithPassword({
                email,
                password,
              }),
            NETWORK_MAX_RETRIES,
            NETWORK_BASE_DELAY,
            NETWORK_MAX_DELAY
          );
          if (error) {
            AuthMonitoring.recordNetworkError();
            AuthMonitoring.recordError(
              "offline_signin",
              error.message,
              undefined,
              { email }
            );
            logError("Queued sign-in failed:", error);
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
            AuthMonitoring.recordEvent("offline_signin_success", data.user.id, {
              email,
            });
            success("Queued sign-in operation completed successfully");
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
            logError("Supabase signIn error:", error);
            logError("Error details:", {
              message: error.message,
              status: error.status,
              details: error,
            });
            // Record failed attempt for rate limiting
            recordFailedAuth(email);
            AuthMonitoring.recordNetworkError();
            AuthMonitoring.recordError("signIn", error.message, undefined, {
              email,
              status: error.status,
            });
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
            AuthMonitoring.recordEvent("signin_success", data.user.id, {
              email,
            });
            emitTelemetry("auth.signin.success", {
              userId: data.user.id,
              email,
            });
            return { success: true };
          }
          set({ loading: false });
          return {
            success: false,
            error:
              "Sign in succeeded but no user data was returned. This may be a temporary issue. Please try again or contact support if the problem persists.",
          };
        } catch (error) {
          // Enhanced error message with context and next steps
          let errorMessage: string;
          if (error instanceof Error) {
            // Provide context based on error type
            if (
              error.message.toLowerCase().includes("network") ||
              error.message.toLowerCase().includes("fetch")
            ) {
              errorMessage =
                "Network error during sign in. Please check your internet connection and try again.";
            } else if (error.message.toLowerCase().includes("timeout")) {
              errorMessage =
                "Sign in request timed out. Please check your connection and try again.";
            } else {
              errorMessage = `Sign in failed: ${error.message}. Please try again or contact support if the issue persists.`;
            }
          } else {
            errorMessage =
              "An unexpected error occurred during sign in. Please refresh the page and try again.";
          }
          // Record failed attempt for rate limiting
          recordFailedAuth(email);
          AuthMonitoring.recordNetworkError();
          AuthMonitoring.recordError("signIn", errorMessage, undefined, {
            email,
          });
          set({ error: errorMessage, loading: false });
          emitTelemetry("auth.signin.exception", {
            email,
            message: errorMessage,
          });
          return { success: false, error: errorMessage };
        }
      },
      signUp: async (email: string, password: string, userData) => {
        AuthMonitoring.recordSignUpAttempt();

        // Security checks
        if (!RequestSecurity.validateOrigin()) {
          const errorMsg = "Request origin validation failed";
          AuthMonitoring.recordSecurityViolation();
          AuthMonitoring.recordError("signUp", errorMsg, undefined, {
            reason: "origin_validation",
          });
          set({ error: errorMsg, loading: false });
          return { success: false, error: errorMsg };
        }

        if (RequestSecurity.detectSuspiciousActivity()) {
          const errorMsg = "Suspicious activity detected";
          AuthMonitoring.recordSecurityViolation();
          AuthMonitoring.recordError("signUp", errorMsg, undefined, {
            reason: "suspicious_activity",
          });
          set({ error: errorMsg, loading: false });
          return { success: false, error: errorMsg };
        }

        // Check client-side rate limiting for signups too
        const rateLimitCheck = checkRateLimit(email);
        if (!rateLimitCheck.allowed) {
          AuthMonitoring.recordRateLimitHit();
          AuthMonitoring.recordError(
            "signUp",
            "Rate limit exceeded",
            undefined,
            { email, delayMs: rateLimitCheck.delayMs }
          );
          const delaySeconds = Math.ceil(rateLimitCheck.delayMs / 1000);
          const errorMsg = `Too many attempts. Please wait ${delaySeconds} seconds before trying again.`;
          set({ error: errorMsg, loading: false });
          return { success: false, error: errorMsg };
        }

        // Check if offline and queue operation
        const offlineOperation = async () => {
          AuthMonitoring.recordOfflineQueuedOperation();
          AuthMonitoring.recordEvent("offline_signup_queued", undefined, {
            email,
            role: userData.role,
          });

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
            NETWORK_MAX_RETRIES,
            NETWORK_BASE_DELAY,
            NETWORK_MAX_DELAY
          );

          if (!authData.user) {
            AuthMonitoring.recordError(
              "offline_signup",
              "No user data returned",
              undefined,
              { email }
            );
            logError("Queued sign-up failed: No user data");
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
            NETWORK_MAX_RETRIES,
            NETWORK_BASE_DELAY,
            NETWORK_MAX_DELAY
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
          AuthMonitoring.recordEvent(
            "offline_signup_success",
            authData.user!.id,
            { email, role: userData.role }
          );
          success("Queued sign-up operation completed successfully");
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
            NETWORK_MAX_RETRIES,
            NETWORK_BASE_DELAY,
            NETWORK_MAX_DELAY
          );

          if (!authData.user) {
            const errorMsg =
              "Account creation failed. The authentication service did not return user data. Please try again, or contact support if the problem continues.";
            set({ error: errorMsg, loading: false });
            emitTelemetry("auth.signup.error", {
              email,
              message: errorMsg,
            });
            return { success: false, error: errorMsg };
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
            NETWORK_MAX_RETRIES,
            NETWORK_BASE_DELAY,
            NETWORK_MAX_DELAY
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
          AuthMonitoring.recordEvent("signup_success", authData.user.id, {
            email,
            role: userData.role,
          });
          emitTelemetry("auth.signup.success", {
            userId: authData.user.id,
            email,
            role: userData.role,
          });
          return { success: true };
        } catch (error) {
          // Enhanced error message with context for signup failures
          let errorMessage: string;
          if (error instanceof Error) {
            const errMsg = error.message.toLowerCase();
            // Provide specific guidance based on error type
            if (errMsg.includes("network") || errMsg.includes("fetch")) {
              errorMessage =
                "Network error during account creation. Please check your internet connection and try again.";
            } else if (errMsg.includes("timeout")) {
              errorMessage =
                "Account creation timed out. Please check your connection and try again.";
            } else if (
              errMsg.includes("duplicate") ||
              errMsg.includes("already exists")
            ) {
              errorMessage =
                "An account with this email already exists. Try signing in instead, or use the password reset option if you forgot your password.";
            } else if (
              errMsg.includes("profile") ||
              errMsg.includes("insert")
            ) {
              errorMessage =
                "Account created but profile setup failed. Please contact support to complete your registration.";
            } else {
              errorMessage = `Account creation failed: ${error.message}. Please try again or contact support if the issue persists.`;
            }
          } else {
            errorMessage =
              "An unexpected error occurred during account creation. Please refresh the page and try again.";
          }
          // Record failed attempt for rate limiting
          recordFailedAuth(email);
          AuthMonitoring.recordNetworkError();
          AuthMonitoring.recordError("signUp", errorMessage, undefined, {
            email,
            role: userData.role,
          });
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
          // Enhanced error message for sign out failures
          let errorMessage: string;
          if (error instanceof Error) {
            const errMsg = error.message.toLowerCase();
            if (errMsg.includes("network") || errMsg.includes("fetch")) {
              errorMessage =
                "Network error during sign out. Your session may still be cleared locally.";
            } else {
              errorMessage = `Sign out failed: ${error.message}. Your local session has been cleared, but you may need to refresh the page.`;
            }
          } else {
            errorMessage =
              "An unexpected error occurred during sign out. Your local session has been cleared.";
          }
          AuthMonitoring.recordError("signOut", errorMessage, userId);
          // Clear local state even if API call fails
          set({
            user: null,
            session: null,
            profile: null,
            error: errorMessage,
            loading: false,
          });
          profileCache.clear();
        }
      },
      resetPassword: async (email: string) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });
          if (error) {
            const userFriendlyError = getAuthErrorMessage(error);
            set({ error: userFriendlyError, loading: false });
            return { success: false, error: userFriendlyError };
          }
          set({ loading: false });
          return { success: true };
        } catch (error) {
          // Enhanced error message for password reset failures
          let errorMessage: string;
          if (error instanceof Error) {
            const errMsg = error.message.toLowerCase();
            if (errMsg.includes("network") || errMsg.includes("fetch")) {
              errorMessage =
                "Network error while sending password reset email. Please check your connection and try again.";
            } else if (errMsg.includes("timeout")) {
              errorMessage =
                "Request timed out while sending password reset email. Please try again.";
            } else if (
              errMsg.includes("not found") ||
              errMsg.includes("user")
            ) {
              errorMessage =
                "If an account exists with this email, you will receive password reset instructions shortly.";
            } else {
              errorMessage = `Password reset failed: ${error.message}. Please try again or contact support.`;
            }
          } else {
            errorMessage =
              "An unexpected error occurred while requesting password reset. Please try again.";
          }
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
            logError("Session refresh failed:", error);
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
            AuthMonitoring.recordEvent(
              "session_refresh_success",
              data.session.user.id
            );
            return { success: true };
          }
          set({ loading: false });
          return {
            success: false,
            error:
              "Session refresh succeeded but no session data was returned. You may need to sign in again.",
          };
        } catch (error) {
          // Enhanced error message for session refresh failures
          let errorMessage: string;
          if (error instanceof Error) {
            const errMsg = error.message.toLowerCase();
            if (errMsg.includes("network") || errMsg.includes("fetch")) {
              errorMessage =
                "Network error while refreshing your session. Please check your internet connection.";
            } else if (errMsg.includes("timeout")) {
              errorMessage =
                "Session refresh timed out. Please check your connection and try again.";
            } else if (
              errMsg.includes("expired") ||
              errMsg.includes("invalid")
            ) {
              errorMessage =
                "Your session has expired. Please sign in again to continue.";
            } else {
              errorMessage = `Session refresh failed: ${error.message}. Please try signing in again.`;
            }
          } else {
            errorMessage =
              "An unexpected error occurred while refreshing your session. Please sign in again.";
          }
          logError("Session refresh error:", error);
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
        if (cached && now - cached.timestamp < cached.ttl) {
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
            logError("Error fetching user profile:", error);
            // Create a basic profile if it doesn't exist
            if (error.code === POSTGRES_NO_ROWS_CODE) {
              info("Profile not found, creating basic profile");
              const basicProfile: UserProfile = {
                id: userId,
                full_name: "User",
                avatar_url: null,
                role: "player",
                app_role: "player",
                is_admin: false,
                subscription_tier: "free",
                subscription_expires_at: null,
                bio: null,
                phone: null,
                email: null,
                display_name: null,
                address: null,
                settings: {},
                position: null,
                jersey_number: null,
                emergency_contact: null,
                emergency_phone: null,
                grade_level: null,
                height_inches: null,
                weight_lbs: null,
                // Coaching fields
                coaching_experience: null,
                education: null,
                certifications: null,
                coaching_philosophy: null,
                specializations: null,
                current_school: null,
                previous_schools: null,
                mentors: null,
                coaching_system: null,
                years_coaching: null,
                // Social media fields
                social_twitter: null,
                social_instagram: null,
                social_linkedin: null,
                social_tiktok: null,
                social_youtube: null,
                personal_website: null,
                is_active: true,
                notification_preferences: {
                  push: true,
                  email: true,
                  social: true,
                },
                last_login: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              // Cache the basic profile
              profileCache.set(userId, {
                data: basicProfile,
                timestamp: now,
                ttl: PROFILE_CACHE_TTL,
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
            ttl: PROFILE_CACHE_TTL,
          });
          set({ profile: data });
        } catch (error) {
          logError("Error fetching user profile:", error);
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
          set({
            error:
              "You're currently offline. This action will be performed when you're back online.",
            loading: false,
          });
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
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        logError("Error checking session:", error);
        AuthMonitoring.recordError("session_check", error.message, undefined, {
          error,
        });
        return;
      }

      if (session) {
        const now = Date.now() / MS_PER_SECOND; // Convert to seconds
        const expiresAt = session.expires_at;

        // If token expires within configured threshold, refresh it
        if (expiresAt && expiresAt - now < SESSION_REFRESH_THRESHOLD) {
          debug("Refreshing session before expiration");

          if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
            logError("Max refresh attempts reached, signing out user");
            AuthMonitoring.recordError(
              "session_refresh",
              "Max refresh attempts exceeded",
              undefined,
              {
                attempts: refreshAttempts,
                maxAttempts: MAX_REFRESH_ATTEMPTS,
              }
            );
            await useAuth.getState().signOut();
            return;
          }

          const { data, error: refreshError } =
            await supabase.auth.refreshSession();

          if (refreshError) {
            logError("Error refreshing session:", refreshError);
            AuthMonitoring.recordError(
              "session_refresh",
              refreshError.message,
              undefined,
              {
                attempt: refreshAttempts + 1,
                maxAttempts: MAX_REFRESH_ATTEMPTS,
              }
            );
            refreshAttempts++;

            // Schedule a retry after delay
            setTimeout(() => {
              debug("Retrying session refresh...");
              startSessionRefresh();
            }, REFRESH_RETRY_DELAY);

            return;
          }

          if (data.session) {
            debug("Session refreshed successfully");
            AuthMonitoring.recordEvent(
              "session_refresh_success",
              data.session.user.id
            );
            useAuth.setState({
              user: data.session.user,
              session: data.session,
              error: null,
            });
            // Reset attempts on success
            refreshAttempts = 0;
          }
        }
      } else {
        debug("No active session found during refresh check");
      }
    } catch (unexpectedError) {
      logError("Unexpected error during session refresh:", unexpectedError);
      AuthMonitoring.recordError(
        "session_refresh_unexpected",
        unexpectedError instanceof Error
          ? unexpectedError.message
          : "Unknown error",
        undefined,
        {
          attempt: refreshAttempts,
        }
      );
    }
  }, SESSION_CHECK_INTERVAL);
};

const stopSessionRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

let isInitializing = false;

// Initialize auth state on app start with improved error handling
const initializeAuth = async () => {
  // Prevent double initialization
  if (isInitializing) {
    debug("Auth initialization already in progress, skipping...");
    return;
  }

  isInitializing = true;

  try {
    logAuth("Initializing auth state...");

    // Set loading to true at the start of initialization
    useAuth.setState({ loading: true, error: null });

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      logError("Error getting initial session:", error);
      AuthMonitoring.recordError("auth_init", error.message, undefined, {
        phase: "get_session",
      });
      useAuth.setState({
        loading: false,
        error: "Failed to initialize authentication. Please refresh the page.",
      });
      return;
    }

    if (session) {
      logAuth("Session restored on app start:", session.user.id);
      AuthMonitoring.recordEvent("auth_init_success", session.user.id, {
        hasSession: true,
      });

      useAuth.setState({
        user: session.user,
        session: session,
        loading: false,
        error: null,
      });

      // Fetch user profile with error handling
      try {
        debug("Starting user profile fetch...");
        await useAuth.getState().fetchUserProfile(session.user.id);
        success("User profile loaded successfully");
      } catch (profileError) {
        logError("Error loading user profile:", profileError);
        AuthMonitoring.recordError(
          "auth_init",
          profileError instanceof Error
            ? profileError.message
            : "Profile fetch failed",
          session.user.id,
          {
            phase: "fetch_profile",
          }
        );
        // Don't fail auth init completely if profile fetch fails
      }

      // Test authenticated database connection
      try {
        debug("Starting database connection test...");
        const dbConnectionOk = await testDatabaseConnection();
        if (dbConnectionOk) {
          success("Authenticated database connection verified");
        } else {
          warn("Authenticated database connection test failed");
        }
      } catch (dbError) {
        logError("Error testing authenticated database connection:", dbError);
        // Don't fail auth init if DB test fails
      }

      debug("Starting session refresh monitoring...");
      // Start session refresh monitoring
      startSessionRefresh();

      success("Auth initialization completed successfully");

      // Ensure loading is definitely false at the end
      useAuth.setState({ loading: false });
    } else {
      logAuth("No session found on app start");
      AuthMonitoring.recordEvent("auth_init_success", undefined, {
        hasSession: false,
      });
      useAuth.setState({ loading: false });
    }
  } catch (unexpectedError) {
    logError("Unexpected error during auth initialization:", unexpectedError);
    AuthMonitoring.recordError(
      "auth_init_unexpected",
      unexpectedError instanceof Error
        ? unexpectedError.message
        : "Unknown error",
      undefined,
      {
        phase: "unexpected",
      }
    );
    useAuth.setState({
      loading: false,
      error: "Authentication initialization failed. Please refresh the page.",
    });
  } finally {
    isInitializing = false;
  }
};

// Initialize auth state
initializeAuth();

// Enhanced auth state change listener with better error handling
supabase.auth.onAuthStateChange(async (event, session) => {
  logAuth(`Auth state changed: ${event}`, session?.user?.id || "no user");

  // Don't process auth state changes during initialization
  if (isInitializing) {
    debug("Skipping auth state change during initialization");
    return;
  }

  try {
    switch (event) {
      case "SIGNED_IN":
        if (session) {
          AuthMonitoring.recordEvent("auth_state_change", session.user.id, {
            event,
            hasSession: true,
          });
          useAuth.setState({
            user: session.user,
            session: session,
            loading: false, // Ensure loading is false when signed in
            error: null,
          });

          // Fetch profile for new sign-ins
          try {
            await useAuth.getState().fetchUserProfile(session.user.id);
          } catch (profileError) {
            logError("Error fetching profile on sign in:", profileError);
            AuthMonitoring.recordError(
              "auth_state_change",
              profileError instanceof Error
                ? profileError.message
                : "Profile fetch failed",
              session.user.id,
              { event }
            );
          }

          // Test database connection after successful sign-in
          try {
            const dbConnectionOk = await testDatabaseConnection();
            if (dbConnectionOk) {
              success("Database connection verified after sign-in");
            }
          } catch (dbError) {
            warn("Database connection test failed after sign-in:", dbError);
          }

          startSessionRefresh();
        }
        break;

      case "SIGNED_OUT":
        AuthMonitoring.recordEvent("auth_state_change", undefined, {
          event,
          hasSession: false,
        });
        stopSessionRefresh();
        // Clear all auth state
        useAuth.setState({
          user: null,
          session: null,
          profile: null,
          error: null,
        });
        // Clear profile cache
        profileCache.clear();
        break;

      case "TOKEN_REFRESHED":
        if (session) {
          AuthMonitoring.recordEvent("auth_state_change", session.user.id, {
            event,
            hasSession: true,
          });
          useAuth.setState({
            user: session.user,
            session: session,
            error: null,
          });
          debug("Auth token refreshed");
        }
        break;

      case "USER_UPDATED":
        if (session) {
          AuthMonitoring.recordEvent("auth_state_change", session.user.id, {
            event,
            hasSession: true,
          });
          useAuth.setState({
            user: session.user,
            session: session,
            error: null,
          });
          info("User updated");
        }
        break;

      default:
        info(`Unhandled auth event: ${event}`);
    }
  } catch (error) {
    logError("Error handling auth state change:", error);
    AuthMonitoring.recordError(
      "auth_state_change",
      error instanceof Error ? error.message : "Unknown error",
      session?.user?.id,
      { event }
    );
  }
});

// Selector hooks for convenience
export const useAuthUser = () => useAuth((state) => state.user);
export const useAuthProfile = () => useAuth((state) => state.profile);
export const useAuthLoading = () => useAuth((state) => state.loading);
export const useAuthProfileLoading = () =>
  useAuth((state) => state.profileLoading);
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
