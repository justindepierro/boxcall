import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import { Typography } from "../design-system";
import { rosterService } from "../../services";
import { PlaybookSearchService } from "../../services/playsService";
import { PlaysQueryService } from "../../services/dataSyncService/PlaysQueryService";
import { FormationService } from "../../services/formationService";
import { PersonnelService } from "../../services/personnelService";
import type { RosterPlayerView } from "../../services/rosterService";
import type { Play } from "../../types/play";
import type { Formation } from "../../types/formation";
import type { PersonnelConfiguration } from "../../types/personnel";
import { useNavigate, useLocation } from "react-router-dom";
import { getActiveTeamId } from "../../utils/activeTeam";
import { useTeamsData } from "../../hooks/useTeamsData";
import { usePlaybook } from "../../contexts/PlaybookContext";
import { useSearchHistory } from "../../hooks/useSearchHistory";
import { Tooltip } from "./Tooltip/Tooltip";
import { supabase } from "../../lib/supabase";

interface GlobalSearchProps {
  className?: string;
}

interface SearchResult {
  type: "player" | "play" | "formation" | "personnel" | "mention";
  data:
    | RosterPlayerView
    | Play
    | Formation
    | PersonnelConfiguration
    | string
    | { play: Play; player: RosterPlayerView };
  displayText: string;
  subText: string;
  metadata?: string; // Additional info for display
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [activeFilter, setActiveFilter] = useState<
    SearchResult["type"] | "all"
  >("all");
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchCacheRef = useRef<
    Map<string, { results: SearchResult[]; timestamp: number }>
  >(new Map());
  const navigate = useNavigate();
  const location = useLocation();

  // Search history hook
  const { addToHistory, getRecentSearches, clearHistory } = useSearchHistory();

  // Get the current active team ID
  const teamId = getActiveTeamId();

  // Get plays data for search - prefer PlaybookContext if available
  const { plays: teamsDataPlays } = useTeamsData();

