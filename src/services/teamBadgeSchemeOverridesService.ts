import { table } from "../data/supabase/db";

import type { Json } from "../types/database";
import type { BadgeColorScheme } from "../types/badge";
import { isBadgeColorScheme } from "../types/badge";

export const TEAM_BADGE_SCHEME_OVERRIDE_CATEGORIES = [
  "play_type",
  "personnel",
  "formation",
  "protection",
  "motion",
] as const;

export type TeamBadgeSchemeOverrideCategory =
  (typeof TEAM_BADGE_SCHEME_OVERRIDE_CATEGORIES)[number];

export type TeamBadgeSchemeOverrides = {
  /** Overrides for play type badges (e.g. Pass/Run/RPO). Keys are normalized (trimmed, lowercased). */
  play_type?: Record<string, BadgeColorScheme>;
  /** Overrides for personnel badges (e.g. 11/12/21). Keys are normalized (trimmed, lowercased). */
  personnel?: Record<string, BadgeColorScheme>;
  /** Overrides for formation badges (e.g. Shotgun). Keys are normalized (trimmed, lowercased). */
  formation?: Record<string, BadgeColorScheme>;
  /** Overrides for protection badges (e.g. Slide). Keys are normalized (trimmed, lowercased). */
  protection?: Record<string, BadgeColorScheme>;
  /** Overrides for motion badges (e.g. Jet). Keys are normalized (trimmed, lowercased). */
  motion?: Record<string, BadgeColorScheme>;
};

export type TeamBadgeSchemeOverridesPatch = Partial<TeamBadgeSchemeOverrides>;

type TeamSettings = {
  badge_scheme_overrides?: TeamBadgeSchemeOverridesPatch;
  [key: string]: unknown;
};

function asObject(v: Json | null | undefined): Record<string, unknown> {
  if (!v) return {};
  if (Array.isArray(v)) return {};
  if (typeof v === "object") return v as Record<string, unknown>;
  return {};
}

function sanitizeOverrides(
  overrides: TeamBadgeSchemeOverridesPatch | null | undefined
): TeamBadgeSchemeOverrides {
  const safe: TeamBadgeSchemeOverrides = {};

  for (const category of TEAM_BADGE_SCHEME_OVERRIDE_CATEGORIES) {
    const raw = (overrides as any)?.[category];
    if (!raw || typeof raw !== "object") continue;
    const next: Record<string, BadgeColorScheme> = {};
    for (const [k, v] of Object.entries(raw as any)) {
      if (!k || typeof k !== "string") continue;
      if (isBadgeColorScheme(v)) next[k] = v as BadgeColorScheme;
    }
    (safe as any)[category] = next;
  }

  return safe;
}

const TEAM_BADGE_OVERRIDES_CACHE_TTL_MS = 10 * 60 * 1000;

type CacheEntry = {
  value?: TeamBadgeSchemeOverrides;
  fetchedAt?: number;
  inFlight?: Promise<TeamBadgeSchemeOverrides>;
};

const cache = new Map<string, CacheEntry>();

export class TeamBadgeSchemeOverridesService {
  static async get(teamId: string): Promise<TeamBadgeSchemeOverrides> {
    const now = Date.now();
    const cached = cache.get(teamId);
    if (
      cached?.value &&
      typeof cached.fetchedAt === "number" &&
      now - cached.fetchedAt < TEAM_BADGE_OVERRIDES_CACHE_TTL_MS
    ) {
      return cached.value;
    }

    if (cached?.inFlight) return cached.inFlight;

    const inFlight = (async () => {
      const { data, error } = await table("teams")
        .select("settings")
        .eq("id", teamId)
        .single();

      if (error) throw error;

      const settings = asObject((data as any)?.settings) as TeamSettings;
      const merged = sanitizeOverrides(settings.badge_scheme_overrides);
      cache.set(teamId, { value: merged, fetchedAt: Date.now() });
      return merged;
    })();

    cache.set(teamId, { ...(cached ?? {}), inFlight });

    try {
      return await inFlight;
    } catch (err) {
      const existing = cache.get(teamId);
      if (existing?.inFlight === inFlight) {
        cache.set(teamId, { ...(existing ?? {}), inFlight: undefined });
      }
      throw err;
    }
  }

  static clearCache(teamId?: string): void {
    if (teamId) {
      cache.delete(teamId);
      return;
    }
    cache.clear();
  }

  static async set(
    teamId: string,
    patch: TeamBadgeSchemeOverridesPatch
  ): Promise<TeamBadgeSchemeOverrides> {
    const { data: team, error: readError } = await table("teams")
      .select("settings")
      .eq("id", teamId)
      .single();

    if (readError) throw readError;

    const existingSettings = asObject((team as any)?.settings) as TeamSettings;
    const existingOverrides = sanitizeOverrides(
      existingSettings.badge_scheme_overrides
    );

    const nextOverrides: TeamBadgeSchemeOverrides = {
      ...existingOverrides,
      ...(patch ?? {}),
    };

    for (const category of TEAM_BADGE_SCHEME_OVERRIDE_CATEGORIES) {
      const existingCategory = (existingOverrides as any)[category];
      const patchCategory = (patch as any)?.[category];
      if (
        (!existingCategory || typeof existingCategory !== "object") &&
        (!patchCategory || typeof patchCategory !== "object")
      ) {
        continue;
      }

      (nextOverrides as any)[category] = {
        ...(existingCategory ?? {}),
        ...(patchCategory ?? {}),
      };
    }

    const updatedSettings: TeamSettings = {
      ...existingSettings,
      badge_scheme_overrides: nextOverrides,
    };

    const { data, error } = await table("teams")
      .update({ settings: updatedSettings as any })
      .eq("id", teamId)
      .select("settings")
      .single();

    if (error) throw error;

    const savedSettings = asObject((data as any)?.settings) as TeamSettings;
    const savedOverrides = sanitizeOverrides(
      savedSettings.badge_scheme_overrides
    );
    cache.set(teamId, { value: savedOverrides, fetchedAt: Date.now() });
    return savedOverrides;
  }
}
