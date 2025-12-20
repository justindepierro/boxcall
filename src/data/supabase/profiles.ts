import type { Database, Tables, Updates } from "../../types/database";
import type { DbResult } from "./db";

import { table, updateById } from "./db";

type ProfileRow = Tables<"profiles">;

export async function updateProfileById(
  profileId: string,
  updates: Updates<"profiles">
): Promise<DbResult<ProfileRow>> {
  return updateById("profiles", profileId, updates);
}

export async function updateProfileAvatarUrl(
  profileId: string,
  avatarUrl: string
): Promise<DbResult<ProfileRow>> {
  return updateById("profiles", profileId, { avatar_url: avatarUrl });
}

export async function getProfileRoleById(
  profileId: string
): Promise<
  DbResult<Pick<Database["public"]["Tables"]["profiles"]["Row"], "role"> | null>
> {
  const { data, error } = await table("profiles")
    .select("role")
    .eq("id", profileId)
    .maybeSingle();

  if (error) return { data: null, error };
  return { data: (data as any) ?? null, error: null };
}
