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
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { loading } = useAuth();

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-secondary">
            Initializing authentication...
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
