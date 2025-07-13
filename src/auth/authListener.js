// src/auth/authListener.js (or wherever this lives)
import { supabase } from "./supabaseClient.js";
import { applyContextualTheme } from "../config/themes/themeController.js";

/**
 * Listen for auth changes and invoke the callback.
 * Also persists session and applies contextual theme.
 *
 * @param {function({ event: string, session: object|null }): void} callback
 * @returns {function} unsubscribe function
 */
export function listenToAuthChanges(callback) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    console.log("🌀 Auth event:", event);

    // 🔄 Save session or clear storage
    if (session) {
      localStorage.setItem("session", JSON.stringify(session));
      localStorage.setItem(
        "team_id",
        session.user?.user_metadata?.team_id || "",
      );
    } else {
      localStorage.removeItem("session");
      localStorage.removeItem("team_id");
    }

    // 🎨 Apply theme only when signed in or refreshed with session
    if (["SIGNED_IN", "INITIAL_SESSION"].includes(event) && session) {
      applyContextualTheme();
    }

    // 🎯 Run any custom logic
    if (typeof callback === "function") {
      callback({ event, session });
    }
  });

  // 🧹 Return unsubscribe function
  return () => {
    subscription?.unsubscribe?.();
  };
}

/**
 * Restore session from localStorage (if available)
 * Useful on app load before Supabase rehydrates.
 * @returns {object|null} cached session or null
 */
export function loadCachedSession() {
  try {
    const raw = localStorage.getItem("supabaseSession");
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn("⚠️ Failed to parse cached session:", err);
    return null;
  }
}
