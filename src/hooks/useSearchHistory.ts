/**
 * useSearchHistory Hook
 * Manages recent searches in localStorage for GlobalSearch component
 */
import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "bc_search_history";
const MAX_HISTORY_SIZE = 10;

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error("[useSearchHistory] Error loading history:", error);
    }
    return [];
  });

  // Save to localStorage whenever history changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("[useSearchHistory] Error saving history:", error);
    }
  }, [history]);

  /**
   * Add a search query to history
   * Prevents duplicates and limits to MAX_HISTORY_SIZE
   */
  const addToHistory = useCallback((query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || trimmedQuery.length < 2) {
      return; // Don't save very short queries
    }

    setHistory((prev) => {
      // Remove existing instance of this query
      const filtered = prev.filter((item) => item.query !== trimmedQuery);

      // Add to front with current timestamp
      const updated = [
        { query: trimmedQuery, timestamp: Date.now() },
        ...filtered,
      ];

      // Limit to MAX_HISTORY_SIZE
      return updated.slice(0, MAX_HISTORY_SIZE);
    });
  }, []);

  /**
   * Clear all search history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("[useSearchHistory] Error clearing history:", error);
    }
  }, []);

  /**
   * Remove a specific query from history
   */
  const removeFromHistory = useCallback((query: string) => {
    setHistory((prev) => prev.filter((item) => item.query !== query));
  }, []);

  /**
   * Get recent queries (sorted by timestamp, most recent first)
   */
  const getRecentSearches = useCallback(
    (limit?: number): string[] => {
      const sorted = [...history].sort((a, b) => b.timestamp - a.timestamp);
      const queries = sorted.map((item) => item.query);
      return limit ? queries.slice(0, limit) : queries;
    },
    [history]
  );

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
    getRecentSearches,
  };
}
