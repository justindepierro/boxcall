/**
 * useGlobalSearch Hook
 *
 * Custom hook managing all state and logic for the GlobalSearch component.
 * Handles search queries, results, keyboard navigation, and mobile modal state.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getActiveTeamId } from "../../../utils/activeTeam";
import { supabase } from "../../../lib/supabase";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";
import { logError } from "../../../utils/logger";
import type { SearchResult, SearchResultType } from "./types";
import { debugLog } from "./types";
import {
  TYPE_ICON_MAP,
  TYPE_COLOR_MAP,
  DEFAULT_TYPE_ICON,
  DEFAULT_TYPE_COLOR,
  SEARCH_DEBOUNCE_MS,
  BLUR_CLOSE_DELAY_MS,
  MOBILE_FOCUS_DELAY_MS,
  SEARCH_LIMITS,
} from "./constants";

/**
 * Hook for managing global search state and behavior
 */
export function useGlobalSearch() {
  // State
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const playbookIdCacheRef = useRef<string | null>(null);

  // Navigation
  const navigate = useNavigate();

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
        const signal = abortControllerRef.current.signal;

        // Cache playbook_id to avoid repeated lookups
        let playbookId = playbookIdCacheRef.current;
        if (!playbookId) {
          const { data: playbooks } = await supabase
            .from("playbooks")
            .select("id")
            .eq("team_id", activeTeamId)
            .eq("is_active", true)
            .limit(1)
            .abortSignal(signal);

          playbookId = playbooks?.[0]?.id || null;
          playbookIdCacheRef.current = playbookId;
        }

        // Execute all searches in parallel with abort signals for speed
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
          // Search plays (only if we have a playbook)
          playbookId
            ? supabase
                .from("plays")
                .select(
                  "id, play_name, formation, one_word_play, personnel, p_type"
                )
                .eq("playbook_id", playbookId)
                .or(
                  `play_name.ilike.%${searchTerm}%,formation.ilike.%${searchTerm}%,one_word_play.ilike.%${searchTerm}%,personnel.ilike.%${searchTerm}%,p_type.ilike.%${searchTerm}%`
                )
                .limit(SEARCH_LIMITS.plays)
                .abortSignal(signal)
            : Promise.resolve({ data: null }),

          // Search formations (only if we have a playbook)
          playbookId
            ? supabase
                .from("formations")
                .select("id, name")
                .eq("playbook_id", playbookId)
                .ilike("name", `%${searchTerm}%`)
                .limit(SEARCH_LIMITS.formations)
                .abortSignal(signal)
            : Promise.resolve({ data: null }),

          // Search players
          supabase
            .from("team_players")
            .select("id, first_name, last_name, jersey_number, position")
            .eq("team_id", activeTeamId)
            .eq("is_active", true)
            .or(
              `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,nickname.ilike.%${searchTerm}%,position.ilike.%${searchTerm}%`
            )
            .limit(SEARCH_LIMITS.players)
            .abortSignal(signal),

          // Search team announcements
          // team_announcements table not yet in generated Database types
          (supabase as any)
            .from("team_announcements")
            .select("id, title, created_at")
            .eq("team_id", activeTeamId)
            .is("deleted_at", null)
            .ilike("title", `%${searchTerm}%`)
            .limit(SEARCH_LIMITS.announcements)
            .abortSignal(signal),

          // Search game plans
          supabase
            .from("game_plans")
            .select("id, opponent, game_date")
            .eq("team_id", activeTeamId)
            .ilike("opponent", `%${searchTerm}%`)
            .limit(SEARCH_LIMITS.gamePlans)
            .abortSignal(signal),

          // Search practice scripts
          supabase
            .from("practice_scripts")
            .select("id, title")
            .eq("team_id", activeTeamId)
            .ilike("title", `%${searchTerm}%`)
            .limit(SEARCH_LIMITS.practiceScripts)
            .abortSignal(signal),

          // Search calendar events
          supabase
            .from("calendar_events")
            .select("id, title, event_date, event_type")
            .eq("team_id", activeTeamId)
            .ilike("title", `%${searchTerm}%`)
            .limit(SEARCH_LIMITS.calendarEvents)
            .abortSignal(signal),

          // Search equipment
          supabase
            .from("equipment")
            .select("id, name, category, quantity")
            .eq("team_id", activeTeamId)
            .ilike("name", `%${searchTerm}%`)
            .limit(SEARCH_LIMITS.equipment)
            .abortSignal(signal),
        ]);

        const searchResults: SearchResult[] = [
          // Add plays
          ...(playsResponse.data || []).map((play) => ({
            type: "play" as const,
            id: play.id,
            title: play.one_word_play || play.play_name || "Unnamed Play",
            subtitle:
              `Play • ${play.formation || ""}${play.personnel ? ` • ${play.personnel}` : ""}${play.p_type ? ` • ${play.p_type}` : ""}`
                .replace(/• $/, "")
                .trim() || "Play",
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
          // Type assertion needed due to team_announcements not being in Database types
          ...(
            (announcementsResponse.data || []) as unknown as Array<{
              id: string;
              title: string;
              created_at: string;
            }>
          ).map((announcement) => ({
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
          debugLog(
            `🔍 Search completed in ${duration.toFixed(2)}ms - ${searchResults.length} results`
          );
        }
      } catch (error: any) {
        // Ignore abort errors
        if (error?.name !== "AbortError") {
          logError("Search error:", error);
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

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query);
    }, SEARCH_DEBOUNCE_MS);

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

  // Handlers
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      setSelectedIndex(-1);
      setIsOpen(true);
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpen, results, selectedIndex, isMobileModalOpen]
  );

  const handleResultClick = useCallback(
    (result: SearchResult) => {
      triggerHapticFeedback("light");
      navigate(result.url);
      setIsOpen(false);
      setIsMobileModalOpen(false);
      setQuery("");
      setResults([]);
    },
    [navigate]
  );

  const handleMobileSearchOpen = useCallback(() => {
    triggerHapticFeedback("light");
    setIsMobileModalOpen(true);
    setTimeout(() => mobileInputRef.current?.focus(), MOBILE_FOCUS_DELAY_MS);
  }, []);

  const handleMobileSearchClose = useCallback(() => {
    setIsMobileModalOpen(false);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  }, []);

  const handleFocus = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleBlur = useCallback(() => {
    setTimeout(() => setIsOpen(false), BLUR_CLOSE_DELAY_MS);
  }, []);

  const handleClear = useCallback(() => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
    triggerHapticFeedback("light");
  }, []);

  const handleMobileClear = useCallback(() => {
    setQuery("");
    setResults([]);
    mobileInputRef.current?.focus();
  }, []);

  // Memoized type helpers
  const getTypeIcon = useCallback(
    (type: SearchResultType) => TYPE_ICON_MAP[type] || DEFAULT_TYPE_ICON,
    []
  );

  const getTypeColor = useCallback(
    (type: SearchResultType) => TYPE_COLOR_MAP[type] || DEFAULT_TYPE_COLOR,
    []
  );

  return {
    // State
    query,
    results,
    isOpen,
    isLoading,
    selectedIndex,
    isMobileModalOpen,

    // Refs
    inputRef,
    mobileInputRef,
    containerRef,

    // Handlers
    handleInputChange,
    handleKeyDown,
    handleResultClick,
    handleMobileSearchOpen,
    handleMobileSearchClose,
    handleFocus,
    handleBlur,
    handleClear,
    handleMobileClear,

    // Helpers
    getTypeIcon,
    getTypeColor,
  };
}
