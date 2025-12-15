/**
 * useGlobalSearch Hook
 *
 * Custom hook managing all state and logic for the GlobalSearch component.
 * Handles search queries, results, keyboard navigation, and mobile modal state.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getActiveTeamId } from "../../../utils/activeTeam";
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
} from "./constants";
import { executeSearchQueries, getPlaybookId } from "./searchQueries";
import { mapSearchResults } from "./searchResultMappers";

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
          playbookId = await getPlaybookId(activeTeamId, signal);
          playbookIdCacheRef.current = playbookId;
        }

        // Execute all searches in parallel
        const rawResults = await executeSearchQueries({
          searchTerm,
          activeTeamId,
          playbookId,
          signal,
        });

        // Map results to SearchResult format
        const searchResults = mapSearchResults(rawResults);
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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      handleKeyboardNavigation(e, {
        isOpen,
        results,
        selectedIndex,
        isMobileModalOpen,
        setSelectedIndex,
        handleResultClick,
        handleMobileSearchClose,
        setIsOpen,
        inputRef,
      });
    },
    [
      isOpen,
      results,
      selectedIndex,
      isMobileModalOpen,
      handleResultClick,
      handleMobileSearchClose,
    ]
  );

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

// Keyboard navigation handler extracted for clarity
interface KeyboardNavParams {
  isOpen: boolean;
  results: SearchResult[];
  selectedIndex: number;
  isMobileModalOpen: boolean;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  handleResultClick: (result: SearchResult) => void;
  handleMobileSearchClose: () => void;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  inputRef: React.RefObject<HTMLInputElement>;
}

function handleKeyboardNavigation(
  e: React.KeyboardEvent,
  params: KeyboardNavParams
): void {
  const {
    isOpen,
    results,
    selectedIndex,
    isMobileModalOpen,
    setSelectedIndex,
    handleResultClick,
    handleMobileSearchClose,
    setIsOpen,
    inputRef,
  } = params;

  switch (e.key) {
    case "ArrowDown":
      if (!isOpen || results.length === 0) return;
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
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
}
