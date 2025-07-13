// src/utils/authGuard.js
import { isLoggedIn, getCurrentUser } from "../state/authState.js";
import { navigateTo } from "../routes/router.js";
import { listenToAuthChanges } from "../auth/authListener.js";
import { applyContextualTheme } from "../../src/config/themes/themeController.js";

/**
 * AuthGuard wrapper for protected page logic.
 * @param {Function} onAuth - Callback to execute if the user is authenticated
 * @param {Object} [options]
 * @param {string} [options.redirectTo='/login'] - Where to send unauthenticated users
 */
export function authGuard(onAuth, options = {}) {
  const redirectTo = options.redirectTo || "/login";

  try {
    if (isLoggedIn()) {
      console.log("🟢 AuthGuard: User is signed in");
      onAuth(getCurrentUser());
    } else {
      console.warn("🔴 AuthGuard: Not signed in, redirecting...");
      navigateTo(redirectTo);
    }
  } catch (err) {
    console.error("⚠️ AuthGuard error:", err);
    navigateTo(redirectTo);
  }
}
/**
 * Global listener for Supabase auth changes.
 * Handles sign in/out/refresh events.
 */
export function initAuthListeners() {
  listenToAuthChanges(async ({ event, session }) => {
    console.log("🔄 Auth state changed:", event);

    if (!session) {
      console.warn("🚪 Logged out – redirecting");
      navigateTo("/login");
    } else {
      console.log("🎨 Reapplying theme for new session...");
      await applyContextualTheme();
    }
  });
}
