import { supabase } from "../lib/supabase";

import type {
  ServerPlaybookViewPreset,
  CreateServerPlaybookViewPresetInput,
  UpdateServerPlaybookViewPresetInput,
} from "../types/playbookViewPreset";

// CRUD utilities for server-backed playbook view presets
// Note: caller ensures user is authenticated; RLS enforces ownership

const TABLE = "playbook_view_presets";

export async function listServerPresets(
  teamId?: string | null
): Promise<ServerPlaybookViewPreset[]> {
  let q = supabase
    .from(TABLE)
    .select("*")
    .order("updated_at", { ascending: false });
  if (teamId) q = q.eq("team_id", teamId);
  const { data, error } = await q;
  if (error) throw error;
  return data as ServerPlaybookViewPreset[];
}

export async function createServerPreset(
  input: CreateServerPlaybookViewPresetInput
): Promise<ServerPlaybookViewPreset> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      name: input.name,
      filters: input.filters,
      team_id: input.team_id ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as ServerPlaybookViewPreset;
}

export async function updateServerPreset(
  input: UpdateServerPlaybookViewPresetInput
): Promise<ServerPlaybookViewPreset> {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.filters !== undefined) patch.filters = input.filters;
  if (input.archived !== undefined) patch.archived = input.archived;
  const { data, error } = await supabase
    .from(TABLE)
    .update(patch)
    .eq("id", input.id)
    .select()
    .single();
  if (error) throw error;
  return data as ServerPlaybookViewPreset;
}

export async function deleteServerPreset(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

export async function upsertImportedPresets(
  presets: Omit<
    ServerPlaybookViewPreset,
    "id" | "created_at" | "updated_at" | "archived" | "user_id"
  >[]
): Promise<number> {
  // For a first pass we just create; future: de-dupe by name+filters hash
  let created = 0;
  for (const p of presets) {
    try {
      await createServerPreset({
        name: p.name,
        filters: p.filters,
        team_id: p.team_id ?? null,
      });
      created += 1;
    } catch {
      // ignore individual failures
    }
  }
  return created;
}
