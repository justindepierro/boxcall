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

export interface PlayerRosterInsert {
  user_id?: string; // Optional - for existing users
  team_id: string;
  jersey_number?: number;
  primary_position: string;
  secondary_positions?: string[];
  class_year?: 'freshman' | 'sophomore' | 'junior' | 'senior' | 'graduate' | 'redshirt';
  eligibility_years_remaining?: number;
  roster_status?: 'active' | 'injured' | 'suspended' | 'academic_probation' | 'inactive' | 'transferred';
  height_inches?: number;
  weight_pounds?: number;
  dominant_hand?: 'left' | 'right' | 'ambidextrous';
  gpa?: number;
  academic_standing?: 'excellent' | 'good' | 'warning' | 'probation' | 'ineligible';
  graduation_year?: number;
  // For non-user players (guest players)
  first_name?: string;
  last_name?: string;
  email_address?: string;
  phone_number?: string;
  parent_contact?: string;
}

export interface PlayerRosterUpdate {
  jersey_number?: number;
  primary_position?: string;
  secondary_positions?: string[];
  class_year?: 'freshman' | 'sophomore' | 'junior' | 'senior' | 'graduate' | 'redshirt';
  eligibility_years_remaining?: number;
  roster_status?: 'active' | 'injured' | 'suspended' | 'academic_probation' | 'inactive' | 'transferred';
  height_inches?: number;
  weight_pounds?: number;
  dominant_hand?: 'left' | 'right' | 'ambidextrous';
  gpa?: number;
  academic_standing?: 'excellent' | 'good' | 'warning' | 'probation' | 'ineligible';
  graduation_year?: number;
  first_name?: string;
  last_name?: string;
  email_address?: string;
  phone_number?: string;
  parent_contact?: string;
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

  async createPlayer(playerData: PlayerRosterInsert): Promise<RosterPlayerView> {
    // For non-user players, we need to generate a unique user_id
    const insertData = {
      ...playerData,
      user_id: playerData.user_id || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roster_status: playerData.roster_status || 'active',
      eligibility_years_remaining: playerData.eligibility_years_remaining || 4,
      dominant_hand: playerData.dominant_hand || 'right',
      academic_standing: playerData.academic_standing || 'good',
    };

    const { data, error } = await this.client
      .from("player_roster")
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
      .from("player_roster")
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
      .from("player_roster")
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
      user_id: data.user_id ?? null,
      jersey_number: data.jersey_number ?? null,
      position: data.position ?? null,
      status: data.status ?? null,
      height_inches: data.height_inches ?? null,
      weight_pounds: data.weight_pounds ?? null,
      graduation_year: data.graduation_year ?? null,
      class_year: data.class_year ?? null,
      dominant_hand: data.dominant_hand ?? null,
      joined_at: data.joined_at ?? null,
      updated_at: data.updated_at ?? null,
      created_at: data.created_at ?? null,
    };
  }

  async checkJerseyNumberAvailable(teamId: string, jerseyNumber: number, excludePlayerId?: string): Promise<boolean> {
    let query = this.client
      .from("player_roster")
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
