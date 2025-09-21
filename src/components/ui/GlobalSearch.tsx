import React, { useState, useRef, useEffect } from "react";
import { Icon } from "./Icon";
import { Typography } from "../design-system";
import { rosterService } from "../../services";
import type { RosterPlayerView } from "../../services/rosterService";
import { useNavigate } from "react-router-dom";

interface GlobalSearchProps {
  className?: string;
}

interface SearchResult {
  type: "player";
  data: RosterPlayerView;
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

  // Mock team ID - in real app this would come from context/auth
  const teamId = "current-team";

  useEffect(() => {
    const searchPlayers = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        // In a real implementation, you'd have a search endpoint
        // For now, we'll fetch all players and filter client-side
        const allPlayers = await rosterService.listByTeam(teamId);
        const filteredPlayers = allPlayers.filter(player =>
          player.jersey_number?.toString().includes(query) ||
          player.position?.toLowerCase().includes(query.toLowerCase()) ||
          player.id.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5); // Limit to 5 results

        const searchResults: SearchResult[] = filteredPlayers.map(player => ({
          type: "player",
          data: player,
          displayText: `Player ${player.jersey_number || "TBD"}`,
          subText: `${player.position || "Position TBD"} • ${player.status || "Status TBD"}`,
        }));

        setResults(searchResults);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchPlayers, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, teamId]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev =>
        prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
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
      navigate(`/team-settings?tab=roster&player=${result.data.id}`);
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
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon
            name="search"
            className="h-4 w-4 text-gray-400"
          />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Search players, plays..."
          className="block w-80 pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     placeholder-gray-400 transition-all duration-200
                     bg-white hover:bg-gray-50 focus:bg-white"
        />

        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
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
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          {isLoading && (
            <div className="px-4 py-3 text-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-2"></div>
              Searching...
            </div>
          )}

          {!isLoading && results.length === 0 && query.length >= 2 && (
            <div className="px-4 py-3 text-center text-gray-500">
              <Icon name="search" className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              No results found for "{query}"
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="py-1">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.data.id}`}
                  onClick={() => handleResultSelect(result)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${
                    index === selectedIndex ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Typography variant="body-sm" className="text-blue-600 font-medium">
                        {result.type === "player" ? (result.data.jersey_number || "?") : "?"}
                      </Typography>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Typography variant="body-sm" className="text-gray-900 font-medium truncate">
                        {result.displayText}
                      </Typography>
                      <Typography variant="body-xs" className="text-gray-500 truncate">
                        {result.subText}
                      </Typography>
                    </div>
                    <Icon name="arrow-right" className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {!isLoading && query.length < 2 && (
            <div className="px-4 py-3 text-center text-gray-400">
              Type at least 2 characters to search
            </div>
          )}
        </div>
      )}
    </div>
  );
};