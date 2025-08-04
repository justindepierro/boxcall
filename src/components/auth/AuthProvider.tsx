import type { ReactNode } from "react";
import React, { useEffect } from "react";
import { useAuth } from "../../app/auth-store";
import { supabase } from "../../lib/supabase";
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });
    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Fetch user profile when user signs in
        await fetchUserProfile(session.user.id);
      } else {
        // Clear profile when user signs out
        setProfile(null);
      }
    });
    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, [setUser, setSession, setProfile, fetchUserProfile]);
  return <>{children}</>;
};
