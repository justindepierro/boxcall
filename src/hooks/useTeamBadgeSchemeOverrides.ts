import { useCallback, useEffect, useMemo, useState } from "react";

import type { BadgeColorScheme } from "../types/badge";
import { BADGE_COLOR_SCHEME_OPTIONS, isBadgeColorScheme } from "../types/badge";
import { useActiveTeamStore } from "../stores/activeTeamStore";
import {
  TeamBadgeSchemeOverridesService,
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

export function useTeamBadgeSchemeOverrides(): {
  teamId: string | null;
  overrides: TeamBadgeSchemeOverrides | null;
  loading: boolean;
  setPlayTypeScheme: (
    playType: string,
    scheme: BadgeColorScheme
  ) => Promise<void>;
} {
  const teamId = useActiveTeamStore((s) => s.activeTeamId);
  const [overrides, setOverrides] = useState<TeamBadgeSchemeOverrides | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!teamId) {
      setOverrides(null);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);

    const load = async () => {
      try {
        const loaded = await TeamBadgeSchemeOverridesService.get(teamId);
        if (!cancelled) setOverrides(loaded);
      } catch {
        if (!cancelled) setOverrides(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [teamId]);

  const setPlayTypeScheme = useCallback(
    async (playType: string, scheme: BadgeColorScheme) => {
      if (!teamId) return;
      const key = normalizeBadgeOverrideKey(playType);
      const saved = await TeamBadgeSchemeOverridesService.set(teamId, {
        play_type: {
          [key]: scheme,
        },
      });
      setOverrides(saved);
    },
    [teamId]
  );

  return useMemo(
    () => ({
      teamId,
      overrides,
      loading,
      setPlayTypeScheme,
    }),
    [teamId, overrides, loading, setPlayTypeScheme]
  );
}
