/**
 * SearchResultItem Component
 *
 * A memoized component displaying a single search result
 * with icon, title, subtitle, and selection state.
 */

import React from "react";
import { Icon } from "../../Icon";
import { Typography } from "../../../design-system";
import type { SearchResultItemProps } from "../types";

export const SearchResultItem = React.memo<SearchResultItemProps>(
  ({ result, index, selectedIndex, getTypeIcon, getTypeColor, onClick }) => {
    const isSelected = index === selectedIndex;

    return (
      <button
        onClick={() => onClick(result)}
        className={`w-full px-5 py-3.5 text-left 
        flex items-center space-x-4
        transition-all duration-200 ease-out
        border-l-4
        ${
          isSelected
            ? "bg-jade-50 dark:bg-jade-900/20 border-jade-500"
            : "border-transparent hover:bg-neutral-50 dark:hover:bg-navy-700/50 hover:border-jade-300 dark:hover:border-jade-700"
        }
        group`}
      >
        {/* Icon Container */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-xl 
          flex items-center justify-center
          transition-all duration-200
          ${
            isSelected
              ? "bg-jade-100 dark:bg-jade-900/40 scale-110"
              : "bg-neutral-100 dark:bg-navy-700 group-hover:scale-105"
          }`}
        >
          <Icon
            name={getTypeIcon(result.type) as any}
            className={`h-5 w-5 ${getTypeColor(result.type)} transition-transform group-hover:scale-110`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Typography
            variant="body-sm"
            className="font-semibold text-navy-900 dark:text-white truncate mb-0.5"
          >
            {result.title}
          </Typography>
          <Typography
            variant="body-xs"
            className="text-neutral-500 dark:text-neutral-400 truncate"
          >
            {result.subtitle}
          </Typography>
        </div>

        {/* Arrow indicator */}
        <Icon
          name="chevron-right"
          className={`h-4 w-4 text-neutral-400 transition-all duration-200
          ${isSelected ? "opacity-100 translate-x-1" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1"}`}
        />
      </button>
    );
  }
);

SearchResultItem.displayName = "SearchResultItem";
