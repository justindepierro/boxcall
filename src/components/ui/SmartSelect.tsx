import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Select } from "./Select";
import { Button } from "./Button/Button";
import { Icon } from "./Icon";

interface SmartSelectProps {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  onCreateOption?: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  searchable?: boolean;
  createOption?: boolean;
  caseNormalization?: "lowercase" | "uppercase" | "titlecase" | "none";
  enableFuzzyMatching?: boolean;
  fuzzyThreshold?: number; // Minimum similarity score (0-1) for suggestions
  showSuggestions?: boolean;
  className?: string;
}

/**
 * SmartSelect - A Select component with intelligent input normalization and fuzzy matching
 *
 * Features:
 * - Case normalization (lowercase, uppercase, titlecase, or none)
 * - Fuzzy matching for "did you mean" suggestions
 * - Automatic space trimming and normalization
 * - Visual feedback for suggestions
 * - Prevents data duplication through consistent formatting
 */
export const SmartSelect: React.FC<SmartSelectProps> = ({
  options,
  value,
  onChange,
  onCreateOption,
  placeholder,
  label,
  required,
  searchable = true,
  createOption = false,
  caseNormalization = "lowercase",
  enableFuzzyMatching = true,
  fuzzyThreshold = 0.6,
  showSuggestions = true,
  className,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<
    Array<{ value: string; label: string; score: number }>
  >([]);
  const [showSuggestionBanner, setShowSuggestionBanner] = useState(false);

  // Normalize text based on the specified case normalization
  const normalizeText = useCallback(
    (text: string): string => {
      const trimmed = text.trim();
      switch (caseNormalization) {
        case "lowercase":
          return trimmed.toLowerCase();
        case "uppercase":
          return trimmed.toUpperCase();
        case "titlecase":
          return trimmed.replace(
            /\w\S*/g,
            (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          );
        case "none":
        default:
          return trimmed;
      }
    },
    [caseNormalization]
  );

  // Calculate Levenshtein distance for fuzzy matching
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };

  // Calculate similarity score (0-1, where 1 is perfect match)
  const calculateSimilarity = useCallback(
    (str1: string, str2: string): number => {
      if (str1 === str2) return 1;
      const maxLength = Math.max(str1.length, str2.length);
      if (maxLength === 0) return 1;
      const distance = levenshteinDistance(
        str1.toLowerCase(),
        str2.toLowerCase()
      );
      return 1 - distance / maxLength;
    },
    []
  );

  // Find fuzzy matches and suggestions
  const findSuggestions = useMemo(() => {
    if (!enableFuzzyMatching || !inputValue.trim()) {
      return [];
    }

    const normalizedInput = normalizeText(inputValue);
    const matches = options
      .map((option) => ({
        ...option,
        score: calculateSimilarity(
          normalizedInput,
          normalizeText(option.value)
        ),
      }))
      .filter((match) => match.score >= fuzzyThreshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Top 3 suggestions

    return matches;
  }, [
    inputValue,
    options,
    enableFuzzyMatching,
    fuzzyThreshold,
    normalizeText,
    calculateSimilarity,
  ]);

  // Update suggestions when input changes
  useEffect(() => {
    setSuggestions(findSuggestions);
    setShowSuggestionBanner(
      findSuggestions.length > 0 &&
        !options.some(
          (opt) => normalizeText(opt.value) === normalizeText(inputValue)
        )
    );
  }, [findSuggestions, inputValue, options, normalizeText]);

  // Handle input changes with normalization
  const handleInputChange = (
    newValue: string | number | (string | number)[]
  ) => {
    const stringValue = String(newValue);
    const normalized = normalizeText(stringValue);
    setInputValue(normalized);

    // Check if we have an exact match
    const exactMatch = options.find(
      (opt) => normalizeText(opt.value) === normalized
    );
    if (exactMatch) {
      onChange(exactMatch.value);
    } else {
      onChange(normalized);
    }
  };

  // Handle creating new options with normalization
  const handleCreateOption = (newValue: string) => {
    const normalized = normalizeText(newValue);
    if (onCreateOption) {
      onCreateOption(normalized);
    }
    onChange(normalized);
    setInputValue(normalized);
    setShowSuggestionBanner(false);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: {
    value: string;
    label: string;
  }) => {
    onChange(suggestion.value);
    setInputValue(suggestion.value);
    setShowSuggestionBanner(false);
  };

  // Enhanced options that include suggestions
  const enhancedOptions = useMemo(() => {
    const existingOptions = options.map((opt) => ({
      ...opt,
      value: normalizeText(opt.value),
      label: opt.label,
    }));

    // Add current input as option if creating is allowed and it's not already in options
    if (
      createOption &&
      inputValue.trim() &&
      !existingOptions.some((opt) => opt.value === inputValue)
    ) {
      existingOptions.unshift({
        value: inputValue,
        label: `${inputValue} (create new)`,
      });
    }

    return existingOptions;
  }, [options, inputValue, createOption, normalizeText]);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <Select
        options={enhancedOptions}
        value={inputValue}
        onChange={handleInputChange}
        onCreateOption={handleCreateOption}
        placeholder={placeholder}
        searchable={searchable}
        createOption={createOption}
        required={required}
      />

      {/* Suggestion Banner */}
      {showSuggestions && showSuggestionBanner && suggestions.length > 0 && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start">
            <Icon
              name="lightbulb"
              className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800 mb-1">
                Did you mean?
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <Button
                    key={suggestion.value}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    variant="ghost"
                    size="xs"
                    className="!h-auto px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded border border-blue-300 transition-colors"
                    title={`Similarity: ${Math.round(suggestion.score * 100)}%`}
                  >
                    {suggestion.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Normalization indicator */}
      {caseNormalization !== "none" && inputValue && (
        <p className="mt-1 text-xs text-slate-500">
          Input will be normalized to {caseNormalization}
        </p>
      )}
    </div>
  );
};
