/**
 * AuthContext - Simplified Supabase Auth following official best practices
 * 
 * This replaces the over-engineered auth-store.ts with a clean, simple pattern
 * that lets Supabase handle session management internally.
 * 
 * Key principles:
 * 1. Let Supabase manage sessions (don't call setSession manually)
 * 2. Use onAuthStateChange as single source of truth
 * 3. Don't cache sessions externally
 * 
 * @see https://supabase.com/docs/guides/auth/quickstarts/react
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Session, User } from "@supabase/supabase-js";
import type { Database } from "../types/database";

type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextType {
  // Core auth state
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  
  // Auth actions
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  
  // Helpers
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile from database
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      console.log("📋 [AuthContext] Fetching profile for:", userId);
      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        console.error("📋 [AuthContext] Profile fetch error:", profileError.message);
        return;
      }

      console.log("📋 [AuthContext] Profile loaded:", data?.full_name || "No name");
      setProfile(data);
    } catch (err) {
      console.error("📋 [AuthContext] Profile fetch exception:", err);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    console.log("🔐 [AuthContext] Initializing...");

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (sessionError) {
          console.error("🔐 [AuthContext] Session error:", sessionError.message);
          setError(sessionError.message);
          setLoading(false);
          return;
        }

        console.log("🔐 [AuthContext] Initial session:", initialSession ? "Found" : "None");
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("🔐 [AuthContext] Init error:", err);
        if (mounted) {
          setError("Failed to initialize authentication");
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        
        console.log("🔐 [AuthContext] Auth state changed:", event);
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setError(null);
        
        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign in with email/password
  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      return { error };
    }
    return { error: null };
  }, []);

  // Sign up with email/password
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    metadata?: Record<string, unknown>
  ) => {
    setError(null);
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: metadata }
    });
    if (error) {
      setError(error.message);
      return { error };
    }
    return { error: null };
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setError(null);
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message);
      return { error };
    }
    return { error: null };
  }, []);

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAuthenticated: !!session,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 * @throws Error if used outside AuthProvider
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

// Re-export for convenience
export type { AuthContextType };
