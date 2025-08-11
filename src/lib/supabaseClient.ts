import { createClient } from "@supabase/supabase-js";

let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (client) return client;
  const w =
    typeof window !== "undefined"
      ? (window as unknown as Record<string, string | undefined>)
      : {};
  const url =
    import.meta.env.VITE_SUPABASE_URL ||
    w.SUPABASE_URL ||
    process.env.SUPABASE_URL;
  const anon =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    w.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Supabase env vars missing");
  client = createClient(url, anon, { auth: { persistSession: true } });
  return client;
}
