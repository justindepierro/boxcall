/**
 * SearchResults Component
 *
 * Renders the list of search results with loading and empty states.
 */

import React from 'react';
import { Icon } from '../../Icon';
import { Typography } from '../../../design-system';
import type { SearchResultsProps } from '../types';
import { MIN_QUERY_LENGTH_FOR_NO_RESULTS } from '../constants';
import { SearchResultItem } from './SearchResultItem';

export const SearchResults: React.FC<SearchResultsProps> = ({
  isLoading,
  results,
  query,
  selectedIndex,
  getTypeIcon,
  getTypeColor,
  onResultClick,
  emptyMessage = 'Start typing to search across all your content',
}) => {
  if (isLoading) {
    return (
      <div className="px-6 py-8 text-center">
        <Icon
          name="loader"
          className="h-8 w-8 text-jade-500 animate-spin mx-auto mb-3"
        />
        <Typography
          variant="body-sm"
          className="text-neutral-500 dark:text-neutral-400"
        >
          Searching...
        </Typography>
      </div>
    );
  }

  if (results.length > 0) {
    return (
      <div className="space-y-1">
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
    );
  }

  if (query.length >= MIN_QUERY_LENGTH_FOR_NO_RESULTS) {
    return (
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
    );
  }

  return (
    <div className="px-6 py-8 text-center">
      <Typography
        variant="body-sm"
        className="text-neutral-500 dark:text-neutral-400"
      >
        {emptyMessage}
      </Typography>
    </div>
  );
};
