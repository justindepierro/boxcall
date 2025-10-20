import React, { useRef } from "react";
import { Typography } from "../../../design-system/Typography";
import { useIsMobile } from "../../../../hooks/useBreakpoint";
import { useKeyboardAwareScroll } from "../../../../hooks/useKeyboardAwareScroll";

interface FuzzySearchInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  suggestions: string[];
  showSuggestions: boolean;
  onShowSuggestionsChange: (show: boolean) => void;
  required?: boolean;
  maxSuggestions?: number;
  className?: string;
}

/**
 * FuzzySearchInput - Reusable autocomplete/fuzzy search input component
 *
 * Features:
 * - Text input with fuzzy search filtering
 * - Dropdown suggestions based on input
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

  // Filter suggestions based on input value
  const filteredSuggestions = React.useMemo(() => {
    if (!value.trim()) return suggestions.slice(0, maxSuggestions);
    const lower = value.toLowerCase();
    return suggestions
      .filter((s) => s.toLowerCase().includes(lower))
      .slice(0, maxSuggestions);
  }, [value, suggestions, maxSuggestions]);

  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    onShowSuggestionsChange(false);
  };

  return (
    <div className={className}>
      <Typography variant="label-md" className="block mb-spacing-sm">
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
          className={`w-full border border-border-medium rounded-lg focus:ring-2 focus:ring-text-info focus:border-surface-primary/0 ${
            isMobile
              ? "px-5 py-4 text-base" // Mobile: 48px height, 16px font (prevents iOS zoom)
              : "px-spacing-sm py-spacing-xs" // Desktop: normal spacing
          }`}
          required={required}
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-surface-primary/95 dark:bg-surface-secondary/95 backdrop-blur-md border border-stroke rounded-lg shadow-2xl z-10 max-h-40 overflow-y-auto mt-spacing-xs">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full text-left px-spacing-sm py-spacing-xs text-content-primary hover:bg-surface-secondary/50 first:rounded-t-lg last:rounded-b-lg transition-colors"
              >
                <Typography variant="body-sm">{suggestion}</Typography>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
