import { table } from "../data/supabase/db";

import type { Json } from "../types/database";
import type { SituationDefinitions } from "../types/situationDefinitions";
import { DEFAULT_SITUATION_DEFINITIONS } from "../types/situationDefinitions";

export type SituationDefinitionsPatch = Partial<
  Omit<SituationDefinitions, "field_zones" | "down_distance">
> & {
  field_zones?: Partial<SituationDefinitions["field_zones"]>;
  down_distance?: Partial<SituationDefinitions["down_distance"]>;
};

type TeamSettings = {
  situation_definitions?: SituationDefinitionsPatch;
  [key: string]: unknown;
};

function mergeWithDefaults(
  defs: SituationDefinitionsPatch | null | undefined
): SituationDefinitions {
  return {
    field_zones: {
      ...DEFAULT_SITUATION_DEFINITIONS.field_zones,
      ...(defs?.field_zones ?? {}),
    },
    field_zones_v2: Array.isArray((defs as any)?.field_zones_v2)
      ? ((defs as any).field_zones_v2 as any)
      : undefined,
    custom_situations: Array.isArray((defs as any)?.custom_situations)
      ? ((defs as any).custom_situations as any)
      : undefined,
    distance_badges: {
      ...(DEFAULT_SITUATION_DEFINITIONS.distance_badges ?? {}),
      ...(((defs as any)?.distance_badges as any) ?? {}),
    },
    distance_badge_colors:
      (((defs as any)?.distance_badge_colors as any) ?? {}) || {},
    down_distance: {
      ...DEFAULT_SITUATION_DEFINITIONS.down_distance,
      ...(defs?.down_distance ?? {}),
    },
  };
}

function asObject(v: Json | null | undefined): Record<string, unknown> {
  if (!v) return {};
  if (Array.isArray(v)) return {};
  if (typeof v === "object") return v as Record<string, unknown>;
  return {};
}

const TEAM_DEFS_CACHE_TTL_MS = 10 * 60 * 1000;

type TeamDefsCacheEntry = {
  value?: SituationDefinitions;
  fetchedAt?: number;
  inFlight?: Promise<SituationDefinitions>;
};

const teamDefsCache = new Map<string, TeamDefsCacheEntry>();

export class TeamSituationDefinitionsService {
  static async get(teamId: string): Promise<SituationDefinitions> {
    const now = Date.now();
    const cached = teamDefsCache.get(teamId);
    if (
      cached?.value &&
      typeof cached.fetchedAt === "number" &&
      now - cached.fetchedAt < TEAM_DEFS_CACHE_TTL_MS
    ) {
      return cached.value;
    }

    if (cached?.inFlight) {
      return cached.inFlight;
    }

    const inFlight = (async () => {
      const { data, error } = await table("teams")
        .select("settings")
        .eq("id", teamId)
        .single();

      if (error) throw error;

      const settings = asObject((data as any)?.settings) as TeamSettings;
      const merged = mergeWithDefaults(settings.situation_definitions);
      teamDefsCache.set(teamId, { value: merged, fetchedAt: Date.now() });
      return merged;
    })();

    teamDefsCache.set(teamId, {
      ...(cached ?? {}),
      inFlight,
    });

    try {
      return await inFlight;
    } catch (err) {
      const existing = teamDefsCache.get(teamId);
      if (existing?.inFlight === inFlight) {
        teamDefsCache.set(teamId, { ...(existing ?? {}), inFlight: undefined });
      }
      throw err;
    }
  }

  static clearCache(teamId?: string): void {
    if (teamId) {
      teamDefsCache.delete(teamId);
      return;
    }
    teamDefsCache.clear();
  }

  static async set(
    teamId: string,
    defs: SituationDefinitionsPatch
  ): Promise<SituationDefinitions> {
    const { data: team, error: readError } = await table("teams")
      .select("settings")
      .eq("id", teamId)
      .single();

    if (readError) throw readError;

    const existingSettings = asObject((team as any)?.settings) as TeamSettings;

    const updatedSettings: TeamSettings = {
      ...existingSettings,
      situation_definitions: {
        ...(existingSettings.situation_definitions ?? {}),
        ...(defs ?? {}),
      },
    };

    const { data, error } = await table("teams")
      .update({ settings: updatedSettings as any })
      .eq("id", teamId)
      .select("settings")
      .single();

    if (error) throw error;

    const saved = asObject((data as any)?.settings) as TeamSettings;
    const merged = mergeWithDefaults(saved.situation_definitions);
    teamDefsCache.set(teamId, { value: merged, fetchedAt: Date.now() });
    return merged;
  }
}
