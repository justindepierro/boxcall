import { PlaybookViewPresetsService } from "../services/playbookViewPresetsService";
import type {
  ServerPlaybookViewPreset,
  CreateServerPlaybookViewPresetInput,
  UpdateServerPlaybookViewPresetInput,
} from "../types/playbookViewPreset";

export async function listServerPresets(
  teamId?: string | null
): Promise<ServerPlaybookViewPreset[]> {
  return PlaybookViewPresetsService.listPresets(teamId);
}

export async function createServerPreset(
  input: CreateServerPlaybookViewPresetInput
): Promise<ServerPlaybookViewPreset> {
  return PlaybookViewPresetsService.createPreset(input);
}

export async function updateServerPreset(
  input: UpdateServerPlaybookViewPresetInput
): Promise<ServerPlaybookViewPreset> {
  return PlaybookViewPresetsService.updatePreset(input);
}

export async function deleteServerPreset(id: string): Promise<void> {
  return PlaybookViewPresetsService.deletePreset(id);
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
