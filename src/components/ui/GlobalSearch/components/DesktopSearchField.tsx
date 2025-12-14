/**
 * DesktopSearchField Component
 *
 * Desktop search input with dropdown results.
 */

import React from 'react';
import { Icon } from '../../Icon';
import { Typography } from '../../../design-system';
import type { DesktopSearchFieldProps } from '../types';
import { MIN_QUERY_LENGTH_FOR_NO_RESULTS } from '../constants';
import { SearchResultItem } from './SearchResultItem';

export const DesktopSearchField: React.FC<DesktopSearchFieldProps> = ({
  query,
  isOpen,
  isLoading,
  results,
  selectedIndex,
  inputRef,
  containerRef,
  onInputChange,
  onKeyDown,
  onFocus,
  onBlur,
  onClear,
  onResultClick,
  getTypeIcon,
  getTypeColor,
  className = '',
}) => {
  return (
    <div
      ref={containerRef}
      className={`hidden md:block relative ${className}`}
    >
      <div className="relative group">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          <Icon
            name="search"
            className="h-5 w-5 text-neutral-400 group-focus-within:text-jade-500 transition-colors duration-200"
            aria-hidden="true"
          />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Search anything..."
          className="w-full h-12 pl-12 pr-12 
          bg-white dark:bg-navy-800/50
          border-2 border-neutral-200 dark:border-navy-700
          rounded-2xl
          text-navy-900 dark:text-white
          placeholder-neutral-400 dark:placeholder-neutral-500
          transition-all duration-300 ease-in-out
          hover:border-jade-300 dark:hover:border-jade-700
          focus:outline-none focus:ring-4 focus:ring-jade-500/20 focus:border-jade-500 dark:focus:border-jade-500
          shadow-sm hover:shadow-md focus:shadow-lg
          backdrop-blur-sm"
          aria-label="Global search"
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={onClear}
            className="absolute inset-y-0 right-0 pr-4 flex items-center z-10
            text-neutral-400 hover:text-navy-900 dark:hover:text-white
            transition-colors duration-200"
            aria-label="Clear search"
          >
            <div className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-navy-700/50 transition-colors">
              <Icon name="close" className="h-4 w-4" />
            </div>
          </button>
        )}

        {/* Loading Indicator */}
        {isLoading && !query && (
          <div className="absolute inset-y-0 right-12 flex items-center pr-3">
            <Icon
              name="loader"
              className="h-4 w-4 text-jade-500 animate-spin"
            />
          </div>
        )}

        {/* Keyboard Shortcut Hint */}
        {!query && !isOpen && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <div className="hidden sm:flex items-center space-x-1 text-xs text-neutral-400 dark:text-neutral-500">
              <kbd className="px-2 py-1 bg-neutral-100 dark:bg-navy-700 border border-neutral-200 dark:border-navy-600 rounded-md font-mono">
                ⌘K
              </kbd>
            </div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query.length > 0 || isLoading) && (
        <div
          className="absolute top-full left-0 right-0 mt-3
          bg-white dark:bg-navy-800 
          border-2 border-neutral-200 dark:border-navy-700
          rounded-2xl 
          shadow-2xl 
          backdrop-blur-xl
          z-[100]
          max-h-96 
          overflow-hidden
          animate-in fade-in slide-in-from-top-2 duration-300"
        >
          {isLoading ? (
            <div className="px-6 py-8 text-center">
              <Icon
                name="loader"
                className="h-8 w-8 text-jade-500 animate-spin mx-auto mb-3"
              />
              <Typography
                variant="body-sm"
                className="text-neutral-500 dark:text-neutral-400"
              >
                Searching across your content...
              </Typography>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2 overflow-y-auto max-h-96 custom-scrollbar">
              {results.map((result, index) => (
                <SearchResultItem
                  key={`${result.type}-${result.id}`}
                  result={result}
                  index={index}
                  selectedIndex={selectedIndex}
                  getTypeIcon={getTypeIcon}
                  getTypeColor={getTypeColor}
                  onClick={onResultClick}
                />
              ))}
            </div>
          ) : query.length >= MIN_QUERY_LENGTH_FOR_NO_RESULTS ? (
            <div className="px-6 py-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-navy-700 flex items-center justify-center">
                <Icon name="search" className="h-8 w-8 text-neutral-400" />
              </div>
              <Typography
                variant="body-sm"
                className="font-medium text-navy-900 dark:text-white mb-1"
              >
                No results found
              </Typography>
              <Typography
                variant="body-xs"
                className="text-neutral-500 dark:text-neutral-400"
              >
                Try searching for plays, players, or announcements
              </Typography>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
