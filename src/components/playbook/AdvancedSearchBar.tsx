/**
 * Advanced Search Bar with Fuzzy Search and Autocomplete
 * Features: Typo tolerance, suggestions dropdown, search history
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "../ui";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { PlaybookSearchService } from "../../services/playbookSearchService";
import type { Play } from "../../types/play";

interface AdvancedSearchBarProps {
  plays: Play[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const AdvancedSearchBar: React.FC<AdvancedSearchBarProps> = ({
  plays,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  placeholder = "Search plays... (try 'slant', 'red zone', 'play action')",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Create search service instance
  const searchService = useMemo(
    () => new PlaybookSearchService(plays),
    [plays]
  );

  // Update search service when plays change
  useEffect(() => {
    searchService.updatePlays(plays);
  }, [plays, searchService]);

  // Get suggestions when query changes
  useEffect(() => {
    const newSuggestions = searchService.getSearchSuggestions(searchQuery, 8);
    setSuggestions(newSuggestions);
    setSelectedIndex(-1);
  }, [searchQuery, searchService]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange(value);
    setIsOpen(true);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsOpen(true);
  };

  // Handle input blur (with delay to allow for clicks)
  const handleInputBlur = () => {
    setTimeout(() => setIsOpen(false), 150);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    onSearchChange(suggestion);
    setIsOpen(false);
    inputRef.current?.focus();
    if (onSearchSubmit) {
      onSearchSubmit(suggestion);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "Enter" && onSearchSubmit) {
        onSearchSubmit(searchQuery);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          const suggestion = suggestions[selectedIndex];
          handleSuggestionClick(suggestion);
        } else if (onSearchSubmit) {
          onSearchSubmit(searchQuery);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Clear search
  const clearSearch = () => {
    onSearchChange("");
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Search className="h-4 w-4 text-text-muted" />
        </div>

  <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg 
                   focus:ring-2 focus:ring-jade-500 focus:border-jade-600 
                   placeholder-gray-500 text-sm transition-colors duration-200
       bg-white dark:bg-gray-800 shadow-sm hover:border-gray-400 dark:border-gray-600"
        />

        {searchQuery && (
          <Button
            onClick={clearSearch}
            variant="ghost"
            size="xs"
            className="absolute inset-y-0 right-0 pr-3 flex items-center h-auto text-text-muted hover:text-text-secondary"
            type="button"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
  <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg 
       border border-gray-200 dark:border-gray-700 dark:bg-gray-800 max-h-64 overflow-y-auto"
        >
          <div className="py-1">
            {suggestions.map((suggestion, index) => {
              const isHistory =
                searchQuery.trim() === "" ||
                searchService.getSearchSuggestions("").includes(suggestion);
              const isSelected = index === selectedIndex;

              return (
                <Button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  variant={isSelected ? "secondary" : "ghost"}
                  size="sm"
                  className={`w-full justify-start px-4 py-2 text-left text-sm flex items-center space-x-3 rounded-none ${
                    isSelected
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/40"
                      : "text-text-secondary hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {isHistory ? (
                    <Clock className="h-3 w-3 text-text-muted" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-text-muted" />
                  )}
                  <span className="truncate">{suggestion}</span>
                  {isHistory && (
                    <span className="text-xs text-text-muted ml-auto">
                      Recent
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
