import { useCallback, useEffect, useMemo } from "react";

import type { BadgeColorScheme } from "../types/badge";
import { BADGE_COLOR_SCHEME_OPTIONS, isBadgeColorScheme } from "../types/badge";
import { useActiveTeamStore } from "../stores/activeTeamStore";
import { useTeamBadgeSchemeOverridesStore } from "../stores/teamBadgeSchemeOverridesStore";
import {
  type TeamBadgeSchemeOverrideCategory,
  type TeamBadgeSchemeOverrides,
} from "../services/teamBadgeSchemeOverridesService";

export const BADGE_SCHEME_OPTIONS = BADGE_COLOR_SCHEME_OPTIONS;

export function normalizeBadgeOverrideKey(label: string): string {
  return label.trim().toLowerCase();
}

const DEFAULT_PLAY_TYPE_SCHEMES: Record<string, BadgeColorScheme> = {
  pass: "blue",
  run: "jade",
  rpo: "purple",
  "play action": "amber",
};

export function getPlayTypeBadgeScheme(
  overrides: TeamBadgeSchemeOverrides | null | undefined,
  playType: string | null | undefined
): BadgeColorScheme {
  const type = playType?.trim();
  if (!type) return "navy";

  const key = normalizeBadgeOverrideKey(type);
  const overridden = overrides?.play_type?.[key];
  if (isBadgeColorScheme(overridden)) return overridden;

  const def = DEFAULT_PLAY_TYPE_SCHEMES[key];
  return isBadgeColorScheme(def) ? def : "navy";
}

const DEFAULT_CATEGORY_SCHEMES: Partial<
  Record<TeamBadgeSchemeOverrideCategory, BadgeColorScheme>
> = {
  personnel: "indigo",
  formation: "purple",
  protection: "orange",
  motion: "cyan",
};

export function getCategoryBadgeScheme(
  overrides: TeamBadgeSchemeOverrides | null | undefined,
  category: TeamBadgeSchemeOverrideCategory,
  label: string | null | undefined
): BadgeColorScheme {
  if (category === "play_type") {
    return getPlayTypeBadgeScheme(overrides, label);
  }

  const normalized = label?.trim();
  if (!normalized) return DEFAULT_CATEGORY_SCHEMES[category] ?? "navy";

  const key = normalizeBadgeOverrideKey(normalized);
  const overridden = (overrides as any)?.[category]?.[key];
  if (isBadgeColorScheme(overridden)) return overridden;

  return DEFAULT_CATEGORY_SCHEMES[category] ?? "navy";
}

export function useTeamBadgeSchemeOverrides(): {
  teamId: string | null;
  overrides: TeamBadgeSchemeOverrides | null;
  loading: boolean;
  setPlayTypeScheme: (
    playType: string,
    scheme: BadgeColorScheme
  ) => Promise<void>;
  setCategoryScheme: (
    category: TeamBadgeSchemeOverrideCategory,
    label: string,
    scheme: BadgeColorScheme
  ) => Promise<void>;
} {
  const teamId = useActiveTeamStore((s) => s.activeTeamId);
  const storeEntry = useTeamBadgeSchemeOverridesStore((s) =>
    teamId ? s.byTeamId[teamId] : undefined
  );
  const load = useTeamBadgeSchemeOverridesStore((s) => s.load);
  const setInStore = useTeamBadgeSchemeOverridesStore((s) => s.set);

  const overrides = storeEntry?.overrides ?? null;
  const loading = teamId ? !storeEntry?.loaded || !!storeEntry?.loading : false;

  useEffect(() => {
    if (!teamId) return;
    void load(teamId);
  }, [teamId, load]);

  const setPlayTypeScheme = useCallback(
    async (playType: string, scheme: BadgeColorScheme) => {
      if (!teamId) return;
      const key = normalizeBadgeOverrideKey(playType);
      await setInStore(teamId, {
        play_type: {
          [key]: scheme,
        },
      });
    },
    [teamId, setInStore]
  );

  const setCategoryScheme = useCallback(
    async (
      category: TeamBadgeSchemeOverrideCategory,
      label: string,
      scheme: BadgeColorScheme
    ) => {
      if (!teamId) return;
      const key = normalizeBadgeOverrideKey(label);
      await setInStore(teamId, {
        [category]: {
          [key]: scheme,
        },
      } as any);
    },
    [teamId, setInStore]
  );

  return useMemo(
    () => ({
      teamId,
      overrides,
      loading,
      setPlayTypeScheme,
      setCategoryScheme,
    }),
    [teamId, overrides, loading, setPlayTypeScheme, setCategoryScheme]
  );
}
