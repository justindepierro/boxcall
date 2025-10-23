import { useState, useEffect, useCallback } from "react";
import { PlaysService } from "../../../services/playsService";
import {
  validateFormationName,
  validatePersonnelValue,
} from "../../../utils/playFieldValidation";

interface SuggestionState {
  formations: string[];
  playNames: string[];
  personnel: string[];
  playTypes: string[];
}

interface AISuggestionState {
  aiFormations: string[];
  aiPlayNames: string[];
  aiPersonnel: string[];
  generatedPlayNames: string[];
}

interface VisibilityState {
  formation: boolean;
  playName: boolean;
  personnel: boolean;
  playType: boolean;
}

/**
 * Enhanced AI-Powered Suggestions Hook
 * Combines fuzzy search with AI-powered recommendations
 * Extracted from AddNewPlayModal to reduce file complexity
 */
export const useAISuggestions = (playbookId?: string) => {
  // Basic suggestions (existing fuzzy search)
  const [suggestions, setSuggestions] = useState<SuggestionState>({
    formations: [],
    playNames: [],
    personnel: [],
    playTypes: [],
  });

  // AI-powered suggestions
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestionState>({
    aiFormations: [],
    aiPlayNames: [],
    aiPersonnel: [],
    generatedPlayNames: [],
  });

  // Visibility toggles for suggestion dropdowns
  const [visibility, setVisibility] = useState<VisibilityState>({
    formation: false,
    playName: false,
    personnel: false,
    playType: false,
  });

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isAILoading, setIsAILoading] = useState(false);

  // Current context for AI suggestions
  const [currentContext, setCurrentContext] = useState({
    formation: "",
    playType: "",
    personnel: "",
  });

  // Load basic suggestions on mount
  useEffect(() => {
    const loadBasicSuggestions = async () => {
      try {
        setIsLoading(true);
        const [formations, playNames, personnel, playTypes] = await Promise.all([
          PlaysService.getUniqueFormations(),
          PlaysService.getUniquePlayNames(),
          PlaysService.getUniquePersonnel(),
          PlaysService.getUniquePlayTypes(),
        ]);

        setSuggestions({
          formations: formations.filter(
            (formation) => validateFormationName(formation).isValid
          ),
          playNames,
          personnel: personnel.filter((value) =>
            validatePersonnelValue(value).isValid
          ),
          playTypes,
        });
      } catch (error) {
        console.error("Failed to load basic suggestions:", error);
        // Keep empty arrays on error
      } finally {
        setIsLoading(false);
      }
    };

    loadBasicSuggestions();
  }, []);

  // Load AI suggestions when context changes
  useEffect(() => {
    const loadAISuggestions = async () => {
      if (!playbookId) return;

      try {
        setIsAILoading(true);

        const [aiFormations, aiPlayNames, aiPersonnel] = await Promise.all([
          PlaysService.getAISuggestedFormations(currentContext.formation, playbookId, 5),
          PlaysService.getAISuggestedPlayNames(
            currentContext.formation,
            currentContext.playType,
            playbookId,
            5
          ),
          PlaysService.getAISuggestedPersonnel(currentContext.formation, playbookId, 5),
        ]);

        // Generate contextual play name suggestions
        const generatedPlayNames = PlaysService.generatePlayNameSuggestions(
          currentContext.formation,
          currentContext.playType,
          suggestions.playNames
        );

        setAiSuggestions({
          aiFormations,
          aiPlayNames,
          aiPersonnel,
          generatedPlayNames,
        });
      } catch (error) {
        console.error("Failed to load AI suggestions:", error);
      } finally {
        setIsAILoading(false);
      }
    };

    // Debounce AI suggestions loading
    const timeoutId = setTimeout(loadAISuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [currentContext, playbookId, suggestions.playNames]);

  // Update context when form values change
  const updateContext = useCallback((field: keyof typeof currentContext, value: string) => {
    setCurrentContext(prev => ({ ...prev, [field]: value }));
  }, []);

  // Filter basic suggestions based on input
  const filterBasicSuggestions = useCallback(
    (type: keyof SuggestionState, input: string, maxResults = 5): string[] => {
      if (!input.trim()) return [];

      const suggestionList = suggestions[type];
      const filtered = suggestionList.filter((suggestion) =>
        suggestion.toLowerCase().includes(input.toLowerCase())
      );

      return filtered.slice(0, maxResults);
    },
    [suggestions]
  );

  // Get combined suggestions (AI + basic fuzzy search)
  const getCombinedSuggestions = useCallback(
    (type: keyof SuggestionState, input: string, maxResults = 8): string[] => {
      const aiKey = `ai${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof AISuggestionState;
      const generatedKey = type === 'playNames' ? 'generatedPlayNames' : null;

      const aiSuggestionsList = aiSuggestions[aiKey] as string[];
      const generatedSuggestions = generatedKey ? (aiSuggestions[generatedKey] as string[]) : [];
      const basicFiltered = filterBasicSuggestions(type, input, maxResults);

      // Combine and deduplicate: AI suggestions first, then generated, then basic fuzzy matches
      const combined = [
        ...aiSuggestionsList,
        ...generatedSuggestions,
        ...basicFiltered
      ];

      return [...new Set(combined)].slice(0, maxResults);
    },
    [aiSuggestions, filterBasicSuggestions]
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

  // Check if suggestions are visible
  const isSuggestionsVisible = useCallback(
    (type: keyof VisibilityState) => {
      return visibility[type];
    },
    [visibility]
  );

  // Get suggestion counts for UI indicators
  const getSuggestionCounts = useCallback(() => {
    return {
      formations: aiSuggestions.aiFormations.length,
      playNames: aiSuggestions.aiPlayNames.length + aiSuggestions.generatedPlayNames.length,
      personnel: aiSuggestions.aiPersonnel.length,
      playTypes: suggestions.playTypes.length, // AI not implemented for play types yet
    };
  }, [aiSuggestions, suggestions.playTypes]);

  return {
    // Data
    suggestions,
    aiSuggestions,
    isLoading,
    isAILoading,

    // Context management
    updateContext,
    currentContext,

    // Visibility state
    isSuggestionsVisible,

    // Actions
    showSuggestions,
    hideSuggestions,
    toggleSuggestions,
    getCombinedSuggestions,
    getSuggestionCounts,
  };
};