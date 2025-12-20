import type { Tables, Updates } from "../../types/database";
import type { DbResult } from "./db";

import { table } from "./db";

export type TeamMemberRow = Tables<"team_members">;

export async function getActiveTeamMembershipsByUserId(
  userId: string
): Promise<DbResult<TeamMemberRow[]>> {
  const { data, error } = await table("team_members")
    .select("team_id, team_role, capabilities, role_notes, assigned_at, status")
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) return { data: null, error };
  return { data: (data as TeamMemberRow[]) ?? [], error: null };
}

export async function getActiveTeamMembershipByUserAndTeam(
  userId: string,
  teamId: string,
  columns:
    | "team_role"
    | "capabilities, team_role"
    | "team_role, capabilities"
    | "*" = "team_role"
): Promise<DbResult<Partial<TeamMemberRow> | null>> {
  const { data, error } = await table("team_members")
    .select(columns)
    .eq("user_id", userId)
    .eq("team_id", teamId)
    .eq("status", "active")
    .maybeSingle();

  if (error) return { data: null, error };
  return { data: (data as Partial<TeamMemberRow>) ?? null, error: null };
}

export async function updateTeamMemberByUserAndTeam(
  userId: string,
  teamId: string,
  updates: Updates<"team_members">
): Promise<DbResult<TeamMemberRow>> {
  const { data, error } = await table("team_members")
    .update(updates as unknown as Record<string, unknown>)
    .eq("user_id", userId)
    .eq("team_id", teamId)
    .select("*")
    .single();

  if (error) return { data: null, error };
  return { data: data as TeamMemberRow, error: null };
}
