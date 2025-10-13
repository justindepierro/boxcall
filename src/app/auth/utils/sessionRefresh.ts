import type { SupabaseClient } from "@supabase/supabase-js";
import {
  SESSION_CHECK_INTERVAL,
  SESSION_REFRESH_THRESHOLD,
  MS_PER_SECOND,
  MAX_REFRESH_ATTEMPTS,
  REFRESH_RETRY_DELAY,
} from "../constants";
import { debug, error as logError } from "../../../utils/logger";
import { AuthMonitoring } from "../../../utils/authMonitoring";

/**
 * Session refresh state
 */
let refreshInterval: NodeJS.Timeout | null = null;
let refreshAttempts = 0;

/**
 * Start automatic session refresh monitoring
 *
 * Checks the session every 5 minutes and refreshes if it's about to expire.
 * Implements retry logic with exponential backoff on failures.
 *
 * @param supabase - The Supabase client instance
 * @param setState - Function to update auth state
 * @param signOut - Function to sign out if max retries exceeded
 */
export function startSessionRefresh(
  supabase: SupabaseClient,
  setState: (state: any) => void,
  signOut: () => Promise<void>
): void {
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
            await signOut();
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
              startSessionRefresh(supabase, setState, signOut);
            }, REFRESH_RETRY_DELAY);

            return;
          }

          if (data.session) {
            debug("Session refreshed successfully");
            AuthMonitoring.recordEvent(
              "session_refresh_success",
              data.session.user.id
            );
            setState({
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
}

/**
 * Stop automatic session refresh monitoring
 */
export function stopSessionRefresh(): void {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

/**
 * Reset session refresh attempts counter
 * @internal
 */
export function resetRefreshAttempts(): void {
  refreshAttempts = 0;
}
