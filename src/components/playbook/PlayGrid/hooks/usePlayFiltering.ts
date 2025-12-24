/**
 * usePlayFiltering Hook
 * Handles play filtering logic including search, category, and filter-based filtering
 */

import { useMemo, useEffect, useRef } from "react";
import type { Play } from "../../../../types/play";
import { getPlayFlags } from "@utils/localPlayFlags";
import {
  getPlayCategory,
  playMatchesSubcategory,
} from "../../../../utils/playbook-categories";
import { telemetry } from "../../../../telemetry/dispatcher";
import { TelemetryEventTypes } from "../../../../telemetry/events";

function getResultBucket(resultCount: number): "0" | "1-10" | "11-50" | ">50" {
  if (resultCount === 0) return "0";
  if (resultCount <= 10) return "1-10";
  if (resultCount <= 50) return "11-50";
  return ">50";
}

interface PlayFilters {
  formation?: string;
  playType?: string;
  down?: string;
  distance?: string;
  tags?: string[];
}

interface AdvancedFilter {
  id: string;
  field: string;
  operator: "equals" | "contains" | "in";
  value: string | string[];
  label: string;
}

interface UsePlayFilteringProps {
  plays: Play[];
  searchQuery: string;
  filters: PlayFilters;
  advancedFilters?: AdvancedFilter[];
  selectedCategory?: string;
  selectedSubcategory?: string;
  favoriteIds: string[];
}

interface UsePlayFilteringResult {
  filteredPlays: Play[];
  hasFilters: boolean;
}

