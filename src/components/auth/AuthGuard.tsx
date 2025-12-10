import React, { useEffect, useRef } from "react";
import { useAuth } from "../../app/auth-store";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard - Prevents rendering children until auth initialization is complete
 *
 * This ensures:
 * 1. Auth session is loaded
 * 2. User profile is fetched (if user is logged in)
 * 3. All auth state is stable before rendering the app
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const {
    loading,
    profileLoading,
    user,
    profile,
    session: _session,
  } = useAuth();
  const fetchUserProfile = useAuth((state) => state.fetchUserProfile);
  const fetchingRef = useRef(false);

  // If we have a user but no profile, fetch it (once)
  useEffect(() => {
    if (user?.id && !profile && !profileLoading && !fetchingRef.current) {
      fetchingRef.current = true;
      console.log("🛡️ [AuthGuard] User exists but no profile, fetching...");
      fetchUserProfile(user.id).finally(() => {
        fetchingRef.current = false;
      });
    }
  }, [user?.id, profile, profileLoading, fetchUserProfile]);

  // Show loading while:
  // 1. Initial auth is loading
  // 2. We have a user but profile is still loading
  const isLoading = loading || (user && !profile && profileLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          {/* BoxCall branded loading */}
          <div className="relative">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-jade-200 border-t-jade-600 mx-auto" />
          </div>
          <p className="mt-3 text-sm text-secondary font-medium">
            {profileLoading ? "Loading profile..." : "Loading BoxCall..."}
          </p>
        </div>
      </div>
    );
  }

  // Debug log (only once when ready)
  if (import.meta.env.DEV && profile) {
    console.log("🛡️ [AuthGuard] Ready:", {
      hasUser: !!user,
      hasProfile: !!profile,
      profileRole: profile?.role,
      profileId: profile?.id,
    });
  }

  // Auth is complete - render children whether user is logged in or not
  // The individual route components will handle login redirects as needed
  return <>{children}</>;
}

export default AuthGuard;
