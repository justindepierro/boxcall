import React, { useEffect } from "react";

import { useAuth } from "../../app/auth-store";
import { supabase } from "../../lib/supabase";
import { sessionManager } from "../../utils/sessionManager";

import type { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}
/**
 * AuthProvider Component
 *
 * Manages authentication state initialization and listens for auth changes.
 * Should wrap the entire app to ensure auth state is properly managed.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { setUser, setSession, setProfile, fetchUserProfile } = useAuth();
  useEffect(() => {
    console.log("🔐 AuthProvider: Starting auth initialization");

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      console.log("🔐 AuthProvider: Session check result", {
        hasSession: !!session,
        userId: session?.user?.id,
        error: error?.message,
      });

      // If there's an error or no valid session, clear everything
      if (error || !session) {
        console.log("🔐 AuthProvider: No valid session, clearing auth state");
        setSession(null);
        setUser(null);
        setProfile(null);
        return;
      }

      // Validate the session is still active
      try {
        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError || !userData.user) {
          console.log(
            "🔐 AuthProvider: Session validation failed, clearing auth state"
          );
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setProfile(null);
          return;
        }
      } catch {
        console.log(
          "🔐 AuthProvider: Session validation error, clearing auth state"
        );
        setSession(null);
        setUser(null);
        setProfile(null);
        return;
      }

      setSession(session);
      setUser(session.user);

      if (session.user) {
        console.log("🔐 AuthProvider: User found, fetching profile");
        fetchUserProfile(session.user.id);
        // Start session monitoring when user is authenticated
        sessionManager.startMonitoring(
          () => {
            // Show warning before timeout
            console.warn("Session will expire soon. Please save your work.");
            // In a real app, you'd show a modal or toast notification
          },
          () => {
            // Handle timeout
            console.log("Session expired due to inactivity");
            setUser(null);
            setSession(null);
            setProfile(null);
          },
          () => {
            // Activity detected - could refresh session if needed
            console.debug("User activity detected");
          }
        );
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
        // Start session monitoring
        sessionManager.startMonitoring(
          () => console.warn("Session will expire soon"),
          () => {
            console.log("Session expired");
            setUser(null);
            setSession(null);
            setProfile(null);
          },
          () => console.debug("Activity detected")
        );
      } else {
        // Stop session monitoring when logged out
        sessionManager.stopMonitoring();
        setProfile(null);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
      sessionManager.stopMonitoring();
    };
  }, [setUser, setSession, setProfile, fetchUserProfile]);
  return <>{children}</>;
};