export function usePlayFiltering({
  plays,
  searchQuery,
  filters,
  advancedFilters = [],
  selectedCategory,
  selectedSubcategory,
  favoriteIds,
}: UsePlayFilteringProps): UsePlayFilteringResult {
  function normalizeText(value: unknown): string {
    return String(value ?? "").trim().toLowerCase();
  }

  function normalizeTextArray(value: unknown): string[] {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value
        .map((v) => normalizeText(v))
        .filter((v) => v.length > 0);
    }
    const str = normalizeText(value);
    return str ? [str] : [];
  }

  function playFieldValue(play: Play, field: string): unknown {
    switch (field) {
      case "name":
        return play.play_name;
      case "formation":
        return play.formation;
      case "playType":
      case "category":
        return play.p_type;
      case "description":
        return play.notes;
      case "personnel":
        return play.personnel;
      case "down":
        return play.pref_down;
      case "distance":
        return play.pref_dis;
      case "fieldPosition":
        // No single source-of-truth column yet; best-effort.
        return (
          (play as any).pref_field_pos ??
          (play as any).pref_field_position ??
          (play as any).field_position ??
          play.flags ??
          play.notes
        );
      case "tags":
        return [
          ...(play.tags ?? []),
          ...(play.flags ?? []),
          ...(play.ftag1 ? [play.ftag1] : []),
          ...(play.ftag2 ? [play.ftag2] : []),
          ...(play.p_tag1 ? [play.p_tag1] : []),
          ...(play.p_tag2 ? [play.p_tag2] : []),
        ];
      case "timesUsed":
        return play.times_called;
      case "successRate":
        return (play as any).success_rate;
      case "yardsPerPlay":
        return (play as any).avg_yards;
      default:
        return (play as any)[field];
    }
  }

  function matchesAdvancedFilter(play: Play, filter: AdvancedFilter): boolean {
    const left = playFieldValue(play, filter.field);

    const leftNumber =
      typeof left === "number" ? left : Number.parseFloat(String(left));
    const filterNumber =
      typeof filter.value === "string"
        ? Number.parseFloat(filter.value)
        : Number.NaN;

    if (!Number.isNaN(leftNumber) && !Number.isNaN(filterNumber)) {
      if (filter.operator === "equals") return leftNumber === filterNumber;
      return true;
    }

    const leftValues = Array.isArray(left)
      ? normalizeTextArray(left)
      : [normalizeText(left)].filter(Boolean);

    if (filter.operator === "equals") {
      if (Array.isArray(filter.value)) {
        const allowed = filter.value.map(normalizeText).filter(Boolean);
        return leftValues.some((v) => allowed.includes(v));
      }
      const expected = normalizeText(filter.value);
      return leftValues.some((v) => v === expected);
    }

    if (filter.operator === "contains") {
      const needle = normalizeText(filter.value);
      return leftValues.some((v) => v.includes(needle));
    }

    if (filter.operator === "in") {
      const allowed = Array.isArray(filter.value)
        ? filter.value.map(normalizeText).filter(Boolean)
        : [normalizeText(filter.value)].filter(Boolean);
      return leftValues.some((v) => allowed.includes(v));
    }

    return true;
  }

  // Apply filters to plays
  const filteredPlays = useMemo(() => {
    let result = plays.filter((play) => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = play.play_name.toLowerCase().includes(query);
        const matchesFormation = play.formation.toLowerCase().includes(query);
        const matchesNotes = play.notes?.toLowerCase().includes(query);
        let matchesFlags = false;
        if (!matchesName && !matchesFormation && !matchesNotes) {
          const flags = getPlayFlags(play.id);
          const haystack = [
            ...flags.positions,
            ...flags.players,
            ...flags.flags,
          ]
            .join("\n")
            .toLowerCase();
          matchesFlags = haystack.includes(query);
          if (!matchesFlags) return false;
        }
      }

      // Quick Win: Favorites filter
      if (selectedCategory === "favorites") {
        return favoriteIds.includes(play.id);
      }

      // Category-based filtering from Smart Playbook Glossary
      if (selectedCategory && selectedCategory !== "most-used") {
        const playCategories = getPlayCategory(play);
        if (!playCategories.includes(selectedCategory)) {
          return false;
        }

        // Subcategory filtering (more specific filtering within categories)
        if (selectedSubcategory) {
          if (!playMatchesSubcategory(play, selectedSubcategory)) {
            return false;
          }
        }
      }

      // Formation filter
      if (filters.formation && play.formation !== filters.formation)
        return false;

      // Play type filter
      if (
        filters.playType &&
        play.p_type?.toLowerCase() !== filters.playType.toLowerCase()
      )
        return false;

      // Preferred down filter
      if (filters.down) {
        const downNeedle = normalizeText(filters.down);
        const downHaystack = normalizeText(play.pref_down);
        if (!downHaystack || !downHaystack.includes(downNeedle)) return false;
      }

      // Preferred distance filter
      if (filters.distance) {
        const distanceNeedle = normalizeText(filters.distance);
        const distanceHaystack = normalizeText(play.pref_dis);
        if (!distanceHaystack || !distanceHaystack.includes(distanceNeedle)) {
          return false;
        }
      }

      // Tags filter (matches tags + legacy tags + flags)
      if (filters.tags && filters.tags.length > 0) {
        const required = filters.tags.map(normalizeText).filter(Boolean);
        const haystack = normalizeTextArray([
          ...(play.tags ?? []),
          ...(play.flags ?? []),
          ...(play.ftag1 ? [play.ftag1] : []),
          ...(play.ftag2 ? [play.ftag2] : []),
          ...(play.p_tag1 ? [play.p_tag1] : []),
          ...(play.p_tag2 ? [play.p_tag2] : []),
        ]);

        const hasAny = required.some((tag) => haystack.includes(tag));
        if (!hasAny) return false;
      }

      // Advanced filters
      if (advancedFilters.length > 0) {
        for (const af of advancedFilters) {
          if (!matchesAdvancedFilter(play, af)) return false;
        }
      }

      return true;
    });

    // Quick Win: Most Used sorting
    if (selectedCategory === "most-used") {
      result = [...result].sort(
        (a, b) => (b.times_called || 0) - (a.times_called || 0)
      );
    }

    return result;
  }, [
    plays,
    searchQuery,
    filters,
    advancedFilters,
    selectedCategory,
    selectedSubcategory,
    favoriteIds,
  ]);

  // Telemetry tracking
  const lastFilterSignatureRef = useRef<string | null>(null);
  const filterSignature = useMemo(
    () =>
      JSON.stringify({
        search: !!searchQuery,
        searchLength: searchQuery?.length || 0,
        formation: filters.formation || null,
        playType: filters.playType || null,
        advancedFiltersCount: advancedFilters.length,
        selectedCategory: selectedCategory || null,
        selectedSubcategory: selectedSubcategory || null,
        resultCount: filteredPlays.length,
        resultBucket: getResultBucket(filteredPlays.length),
      }),
    [
      searchQuery,
      filters.formation,
      filters.playType,
      advancedFilters.length,
      selectedCategory,
      selectedSubcategory,
      filteredPlays.length,
    ]
  );

  useEffect(() => {
    if (lastFilterSignatureRef.current === filterSignature) return;
    lastFilterSignatureRef.current = filterSignature;
    telemetry.enqueue({
      type: TelemetryEventTypes.FilterApply,
      data: JSON.parse(filterSignature),
    });
  }, [filterSignature]);

  const hasFilters: boolean =
    !!searchQuery ||
    !!selectedCategory ||
    !!selectedSubcategory ||
    advancedFilters.length > 0 ||
    Object.values(filters).some(
      (f) => f && (Array.isArray(f) ? f.length > 0 : true)
    );

  return { filteredPlays, hasFilters };
}
