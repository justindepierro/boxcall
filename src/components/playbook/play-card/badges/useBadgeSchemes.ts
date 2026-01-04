/**
 * useBadgeSchemes Hook
 *
 * Consolidates all badge scheme management logic for PlayCard components.
 * Provides memoized schemes and change handlers for all badge categories.
 */

import { useMemo, useCallback, useSyncExternalStore, useEffect } from "react";
import type { Play as PlayType } from "../../../../types/play";
import type { BadgeColorScheme } from "../../../../types/badge";
import { readLocalJson, writeLocalJson } from "../../../../utils/storage";
import { PreferenceService } from "../../../../services/preferenceService";

type BadgeOverrides = {
  playType: Record<string, BadgeColorScheme>;
  categories: Record<string, Record<string, BadgeColorScheme>>;
};

const STORAGE_KEY = "bc_badge_scheme_overrides";

const defaultOverrides: BadgeOverrides = {
  playType: {},
  categories: {},
};

const parseOverrides = (raw: string | null): Partial<BadgeOverrides> => {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Partial<BadgeOverrides>;
  } catch {
    return {};
  }
};

const sanitizeOverrides = (
  value: Partial<BadgeOverrides> | null | undefined
): BadgeOverrides => ({
  playType: value?.playType ?? {},
  categories: value?.categories ?? {},
});

const mergeOverrides = (
  base: BadgeOverrides,
  incoming: BadgeOverrides
): BadgeOverrides => {
  const mergedCategories = { ...base.categories };
  Object.entries(incoming.categories).forEach(([category, map]) => {
    mergedCategories[category] = {
      ...(base.categories[category] || {}),
      ...map,
    };
  });

  return {
    playType: { ...base.playType, ...incoming.playType },
    categories: mergedCategories,
  };
};

const normalizeKey = (value: string | null | undefined): string =>
  (value ?? "").trim();

const getCategoryBadgeScheme = (
  overrides: BadgeOverrides,
  category: string,
  value: string
): BadgeColorScheme => {
  const normalized = normalizeKey(value);
  if (!normalized) return "navy";
  const categoryOverrides = overrides.categories[category] || {};
  return categoryOverrides[normalized] || "navy";
};

const getPlayTypeBadgeScheme = (
  overrides: BadgeOverrides,
  playType: string
): BadgeColorScheme => {
  const normalized = normalizeKey(playType);
  if (!normalized) return "jade";
  return overrides.playType[normalized] || "jade";
};

// Module-level store so updates fan out to every consumer
let overridesRef: BadgeOverrides = sanitizeOverrides(
  readLocalJson<BadgeOverrides>(STORAGE_KEY) || defaultOverrides
);

const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const updateOverrides = (next: BadgeOverrides) => {
  overridesRef = sanitizeOverrides(next);
  writeLocalJson(STORAGE_KEY, overridesRef);
  notify();
};

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    const parsed = parseOverrides(event.newValue);
    overridesRef = sanitizeOverrides(parsed);
    notify();
  });
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => overridesRef || defaultOverrides;

const useBadgeOverrideState = () => {
  const overrides = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    let isMounted = true;
    const hydrate = async () => {
      const prefs = await PreferenceService.loadPreferences();
      const remote = sanitizeOverrides(prefs?.badge_scheme_overrides);
      const hasRemote =
        Object.keys(remote.playType).length > 0 ||
        Object.keys(remote.categories).length > 0;
      if (!hasRemote) return;

      if (!isMounted) return;
      const merged = mergeOverrides(getSnapshot(), remote);
      updateOverrides(merged);
    };

    void hydrate();
    return () => {
      isMounted = false;
    };
  }, []);

  const persist = useCallback((next: BadgeOverrides) => {
    const normalized = sanitizeOverrides(next);
    updateOverrides(normalized);
    void PreferenceService.savePreferences({
      badge_scheme_overrides: normalized,
    });
  }, []);

  const setCategoryScheme = useCallback(
    async (category: string, value: string, scheme: BadgeColorScheme) => {
      const normalized = normalizeKey(value);
      if (!normalized) return;
      persist({
        playType: overrides.playType,
        categories: {
          ...overrides.categories,
          [category]: {
            ...(overrides.categories[category] || {}),
            [normalized]: scheme,
          },
        },
      });
    },
    [overrides.playType, overrides.categories, persist]
  );

  const setPlayTypeScheme = useCallback(
    async (playType: string, scheme: BadgeColorScheme) => {
      const normalized = normalizeKey(playType);
      if (!normalized) return;
      persist({
        playType: {
          ...overrides.playType,
          [normalized]: scheme,
        },
        categories: overrides.categories,
      });
    },
    [overrides.playType, overrides.categories, persist]
  );

  return { overrides, setCategoryScheme, setPlayTypeScheme };
};

