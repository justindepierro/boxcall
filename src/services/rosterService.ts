import { type PostgrestError } from "@supabase/supabase-js";

import { supabase as sharedClient } from "../lib/supabase";

export interface RosterPlayerView {
  id: string;
  team_id: string;
  first_name: string | null;
  last_name: string | null;
  jersey_number: number | null;
  position: string | null; // primary position
  grade_level: string | null;
  height_inches: number | null;
  weight_lbs: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PlayerRosterInsert {
  team_id: string;
  first_name: string;
  last_name: string;
  jersey_number?: number;
  position?: string;
  grade_level?: string;
  height_inches?: number;
  weight_lbs?: number;
  is_active?: boolean;
}

export interface PlayerRosterUpdate {
  jersey_number?: number;
  position?: string;
  grade_level?: string;
  height_inches?: number;
  weight_lbs?: number;
  is_active?: boolean;
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
      first_name?: string | null;
      last_name?: string | null;
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
      email_address?: string | null;
      phone_number?: string | null;
      parent_contact?: string | null;
      roster_status?: string | null;
      primary_position?: string | null;
      secondary_positions?: string[] | null;
    }
    const { data, error } = await this.client
      .from("team_players")
      .select("*")
      .eq("team_id", teamId)
      .order("jersey_number", { ascending: true });
    if (error) throw error as PostgrestError;
    if (!data) return [];
    // Defensive mapping to expected shape
    return (data as RawRow[]).map((row) => ({
      id: row.id,
      team_id: row.team_id,
      first_name: row.first_name ?? null,
      last_name: row.last_name ?? null,
      jersey_number: row.jersey_number ?? null,
      position: row.position ?? null,
      grade_level: row.grade_level as string ?? null,
      height_inches: row.height_inches ?? null,
      weight_lbs: row.weight_lbs as number ?? null,
      is_active: row.is_active as boolean ?? null,
      created_at: row.created_at ?? null,
      updated_at: row.updated_at ?? null,
    }));
  }

  async createPlayer(playerData: PlayerRosterInsert): Promise<RosterPlayerView> {
    const insertData = {
      ...playerData,
      is_active: playerData.is_active ?? true,
    };

    const { data, error } = await this.client
      .from("team_players")
      .insert([insertData])
      .select()
      .single();

    if (error) throw error as PostgrestError;
    if (!data) throw new Error("Failed to create player - no data returned");

    // Return the created player by fetching from the view
    return this.getPlayerById(data.id);
  }

  async updatePlayer(playerId: string, updateData: PlayerRosterUpdate): Promise<RosterPlayerView> {
    const { data, error } = await this.client
      .from("team_players")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", playerId)
      .select()
      .single();

    if (error) throw error as PostgrestError;
    if (!data) throw new Error("Failed to update player - player not found");

    // Return the updated player by fetching from the view
    return this.getPlayerById(data.id);
  }

  async deletePlayer(playerId: string): Promise<void> {
    const { error } = await this.client
      .from("team_players")
      .delete()
      .eq("id", playerId);

    if (error) throw error as PostgrestError;
  }

  async getPlayerById(playerId: string): Promise<RosterPlayerView> {
    const { data, error } = await this.client
      .from("team_players_view")
      .select("*")
      .eq("id", playerId)
      .single();

    if (error) throw error as PostgrestError;
    if (!data) throw new Error("Player not found");

    return {
      id: data.id,
      team_id: data.team_id,
      first_name: data.first_name ?? null,
      last_name: data.last_name ?? null,
      jersey_number: data.jersey_number ?? null,
      position: data.position ?? null,
      grade_level: data.grade_level ?? null,
      height_inches: data.height_inches ?? null,
      weight_lbs: data.weight_lbs ?? null,
      is_active: data.is_active ?? null,
      created_at: data.created_at ?? null,
      updated_at: data.updated_at ?? null,
    };
  }

  async checkJerseyNumberAvailable(teamId: string, jerseyNumber: number, excludePlayerId?: string): Promise<boolean> {
    let query = this.client
      .from("team_players")
      .select("id")
      .eq("team_id", teamId)
      .eq("jersey_number", jerseyNumber);

    if (excludePlayerId) {
      query = query.neq("id", excludePlayerId);
    }

    const { data, error } = await query;

    if (error) throw error as PostgrestError;
    return !data || data.length === 0;
  }
}

export const rosterService = RosterService.instance;
