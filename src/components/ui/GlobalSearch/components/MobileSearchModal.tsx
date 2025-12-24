/**
 * MobileSearchModal Component
 *
 * Full-screen mobile search modal with results.
 */

import React from "react";
import { Icon } from "../../Icon";
import { Typography } from "../../../design-system";
import type { MobileSearchModalProps } from "../types";
import { SearchResults } from "./SearchResults";

export const MobileSearchModal: React.FC<MobileSearchModalProps> = ({
  isOpen,
  query,
  isLoading,
  results,
  selectedIndex,
  recentSearches,
  inputRef,
  onClose,
  onInputChange,
  onKeyDown,
  onClear,
  onResultClick,
  onRecentSearchClick,
  onClearHistory,
  getTypeIcon,
  getTypeColor,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="absolute inset-x-0 top-0 bg-white dark:bg-navy-900 shadow-2xl">
        <div className="p-4 space-y-4">
          {/* Header with close button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-navy-800 rounded-lg transition-colors"
              aria-label="Close search"
            >
              <Icon name="close" className="h-6 w-6 text-neutral-500" />
            </button>
            <Typography variant="headline-sm" className="text-primary flex-1">
              Search BoxCall
            </Typography>
          </div>

          {/* Search Input */}
          <div
            className="relative flex items-center
            bg-neutral-50 dark:bg-navy-800
            border-2 border-neutral-200 dark:border-navy-700
            focus-within:border-jade-500
            rounded-xl shadow-sm focus-within:shadow-md
            transition-all duration-300"
          >
            <div className="flex items-center pl-4 pr-3">
              <Icon
                name="search"
                className="h-5 w-5 text-neutral-400 dark:text-neutral-500"
              />
            </div>
            <input
              ref={inputRef}
              id="global-search-mobile"
              name="globalSearch"
              type="text"
              value={query}
              onChange={onInputChange}
              onKeyDown={onKeyDown}
              placeholder="Search plays, players, plans..."
              className="flex-1 py-3 pr-4 bg-transparent text-navy-900 dark:text-white
                placeholder:text-neutral-400 dark:placeholder:text-neutral-500
                font-medium text-base outline-none"
            />
            {query && (
              <button
                onClick={onClear}
                className="mr-3 p-1.5 hover:bg-neutral-200 dark:hover:bg-navy-700 rounded-lg transition-colors"
                aria-label="Clear search"
              >
                <Icon name="close" className="h-4 w-4 text-neutral-500" />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar">
            <SearchResults
              isLoading={isLoading}
              results={results}
              query={query}
              selectedIndex={selectedIndex}
              getTypeIcon={getTypeIcon}
              getTypeColor={getTypeColor}
              onResultClick={onResultClick}
              recentSearches={recentSearches}
              onRecentSearchClick={onRecentSearchClick}
              onClearHistory={onClearHistory}
              emptyMessage="Start typing to search across all your content"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
