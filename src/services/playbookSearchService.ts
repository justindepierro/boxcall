/**
 * Advanced Playbook Search Service
 * Fuzzy search with typo tolerance, quick filters, and smart suggestions
 */

import Fuse from "fuse.js";

import type { Play } from "../types/play";
import type { FuseResultMatch, IFuseOptions } from "fuse.js";

export interface SearchResult<T> {
  item: T;
  score?: number;
  matches?: readonly FuseResultMatch[];
}

export interface QuickFilter {
  id: string;
  label: string;
  description: string;
  filter: (play: Play) => boolean;
  color: "red" | "blue" | "green" | "orange" | "purple";
  icon: string;
}

export interface SearchPreset {
  id: string;
  name: string;
  query: string;
  filters: string[];
  description: string;
}

export class PlaybookSearchService {
  private fuse: Fuse<Play>;
  private searchHistory: string[] = [];
  private maxHistorySize = 20;

  // Quick filter definitions
  public quickFilters: QuickFilter[] = [
    {
      id: "red-zone",
      label: "Red Zone",
      description: "Plays designed for red zone (inside 20 yard line)",
      filter: (play) =>
        play.ftag1?.toLowerCase().includes("red-zone") ||
        play.ftag2?.toLowerCase().includes("red-zone") ||
        play.p_tag1?.toLowerCase().includes("red-zone") ||
        play.p_tag2?.toLowerCase().includes("red-zone") ||
        play.notes?.toLowerCase().includes("red zone") ||
        play.play_name.toLowerCase().includes("goal"),
      color: "red",
      icon: "target",
    },
    {
      id: "goal-line",
      label: "Goal Line",
      description: "Short yardage plays for goal line situations",
      filter: (play) =>
        play.ftag1?.toLowerCase().includes("goal-line") ||
        play.ftag2?.toLowerCase().includes("goal-line") ||
        play.p_tag1?.toLowerCase().includes("goal-line") ||
        play.p_tag2?.toLowerCase().includes("goal-line") ||
        play.notes?.toLowerCase().includes("goal line") ||
        play.pref_dis === "1-2",
      color: "green",
      icon: "football", // If not in registry, fallback to "help-circle"
    },
    {
      id: "two-minute",
      label: "2-Minute",
      description: "Hurry-up offense for 2-minute drill",
      filter: (play) =>
        play.ftag1?.toLowerCase().includes("two-minute") ||
        play.ftag2?.toLowerCase().includes("two-minute") ||
        play.p_tag1?.toLowerCase().includes("two-minute") ||
        play.p_tag2?.toLowerCase().includes("two-minute") ||
        (play.notes?.toLowerCase().includes("hurry") ?? false) ||
        (play.notes?.toLowerCase().includes("2-minute") ?? false),
      color: "orange",
      icon: "clock",
    },
    {
      id: "third-down",
      label: "3rd Down",
      description: "Third down conversion plays",
      filter: (play) =>
        play.pref_down === "3" ||
        play.ftag1?.toLowerCase().includes("third-down") ||
        play.ftag2?.toLowerCase().includes("third-down") ||
        play.p_tag1?.toLowerCase().includes("third-down") ||
        play.p_tag2?.toLowerCase().includes("third-down") ||
        (play.notes?.toLowerCase().includes("3rd") ?? false),
      color: "blue",
      icon: "refresh",
    },
    {
      id: "high-success",
      label: "High Success",
      description: "Plays with high success rates (>80%)",
      filter: (play) => {
        // Calculate success rate from times_called and times_successful
        if (play.times_called > 0) {
          const successRate = (play.times_successful / play.times_called) * 100;
          return successRate > 80;
        }
        // For plays with high confidence but no game data yet
        return play.confidence_base > 85;
      },
      color: "green",
      icon: "star",
    },
    {
      id: "play-action",
      label: "Play Action",
      description: "Play action passing plays",
      filter: (play) => play.p_type === "Play Action",
      color: "purple",
      icon: "users", // If not in registry, fallback to "help-circle"
    },
  ];

  // Search presets for common situations
  public searchPresets: SearchPreset[] = [
    {
      id: "my-favorites",
      name: "My Favorites",
      query: "",
      filters: ["high-success"],
      description: "Your most successful plays",
    },
    {
      id: "short-yardage",
      name: "Short Yardage",
      query: "power dive",
      filters: ["goal-line"],
      description: "1-2 yards to go situations",
    },
    {
      id: "long-yardage",
      name: "Long Yardage",
      query: "",
      filters: ["third-down"],
      description: "3rd & 7+ situations",
    },
    {
      id: "scoring-plays",
      name: "Scoring Plays",
      query: "",
      filters: ["red-zone", "goal-line"],
      description: "Red zone and goal line plays",
    },
  ];

