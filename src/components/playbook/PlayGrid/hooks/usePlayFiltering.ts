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

interface UsePlayFilteringProps {
  plays: Play[];
  searchQuery: string;
  filters: PlayFilters;
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
  selectedCategory,
  selectedSubcategory,
  favoriteIds,
}: UsePlayFilteringProps): UsePlayFilteringResult {
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
      if (filters.playType && play.p_type !== filters.playType) return false;

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
        selectedCategory: selectedCategory || null,
        selectedSubcategory: selectedSubcategory || null,
        resultCount: filteredPlays.length,
        resultBucket: getResultBucket(filteredPlays.length),
      }),
    [
      searchQuery,
      filters.formation,
      filters.playType,
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
    Object.values(filters).some(
      (f) => f && (Array.isArray(f) ? f.length > 0 : true)
    );

  return { filteredPlays, hasFilters };
}
