import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import { Typography } from "../design-system";
import { useNavigate } from "react-router-dom";
import { getActiveTeamId } from "../../utils/activeTeam";
import { supabase } from "../../lib/supabase";
import { triggerHapticFeedback } from "../../lib/hapticFeedback";

interface GlobalSearchProps {
  className?: string;
}

interface SearchResult {
  type: "play" | "formation" | "player";
  id: string;
  title: string;
  subtitle: string;
  url: string;
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
  const navigate = useNavigate();

  // Get active team
  const activeTeamId = getActiveTeamId();

  // Search function - simplified to avoid complex service dependencies
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim() || !activeTeamId) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const searchTerm = searchQuery.toLowerCase().trim();

        // Search plays
        const { data: plays } = await supabase
          .from("plays")
          .select("id, play_name, formation")
          .eq("team_id", activeTeamId)
          .ilike("play_name", `%${searchTerm}%`)
          .limit(5);

        // Search formations
        const { data: formations } = await supabase
          .from("formations")
          .select("id, name")
          .eq("team_id", activeTeamId)
          .ilike("name", `%${searchTerm}%`)
          .limit(5);

        // Search players
        const { data: players } = await supabase
          .from("team_players")
          .select("id, first_name, last_name, jersey_number, position")
          .eq("team_id", activeTeamId)
          .or(
            `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`
          )
          .limit(5);

        const searchResults: SearchResult[] = [
          // Add plays
          ...(plays || []).map((play) => ({
            type: "play" as const,
            id: play.id,
            title: play.play_name,
            subtitle: `Formation: ${play.formation || "Unknown"}`,
            url: `/playbook/play/${play.id}`,
          })),
          // Add formations
          ...(formations || []).map((formation) => ({
            type: "formation" as const,
            id: formation.id,
            title: formation.name,
            subtitle: "Formation",
            url: `/formations/${formation.id}`,
          })),
          // Add players
          ...(players || []).map((player) => ({
            type: "player" as const,
            id: player.id,
            title:
              `${player.first_name || ""} ${player.last_name || ""}`.trim(),
            subtitle: `Jersey #${player.jersey_number || "N/A"} • ${player.position || "Unknown"}`,
            url: `/roster/player/${player.id}`,
          })),
        ];

        setResults(searchResults);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [activeTeamId]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, activeTeamId, performSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    triggerHapticFeedback("light");
    navigate(result.url);
    setIsOpen(false);
    setQuery("");
    setResults([]);
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleBlur = () => {
    // Delay closing to allow for result clicks
    setTimeout(() => setIsOpen(false), 150);
  };

  const getTypeIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "play":
        return "play";
      case "formation":
        return "users";
      case "player":
        return "user";
      default:
        return "search";
    }
  };

  const getTypeColor = (type: SearchResult["type"]) => {
    switch (type) {
      case "play":
        return "text-blue-600";
      case "formation":
        return "text-green-600";
      case "player":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon
            name="search"
            className="h-4 w-4 text-secondary"
            aria-hidden="true"
          />
        </div>

        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Search plays, formations, players..."
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:border-transparent text-primary placeholder-text-secondary"
          aria-label="Global search"
        />

        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            aria-label="Clear search"
          >
            <Icon
              name="close"
              className="h-4 w-4 text-secondary hover:text-primary"
            />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen &&
        (query.length > 0 || isLoading) &&
        createPortal(
          <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-3 text-center">
                <Typography variant="body-sm" className="text-secondary">
                  Searching...
                </Typography>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className={`w-full px-4 py-3 text-left hover:bg-muted flex items-start space-x-3 ${
                      index === selectedIndex ? "bg-muted" : ""
                    }`}
                  >
                    <Icon
                      name={getTypeIcon(result.type)}
                      className={`h-4 w-4 mt-0.5 ${getTypeColor(result.type)}`}
                    />
                    <div className="flex-1 min-w-0">
                      <Typography
                        variant="body-sm"
                        className="font-medium text-primary truncate"
                      >
                        {result.title}
                      </Typography>
                      <Typography
                        variant="body-xs"
                        className="text-secondary truncate"
                      >
                        {result.subtitle}
                      </Typography>
                    </div>
                  </button>
                ))}
              </div>
            ) : query.length >= 2 ? (
              <div className="px-4 py-3 text-center">
                <Typography variant="body-sm" className="text-secondary">
                  No results found for "{query}"
                </Typography>
              </div>
            ) : null}
          </div>,
          document.body
        )}
    </div>
  );
};