  constructor(plays: Play[]) {
    // Configure Fuse.js for optimal football play searching
    const fuseOptions: IFuseOptions<Play> = {
      keys: [
        {
          name: "play_name",
          weight: 0.4,
        },
        {
          name: "formation",
          weight: 0.3,
        },
        {
          name: "p_type",
          weight: 0.2,
        },
        {
          name: "notes",
          weight: 0.1,
        },
      ],
      threshold: 0.4, // More lenient for typos
      distance: 100, // Allow longer distances for matches
      minMatchCharLength: 2,
      includeScore: true,
      includeMatches: true,
      findAllMatches: true,
    };

    this.fuse = new Fuse(plays, fuseOptions);
    this.loadSearchHistory();
  }

  /**
   * Perform fuzzy search with typo tolerance
   */
  search(query: string): SearchResult<Play>[] {
    if (!query.trim()) {
      return [];
    }

    // Add to search history
    this.addToHistory(query);

    // Perform fuzzy search
    const results = this.fuse.search(query);

    return results.map((result) => ({
      item: result.item,
      score: result.score,
      matches: result.matches,
    }));
  }

  /**
   * Apply quick filters to plays
   */
  applyQuickFilters(plays: Play[], activeFilters: string[]): Play[] {
    if (activeFilters.length === 0) {
      return plays;
    }

    return plays.filter((play) => {
      return activeFilters.every((filterId) => {
        const filter = this.quickFilters.find((f) => f.id === filterId);
        return filter ? filter.filter(play) : true;
      });
    });
  }

  /**
   * Get search suggestions based on history and common terms
   */
  getSearchSuggestions(query: string, limit: number = 5): string[] {
    if (!query.trim()) {
      return this.searchHistory.slice(0, limit);
    }

    const queryLower = query.toLowerCase();

    // Common football terms for suggestions
    const commonTerms = [
      "slant",
      "fade",
      "curl",
      "comeback",
      "hitch",
      "dig",
      "post",
      "go",
      "screen",
      "draw",
      "power",
      "sweep",
      "dive",
      "counter",
      "toss",
      "shotgun",
      "pistol",
      "i-form",
      "singleback",
      "twins",
      "trips",
      "play action",
      "rollout",
      "bootleg",
      "quick game",
      "deep ball",
    ];

    // Filter suggestions based on query
    const suggestions = [...this.searchHistory, ...commonTerms]
      .filter((term) => term.toLowerCase().includes(queryLower))
      .filter((term, index, arr) => arr.indexOf(term) === index) // Remove duplicates
      .slice(0, limit);

    return suggestions;
  }

  /**
   * Get plays by preset
   */
  getPlaysByPreset(preset: SearchPreset, plays: Play[]): Play[] {
    let filteredPlays = plays;

    // Apply quick filters
    if (preset.filters.length > 0) {
      filteredPlays = this.applyQuickFilters(plays, preset.filters);
    }

    // Apply search query
    if (preset.query.trim()) {
      const searchResults = this.search(preset.query);
      const searchPlayIds = new Set(searchResults.map((r) => r.item.id));
      filteredPlays = filteredPlays.filter((play) =>
        searchPlayIds.has(play.id)
      );
    }

    return filteredPlays;
  }

  /**
   * Add query to search history
   */
  private addToHistory(query: string): void {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || trimmedQuery.length < 2) {
      return;
    }

    // Remove if already exists
    this.searchHistory = this.searchHistory.filter((q) => q !== trimmedQuery);

    // Add to beginning
    this.searchHistory.unshift(trimmedQuery);

    // Limit history size
    this.searchHistory = this.searchHistory.slice(0, this.maxHistorySize);

    // Save to localStorage
    this.saveSearchHistory();
  }

  /**
   * Load search history from localStorage
   */
  private loadSearchHistory(): void {
    try {
      const saved = localStorage.getItem("playbook_search_history");
      if (saved) {
        this.searchHistory = JSON.parse(saved);
      }
    } catch (error) {
// console.warn("Failed to load search history:", error);
      this.searchHistory = [];
    }
  }

  /**
   * Save search history to localStorage
   */
  private saveSearchHistory(): void {
    try {
      localStorage.setItem(
        "playbook_search_history",
        JSON.stringify(this.searchHistory)
      );
    } catch (error) {
// console.warn("Failed to save search history:", error);
    }
  }

  /**
   * Clear search history
   */
  clearHistory(): void {
    this.searchHistory = [];
    this.saveSearchHistory();
  }

  /**
   * Update plays data (when new plays are added/modified)
   */
  updatePlays(plays: Play[]): void {
    this.fuse.setCollection(plays);
  }
}
