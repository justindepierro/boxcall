/**
 * SearchResults Component
 *
 * Renders the list of search results with loading and empty states.
 */

import React from "react";
import { Icon } from "../../Icon";
import { Typography } from "../../../design-system";
import type { SearchResultsProps } from "../types";
import { MIN_QUERY_LENGTH_FOR_NO_RESULTS } from "../constants";
import { SearchResultItem } from "./SearchResultItem";

const TYPE_LABELS: Record<string, string> = {
  play: "Plays",
  formation: "Formations",
  player: "Players",
  announcement: "Announcements",
  game_plan: "Game Plans",
  practice_script: "Practice Scripts",
  calendar_event: "Calendar",
  equipment: "Equipment",
};

const TYPE_ORDER = [
  "play",
  "formation",
  "player",
  "announcement",
  "game_plan",
  "practice_script",
  "calendar_event",
  "equipment",
] as const;

export const SearchResults: React.FC<SearchResultsProps> = ({
  isLoading,
  results,
  query,
  selectedIndex,
  getTypeIcon,
  getTypeColor,
  onResultClick,
  recentSearches,
  onRecentSearchClick,
  onClearHistory,
  emptyMessage = "Start typing to search across all your content",
}) => {
  if (isLoading && results.length === 0) {
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

  if (
    query.trim().length === 0 &&
    (recentSearches?.length || 0) > 0 &&
    onRecentSearchClick
  ) {
    return (
      <div className="px-4 py-4">
        <div className="flex items-center justify-between px-1 mb-3">
          <Typography
            variant="body-xs"
            className="text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-wide"
          >
            Recent searches
          </Typography>
          {onClearHistory && (
            <button
              onClick={onClearHistory}
              className="text-xs font-semibold text-neutral-500 hover:text-navy-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
              type="button"
            >
              Clear
            </button>
          )}
        </div>

        <div className="space-y-1">
          {recentSearches!.map((recent) => (
            <button
              key={recent}
              onClick={() => onRecentSearchClick(recent)}
              className="w-full px-3 py-2.5 text-left rounded-xl
              bg-neutral-50 dark:bg-navy-800
              hover:bg-neutral-100 dark:hover:bg-navy-700/60
              transition-colors"
              type="button"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-navy-700 flex items-center justify-center flex-shrink-0">
                  <Icon name="search" className="h-4 w-4 text-neutral-400" />
                </div>
                <Typography
                  variant="body-sm"
                  className="font-semibold text-navy-900 dark:text-white truncate"
                >
                  {recent}
                </Typography>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (results.length > 0) {
    const resultsByType = new Map<string, typeof results>();
    for (const result of results) {
      const group = resultsByType.get(result.type) || [];
      group.push(result);
      resultsByType.set(result.type, group);
    }

    let runningIndex = 0;

    return (
      <div className="py-1">
        {isLoading && (
          <div className="px-5 pt-3 pb-1 flex items-center gap-2">
            <Icon
              name="loader"
              className="h-4 w-4 text-jade-500 animate-spin"
            />
            <Typography
              variant="body-xs"
              className="text-neutral-500 dark:text-neutral-400 font-semibold"
            >
              Searching…
            </Typography>
          </div>
        )}
        {TYPE_ORDER.map((type) => {
          const group = resultsByType.get(type);
          if (!group || group.length === 0) return null;

          return (
            <div key={type}>
              <div className="px-5 pt-3 pb-2">
                <Typography
                  variant="body-xs"
                  className="text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-wide"
                >
                  {TYPE_LABELS[type] || type}
                </Typography>
              </div>
              <div className="space-y-1">
                {group.map((result) => {
                  const itemIndex = runningIndex;
                  runningIndex += 1;

                  return (
                    <SearchResultItem
                      key={`${result.type}-${result.id}`}
                      result={result}
                      index={itemIndex}
                      selectedIndex={selectedIndex}
                      getTypeIcon={getTypeIcon}
                      getTypeColor={getTypeColor}
                      onClick={onResultClick}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
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
