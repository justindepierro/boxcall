/**
 * Universal Search Bar with Cross-Context Search
 * Shows results from Playbook, Practice Scripts, and Game Plans with color-coded badges
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Icon } from "../ui/Icon";
import { Badge } from "../ui/Badge";
import { UniversalSearchService, type UniversalSearchResult } from "@services";
import type { Play } from "../../types/play";

interface UniversalSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onResultSelect?: (result: UniversalSearchResult) => void;
  onCreatePlay?: (playName: string) => void;
  placeholder?: string;
  className?: string;
  teamId: string;
  plays: Play[]; // For initializing the search service
}

export const UniversalSearchBar: React.FC<UniversalSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onResultSelect,
  onCreatePlay,
  placeholder = "Search across playbook, practice, and game plans...",
  className = "",
  teamId,
  plays,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<UniversalSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize universal search service
  const searchService = useMemo(() => {
    const service = new UniversalSearchService(teamId);
    service.initializePlays(plays);
    return service;
  }, [teamId, plays]);

  // Perform search when query changes
  useEffect(() => {
    const performSearch = async () => {
      console.info("🔍 performSearch called with query:", searchQuery);
      if (!searchQuery.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await searchService.search(searchQuery);
        setResults(response.results.slice(0, 8)); // Limit to 8 results
        const shouldOpen = response.results.length > 0 || !!onCreatePlay;
        console.info(
          "🔍 Setting isOpen to:",
          shouldOpen,
          "(results:",
          response.results.length,
          "onCreatePlay:",
          !!onCreatePlay,
          ")"
        );
        setIsOpen(shouldOpen);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
        const shouldOpen = !!onCreatePlay;
        console.info(
          "🔍 Setting isOpen to:",
          shouldOpen,
          "(error case, onCreatePlay:",
          !!onCreatePlay,
          ")"
        );
        setIsOpen(shouldOpen);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300); // Debounce search
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchService, onCreatePlay]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.info(
      "🎹 KEYBOARD EVENT:",
      e.key,
      "target:",
      e.target,
      "isOpen:",
      isOpen,
      "searchQuery:",
      searchQuery
    );
    if (!isOpen) {
      console.info("🚫 Dropdown not open, ignoring key:", e.key);
      return;
    }

    const hasCreateOption = searchQuery.trim() && onCreatePlay;
    const totalItems = hasCreateOption ? results.length + 1 : results.length;
    console.info(
      "📊 hasCreateOption:",
      hasCreateOption,
      "totalItems:",
      totalItems,
      "selectedIndex:",
      selectedIndex
    );

    if (totalItems === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
        break;
      case "Enter":
        console.info("🚀 Enter pressed, processing...");
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (hasCreateOption && selectedIndex === results.length) {
            console.info("🎯 Creating new play (selected)");
            handleCreatePlay(searchQuery.trim());
          } else if (results[selectedIndex]) {
            console.info("🔗 Selecting result:", results[selectedIndex]);
            handleResultSelect(results[selectedIndex]);
          }
        } else if (searchQuery.trim() && onCreatePlay) {
          console.info("🎯 Creating new play (no selection)");
          handleCreatePlay(searchQuery.trim());
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleResultSelect = (result: UniversalSearchResult) => {
    onResultSelect?.(result);
    setIsOpen(false);
    setSelectedIndex(-1);
    // Navigate to the result
    window.location.href = result.navigateTo;
  };

  const handleCreatePlay = (playName: string) => {
    console.info(
      "🎨 UniversalSearchBar.handleCreatePlay called with:",
      playName
    );
    console.info("🎨 onCreatePlay prop exists:", !!onCreatePlay);
    onCreatePlay?.(playName);
    setIsOpen(false);
    setSelectedIndex(-1);
    // Clear the search query after creating
    onSearchChange("");
  };

  const getContextIcon = (context: string) => {
    switch (context) {
      case "playbook":
        return "file";
      case "practice-script":
        return "clock";
      case "game-plan":
        return "users";
      default:
        return "search";
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            console.info(
              "🎯 Input focused, results.length:",
              results.length,
              "onCreatePlay:",
              !!onCreatePlay
            );
            if (results.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-text-primary placeholder-text-muted"
        />
        <Icon
          name="search"
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {results.map((result, index) => (
            <div
              key={result.id}
              onClick={() => handleResultSelect(result)}
              className={`flex items-center justify-between px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                index === selectedIndex ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Icon
                  name={getContextIcon(result.context)}
                  className="h-4 w-4 text-gray-400 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-text-primary truncate">
                    {result.title}
                  </div>
                  {result.subtitle && (
                    <div className="text-sm text-text-secondary truncate">
                      {result.subtitle}
                    </div>
                  )}
                </div>
              </div>
              <Badge
                size="sm"
                className={`${result.contextColor} text-white text-xs`}
              >
                {result.contextLabel}
              </Badge>
            </div>
          ))}

          {/* Show "Create new play" option when we can create plays and have a query */}
          {!isLoading && searchQuery.trim() && onCreatePlay && (
            <div
              onClick={() => handleCreatePlay(searchQuery.trim())}
              className={`flex items-center px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                selectedIndex === results.length ? "bg-blue-50" : ""
              }`}
            >
              <Icon
                name="plus"
                className="h-4 w-4 text-green-500 flex-shrink-0 mr-3"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-green-700">
                  Create new play
                </div>
                <div className="text-sm text-green-600">
                  "{searchQuery.trim()}"
                </div>
              </div>
              <Badge
                size="sm"
                className="bg-green-500 text-text-inverse text-xs"
              >
                New
              </Badge>
            </div>
          )}

          {results.length === 0 &&
            !isLoading &&
            (!searchQuery.trim() || !onCreatePlay) && (
              <div className="px-4 py-3 text-text-secondary text-center">
                No results found
              </div>
            )}
        </div>
      )}
    </div>
  );
};
