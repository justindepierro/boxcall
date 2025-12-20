import type { Tables } from "../../types/database";
import type { DbResult } from "./db";

import { table } from "./db";

export type TeamRow = Tables<"teams">;

export async function getTeamsByIds(
  teamIds: string[]
): Promise<DbResult<TeamRow[]>> {
  if (teamIds.length === 0) return { data: [], error: null };

  const { data, error } = await table("teams")
    .select("id, name")
    .in("id", teamIds);

  if (error) return { data: null, error };
  return { data: (data as TeamRow[]) ?? [], error: null };
}
