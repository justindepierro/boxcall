import React, { useState, useRef, useEffect, useMemo } from "react";
import { Icon } from "./Icon";
import { Typography } from "../design-system";
import { rosterService } from "../../services";
import { PlaybookSearchService } from "../../services/playbookSearchService";
import type { RosterPlayerView } from "../../services/rosterService";
import type { Play } from "../../types/play";
import { useNavigate, useLocation } from "react-router-dom";
import { getActiveTeamId } from "../../utils/activeTeam";
import { useTeamsData } from "../../hooks/useTeamsData";
import { usePlaybook } from "../../contexts/PlaybookContext";

interface GlobalSearchProps {
  className?: string;
}

interface SearchResult {
  type: "player" | "play" | "formation" | "mention";
  data:
    | RosterPlayerView
    | Play
    | string
    | { play: Play; player: RosterPlayerView };
  displayText: string;
  subText: string;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the current active team ID
  const teamId = getActiveTeamId();

  // Get plays data for search
  const { plays: allPlays } = useTeamsData();

  // Conditionally use playbook context if available (when on playbook page)
  let playbookContext: ReturnType<typeof usePlaybook> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    playbookContext = usePlaybook();
  } catch {
    // Not within PlaybookProvider, that's fine
  }

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
      // Prioritize plays, then formations, then players
      return results.sort((a, b) => {
        const priorityOrder = { play: 0, formation: 1, player: 2, mention: 3 };
        return priorityOrder[a.type] - priorityOrder[b.type];
      });
    } else if (context === "roster" || context === "team-settings") {
      // Prioritize players, then plays, then formations
      return results.sort((a, b) => {
        const priorityOrder = { player: 0, play: 1, formation: 2, mention: 3 };
        return priorityOrder[a.type] - priorityOrder[b.type];
      });
    }
    return results; // General context - keep original order
  };

  useEffect(() => {
    const searchAll = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const allResults: SearchResult[] = [];

        // Search players
        const allPlayers = await rosterService.listByTeam(teamId);
        const filteredPlayers = allPlayers
          .filter(
            (player) =>
              player.jersey_number?.toString().includes(query) ||
              player.position?.toLowerCase().includes(query.toLowerCase()) ||
              player.id.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 3); // Limit to 3 results per type

        allResults.push(
          ...filteredPlayers.map((player) => ({
            type: "player" as const,
            data: player,
            displayText: `Player ${player.jersey_number || "TBD"}`,
            subText: `${player.position || "Position TBD"} • ${player.status || "Status TBD"}`,
          }))
        );

        // Search plays using PlaybookSearchService
        if (allPlays && allPlays.length > 0) {
          // Update search service with current plays
          searchService.updatePlays(
            allPlays.map((play) => ({
              ...play,
              confidence_base: 70,
              times_called: 0,
              times_successful: 0,
              created_by: "system",
              created_at: new Date(play.created_at),
              updated_at: new Date(play.updated_at),
            }))
          );

          const playResults = searchService.search(query).slice(0, 3);
          allResults.push(
            ...playResults.map((result) => ({
              type: "play" as const,
              data: result.item,
              displayText: result.item.play_name,
              subText: `${result.item.formation} • ${result.item.p_type}`,
            }))
          );
        }

        // Search formations
        if (allPlays && allPlays.length > 0) {
          const uniqueFormations = [
            ...new Set(allPlays.map((play) => play.formation)),
          ];
          const filteredFormations = uniqueFormations
            .filter((formation) =>
              formation.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 2);

          allResults.push(
            ...filteredFormations.map((formation) => ({
              type: "formation" as const,
              data: formation,
              displayText: formation,
              subText: "Formation",
            }))
          );
        }

        // Search player mentions in plays - simplified for now
        // Note: The Play type from useTeamsData doesn't include key_player fields
        // This could be expanded later with a more complete Play type
        // For now, we'll skip player mentions

        // Reorder results based on current route context
        const reorderedResults = reorderResults(allResults, getSearchContext);

        setResults(reorderedResults);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchAll, 300);
    return () => clearTimeout(debounceTimer);
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
    if (e.key === "Escape") {
      setIsOpen(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleResultSelect(results[selectedIndex]);
      }
    }
  };

  const handleResultSelect = (result: SearchResult) => {
    if (result.type === "player") {
      // Navigate to player profile or team settings with player highlighted
      navigate(
        `/team/${teamId}/settings?tab=roster&player=${(result.data as RosterPlayerView).id}`
      );
    } else if (result.type === "play") {
      // Navigate to playbook with play highlighted
      navigate(`/playbook?play=${(result.data as Play).id}`);
    } else if (result.type === "formation") {
      // Navigate to playbook filtered by formation
      navigate(
        `/playbook?formation=${encodeURIComponent(result.data as string)}`
      );
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
          placeholder="Search players, plays, formations..."
          className="block w-80 pl-10 pr-10 py-2 text-sm rounded-lg
                     focus:ring-2 focus:ring-focus-info focus:border-border-info
                     placeholder-text-secondary transition-all duration-200
                     bg-surface-primary hover:bg-surface-secondary focus:bg-surface-primary"
        />

        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-secondary"
            type="button"
            aria-label="Clear search"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query.length > 0 || isLoading) && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-surface-primary rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          {isLoading && (
            <div className="px-4 py-3 text-center text-text-muted">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-text-info mx-auto mb-2"></div>
              Searching...
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

          {!isLoading && results.length > 0 && (
            <div className="py-1">
              {results.map((result, index) => {
                const getKey = () => {
                  switch (result.type) {
                    case "player":
                      return `player-${(result.data as RosterPlayerView).id}`;
                    case "play":
                      return `play-${(result.data as Play).id}`;
                    case "formation":
                      return `formation-${result.data as string}`;
                    case "mention": {
                      const mentionData = result.data as {
                        play: Play;
                        player: RosterPlayerView;
                      };
                      return `mention-${mentionData.play.id}-${mentionData.player.id}`;
                    }
                    default:
                      return `unknown-${index}`;
                  }
                };

                const getIconText = () => {
                  switch (result.type) {
                    case "player":
                      return (
                        (result.data as RosterPlayerView).jersey_number || "?"
                      );
                    case "play":
                      return "P";
                    case "formation":
                      return "F";
                    case "mention":
                      return "M";
                    default:
                      return "?";
                  }
                };

                return (
                  <button
                    key={getKey()}
                    onClick={() => handleResultSelect(result)}
                    className={`w-full px-4 py-3 text-left hover:bg-surface-hover focus:bg-surface-hover focus:outline-none ${
                      index === selectedIndex ? "bg-surface-info" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          result.type === "player"
                            ? "bg-surface-info"
                            : result.type === "play"
                              ? "bg-surface-success"
                              : result.type === "formation"
                                ? "bg-surface-warning"
                                : "bg-surface-secondary"
                        }`}
                      >
                        <Typography
                          variant="body-sm"
                          className={`font-medium ${
                            result.type === "player"
                              ? "text-text-info"
                              : result.type === "play"
                                ? "text-text-success"
                                : result.type === "formation"
                                  ? "text-text-warning"
                                  : "text-text-secondary"
                          }`}
                        >
                          {getIconText()}
                        </Typography>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Typography
                          variant="body-sm"
                          className="text-text-primary font-medium truncate"
                        >
                          {result.displayText}
                        </Typography>
                        <Typography
                          variant="body-xs"
                          className="text-text-muted truncate"
                        >
                          {result.subText}
                        </Typography>
                      </div>
                      <Icon
                        name="arrow-right"
                        className="h-4 w-4 text-text-muted flex-shrink-0"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {!isLoading && query.length < 2 && (
            <div className="px-4 py-3 text-center text-text-muted">
              Type at least 2 characters to search
            </div>
          )}
        </div>
      )}
    </div>
  );
};
