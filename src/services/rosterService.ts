import { type PostgrestError } from "@supabase/supabase-js";
import { supabase as sharedClient } from "../lib/supabase";

export interface RosterPlayerView {
  id: string;
  team_id: string;
  user_id: string | null;
  jersey_number: number | null;
  position: string | null; // primary position
  status: string | null; // roster_status
  height_inches: number | null;
  weight_pounds: number | null;
  graduation_year: number | null;
  class_year: string | null;
  dominant_hand: string | null;
  joined_at: string | null;
  updated_at: string | null;
  created_at: string | null;
}

// Use centralized supabase client (browser-safe, avoids process reference)
function getClient() {
  return sharedClient;
}

export class RosterService {
  private static _instance: RosterService;
  static get instance() {
    if (!this._instance) this._instance = new RosterService();
    return this._instance;
  }
  private client = getClient();

  async listByTeam(teamId: string): Promise<RosterPlayerView[]> {
    interface RawRow {
      [key: string]: unknown;
      id: string;
      team_id: string;
      user_id?: string | null;
      jersey_number?: number | null;
      position?: string | null;
      status?: string | null;
      height_inches?: number | null;
      weight_pounds?: number | null;
      graduation_year?: number | null;
      class_year?: string | null;
      dominant_hand?: string | null;
      joined_at?: string | null;
      updated_at?: string | null;
      created_at?: string | null;
    }
    const { data, error } = await this.client
      .from("team_players_view")
      .select("*")
      .eq("team_id", teamId)
      .order("jersey_number", { ascending: true });
    if (error) throw error as PostgrestError;
    if (!data) return [];
    // Defensive mapping to expected shape
    return (data as RawRow[]).map((row) => ({
      id: row.id,
      team_id: row.team_id,
      user_id: row.user_id ?? null,
      jersey_number: row.jersey_number ?? null,
      position: row.position ?? null,
      status: row.status ?? null,
      height_inches: row.height_inches ?? null,
      weight_pounds: row.weight_pounds ?? null,
      graduation_year: row.graduation_year ?? null,
      class_year: row.class_year ?? null,
      dominant_hand: row.dominant_hand ?? null,
      joined_at: row.joined_at ?? null,
      updated_at: row.updated_at ?? null,
      created_at: row.created_at ?? null,
    }));
  }
}

export const rosterService = RosterService.instance;
