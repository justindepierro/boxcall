import { useState, useCallback } from "react";

import type { Play, PlayType } from "../types/play";

interface UsePlaybookState {
  plays: Play[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filters: {
    formation?: string;
    playType?: PlayType;
    down?: string;
    distance?: string;
    tags?: string[];
  };
}
interface UsePlaybookActions {
  setSearchQuery: (query: string) => void;
  setFilters: (filters: UsePlaybookState["filters"]) => void;
  createPlay: (
    play: Omit<Play, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  updatePlay: (id: string, updates: Partial<Play>) => Promise<void>;
  deletePlay: (id: string) => Promise<void>;
  duplicatePlay: (id: string) => Promise<void>;
  loadPlays: () => Promise<void>;
}
export const usePlaybook = (): UsePlaybookState & UsePlaybookActions => {
  const [state, setState] = useState<UsePlaybookState>({
    plays: [],
    loading: false,
    error: null,
    searchQuery: "",
    filters: {},
  });
  const setSearchQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query }));
  }, []);
  const setFilters = useCallback((filters: UsePlaybookState["filters"]) => {
    setState((prev) => ({ ...prev, filters }));
  }, []);
  const createPlay = useCallback(
    async (playData: Omit<Play, "id" | "created_at" | "updated_at">) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        // TODO: Implement API call to create play
        // Simulate API response
        const newPlay: Play = {
          ...playData,
          id: `play_${Date.now()}`,
          created_at: new Date(),
          updated_at: new Date(),
        };
        setState((prev) => ({
          ...prev,
          plays: [...prev.plays, newPlay],
          loading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error ? error.message : "Failed to create play",
        }));
      }
    },
    []
  );
  const updatePlay = useCallback(async (id: string, updates: Partial<Play>) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // TODO: Implement API call to update play
      setState((prev) => ({
        ...prev,
        plays: prev.plays.map((play) =>
          play.id === id
            ? { ...play, ...updates, updated_at: new Date() }
            : play
        ),
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to update play",
      }));
    }
  }, []);
  const deletePlay = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // TODO: Implement API call to delete play
      setState((prev) => ({
        ...prev,
        plays: prev.plays.filter((play) => play.id !== id),
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to delete play",
      }));
    }
  }, []);
  const duplicatePlay = useCallback(
    async (id: string) => {
      const playToDuplicate = state.plays.find((play) => play.id === id);
      if (!playToDuplicate) {
        setState((prev) => ({ ...prev, error: "Play not found" }));
        return;
      }
      // Create a new play without the ID and timestamps
      const {
        id: _,
        created_at: __,
        updated_at: ___,
        ...playData
      } = playToDuplicate;
      await createPlay({
        ...playData,
        play_name: `${playToDuplicate.play_name} (Copy)`,
      });
    },
    [state.plays, createPlay]
  );
  const loadPlays = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // TODO: Implement API call to load plays
      // For now, return empty array - will be populated by CSV import or manual creation
      setState((prev) => ({
        ...prev,
        plays: [],
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to load plays",
      }));
    }
  }, []);
  return {
    ...state,
    setSearchQuery,
    setFilters,
    createPlay,
    updatePlay,
    deletePlay,
    duplicatePlay,
    loadPlays,
  };
};
