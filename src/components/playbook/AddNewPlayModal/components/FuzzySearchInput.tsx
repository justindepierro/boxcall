import React, { useRef } from "react";
import { Typography } from "../../../design-system/Typography";
import { useIsMobile } from "../../../../hooks/useBreakpoint";
import { useKeyboardAwareScroll } from "../../../../hooks/useKeyboardAwareScroll";
import { Icon } from "../../../ui/Icon/Icon";

interface FuzzySearchInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  suggestions: string[];
  aiSuggestions?: string[];
  generatedSuggestions?: string[];
  showSuggestions: boolean;
  onShowSuggestionsChange: (show: boolean) => void;
  required?: boolean;
  maxSuggestions?: number;
  className?: string;
}

/**
 * Enhanced FuzzySearchInput - Reusable autocomplete/fuzzy search input component
 *
 * Features:
 * - Text input with fuzzy search filtering
 * - Dropdown suggestions based on input
 * - AI-powered suggestions with visual indicators
 * - Keyboard navigation (Tab, Escape)
 * - Click outside to close
 * - Customizable max suggestions
 *
 * Used by: FormationSection, PlayNameSection, PersonnelSection
 */
export const FuzzySearchInput: React.FC<FuzzySearchInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  suggestions,
  aiSuggestions = [],
  generatedSuggestions = [],
  showSuggestions,
  onShowSuggestionsChange,
  required = false,
  maxSuggestions = 5,
  className = "",
}) => {
  // Mobile detection for responsive input sizing
  const isMobile = useIsMobile();

  // Input ref for keyboard-aware scrolling
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll input into view when keyboard appears on mobile
  useKeyboardAwareScroll(inputRef);

  // Combine all suggestions with metadata
  const allSuggestions = React.useMemo(() => {
    const combined: Array<{
      text: string;
      type: "ai" | "generated" | "basic";
      priority: number;
    }> = [];

    // Add AI suggestions (highest priority)
    aiSuggestions.forEach((suggestion) => {
      combined.push({ text: suggestion, type: "ai", priority: 3 });
    });

    // Add generated suggestions (medium priority)
    generatedSuggestions.forEach((suggestion) => {
      combined.push({ text: suggestion, type: "generated", priority: 2 });
    });

    // Add basic fuzzy matches (lowest priority)
    const basicFiltered = suggestions.filter((suggestion) =>
      suggestion.toLowerCase().includes(value.toLowerCase())
    );
    basicFiltered.forEach((suggestion) => {
      // Avoid duplicates
      if (!combined.some((item) => item.text === suggestion)) {
        combined.push({ text: suggestion, type: "basic", priority: 1 });
      }
    });

    // Sort by priority (AI first), then alphabetically
    return combined
      .sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return a.text.localeCompare(b.text);
      })
      .slice(0, maxSuggestions);
  }, [value, suggestions, aiSuggestions, generatedSuggestions, maxSuggestions]);

  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    onShowSuggestionsChange(false);
  };

  const getSuggestionIcon = (type: "ai" | "generated" | "basic") => {
    switch (type) {
      case "ai":
        return <Icon name="sparkles" className="h-3 w-3 text-blue-500" />;
      case "generated":
        return <Icon name="lightbulb" className="h-3 w-3 text-warning-500" />;
      default:
        return null;
    }
  };

  const getSuggestionLabel = (type: "ai" | "generated" | "basic") => {
    switch (type) {
      case "ai":
        return "AI Suggested";
      case "generated":
        return "Smart Suggestion";
      default:
        return null;
    }
  };

  return (
    <div className={className}>
      <Typography variant="label-md" className="block mb-sm">
        {label}
        {required && " *"}
      </Typography>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => onShowSuggestionsChange(true)}
          onBlur={() => setTimeout(() => onShowSuggestionsChange(false), 200)}
          placeholder={placeholder}
          className={`w-full border border-secondary rounded-lg focus:ring-2 focus:ring-text-info focus:border-bg-primary/0 ${
            isMobile
              ? "px-5 py-4 text-base" // Mobile: 48px height, 16px font (prevents iOS zoom)
              : "px-sm py-xs" // Desktop: normal spacing
          }`}
          required={required}
        />
        {showSuggestions && allSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-primary/95 dark:bg-secondary/95 backdrop-blur-md border border-stroke rounded-lg shadow-2xl z-popover max-h-40 overflow-y-auto mt-xs">
            {allSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion.text)}
                className="w-full text-left px-sm py-xs hover:bg-secondary/50 first:rounded-t-lg last:rounded-b-lg transition-colors group"
              >
                <div className="flex items-center gap-xs">
                  {getSuggestionIcon(suggestion.type)}
                  <Typography variant="body-sm" className="flex-1">
                    {suggestion.text}
                  </Typography>
                  {getSuggestionLabel(suggestion.type) && (
                    <Typography
                      variant="caption"
                      className="text-muted opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {getSuggestionLabel(suggestion.type)}
                    </Typography>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
