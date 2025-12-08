import React from "react";
import { useAuth } from "../../app/auth-store";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard - Prevents rendering children until auth initialization is complete
 *
 * This fixes the issue where components try to load data before the user
 * authentication state is properly established, causing RLS policies to
 * block queries because they appear to come from an unauthenticated user.
 * 
 * Optimized: Auth init now runs profile fetch and DB test in parallel,
 * making this loading state much shorter (~200-500ms vs 1-2s before).
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { loading } = useAuth();

  // Show loading state while auth is initializing
  // This should be very brief now that auth init is optimized
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          {/* BoxCall branded loading */}
          <div className="relative">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-jade-200 border-t-jade-600 mx-auto" />
          </div>
          <p className="mt-3 text-sm text-secondary font-medium">
            Loading BoxCall...
          </p>
        </div>
      </div>
    );
  }

  // Auth is complete - render children whether user is logged in or not
  // The individual route components will handle login redirects as needed
  return <>{children}</>;
}

export default AuthGuard;
