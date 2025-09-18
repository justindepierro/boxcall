import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
} else if (import.meta.env.DEV) {
  supabaseClient = createDevStub();
} else {
  // In non-dev environments, fail fast if env is missing
  throw new Error("Missing Supabase environment variables");
}

export const supabase = supabaseClient;
// Export types for better TypeScript support
export type { Session, User } from "@supabase/supabase-js";