// ============================================================================
// Types
// ============================================================================

export type BadgeCategory =
  | "playType"
  | "personnel"
  | "formation"
  | "protection"
  | "motion";

export interface BadgeSchemeConfig {
  scheme: BadgeColorScheme;
  onChange: (scheme: BadgeColorScheme) => Promise<void>;
}

export interface BadgeSchemes {
  playType: BadgeSchemeConfig;
  personnel: BadgeSchemeConfig;
  formation: BadgeSchemeConfig;
  protection: BadgeSchemeConfig;
  motion: BadgeSchemeConfig;
}

interface UseBadgeSchemesOptions {
  /** The current play data (use optimisticPlay for instant feedback) */
  play: PlayType;
  /** Original play data for fallback values */
  originalPlay?: PlayType;
}

// ============================================================================
// Hook
// ============================================================================

export function useBadgeSchemes({
  play,
  originalPlay,
}: UseBadgeSchemesOptions): BadgeSchemes {
  const { overrides, setPlayTypeScheme, setCategoryScheme } =
    useBadgeOverrideState();

  // Use provided originalPlay or fall back to play
  const fallback = originalPlay ?? play;

  // ----- Play Type -----
  const playTypeScheme = useMemo(
    () => getPlayTypeBadgeScheme(overrides, play.p_type ?? fallback.p_type),
    [overrides, play.p_type, fallback.p_type]
  );

  const onChangePlayTypeScheme = useMemo(() => {
    const playType = normalizeKey(play.p_type ?? fallback.p_type);
    if (!playType) return async () => {};
    return async (scheme: BadgeColorScheme) => {
      await setPlayTypeScheme(playType, scheme);
    };
  }, [play.p_type, fallback.p_type, setPlayTypeScheme]);

  // ----- Personnel -----
  const personnelScheme = useMemo(
    () =>
      getCategoryBadgeScheme(
        overrides,
        "personnel",
        play.personnel ?? fallback.personnel ?? ""
      ),
    [overrides, play.personnel, fallback.personnel]
  );

  const onChangePersonnelScheme = useMemo(() => {
    const personnel = normalizeKey(play.personnel ?? fallback.personnel);
    if (!personnel) return async () => {};
    return async (scheme: BadgeColorScheme) => {
      await setCategoryScheme("personnel", personnel, scheme);
    };
  }, [play.personnel, fallback.personnel, setCategoryScheme]);

  // ----- Formation -----
  const formationScheme = useMemo(
    () =>
      getCategoryBadgeScheme(
        overrides,
        "formation",
        play.formation ?? fallback.formation
      ),
    [overrides, play.formation, fallback.formation]
  );

  const onChangeFormationScheme = useMemo(() => {
    const formation = normalizeKey(play.formation ?? fallback.formation);
    if (!formation) return async () => {};
    return async (scheme: BadgeColorScheme) => {
      await setCategoryScheme("formation", formation, scheme);
    };
  }, [play.formation, fallback.formation, setCategoryScheme]);

  // ----- Protection -----
  const protectionScheme = useMemo(
    () =>
      getCategoryBadgeScheme(
        overrides,
        "protection",
        play.protection ?? fallback.protection ?? ""
      ),
    [overrides, play.protection, fallback.protection]
  );

  const onChangeProtectionScheme = useMemo(() => {
    const protection = normalizeKey(play.protection ?? fallback.protection);
    if (!protection) return async () => {};
    return async (scheme: BadgeColorScheme) => {
      await setCategoryScheme("protection", protection, scheme);
    };
  }, [play.protection, fallback.protection, setCategoryScheme]);

  // ----- Motion -----
  const motionScheme = useMemo(
    () =>
      getCategoryBadgeScheme(
        overrides,
        "motion",
        play.motion ?? fallback.motion ?? ""
      ),
    [overrides, play.motion, fallback.motion]
  );

  const onChangeMotionScheme = useMemo(() => {
    const motion = normalizeKey(play.motion ?? fallback.motion);
    if (!motion) return async () => {};
    return async (scheme: BadgeColorScheme) => {
      await setCategoryScheme("motion", motion, scheme);
    };
  }, [play.motion, fallback.motion, setCategoryScheme]);

  return {
    playType: { scheme: playTypeScheme, onChange: onChangePlayTypeScheme },
    personnel: { scheme: personnelScheme, onChange: onChangePersonnelScheme },
    formation: { scheme: formationScheme, onChange: onChangeFormationScheme },
    protection: {
      scheme: protectionScheme,
      onChange: onChangeProtectionScheme,
    },
    motion: { scheme: motionScheme, onChange: onChangeMotionScheme },
  };
}
