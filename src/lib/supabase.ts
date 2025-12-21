import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../types/database";
import { auth as logAuth, debug, warn } from "../utils/logger";
import { getBrowserLocalStorage, storageKeys } from "../utils/storage";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only log in dev mode to avoid production overhead
if (import.meta.env.DEV) {
  debug("[Supabase] Module loading...");
  debug(
    "🔧 VITE_SUPABASE_URL:",
    supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "MISSING"
  );
  debug("🔧 VITE_SUPABASE_ANON_KEY:", supabaseAnonKey ? "PRESENT" : "MISSING");
}

function createDevStub(): SupabaseClient<Database> {
  // Minimal stub to allow app startup without Supabase env in development.
  // Auth returns unauthenticated; any data calls will throw with a clear message.
  const err = (method: string) =>
    new Error(`Supabase not configured (dev fallback): ${method}`);
  const auth = {
    async getSession() {
      return { data: { session: null }, error: null } as unknown;
    },
    async getUser() {
      return { data: { user: null }, error: null } as unknown;
    },
    onAuthStateChange() {
      return {
        data: {
          subscription: {
            unsubscribe() {
              // no-op
            },
          },
        },
      } as unknown;
    },
    async signInWithPassword() {
      return {
        data: { user: null, session: null },
        error: { message: err("signInWithPassword").message },
      } as unknown;
    },
    async signUp() {
      return {
        data: { user: null, session: null },
        error: { message: err("signUp").message },
      } as unknown;
    },
    async signOut() {
      return { error: { message: err("signOut").message } } as unknown;
    },
    async resetPasswordForEmail() {
      return {
        error: { message: err("resetPasswordForEmail").message },
      } as unknown;
    },
  } as unknown;

  const from = () => {
    throw err("from(...)");
  };

  const stub = { auth, from } as unknown as SupabaseClient<Database>;
  // Surface a helpful console warning on first use
  warn(
    "[BoxCall] Using dev Supabase stub – set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable real backend."
  );
  return stub;
}

let supabaseClient: SupabaseClient<Database>;

if (supabaseUrl && supabaseAnonKey) {
  // Use only anon key for client-side operations - NEVER expose service role key
  if (import.meta.env.DEV) debug("[Supabase] Creating real Supabase client");
  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // 🚀 PERFORMANCE: Use localStorage (faster) instead of cookies
      storage: getBrowserLocalStorage(),
      // 🚀 PERFORMANCE: Faster session check on init
      storageKey: storageKeys.auth.supabaseAuth,
      flowType: "pkce", // More secure, similar speed
      // 🔧 FIX: Disable Web Locks API to prevent cross-tab lock contention hangs
      // This was causing getSession() and all queries to hang indefinitely
      // The "no-op" lock function immediately acquires and releases locks
      lock: async <R>(
        _name: string,
        _acquireTimeout: number,
        fn: () => Promise<R>
      ): Promise<R> => fn(),
    },
    // 🚀 PERFORMANCE: Add global configuration for better performance
    global: {
      headers: {
        "x-client-info": "boxcall-web",
      },
    },
    // 🚀 PERFORMANCE: Enable connection pooling and keep-alive
    db: {
      schema: "public" as const,
    },
  }) as unknown as SupabaseClient<Database>;

  // Log auth state changes in dev mode for debugging
  if (import.meta.env.DEV) {
    supabaseClient.auth.onAuthStateChange((event, session) => {
      logAuth(
        "[Auth] State changed:",
        event,
        session ? "with session" : "no session"
      );
    });
  }
} else if (import.meta.env.DEV) {
  warn("[Supabase] Using dev stub - environment variables missing");
  supabaseClient = createDevStub();
} else {
  // In non-dev environments, fail fast if env is missing
  throw new Error("Missing Supabase environment variables");
}

export const supabase = supabaseClient;
// Export types for better TypeScript support
export type { Session, User } from "@supabase/supabase-js";

// Expose supabase client globally for debugging in browser console (dev only)
if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as any).supabase = supabaseClient;

  // Add debug helper for testing queries in console
  (window as any).testBoxCallDB = async () => {
    debug("[Supabase] Testing BoxCall database connectivity...");

    // 1. Check auth session
    const {
      data: { session },
      error: sessionError,
    } = await supabaseClient.auth.getSession();
    debug(
      "1. Session:",
      session ? `Valid (expires: ${session.expires_at})` : "None",
      sessionError?.message || ""
    );

    if (!session) {
      warn("[Supabase] No session - user needs to log in");
      return;
    }

    // NOTE: Direct table queries are intentionally disabled here.
    // This module defines the Supabase client, so importing the DAL would create a circular dependency.
    debug(
      "2. Table query checks skipped (DAL enforcement). Use app screens / health checks for DB diagnostics."
    );

    return { session };
  };

  debug("[Supabase] Run window.testBoxCallDB() to diagnose DB issues");
}
