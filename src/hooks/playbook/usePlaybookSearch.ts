/**
 * usePlaybookSearch - Hook for managing search and filtering in PlaybookPage
 *
 * Handles instant search without debouncing for performance
 * Manages filter state and suggestions
 */

import { useState, useEffect, useMemo } from "react";
import type { Play } from "../../types/play";

interface UsePlaybookSearchOptions {
  plays: Play[];
  searchQuery: string;
  isMobile: boolean;
}

export interface SearchSuggestions {
  formations: string[];
  playNames: string[];
  personnel: string[];
}

export function usePlaybookSearch({
  plays,
  searchQuery,
}: UsePlaybookSearchOptions) {
  const [suggestions, setSuggestions] = useState<SearchSuggestions>({
    formations: [],
    playNames: [],
    personnel: [],
  });

  // 🚀 INSTANT SEARCH: No debounce! Array filtering is fast enough (<10ms for 200 plays)
  const filteredPlays = useMemo(() => {
    if (!searchQuery.trim()) return plays;

    const query = searchQuery.toLowerCase().trim();
    return plays.filter((play) => {
      const searchableText = [
        play.play_name,
        play.formation,
        play.personnel,
        play.one_word_play,
        play.tags?.join(" "),
        play.flags?.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [plays, searchQuery]);

  // Load search suggestions
  const loadSuggestions = useMemo(() => {
    const formations = [
      ...new Set(
        plays.map((p) => p.formation).filter((f): f is string => Boolean(f))
      ),
    ];
    const playNames = [
      ...new Set(
        plays.map((p) => p.play_name).filter((n): n is string => Boolean(n))
      ),
    ];
    const personnel = [
      ...new Set(
        plays.map((p) => p.personnel).filter((p): p is string => Boolean(p))
      ),
    ];

    return () => setSuggestions({ formations, playNames, personnel });
  }, [plays]);

  // Load suggestions on mount and when plays change
  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  return {
    filteredPlays,
    suggestions,
    isSearchPending: false, // Never pending with instant search
  };
}