  // Conditionally use playbook context if available (when on playbook page)
  let playbookContext: ReturnType<typeof usePlaybook> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    playbookContext = usePlaybook();
  } catch {
    // Not within PlaybookProvider, that's fine
  }

  // Use teamsData plays (this is what's available)
  const allPlays = teamsDataPlays;

  // Global keyboard shortcut: Cmd/Ctrl + K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: Focus search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Transform DatabasePlay[] to Play[] by adding missing required fields
  const transformedPlays = useMemo(() => {
    return (allPlays || []).map(
      (play): Play => ({
        ...play,
        confidence_base: 70, // default value
        times_called: 0, // default value
        times_successful: 0, // default value
        created_by: "system", // default value
        created_at: new Date(play.created_at),
        updated_at: new Date(play.updated_at),
      })
    );
  }, [allPlays]);

  // Create search service instance for plays
  const searchService = useMemo(
    () => new PlaybookSearchService(transformedPlays),
    [transformedPlays]
  );

  // Determine search context based on current route
  const getSearchContext = useMemo(() => {
    const pathname = location.pathname;
    if (pathname === "/playbook") {
      return "playbook"; // Prioritize plays and formations
    } else if (pathname.includes("/settings") && pathname.includes("roster")) {
      return "roster"; // Prioritize players
    } else if (pathname.includes("/team/") && pathname.includes("/settings")) {
      return "team-settings"; // Prioritize players
    }
    return "general"; // No specific prioritization
  }, [location.pathname]);

  // Reorder results based on search context
  const reorderResults = (results: SearchResult[], context: string) => {
    if (context === "playbook") {
      // Prioritize plays, then formations, then personnel, then players
      return results.sort((a, b) => {
        const priorityOrder = {
          play: 0,
          formation: 1,
          personnel: 2,
          player: 3,
          mention: 4,
        };
        return priorityOrder[a.type] - priorityOrder[b.type];
      });
    } else if (context === "roster" || context === "team-settings") {
      // Prioritize players, then plays, then formations, then personnel
      return results.sort((a, b) => {
        const priorityOrder = {
          player: 0,
          play: 1,
          formation: 2,
          personnel: 3,
          mention: 4,
        };
        return priorityOrder[a.type] - priorityOrder[b.type];
      });
    }
    return results; // General context - keep original order
  };

  // Highlight matched text in search results
  const highlightMatch = (
    text: string,
    searchQuery: string
  ): React.ReactNode => {
    if (!searchQuery.trim()) return text;

    try {
      const regex = new RegExp(
        `(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi"
      );
      const parts = text.split(regex);

      return parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="bg-warning-100 dark:bg-warning-900/60 text-inherit"
          >
            {part}
          </mark>
        ) : (
          part
        )
      );
    } catch {
      return text; // Return original text if regex fails
    }
  };

  // Filter results based on active filter
  const filteredResults = useMemo(() => {
    if (activeFilter === "all") {
      return results;
    }
    return results.filter((result) => result.type === activeFilter);
  }, [results, activeFilter]);

  // Group results by type for grouped view
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {
      play: [],
      formation: [],
      personnel: [],
      player: [],
      mention: [],
    };

    filteredResults.forEach((result) => {
      groups[result.type].push(result);
    });

    // Return only non-empty groups in priority order
    return Object.entries(groups)
      .filter(([_, items]) => items.length > 0)
      .map(([type, items]) => ({ type, items }));
  }, [filteredResults]);

  // State for expanded groups (when showing more than 3 items)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Toggle group expansion
  const toggleGroupExpansion = (groupType: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupType)) {
        newSet.delete(groupType);
      } else {
        newSet.add(groupType);
      }
      return newSet;
    });
  };

  // Reset selectedIndex when filter changes or results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [activeFilter, results.length]);

  useEffect(() => {
    const searchAll = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      // � Check cache first
      const cacheKey = query.toLowerCase().trim();
      const cached = searchCacheRef.current.get(cacheKey);
      const CACHE_TTL = 60000; // 1 minute cache

      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setResults(cached.results);
        setIsLoading(false);
        return;
      }

      // � Cancel any previous search request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this search
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      setIsLoading(true);
      const startTime = performance.now();

      try {
        // 🚀 PARALLEL FETCHING: Execute all searches simultaneously
        const [playersResult, playsResult, formationsResult, personnelResult] =
          await Promise.allSettled([
            // Search 1: Players
            (async () => {
              const allPlayers = await rosterService.listByTeam(teamId);
              return allPlayers
                .filter(
                  (player) =>
                    player.jersey_number?.toString().includes(query) ||
                    player.position
                      ?.toLowerCase()
                      .includes(query.toLowerCase()) ||
                    player.first_name
                      ?.toLowerCase()
                      .includes(query.toLowerCase()) ||
                    player.last_name
                      ?.toLowerCase()
                      .includes(query.toLowerCase()) ||
                    player.id.toLowerCase().includes(query.toLowerCase())
                )
                .slice(0, 3)
                .map((player) => ({
                  type: "player" as const,
                  data: player,
                  displayText:
                    player.first_name && player.last_name
                      ? `${player.first_name} ${player.last_name}`
                      : `Player ${player.jersey_number || "TBD"}`,
                  subText: `${player.position || "Position TBD"} • ${player.is_active ? "Active" : "Inactive"}`,
                }));
            })(),

            // Search 2: Plays
            (async () => {
              let playsToSearch: Play[] = [];

              // Convert DatabasePlay[] to Play[] if available
              if (allPlays && allPlays.length > 0) {
                playsToSearch = allPlays.map((play) => ({
                  ...play,
                  created_by: "system",
                  created_at: new Date(play.created_at),
                  updated_at: new Date(play.updated_at),
                })) as unknown as Play[];
              } else {
                // Fallback: query database directly
                playsToSearch = await PlaysQueryService.getAllPlays(
                  supabase,
                  teamId
                );
              }

              if (playsToSearch.length > 0) {
                searchService.updatePlays(
                  playsToSearch.map((play: Play) => ({
                    ...play,
                    confidence_base: 70,
                    times_called: 0,
                    times_successful: 0,
                    created_by: play.created_by || "system",
                    created_at: new Date(play.created_at),
                    updated_at: new Date(play.updated_at),
                  }))
                );

                return searchService
                  .search(query)
                  .slice(0, 3)
                  .map((result) => ({
                    type: "play" as const,
                    data: result.item,
                    displayText: result.item.play_name,
                    subText: `${result.item.formation} • ${result.item.p_type}`,
                  }));
              }
              return [];
            })(),

            // Search 3: Formations
            (async () => {
              const formations =
                await FormationService.getFormationsByPlaybook(teamId);
              return formations
                .filter(
                  (formation) =>
                    formation.name
                      .toLowerCase()
                      .includes(query.toLowerCase()) ||
                    formation.category
                      ?.toLowerCase()
                      .includes(query.toLowerCase()) ||
                    formation.tags?.some((tag) =>
                      tag.toLowerCase().includes(query.toLowerCase())
                    ) ||
                    formation.description
                      ?.toLowerCase()
                      .includes(query.toLowerCase())
                )
                .slice(0, 3)
                .map((formation) => ({
                  type: "formation" as const,
                  data: formation,
                  displayText: formation.name,
                  subText: `${formation.direction === "left" ? "← " : formation.direction === "right" ? "→ " : ""}Formation${formation.category ? ` • ${formation.category}` : ""}`,
                  metadata: formation.personnel_name
                    ? `${formation.personnel_name} personnel`
                    : undefined,
                }));
            })(),

            // Search 4: Personnel
            (async () => {
              const personnelConfigs =
                await PersonnelService.getPersonnelConfigurations(teamId);
              return personnelConfigs
                .filter(
                  (personnel: PersonnelConfiguration) =>
                    personnel.name
                      .toLowerCase()
                      .includes(query.toLowerCase()) ||
                    personnel.description
                      ?.toLowerCase()
                      .includes(query.toLowerCase())
                )
                .slice(0, 2)
                .map((personnel: PersonnelConfiguration) => ({
                  type: "personnel" as const,
                  data: personnel,
                  displayText: personnel.name,
                  subText: `Personnel • ${personnel.players?.length || 0} positions`,
                  metadata: personnel.description || undefined,
                }));
            })(),
          ]);

        // Combine all successful results
        const allResults: SearchResult[] = [];

        if (playersResult.status === "fulfilled")
          allResults.push(...playersResult.value);
        if (playsResult.status === "fulfilled")
          allResults.push(...playsResult.value);
        if (formationsResult.status === "fulfilled")
          allResults.push(...formationsResult.value);
        if (personnelResult.status === "fulfilled")
          allResults.push(...personnelResult.value);

        // Reorder results based on current route context
        const reorderedResults = reorderResults(allResults, getSearchContext);

        const searchTime = performance.now() - startTime;
        console.log(
          `⚡ Search completed in ${searchTime.toFixed(0)}ms - ${reorderedResults.length} results`
        );

        // 💾 Store in cache
        searchCacheRef.current.set(cacheKey, {
          results: reorderedResults,
          timestamp: Date.now(),
        });

        setResults(reorderedResults);
      } catch (error) {
        // Don't set error state if request was aborted
        if (signal.aborted) {
          return;
        }
        console.error("❌ Search error:", error);
        setResults([]);
      } finally {
        // Only update loading state if this request wasn't aborted
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    const debounceTimer = setTimeout(searchAll, 150); // ⚡ Industry standard debounce
    return () => {
      clearTimeout(debounceTimer);
      // Cleanup: abort any pending requests when component unmounts or query changes
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, teamId, allPlays, searchService, getSearchContext]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  // Sync with playbook search when on playbook page
  useEffect(() => {
    if (
      location.pathname === "/playbook" &&
      playbookContext?.state.searchQuery !== undefined
    ) {
      setQuery(playbookContext.state.searchQuery);
    }
  }, [location.pathname, playbookContext?.state.searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setIsOpen(true);

    // If on playbook page and playbook context is available, also update playbook search
    if (location.pathname === "/playbook" && playbookContext) {
      playbookContext.dispatch({ type: "SET_SEARCH", query: newQuery });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Get the list of results to navigate (filtered or all)
    const navigableResults =
      filteredResults.length > 0 ? filteredResults : results;

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setSelectedIndex(-1);
      inputRef.current?.blur(); // ✨ Enhanced: Also blur input
    } else if (e.key === "Tab") {
      // ✨ New: Tab to cycle through results
      if (!isOpen || navigableResults.length === 0) {
        return; // Let default Tab behavior work if dropdown closed
      }
      e.preventDefault();
      if (e.shiftKey) {
        // Shift+Tab: Go backward
        setSelectedIndex((prev) =>
          prev <= 0 ? navigableResults.length - 1 : prev - 1
        );
      } else {
        // Tab: Go forward
        setSelectedIndex((prev) =>
          prev >= navigableResults.length - 1 ? 0 : prev + 1
        );
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < navigableResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Home") {
      // ✨ New: Jump to first result
      e.preventDefault();
      if (navigableResults.length > 0) {
        setSelectedIndex(0);
      }
    } else if (e.key === "End") {
      // ✨ New: Jump to last result
      e.preventDefault();
      if (navigableResults.length > 0) {
        setSelectedIndex(navigableResults.length - 1);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && navigableResults[selectedIndex]) {
        handleResultSelect(navigableResults[selectedIndex]);
      }
    }
  };

  const handleResultSelect = (result: SearchResult) => {
    // Add current query to search history
    if (query.trim()) {
      addToHistory(query.trim());
    }

    if (result.type === "player") {
      // Navigate to player profile or team settings with player highlighted
      navigate(
        `/team/${teamId}/settings?tab=roster&player=${(result.data as RosterPlayerView).id}`
      );
    } else if (result.type === "play") {
      // Navigate to playbook with play highlighted
      navigate(`/playbook?play=${(result.data as Play).id}`);
    } else if (result.type === "formation") {
      // Navigate to playbook with formation builder modal
      const formation = result.data as Formation;
      navigate(`/playbook?formation=${formation.id}`);
    } else if (result.type === "personnel") {
      // Navigate to playbook with personnel modal
      const personnel = result.data as PersonnelConfiguration;
      navigate(`/playbook?personnel=${personnel.id}`);
    } else if (result.type === "mention") {
      // Navigate to playbook with the play highlighted
      const mentionData = result.data as {
        play: Play;
        player: RosterPlayerView;
      };
      navigate(`/playbook?play=${mentionData.play.id}`);
    }
    setIsOpen(false);
    setQuery("");
    setSelectedIndex(-1);
  };

  const handleFocus = () => {
    setIsOpen(true);

    // Calculate dropdown position
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  const handleBlur = () => {
    // Delay closing to allow for result clicks
    setTimeout(() => setIsOpen(false), 150);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();

    // If on playbook page and playbook context is available, also clear playbook search
    if (location.pathname === "/playbook" && playbookContext) {
      playbookContext.dispatch({ type: "SET_SEARCH", query: "" });
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon name="search" className="h-4 w-4 text-text-muted" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Search plays, formations, personnel, players..."
          className="block w-80 pl-10 pr-20 py-2 text-sm rounded-lg border-none
                     focus:ring-2 focus:ring-focus-info focus:border-border-info
                     placeholder-text-secondary transition-all duration-200
                     bg-surface-primary hover:bg-surface-secondary focus:bg-surface-primary"
        />

        {/* Keyboard shortcut hint */}
        {!query && !isOpen && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-block px-2 py-1 text-xs bg-surface-secondary border border-border-subtle rounded text-text-muted font-mono">
              ⌘K
            </kbd>
          </div>
        )}

        {query && (
          <Tooltip content="Clear search">
            <button
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-secondary"
              type="button"
              aria-label="Clear search"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </Tooltip>
        )}
      </div>

      {/* Search Results Dropdown - Rendered as Portal */}
      {isOpen &&
        (query.length > 0 || isLoading || getRecentSearches().length > 0) &&
        createPortal(
          <div
            ref={resultsRef}
            className="fixed bg-surface-primary rounded-lg shadow-2xl z-[9999] max-h-80 overflow-y-auto"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {/* Recent Searches - Show when input is empty or very short */}
            {!isLoading &&
              query.length < 2 &&
              getRecentSearches().length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-2 flex items-center justify-between">
                    <Typography
                      variant="body-xs"
                      className="text-text-muted font-medium"
                    >
                      Recent Searches
                    </Typography>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearHistory();
                      }}
                      className="text-text-muted hover:text-text-primary text-xs"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-1">
                    {getRecentSearches(5).map((recentQuery, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setQuery(recentQuery);
                          inputRef.current?.focus();
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-surface-hover focus:bg-surface-hover focus:outline-none flex items-center space-x-3"
                      >
                        <Icon
                          name="clock"
                          className="h-4 w-4 text-text-muted flex-shrink-0"
                        />
                        <Typography
                          variant="body-sm"
                          className="text-text-primary truncate"
                        >
                          {recentQuery}
                        </Typography>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {isLoading && (
              <div className="py-2 space-y-1">
                {/* Loading Skeletons - 3 result placeholders */}
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="px-4 py-3 flex items-center space-x-3 animate-pulse"
                  >
                    <div className="w-8 h-8 rounded-full bg-surface-muted flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-surface-muted rounded w-3/4" />
                      <div className="h-3 bg-surface-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && results.length === 0 && query.length >= 2 && (
              <div className="px-4 py-3 text-center text-text-muted">
                <Icon
                  name="search"
                  className="h-8 w-8 mx-auto mb-2 text-text-muted"
                />
                No results found for "{query}"
              </div>
            )}

            {/* Filter Chips - Show when we have results */}
            {!isLoading && results.length > 0 && (
              <div className="border-b border-surface-muted px-3 py-2">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setActiveFilter("all")}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      activeFilter === "all"
                        ? "bg-surface-info text-text-info"
                        : "bg-surface-secondary text-text-secondary hover:bg-surface-hover"
                    }`}
                  >
                    All ({results.length})
                  </button>
                  {["play", "formation", "personnel", "player"].map(
                    (filterType) => {
                      const count = results.filter(
                        (r) => r.type === filterType
                      ).length;
                      if (count === 0) return null;

                      return (
                        <button
                          key={filterType}
                          onClick={() =>
                            setActiveFilter(filterType as SearchResult["type"])
                          }
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            activeFilter === filterType
                              ? "bg-surface-info text-text-info"
                              : "bg-surface-secondary text-text-secondary hover:bg-surface-hover"
                          }`}
                        >
                          {filterType === "play" && `Plays (${count})`}
                          {filterType === "formation" &&
                            `Formations (${count})`}
                          {filterType === "personnel" && `Personnel (${count})`}
                          {filterType === "player" && `Players (${count})`}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {!isLoading && results.length > 0 && (
              <div className="py-1">
                {filteredResults.length === 0 && (
                  <div className="px-4 py-3 text-center text-text-muted">
                    <Typography variant="body-sm">
                      No {activeFilter} results
                    </Typography>
                  </div>
                )}

                {/* Grouped Results View */}
                {groupedResults.map((group) => {
                  const groupTypeLabel = {
                    play: "Plays",
                    formation: "Formations",
                    personnel: "Personnel",
                    player: "Players",
                    mention: "Mentions",
                  }[group.type];

                  const isExpanded = expandedGroups.has(group.type);
                  const showExpandButton = group.items.length > 3;
                  const displayItems = isExpanded
                    ? group.items
                    : group.items.slice(0, 3);

                  return (
                    <div key={group.type} className="mb-2 last:mb-0">
                      {/* Group Header */}
                      <div className="px-4 py-2 bg-surface-muted border-b border-surface-secondary">
                        <Typography
                          variant="body-sm"
                          className="font-semibold text-text-primary"
                        >
                          {groupTypeLabel} ({group.items.length})
                        </Typography>
                      </div>

                      {/* Group Items */}
                      {displayItems.map((result) => {
                        // Calculate global index for keyboard navigation
                        const globalIndex = filteredResults.indexOf(result);

                        const getKey = () => {
                          switch (result.type) {
                            case "player":
                              return `player-${(result.data as RosterPlayerView).id}`;
                            case "play":
                              return `play-${(result.data as Play).id}`;
                            case "formation":
                              return `formation-${(result.data as Formation).id}`;
                            case "personnel":
                              return `personnel-${(result.data as PersonnelConfiguration).id}`;
                            case "mention": {
                              const mentionData = result.data as {
                                play: Play;
                                player: RosterPlayerView;
                              };
                              return `mention-${mentionData.play.id}-${mentionData.player.id}`;
                            }
                            default:
                              return `unknown-${globalIndex}`;
                          }
                        };

                        const getIconText = () => {
                          switch (result.type) {
                            case "player":
                              return (
                                (result.data as RosterPlayerView)
                                  .jersey_number || "?"
                              );
                            case "play":
                              return "P";
                            case "formation":
                              return "F";
                            case "personnel":
                              return (
                                (
                                  result.data as PersonnelConfiguration
                                ).name.split(" ")[0] || "G"
                              );
                            case "mention":
                              return "M";
                            default:
                              return "?";
                          }
                        };

                        const getIconColor = () => {
                          switch (result.type) {
                            case "player":
                              return "bg-surface-info";
                            case "play":
                              return "bg-surface-success";
                            case "formation":
                              return "bg-surface-warning";
                            case "personnel":
                              return "bg-purple-100 dark:bg-purple-900/30";
                            case "mention":
                              return "bg-surface-secondary";
                            default:
                              return "bg-surface-secondary";
                          }
                        };

                        const getTextColor = () => {
                          switch (result.type) {
                            case "player":
                              return "text-text-info";
                            case "play":
                              return "text-text-success";
                            case "formation":
                              return "text-text-warning";
                            case "personnel":
                              return "text-purple-700 dark:text-purple-300";
                            case "mention":
                              return "text-text-secondary";
                            default:
                              return "text-text-secondary";
                          }
                        };

                        return (
                          <button
                            key={getKey()}
                            onClick={() => handleResultSelect(result)}
                            className={`w-full px-4 py-3 text-left transition-all ${
                              globalIndex === selectedIndex
                                ? "bg-surface-info ring-2 ring-blue-500 ring-inset"
                                : "hover:bg-surface-hover"
                            } focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset`}
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor()}`}
                              >
                                <Typography
                                  variant="body-sm"
                                  className={`font-medium ${getTextColor()}`}
                                >
                                  {getIconText()}
                                </Typography>
                              </div>
                              <div className="flex-1 min-w-0">
                                <Typography
                                  variant="body-sm"
                                  className="text-text-primary font-medium truncate"
                                >
                                  {highlightMatch(result.displayText, query)}
                                </Typography>
                                <Typography
                                  variant="body-xs"
                                  className="text-text-muted truncate"
                                >
                                  {highlightMatch(result.subText, query)}
                                </Typography>
                                {result.metadata && (
                                  <Typography
                                    variant="body-xs"
                                    className="text-text-muted/70 truncate italic"
                                  >
                                    {result.metadata}
                                  </Typography>
                                )}
                              </div>
                              <Icon
                                name="arrow-right"
                                className="h-4 w-4 text-text-muted flex-shrink-0"
                              />
                            </div>
                          </button>
                        );
                      })}

                      {/* Show More/Less Button */}
                      {showExpandButton && (
                        <button
                          onClick={() => toggleGroupExpansion(group.type)}
                          className="w-full px-4 py-2 text-center text-text-info hover:bg-surface-hover text-sm font-medium"
                        >
                          {isExpanded
                            ? "Show less"
                            : `Show ${group.items.length - 3} more`}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {!isLoading && query.length < 2 && (
              <div className="px-4 py-3 text-center text-text-muted">
                Type at least 2 characters to search
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};
