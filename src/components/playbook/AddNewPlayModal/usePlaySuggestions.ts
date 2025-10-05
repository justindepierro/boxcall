import { useState, useEffect, useCallback } from "react";
import { PlaysService } from "../../../services/playsService";

interface SuggestionState {
  formations: string[];
  playNames: string[];
  personnel: string[];
}

interface VisibilityState {
  formation: boolean;
  playName: boolean;
  personnel: boolean;
}

/**
 * Custom hook for managing fuzzy search suggestions
 * Extracted from AddNewPlayModal to reduce file complexity
 */
export const usePlaySuggestions = () => {
  // Suggestion data
  const [suggestions, setSuggestions] = useState<SuggestionState>({
    formations: [],
    playNames: [],
    personnel: [],
  });

  // Visibility toggles for suggestion dropdowns
  const [visibility, setVisibility] = useState<VisibilityState>({
    formation: false,
    playName: false,
    personnel: false,
  });

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Load all suggestions on mount
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        setIsLoading(true);
        const [formations, playNames, personnel] = await Promise.all([
          PlaysService.getUniqueFormations(),
          PlaysService.getUniquePlayNames(),
          PlaysService.getUniquePersonnel(),
        ]);

        setSuggestions({
          formations,
          playNames,
          personnel,
        });
      } catch (error) {
        console.error("Failed to load suggestions:", error);
        // Keep empty arrays on error
      } finally {
        setIsLoading(false);
      }
    };

    loadSuggestions();
  }, []);

  // Filter suggestions based on input
  const filterSuggestions = useCallback(
    (
      type: keyof SuggestionState,
      input: string,
      maxResults = 5
    ): string[] => {
      if (!input.trim()) return [];

      const suggestionList = suggestions[type];
      const filtered = suggestionList.filter((suggestion) =>
        suggestion.toLowerCase().includes(input.toLowerCase())
      );

      return filtered.slice(0, maxResults);
    },
    [suggestions]
  );

  // Show suggestions dropdown
  const showSuggestions = useCallback((type: keyof VisibilityState) => {
    setVisibility((prev) => ({ ...prev, [type]: true }));
  }, []);

  // Hide suggestions dropdown
  const hideSuggestions = useCallback((type: keyof VisibilityState) => {
    setVisibility((prev) => ({ ...prev, [type]: false }));
  }, []);

  // Toggle suggestions dropdown
  const toggleSuggestions = useCallback((type: keyof VisibilityState) => {
    setVisibility((prev) => ({ ...prev, [type]: !prev[type] }));
  }, []);

  // Get filtered suggestions for a specific type
  const getFilteredSuggestions = useCallback(
    (type: keyof SuggestionState, input: string, maxResults?: number) => {
      return filterSuggestions(type, input, maxResults);
    },
    [filterSuggestions]
  );

  // Check if suggestions are visible
  const isSuggestionsVisible = useCallback(
    (type: keyof VisibilityState) => {
      return visibility[type];
    },
    [visibility]
  );

  return {
    // Data
    suggestions,
    isLoading,

    // Visibility state
    isSuggestionsVisible,

    // Actions
    showSuggestions,
    hideSuggestions,
    toggleSuggestions,
    getFilteredSuggestions,
  };
};
