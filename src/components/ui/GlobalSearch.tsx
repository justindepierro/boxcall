import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
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
  type:
    | "play"
    | "formation"
    | "player"
    | "announcement"
    | "game_plan"
    | "practice_script"
    | "calendar_event"
    | "equipment";
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

// Memoized result item component for performance
const SearchResultItem = React.memo<{
  result: SearchResult;
  index: number;
  selectedIndex: number;
  getTypeIcon: (type: SearchResult["type"]) => string;
  getTypeColor: (type: SearchResult["type"]) => string;
  onClick: (result: SearchResult) => void;
}>(({ result, index, selectedIndex, getTypeIcon, getTypeColor, onClick }) => {
  const isSelected = index === selectedIndex;

  return (
    <button
      onClick={() => onClick(result)}
      className={`w-full px-5 py-3.5 text-left 
        flex items-center space-x-4
        transition-all duration-200 ease-out
        border-l-4
        ${
          isSelected
            ? "bg-jade-50 dark:bg-jade-900/20 border-jade-500"
            : "border-transparent hover:bg-neutral-50 dark:hover:bg-navy-700/50 hover:border-jade-300 dark:hover:border-jade-700"
        }
        group`}
    >
      {/* Icon Container */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-xl 
          flex items-center justify-center
          transition-all duration-200
          ${
            isSelected
              ? "bg-jade-100 dark:bg-jade-900/40 scale-110"
              : "bg-neutral-100 dark:bg-navy-700 group-hover:scale-105"
          }`}
      >
        <Icon
          name={getTypeIcon(result.type) as any}
          className={`h-5 w-5 ${getTypeColor(result.type)} transition-transform group-hover:scale-110`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <Typography
          variant="body-sm"
          className="font-semibold text-navy-900 dark:text-white truncate mb-0.5"
        >
          {result.title}
        </Typography>
        <Typography
          variant="body-xs"
          className="text-neutral-500 dark:text-neutral-400 truncate"
        >
          {result.subtitle}
        </Typography>
      </div>

      {/* Arrow indicator */}
      <Icon
        name="chevron-right"
        className={`h-4 w-4 text-neutral-400 transition-all duration-200
          ${isSelected ? "opacity-100 translate-x-1" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1"}`}
      />
    </button>
  );
});

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const abortControllerRef = useRef<AbortController | null>(null);
  const playbookIdCacheRef = useRef<string | null>(null);

  // Get active team
  const activeTeamId = getActiveTeamId();

  // Search function - optimized for blazing fast performance
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim() || !activeTeamId) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      const startTime = performance.now();

      try {
        const searchTerm = searchQuery.toLowerCase().trim();

        // Cache playbook_id to avoid repeated lookups
        let playbookId = playbookIdCacheRef.current;
        if (!playbookId) {
          const { data: playbooks } = await supabase
            .from("playbooks")
            .select("id")
            .eq("team_id", activeTeamId)
            .eq("is_active", true)
            .limit(1)
            .abortSignal(abortControllerRef.current.signal);

          playbookId = playbooks?.[0]?.id || null;
          playbookIdCacheRef.current = playbookId;
        }

        // Execute all searches in parallel with abort signals for speed
        const signal = abortControllerRef.current.signal;
        const [
          playsResponse,
          formationsResponse,
          playersResponse,
          announcementsResponse,
          gamePlansResponse,
          practiceScriptsResponse,
          calendarEventsResponse,
          equipmentResponse,
        ] = await Promise.all([
          // Search plays (only if we have a playbook) - limit to 2 for speed
          playbookId
            ? supabase
                .from("plays")
                .select("id, play_name, formation")
                .eq("playbook_id", playbookId)
                .or(
                  `play_name.ilike.%${searchTerm}%,formation.ilike.%${searchTerm}%,one_word_play.ilike.%${searchTerm}%`
                )
                .limit(2)
                .abortSignal(signal)
            : Promise.resolve({ data: null }),

          // Search formations (only if we have a playbook)
          playbookId
            ? supabase
                .from("formations")
                .select("id, name")
                .eq("playbook_id", playbookId)
                .ilike("name", `%${searchTerm}%`)
                .limit(2)
                .abortSignal(signal)
            : Promise.resolve({ data: null }),

          // Search players - only essential fields
          supabase
            .from("team_players")
            .select("id, first_name, last_name, jersey_number, position")
            .eq("team_id", activeTeamId)
            .eq("is_active", true)
            .or(
              `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,nickname.ilike.%${searchTerm}%,position.ilike.%${searchTerm}%`
            )
            .limit(2)
            .abortSignal(signal),

          // Search team announcements - title only for speed
          supabase
            .from("team_announcements")
            .select("id, title, created_at")
            .eq("team_id", activeTeamId)
            .is("deleted_at", null)
            .ilike("title", `%${searchTerm}%`)
            .limit(2)
            .abortSignal(signal),

          // Search game plans
          supabase
            .from("game_plans")
            .select("id, opponent, game_date")
            .eq("team_id", activeTeamId)
            .ilike("opponent", `%${searchTerm}%`)
            .limit(2)
            .abortSignal(signal),

          // Search practice scripts
          supabase
            .from("practice_scripts")
            .select("id, title")
            .eq("team_id", activeTeamId)
            .ilike("title", `%${searchTerm}%`)
            .limit(2)
            .abortSignal(signal),

          // Search calendar events
          supabase
            .from("calendar_events")
            .select("id, title, event_date, event_type")
            .eq("team_id", activeTeamId)
            .ilike("title", `%${searchTerm}%`)
            .limit(2)
            .abortSignal(signal),

          // Search equipment
          supabase
            .from("equipment")
            .select("id, name, category, quantity")
            .eq("team_id", activeTeamId)
            .ilike("name", `%${searchTerm}%`)
            .limit(2)
            .abortSignal(signal),
        ]);

        const searchResults: SearchResult[] = [
          // Add plays
          ...(playsResponse.data || []).map((play) => ({
            type: "play" as const,
            id: play.id,
            title: play.play_name,
            subtitle: `Play • Formation: ${play.formation || "Unknown"}`,
            url: `/playbook`,
          })),

          // Add formations
          ...(formationsResponse.data || []).map((formation) => ({
            type: "formation" as const,
            id: formation.id,
            title: formation.name,
            subtitle: "Formation",
            url: `/playbook`,
          })),

          // Add players
          ...(playersResponse.data || []).map((player) => ({
            type: "player" as const,
            id: player.id,
            title:
              `${player.first_name || ""} ${player.last_name || ""}`.trim(),
            subtitle: `Player • #${player.jersey_number || "N/A"} ${player.position || ""}`,
            url: `/roster`,
          })),

          // Add announcements
          ...(announcementsResponse.data || []).map((announcement) => ({
            type: "announcement" as const,
            id: announcement.id,
            title: announcement.title,
            subtitle: `Announcement • ${new Date(announcement.created_at).toLocaleDateString()}`,
            url: `/team-bulletin`,
          })),

          // Add game plans
          ...(gamePlansResponse.data || []).map((gamePlan) => ({
            type: "game_plan" as const,
            id: gamePlan.id,
            title: `vs ${gamePlan.opponent}`,
            subtitle: `Game Plan • ${new Date(gamePlan.game_date).toLocaleDateString()}`,
            url: `/game-plans`,
          })),

          // Add practice scripts
          ...(practiceScriptsResponse.data || []).map((script) => ({
            type: "practice_script" as const,
            id: script.id,
            title: script.title,
            subtitle: "Practice Script",
            url: `/practice`,
          })),

          // Add calendar events
          ...(calendarEventsResponse.data || []).map((event) => ({
            type: "calendar_event" as const,
            id: event.id,
            title: event.title,
            subtitle: `${event.event_type || "Event"} • ${new Date(event.event_date).toLocaleDateString()}`,
            url: `/calendar`,
          })),

          // Add equipment
          ...(equipmentResponse.data || []).map((item) => ({
            type: "equipment" as const,
            id: item.id,
            title: item.name,
            subtitle: `Equipment • ${item.category} (${item.quantity} available)`,
            url: `/equipment`,
          })),
        ];

        setResults(searchResults);

        // Performance logging (dev only)
        if (import.meta.env.DEV) {
          const duration = performance.now() - startTime;
          console.log(
            `🔍 Search completed in ${duration.toFixed(2)}ms - ${searchResults.length} results`
          );
        }
      } catch (error: any) {
        // Ignore abort errors
        if (error?.name !== "AbortError") {
          console.error("Search error:", error);
          setResults([]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [activeTeamId]
  );

  // Clear playbook cache when team changes
  useEffect(() => {
    playbookIdCacheRef.current = null;
  }, [activeTeamId]);

  // Optimized debounced search - faster debounce for instant feel
  useEffect(() => {
    // Clear immediately for empty query
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    // Shorter debounce for snappy feel (150ms instead of 300ms)
    const timer = setTimeout(() => {
      performSearch(query);
    }, 150);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Global keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        if (!isOpen || results.length === 0) return;
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        if (!isOpen || results.length === 0) return;
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        if (!isOpen || results.length === 0) return;
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        if (isMobileModalOpen) {
          handleMobileSearchClose();
        } else {
          setIsOpen(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
        }
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    triggerHapticFeedback("light");
    navigate(result.url);
    setIsOpen(false);
    setIsMobileModalOpen(false);
    setQuery("");
    setResults([]);
  };

  const handleMobileSearchOpen = () => {
    triggerHapticFeedback("light");
    setIsMobileModalOpen(true);
    // Focus input after modal opens
    setTimeout(() => mobileInputRef.current?.focus(), 100);
  };

  const handleMobileSearchClose = () => {
    setIsMobileModalOpen(false);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const handleMobileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
    setIsOpen(true);
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleBlur = () => {
    // Delay closing to allow for result clicks
    setTimeout(() => setIsOpen(false), 150);
  };

  // Memoized icon/color maps for performance
  const typeIconMap = useMemo(
    () => ({
      play: "play",
      formation: "users",
      player: "user",
      announcement: "bell",
      game_plan: "clipboard-list",
      practice_script: "list",
      calendar_event: "calendar",
      equipment: "folder",
    }),
    []
  );

  const typeColorMap = useMemo(
    () => ({
      play: "text-blue-600",
      formation: "text-green-600",
      player: "text-purple-600",
      announcement: "text-orange-600",
      game_plan: "text-red-600",
      practice_script: "text-teal-600",
      calendar_event: "text-indigo-600",
      equipment: "text-amber-600",
    }),
    []
  );

  const getTypeIcon = useCallback(
    (type: SearchResult["type"]) => typeIconMap[type] || ("search" as any),
    [typeIconMap]
  );

  const getTypeColor = useCallback(
    (type: SearchResult["type"]) => typeColorMap[type] || "text-gray-600",
    [typeColorMap]
  );

  return (
    <>
      {/* Mobile/Tablet: Search Button */}
      <button
        onClick={handleMobileSearchOpen}
        className={`md:hidden flex items-center justify-center gap-2 px-4 py-2.5 min-w-28
          bg-gradient-to-r from-jade-500 to-jade-600
          hover:from-jade-600 hover:to-jade-700
          active:scale-95
          border-2 border-jade-600
          rounded-xl shadow-md hover:shadow-lg
          transition-all duration-200 ease-out
          ${className}`}
      >
        <Icon name="search" className="h-5 w-5 text-white" />
        <span className="text-base font-semibold text-white">Search</span>
      </button>

      {/* Desktop: Full Search Field */}
      <div
        ref={containerRef}
        className={`hidden md:block relative ${className}`}
      >
        <div className="relative group">
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <Icon
              name="search"
              className="h-5 w-5 text-neutral-400 group-focus-within:text-jade-500 transition-colors duration-200"
              aria-hidden="true"
            />
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Search anything..."
            className="w-full h-12 pl-12 pr-12 
            bg-white dark:bg-navy-800/50
            border-2 border-neutral-200 dark:border-navy-700
            rounded-2xl
            text-navy-900 dark:text-white
            placeholder-neutral-400 dark:placeholder-neutral-500
            transition-all duration-300 ease-in-out
            hover:border-jade-300 dark:hover:border-jade-700
            focus:outline-none focus:ring-4 focus:ring-jade-500/20 focus:border-jade-500 dark:focus:border-jade-500
            shadow-sm hover:shadow-md focus:shadow-lg
            backdrop-blur-sm"
            aria-label="Global search"
          />

          {/* Clear Button */}
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
                inputRef.current?.focus();
                triggerHapticFeedback("light");
              }}
              className="absolute inset-y-0 right-0 pr-4 flex items-center z-10
              text-neutral-400 hover:text-navy-900 dark:hover:text-white
              transition-colors duration-200"
              aria-label="Clear search"
            >
              <div className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-navy-700/50 transition-colors">
                <Icon name="close" className="h-4 w-4" />
              </div>
            </button>
          )}

          {/* Loading Indicator */}
          {isLoading && !query && (
            <div className="absolute inset-y-0 right-12 flex items-center pr-3">
              <Icon
                name="loader"
                className="h-4 w-4 text-jade-500 animate-spin"
              />
            </div>
          )}

          {/* Keyboard Shortcut Hint */}
          {!query && !isOpen && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <div className="hidden sm:flex items-center space-x-1 text-xs text-neutral-400 dark:text-neutral-500">
                <kbd className="px-2 py-1 bg-neutral-100 dark:bg-navy-700 border border-neutral-200 dark:border-navy-600 rounded-md font-mono">
                  ⌘K
                </kbd>
              </div>
            </div>
          )}
        </div>

        {/* Search Results Dropdown - Premium Design */}
        {isOpen && (query.length > 0 || isLoading) && (
          <div
            className="absolute top-full left-0 right-0 mt-3
            bg-white dark:bg-navy-800 
            border-2 border-neutral-200 dark:border-navy-700
            rounded-2xl 
            shadow-2xl 
            backdrop-blur-xl
            z-[100]
            max-h-96 
            overflow-hidden
            animate-in fade-in slide-in-from-top-2 duration-300"
          >
            {isLoading ? (
              <div className="px-6 py-8 text-center">
                <Icon
                  name="loader"
                  className="h-8 w-8 text-jade-500 animate-spin mx-auto mb-3"
                />
                <Typography
                  variant="body-sm"
                  className="text-neutral-500 dark:text-neutral-400"
                >
                  Searching across your content...
                </Typography>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2 overflow-y-auto max-h-96 custom-scrollbar">
                {results.map((result, index) => (
                  <SearchResultItem
                    key={`${result.type}-${result.id}`}
                    result={result}
                    index={index}
                    selectedIndex={selectedIndex}
                    getTypeIcon={getTypeIcon}
                    getTypeColor={getTypeColor}
                    onClick={handleResultClick}
                  />
                ))}
              </div>
            ) : query.length >= 2 ? (
              <div className="px-6 py-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-navy-700 flex items-center justify-center">
                  <Icon name="search" className="h-8 w-8 text-neutral-400" />
                </div>
                <Typography
                  variant="body-sm"
                  className="font-medium text-navy-900 dark:text-white mb-1"
                >
                  No results found
                </Typography>
                <Typography
                  variant="body-xs"
                  className="text-neutral-500 dark:text-neutral-400"
                >
                  Try searching for plays, players, or announcements
                </Typography>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Mobile Search Modal */}
      {isMobileModalOpen && (
        <div className="fixed inset-0 z-[200] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleMobileSearchClose}
          />

          {/* Modal Content */}
          <div className="absolute inset-x-0 top-0 bg-white dark:bg-navy-900 shadow-2xl">
            <div className="p-4 space-y-4">
              {/* Header with close button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleMobileSearchClose}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-navy-800 rounded-lg transition-colors"
                  aria-label="Close search"
                >
                  <Icon name="x" className="h-6 w-6 text-neutral-500" />
                </button>
                <Typography
                  variant="headline-sm"
                  className="text-primary flex-1"
                >
                  Search BoxCall
                </Typography>
              </div>

              {/* Search Input */}
              <div
                className="relative flex items-center
                bg-neutral-50 dark:bg-navy-800
                border-2 border-neutral-200 dark:border-navy-700
                focus-within:border-jade-500
                rounded-xl shadow-sm focus-within:shadow-md
                transition-all duration-300"
              >
                <div className="flex items-center pl-4 pr-3">
                  <Icon
                    name="search"
                    className="h-5 w-5 text-neutral-400 dark:text-neutral-500"
                  />
                </div>
                <input
                  ref={mobileInputRef}
                  type="text"
                  value={query}
                  onChange={handleMobileInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Search plays, players, plans..."
                  className="flex-1 py-3 pr-4 bg-transparent text-navy-900 dark:text-white
                    placeholder:text-neutral-400 dark:placeholder:text-neutral-500
                    font-medium text-base outline-none"
                />
                {query && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setResults([]);
                      mobileInputRef.current?.focus();
                    }}
                    className="mr-3 p-1.5 hover:bg-neutral-200 dark:hover:bg-navy-700 rounded-lg transition-colors"
                    aria-label="Clear search"
                  >
                    <Icon name="x" className="h-4 w-4 text-neutral-500" />
                  </button>
                )}
              </div>

              {/* Results */}
              <div className="max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar">
                {isLoading ? (
                  <div className="px-6 py-8 text-center">
                    <Icon
                      name="loader"
                      className="h-8 w-8 text-jade-500 animate-spin mx-auto mb-3"
                    />
                    <Typography
                      variant="body-sm"
                      className="text-neutral-500 dark:text-neutral-400"
                    >
                      Searching...
                    </Typography>
                  </div>
                ) : results.length > 0 ? (
                  <div className="space-y-1">
                    {results.map((result, index) => (
                      <SearchResultItem
                        key={`${result.type}-${result.id}`}
                        result={result}
                        index={index}
                        selectedIndex={selectedIndex}
                        getTypeIcon={getTypeIcon}
                        getTypeColor={getTypeColor}
                        onClick={handleResultClick}
                      />
                    ))}
                  </div>
                ) : query.length >= 2 ? (
                  <div className="px-6 py-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-navy-700 flex items-center justify-center">
                      <Icon
                        name="search"
                        className="h-8 w-8 text-neutral-400"
                      />
                    </div>
                    <Typography
                      variant="body-sm"
                      className="font-medium text-navy-900 dark:text-white mb-1"
                    >
                      No results found
                    </Typography>
                    <Typography
                      variant="body-xs"
                      className="text-neutral-500 dark:text-neutral-400"
                    >
                      Try searching for plays, players, or announcements
                    </Typography>
                  </div>
                ) : (
                  <div className="px-6 py-8 text-center">
                    <Typography
                      variant="body-sm"
                      className="text-neutral-500 dark:text-neutral-400"
                    >
                      Start typing to search across all your content
                    </Typography>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
