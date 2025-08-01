import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Session } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// User profile type from our database (main profiles table with role)
type UserProfile = Database['public']['Tables']['profiles']['Row'];

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
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData: {
    firstName: string;
    lastName: string;
    role: 'coach' | 'player' | 'family' | 'admin';
  }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  
  // Utility actions
  clearError: () => void;
  reset: () => void;
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
    (set) => ({
      ...initialState,
      
      // Basic state setters
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      // Authentication methods (placeholder implementations - will be updated with Supabase)
      signIn: async (email: string, password: string) => {
        set({ loading: true, error: null });
        
        try {
          // TODO: Implement Supabase signIn with password
          console.log('SignIn attempt:', { email, passwordProvided: !!password });
          
          // Placeholder implementation
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // For now, return success placeholder
          set({ loading: false });
          return { success: true };
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
          set({ error: errorMessage, loading: false });
          return { success: false, error: errorMessage };
        }
      },
      
      signUp: async (email: string, password: string, userData) => {
        set({ loading: true, error: null });
        
        try {
          // TODO: Implement Supabase signUp with password and userData
          console.log('SignUp attempt:', { email, userData, passwordProvided: !!password });
          
          // Placeholder implementation
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({ loading: false });
          return { success: true };
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
          set({ error: errorMessage, loading: false });
          return { success: false, error: errorMessage };
        }
      },
      
      signOut: async () => {
        set({ loading: true, error: null });
        
        try {
          // TODO: Implement Supabase signOut
          console.log('SignOut attempt');
          
          // Clear all auth state
          set({ 
            user: null, 
            session: null, 
            profile: null, 
            loading: false 
          });
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
          set({ error: errorMessage, loading: false });
        }
      },
      
      resetPassword: async (email: string) => {
        set({ loading: true, error: null });
        
        try {
          // TODO: Implement Supabase password reset
          console.log('Password reset attempt:', { email });
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({ loading: false });
          return { success: true };
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
          set({ error: errorMessage, loading: false });
          return { success: false, error: errorMessage };
        }
      },
      
      // Utility methods
      clearError: () => set({ error: null }),
      reset: () => set(initialState),
    }),
    {
      name: 'boxcall-auth-storage',
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
export const useIsCoach = () => useAuth((state) => state.profile?.role === 'coach');
export const useIsPlayer = () => useAuth((state) => state.profile?.role === 'player');
export const useIsFamily = () => useAuth((state) => state.profile?.role === 'family');
export const useIsAdmin = () => useAuth((state) => state.profile?.role === 'admin');
