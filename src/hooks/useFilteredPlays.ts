/**
 * useFilteredPlays Hook
 *
 * Unified play filtering with the new PlaybookFilters interface.
 * Replaces the complex usePlayFiltering with a simpler, more maintainable approach.
 *
 * Part of Phase 3: Unified Filtering (Playbook Data Unification Roadmap)
 */

import { useMemo, useEffect, useRef } from "react";
import type { Play } from "../types/play";
import type { PlaybookFilters } from "../types/filters";
import { hasActiveFilters } from "../types/filters";
import { getPlayFlags } from "@utils/localPlayFlags";
import { telemetry } from "../telemetry/dispatcher";
import { TelemetryEventTypes } from "../telemetry/events";

// ============ ELITE DETECTION FUNCTIONS ============
// These provide coach-centric categorization of plays

/**
 * Detect play family from play name, formation, and notes
 */
function detectPlayFamily(play: Play): string | null {
  const text =
    `${play.play_name} ${play.formation} ${play.notes ?? ""}`.toLowerCase();

  // Run concepts
  if (/inside\s*zone|izo|izr/i.test(text)) return "inside_zone";
  if (/outside\s*zone|ozo|ozr|stretch/i.test(text)) return "outside_zone";
  if (/power/i.test(text)) return "power";
  if (/counter/i.test(text)) return "counter";
  if (/trap/i.test(text)) return "trap";
  if (/draw/i.test(text)) return "draw";
  if (/sweep|toss|jet/i.test(text)) return "sweep";

  // Pass concepts
  if (/screen/i.test(text)) return "screen";
  if (/quick\s*(game)?|slant|hitch|flat/i.test(text)) return "quick_game";
  if (/boot|rollout|nakeds?/i.test(text)) return "boot";
  if (/sprint\s*out/i.test(text)) return "sprint_out";
  if (/play\s*action|pa\b/i.test(text)) return "play_action";
  if (/rpo/i.test(text)) return "rpo";
  if (/drop\s*back|pass/i.test(text)) return "drop_back";

  return null;
}

/**
 * Compute field zone from play preferences
 */
function computeFieldZone(play: Play): string | null {
  const text =
    `${play.pref_field_pos ?? ""} ${play.pref_situation ?? ""} ${(play.flags ?? []).join(" ")}`.toLowerCase();

  if (/backed\s*up|coming\s*out|own\s*(1|2|3|4|5|6|7|8|9|10)\b/.test(text))
    return "backed_up";
  if (/goal\s*line|gtg|inside\s*(the\s*)?5/.test(text)) return "goalline";
  if (/red\s*zone|inside\s*(the\s*)?(20|10)/.test(text)) return "redzone";
  if (/plus|opp|opponent/.test(text)) return "plus_territory";
  if (/own\s*territory|between/.test(text)) return "own_territory";

  return null;
}

// ============ NORMALIZATION HELPERS ============

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function normalizeComparable(value: unknown): string {
  return normalizeText(value).replace(/[^a-z0-9]+/g, "");
}

// ============ FILTER MATCHING ============

/** Match search filter against play fields */
function matchesSearch(play: Play, search: string): boolean {
  if (!search) return true;

  const query = search.toLowerCase();
  const matchesName = play.play_name.toLowerCase().includes(query);
  const matchesFormation = play.formation.toLowerCase().includes(query);
  const matchesNotes = play.notes?.toLowerCase().includes(query);

  if (matchesName || matchesFormation || matchesNotes) return true;

  // Check local flags as fallback
  const flags = getPlayFlags(play.id);
  const haystack = [...flags.positions, ...flags.players, ...flags.flags]
    .join("\n")
    .toLowerCase();

  return haystack.includes(query);
}

/** Match play type filter */
function matchesPlayType(play: Play, playType: string | null): boolean {
  if (!playType) return true;
  return normalizeComparable(play.p_type) === normalizeComparable(playType);
}

/** Match personnel filter */
function matchesPersonnel(play: Play, personnel: string | null): boolean {
  if (!personnel) return true;
  return normalizeComparable(play.personnel) === normalizeComparable(personnel);
}

/** Match situation filter */
function matchesSituation(play: Play, situation: string | null): boolean {
  if (!situation) return true;
  return normalizeText(play.pref_situation).includes(normalizeText(situation));
}

/** Match field position filter */
function matchesFieldPosition(
  play: Play,
  fieldPosition: string | null
): boolean {
  if (!fieldPosition) return true;
  const fieldPos = play.pref_field_pos ?? computeFieldZone(play) ?? "";
  return normalizeComparable(fieldPos) === normalizeComparable(fieldPosition);
}

