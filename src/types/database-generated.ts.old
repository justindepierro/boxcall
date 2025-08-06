// Auto-generated types from your Supabase database
// Generated on 2025-08-01T17:46:32.802Z
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          role: string;
          bio: string | null;
          phone: string | null;
          created_at: string;
          email: string;
          display_name: string | null;
          address: string | null;
          settings: Record<string, unknown>;
          last_login: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string | null;
          avatar_url: string | null;
          role: string;
          bio: string | null;
          phone: string | null;
          created_at?: string;
          email: string;
          display_name: string | null;
          address: string | null;
          settings: Record<string, unknown>;
          last_login: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          bio?: string | null;
          phone?: string | null;
          created_at?: string;
          email?: string;
          display_name?: string | null;
          address?: string | null;
          settings?: Record<string, unknown>;
          last_login?: string | null;
          updated_at?: string;
        };
      };
      games: {
        Row: {
          // Table exists but empty - types will be updated when data is available
          id?: string;
          [key: string]: unknown;
        };
        Insert: {
          [key: string]: unknown;
        };
        Update: {
          [key: string]: unknown;
        };
      };
    };
  };
}
// Helper types
export type Profiles = Database["public"]["Tables"]["profiles"]["Row"];
export type Games = Database["public"]["Tables"]["games"]["Row"];
// Known tables that exist but require authentication (RLS enabled)
export const PROTECTED_TABLES = [
  "teams",
  "plays",
  "playbooks",
  "team_members",
] as const;
