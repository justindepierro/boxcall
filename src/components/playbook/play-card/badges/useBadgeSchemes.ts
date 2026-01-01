/**
 * useBadgeSchemes Hook
 *
 * Consolidates all badge scheme management logic for PlayCard components.
 * Provides memoized schemes and change handlers for all badge categories.
 */

import { useMemo } from "react";
import type { Play as PlayType } from "../../../../types/play";
import type { BadgeColorScheme } from "../../../../types/badge";

// Hook deleted - using fallback functions
const getCategoryBadgeScheme = (_overrides: unknown, _category: string, _value: string): BadgeColorScheme => "navy";
const getPlayTypeBadgeScheme = (_overrides: unknown, _playType: string): BadgeColorScheme => "jade";
const useTeamBadgeSchemeOverrides = () => ({
  overrides: null,
  setCategoryScheme: (_category: string, _value: string, _scheme: unknown) => Promise.resolve(),
  setPlayTypeScheme: (_playType: string, _scheme: unknown) => Promise.resolve(),
});

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
    useTeamBadgeSchemeOverrides();

  // Use provided originalPlay or fall back to play
  const fallback = originalPlay ?? play;

  // ----- Play Type -----
  const playTypeScheme = useMemo(
    () => getPlayTypeBadgeScheme(overrides, play.p_type ?? fallback.p_type),
    [overrides, play.p_type, fallback.p_type]
  );

  const onChangePlayTypeScheme = useMemo(() => {
    const playType = (play.p_type ?? fallback.p_type)?.trim();
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
    const personnel = (play.personnel ?? fallback.personnel)?.trim();
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
    const formation = (play.formation ?? fallback.formation)?.trim();
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
    const protection = (play.protection ?? fallback.protection)?.trim();
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
    const motion = (play.motion ?? fallback.motion)?.trim();
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
