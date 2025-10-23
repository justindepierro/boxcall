import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "./useToast";

/**
 * Hook to monitor user session and handle expiry/refresh
 * Checks session every minute and refreshes if needed
 * Redirects to login if session expired
 *
 * @example
 * ```tsx
 * // In App.tsx or root component:
 * useSessionMonitor();
 * ```
 */
export function useSessionMonitor() {
  const toast = useToast();

  useEffect(() => {
    const AUTH_ROUTES = [
      "/login",
      "/create-account",
      "/reset-password",
      "/admin/create-account",
    ];

    const isOnAuthRoute = () => {
      const path = window.location.pathname;
      return AUTH_ROUTES.some((route) => path.startsWith(route));
    };

    const redirectToLogin = (reason: string) => {
      const currentUrl = new URL(window.location.href);

      if (isOnAuthRoute()) {
        // Already on an auth route – update query parameters without forcing a reload.
        if (reason && currentUrl.searchParams.get("reason") !== reason) {
          currentUrl.searchParams.set("reason", reason);
          window.history.replaceState(null, "", currentUrl.toString());
        }
        return;
      }

      const loginUrl = new URL(window.location.origin + "/login");
      if (reason) {
        loginUrl.searchParams.set("reason", reason);
      }

      if (
        currentUrl.pathname === loginUrl.pathname &&
        currentUrl.search === loginUrl.search
      ) {
        return; // Avoid triggering an identical navigation loop
      }

      window.location.href = loginUrl.toString();
    };

    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session check error:", error);
          return;
        }

        if (!session) {
          // No session - redirect to login
          console.warn("Session expired or not found");
          redirectToLogin("session_expired");
          return;
        }

        // Check if session expires soon (< 5 minutes)
        const expiresAt = session.expires_at;
        if (!expiresAt) return;

        const expiresAtDate = new Date(expiresAt * 1000);
        const now = new Date();
        const minutesUntilExpiry =
          (expiresAtDate.getTime() - now.getTime()) / 60000;

        if (minutesUntilExpiry < 5 && minutesUntilExpiry > 0) {
          // Session expires soon - refresh it
          console.info("Session expiring soon, refreshing...");

          const { error: refreshError } = await supabase.auth.refreshSession();

          if (refreshError) {
            console.error("Failed to refresh session:", refreshError);
            toast.error("Session refresh failed", "Please log in again");
          } else {
            console.info("Session refreshed successfully");
            toast.success("Session refreshed");
          }
        } else if (minutesUntilExpiry <= 0) {
          // Session expired
          console.warn("Session expired");
          redirectToLogin("session_expired");
        }
      } catch (error) {
        console.error("Session monitoring error:", error);
      }
    };

    // Check immediately
    checkSession();

    // Check every minute
    const interval = setInterval(checkSession, 60000);

    return () => clearInterval(interval);
  }, [toast]);
}

/**
 * Get human-readable session expiry warning
 */
export function useSessionExpiry() {
  useEffect(() => {
    const checkExpiry = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.expires_at) return null;

      const expiresAt = new Date(session.expires_at * 1000);
      const now = new Date();
      const minutesLeft = Math.floor(
        (expiresAt.getTime() - now.getTime()) / 60000
      );

      return minutesLeft;
    };

    const interval = setInterval(async () => {
      const minutes = await checkExpiry();
      if (minutes !== null && minutes > 0 && minutes <= 5) {
        console.warn(`Session expires in ${minutes} minute(s)`);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);
}
