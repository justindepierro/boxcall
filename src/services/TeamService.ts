import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { BaseService } from "./base/BaseService";
import type { Inserts, Updates } from "../types/database";

export interface TeamSearchResult {
  id: string;
  name: string;
  school: string;
  sport: string;
  level: string;
  memberCount: number;
  coachName: string;
  isPublic: boolean;
  requiresApproval: boolean;
}

class TeamService extends BaseService<"teams"> {
  constructor(supabaseClient: SupabaseClient) {
    super(supabaseClient, "teams");
  }

  protected async validateCreate(_data: Inserts<"teams">): Promise<void> {
    // TODO: Implement validation
  }

  protected async validateUpdate(
    _id: string,
    _data: Updates<"teams">
  ): Promise<void> {
    // TODO: Implement validation
  }

  public async searchTeams(query: string): Promise<TeamSearchResult[]> {
    const { data, error } = await this.supabase
      .from("v_teams_with_details")
      .select("*")
      .or(`name.ilike.%${query}%,school.ilike.%${query}%`);

    if (error) {
      console.error("Error searching teams:", error);
      throw error;
    }

    return data || [];
  }
}

export const teamService = new TeamService(supabase);
