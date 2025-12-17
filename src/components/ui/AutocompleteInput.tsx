/**
 * AutocompleteInput Component
 *
 * A text input with dropdown suggestions from existing database values.
 * Helps coaches reuse consistent terminology for better stats/filtering.
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Typography } from "../design-system/Typography";

interface AutocompleteInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  label,
  value,
  onChange,
  suggestions,
  placeholder = "",
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input value
  useEffect(() => {
    if (!value.trim()) {
      setFilteredSuggestions(suggestions);
    } else {
      const lowerValue = value.toLowerCase();
      const filtered = suggestions.filter((s) =>
        s.toLowerCase().includes(lowerValue)
      );
      setFilteredSuggestions(filtered);
    }
    setHighlightedIndex(-1);
  }, [value, suggestions]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
      setIsOpen(true);
    },
    [onChange]
  );

  const handleInputFocus = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleSelectSuggestion = useCallback(
    (suggestion: string) => {
      onChange(suggestion);
      setIsOpen(false);
      inputRef.current?.blur();
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || filteredSuggestions.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredSuggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredSuggestions.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0) {
            handleSelectSuggestion(filteredSuggestions[highlightedIndex]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
      }
    },
    [isOpen, filteredSuggestions, highlightedIndex, handleSelectSuggestion]
  );

  const showDropdown = isOpen && filteredSuggestions.length > 0 && !disabled;

  return (
    <div className={`relative ${className}`}>
      <Typography variant="label-md" className="block mb-xs text-secondary">
        {label}
      </Typography>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-sm py-xs text-sm border border-secondary rounded-lg focus:ring-2 focus:ring-text-info focus:border-bg-primary/0 disabled:opacity-50"
        autoComplete="off"
      />

      {/* Suggestions Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-xs bg-surface border border-secondary rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full px-sm py-xs text-left text-sm hover:bg-subtle transition-colors ${
                index === highlightedIndex ? "bg-subtle" : ""
              } ${value === suggestion ? "text-info font-medium" : "text-primary"}`}
            >
              {suggestion}
            </button>
          ))}
          {value.trim() &&
            !filteredSuggestions.includes(value) &&
            filteredSuggestions.length > 0 && (
              <div className="px-sm py-xs text-xs text-muted border-t border-secondary">
                Press Enter to use "{value}"
              </div>
            )}
        </div>
      )}

      {/* Helper text when suggestions available */}
      {suggestions.length > 0 && !isOpen && !value && (
        <Typography variant="body-xs" className="text-muted mt-xs">
          {suggestions.length} existing value
          {suggestions.length !== 1 ? "s" : ""} available
        </Typography>
      )}
    </div>
  );
};