/** Match down filter */
function matchesDown(play: Play, down: string | null): boolean {
  if (!down) return true;
  return normalizeText(play.pref_down).includes(normalizeText(down));
}

/** Match distance filter */
function matchesDistance(play: Play, distance: string | null): boolean {
  if (!distance) return true;
  return normalizeText(play.pref_dis).includes(normalizeText(distance));
}

/** Match tags filter - play must have ALL specified tags */
function matchesTags(play: Play, filterTags: string[]): boolean {
  if (filterTags.length === 0) return true;

  const playTags = [
    ...(play.tags ?? []),
    ...(play.flags ?? []),
    ...(play.ftag1 ? [play.ftag1] : []),
    ...(play.ftag2 ? [play.ftag2] : []),
    ...(play.p_tag1 ? [play.p_tag1] : []),
    ...(play.p_tag2 ? [play.p_tag2] : []),
  ].map(normalizeText);

  return filterTags.every((tag) => {
    const normalizedTag = normalizeText(tag);
    return playTags.some((t) => t.includes(normalizedTag));
  });
}

/**
 * Check if a play matches the given filters
 */
function playMatchesFilters(
  play: Play,
  filters: PlaybookFilters,
  favoriteIds: string[]
): boolean {
  // Each check is a simple function call - reduces complexity
  if (!matchesSearch(play, filters.search)) return false;
  if (filters.favoritesOnly && !favoriteIds.includes(play.id)) return false;
  if (!matchesPlayType(play, filters.playType)) return false;
  if (!matchesPersonnel(play, filters.personnel)) return false;
  if (!matchesSituation(play, filters.situation)) return false;
  if (!matchesFieldPosition(play, filters.fieldPosition)) return false;
  if (!matchesDown(play, filters.down)) return false;
  if (!matchesDistance(play, filters.distance)) return false;
  if (!matchesTags(play, filters.tags)) return false;

  return true;
}

// ============ TELEMETRY HELPERS ============

function getResultBucket(resultCount: number): "0" | "1-10" | "11-50" | ">50" {
  if (resultCount === 0) return "0";
  if (resultCount <= 10) return "1-10";
  if (resultCount <= 50) return "11-50";
  return ">50";
}

// ============ MAIN HOOK ============

export interface UseFilteredPlaysResult {
  /** Filtered plays ready for display */
  filteredPlays: Play[];
  /** Whether any filters are active */
  hasFilters: boolean;
  /** Total count before filtering (for stats comparison) */
  unfilteredCount: number;
}

/**
 * Filter plays based on PlaybookFilters
 *
 * @param plays - Array of plays to filter
 * @param filters - Unified filter state
 * @param favoriteIds - Array of favorited play IDs (from local storage)
 * @returns Filtered plays and metadata
 */
export function useFilteredPlays(
  plays: Play[],
  filters: PlaybookFilters,
  favoriteIds: string[] = []
): UseFilteredPlaysResult {
  const filteredPlays = useMemo(() => {
    let result = plays.filter((play) =>
      playMatchesFilters(play, filters, favoriteIds)
    );

    // Sort by most used if that filter is active
    if (filters.mostUsedOnly) {
      result = [...result].sort(
        (a, b) => (b.times_called || 0) - (a.times_called || 0)
      );
    }

    return result;
  }, [plays, filters, favoriteIds]);

  // Telemetry tracking
  const lastFilterSignatureRef = useRef<string | null>(null);
  const filterSignature = useMemo(
    () =>
      JSON.stringify({
        search: !!filters.search,
        searchLength: filters.search?.length || 0,
        playType: filters.playType,
        personnel: filters.personnel,
        situation: filters.situation,
        fieldPosition: filters.fieldPosition,
        down: filters.down,
        distance: filters.distance,
        tagsCount: filters.tags.length,
        favoritesOnly: filters.favoritesOnly,
        mostUsedOnly: filters.mostUsedOnly,
        resultCount: filteredPlays.length,
        resultBucket: getResultBucket(filteredPlays.length),
      }),
    [filters, filteredPlays.length]
  );

  useEffect(() => {
    if (lastFilterSignatureRef.current === filterSignature) return;
    lastFilterSignatureRef.current = filterSignature;
    telemetry.enqueue({
      type: TelemetryEventTypes.FilterApply,
      data: JSON.parse(filterSignature),
    });
  }, [filterSignature]);

  return {
    filteredPlays,
    hasFilters: hasActiveFilters(filters),
    unfilteredCount: plays.length,
  };
}

// Re-export elite detection for use in other components
export { detectPlayFamily, computeFieldZone };
