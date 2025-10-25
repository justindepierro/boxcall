import {
  type PostgrestError,
  type SupabaseClient,
} from "@supabase/supabase-js";

import { supabase as sharedClient } from "../lib/supabase";
import type { Database } from "../types/database";

// RosterPlayerView matches the team_players table structure
export interface RosterPlayerView {
  id: string;
  team_id: string;
  first_name: string | null;
  last_name: string | null;
  nickname: string | null;
  jersey_number: number | null;
  position: string | null; // primary position
  grade_level: string | null;
  height_inches: number | null;
  weight_lbs: number | null;
  is_active: boolean | null;
  roster_status: string | null;
  user_id: string | null;
  invitation_token: string | null;
  invitation_status: string | null;
  invitation_sent_at: string | null;
  invitation_accepted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PlayerRosterInsert {
  team_id: string;
  first_name: string;
  last_name: string;
  nickname?: string;
  jersey_number?: number;
  position?: string;
  grade_level?: string;
  height_inches?: number;
  weight_lbs?: number;
  is_active?: boolean;
}

export interface PlayerRosterUpdate {
  first_name?: string;
  last_name?: string;
  nickname?: string;
  jersey_number?: number;
  position?: string;
  grade_level?: string;
  height_inches?: number;
  weight_lbs?: number;
  is_active?: boolean;
  roster_status?: string;
  email_address?: string;
  phone_number?: string;
  parent_contact?: string;
}

// Use centralized supabase client (browser-safe, avoids process reference)
function getClient(): SupabaseClient<Database> {
  return sharedClient;
}

export class RosterService {
  private static _instance: RosterService;
  static get instance() {
    if (!this._instance) this._instance = new RosterService();
    return this._instance;
  }
  private client: SupabaseClient<Database> = getClient();

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
      nickname: (row.nickname as string) ?? null,
      jersey_number: row.jersey_number ?? null,
      position: row.position ?? null,
      grade_level: (row.grade_level as string) ?? null,
      height_inches: row.height_inches ?? null,
      weight_lbs: (row.weight_lbs as number) ?? null,
      is_active: (row.is_active as boolean) ?? null,
      roster_status: row.roster_status ?? null,
      user_id: (row.user_id as string) ?? null,
      invitation_token: (row.invitation_token as string) ?? null,
      invitation_status: (row.invitation_status as string) ?? null,
      invitation_sent_at: (row.invitation_sent_at as string) ?? null,
      invitation_accepted_at: (row.invitation_accepted_at as string) ?? null,
      created_at: row.created_at ?? null,
      updated_at: row.updated_at ?? null,
    }));
  }

  async createPlayer(
    playerData: PlayerRosterInsert
  ): Promise<RosterPlayerView> {
    const insertData = {
      ...playerData,
      is_active: playerData.is_active ?? true,
    };

    const { data, error } = await (this.client as any)
      .from("team_players")
      .insert([insertData])
      .select()
      .single();

    if (error) throw error as PostgrestError;
    if (!data) throw new Error("Failed to create player - no data returned");

    // Return the created player by fetching from the view
    return this.getPlayerById(data.id);
  }

  async updatePlayer(
    playerId: string,
    updateData: PlayerRosterUpdate
  ): Promise<RosterPlayerView> {
    const { data, error } = await (this.client as any)
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

  /**
   * Update status for multiple players at once
   * @param playerIds - Array of player IDs to update
   * @param status - New status value (active, inactive, inactive_cut, inactive_quit, alumni, etc.)
   * @returns Number of players successfully updated
   */
  async updateMultiplePlayerStatuses(
    playerIds: string[],
    status: string
  ): Promise<number> {
    if (playerIds.length === 0) {
      return 0;
    }

    // Update is_active based on status
    const isActive =
      status === "active" ||
      status === "injured" ||
      status === "suspended" ||
      status === "academic_probation";

    const { data, error } = await (this.client as any)
      .from("team_players")
      .update({
        roster_status: status,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .in("id", playerIds)
      .select("id");

    if (error) throw error as PostgrestError;

    return data?.length || 0;
  }

  /**
   * Update multiple players with partial data
   * @param playerIds - Array of player IDs to update
   * @param updates - Object containing fields to update (only provided fields will be updated)
   * @returns Number of players successfully updated
   */
  async updateMultiplePlayers(
    playerIds: string[],
    updates: {
      position?: string;
      grade_level?: string;
      height_inches?: number;
      weight_lbs?: number;
    }
  ): Promise<number> {
    if (playerIds.length === 0) {
      return 0;
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.position !== undefined) {
      updateData.position = updates.position;
    }
    if (updates.grade_level !== undefined) {
      updateData.grade_level = updates.grade_level;
    }
    if (updates.height_inches !== undefined) {
      updateData.height_inches = updates.height_inches;
    }
    if (updates.weight_lbs !== undefined) {
      updateData.weight_lbs = updates.weight_lbs;
    }

    const { data, error } = await (this.client as any)
      .from("team_players")
      .update(updateData)
      .in("id", playerIds)
      .select("id");

    if (error) throw error as PostgrestError;

    return data?.length || 0;
  }

  async getPlayerById(playerId: string): Promise<RosterPlayerView> {
    interface RawRow {
      [key: string]: unknown;
      id: string;
      team_id: string;
      first_name?: string | null;
      last_name?: string | null;
      jersey_number?: number | null;
      position?: string | null;
      grade_level?: string | null;
      height_inches?: number | null;
      weight_lbs?: number | null;
      is_active?: boolean | null;
      roster_status?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
    }

    const { data, error } = await this.client
      .from("team_players")
      .select("*")
      .eq("id", playerId)
      .single();

    if (error) throw error as PostgrestError;
    if (!data) throw new Error("Player not found");

    const row = data as RawRow;
    return {
      id: row.id,
      team_id: row.team_id,
      first_name: row.first_name ?? null,
      last_name: row.last_name ?? null,
      nickname: (row.nickname as string) ?? null,
      jersey_number: row.jersey_number ?? null,
      position: row.position ?? null,
      grade_level: row.grade_level ?? null,
      height_inches: row.height_inches ?? null,
      weight_lbs: row.weight_lbs ?? null,
      is_active: row.is_active ?? null,
      roster_status: row.roster_status ?? null,
      user_id: (row.user_id as string) ?? null,
      invitation_token: (row.invitation_token as string) ?? null,
      invitation_status: (row.invitation_status as string) ?? null,
      invitation_sent_at: (row.invitation_sent_at as string) ?? null,
      invitation_accepted_at: (row.invitation_accepted_at as string) ?? null,
      created_at: row.created_at ?? null,
      updated_at: row.updated_at ?? null,
    };
  }

  async checkJerseyNumberAvailable(
    teamId: string,
    jerseyNumber: number,
    excludePlayerId?: string
  ): Promise<boolean> {
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
