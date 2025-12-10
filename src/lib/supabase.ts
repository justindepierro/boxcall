import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../types/database";
import { ApiClient } from "./api/client";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only log in dev mode to avoid production overhead
if (import.meta.env.DEV) {
  console.log("🔧 Supabase module loading...");
  console.log(
    "🔧 VITE_SUPABASE_URL:",
    supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "MISSING"
  );
  console.log(
    "🔧 VITE_SUPABASE_ANON_KEY:",
    supabaseAnonKey ? "PRESENT" : "MISSING"
  );
}

function createDevStub(): SupabaseClient<Database> {
  // Minimal stub to allow app startup without Supabase env in development.
  // Auth returns unauthenticated; any data calls will throw with a clear message.
  const err = (method: string) =>
    new Error(`Supabase not configured (dev fallback): ${method}`);
  const auth = {
    async getUser() {
      return { data: { user: null }, error: null } as unknown;
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
  console.warn(
    "[BoxCall] Using dev Supabase stub – set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable real backend."
  );
  return stub;
}

let supabaseClient: SupabaseClient<Database>;

if (supabaseUrl && supabaseAnonKey) {
  // Use only anon key for client-side operations - NEVER expose service role key
  if (import.meta.env.DEV) console.log("✅ Creating real Supabase client");
  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      // ✅ RE-ENABLED: autoRefreshToken is safe now that we use ApiClient for data queries
      // The Supabase client is only used for auth operations
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // 🚀 PERFORMANCE: Use localStorage (faster) instead of cookies
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      // 🚀 PERFORMANCE: Faster session check on init
      storageKey: "boxcall-auth",
      flowType: "pkce", // More secure, similar speed
    },
    // 🚀 PERFORMANCE: Add global configuration for better performance
    global: {
      headers: {
        "x-client-info": "boxcall-web",
      },
    },
    // 🚀 PERFORMANCE: Enable connection pooling and keep-alive
    db: {
      schema: "public",
    },
    // Realtime configuration for Team Bulletin social features
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  // 🔌 Sync auth state changes to ApiClient
  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (session?.access_token) {
      ApiClient.setAccessToken(session.access_token);
      if (import.meta.env.DEV) {
        console.log("🔌 [Auth] Token synced to ApiClient:", event);
      }
    } else {
      ApiClient.setAccessToken(null);
      if (import.meta.env.DEV) {
        console.log("🔌 [Auth] Token cleared from ApiClient:", event);
      }
    }
  });
} else if (import.meta.env.DEV) {
  console.log("⚠️ Using Supabase dev stub - environment variables missing");
  supabaseClient = createDevStub();
} else {
  // In non-dev environments, fail fast if env is missing
  if (import.meta.env.DEV)
    console.log("❌ Missing Supabase environment variables in production");
  throw new Error("Missing Supabase environment variables");
}

export const supabase = supabaseClient;
// Export types for better TypeScript support
export type { Session, User } from "@supabase/supabase-js";
