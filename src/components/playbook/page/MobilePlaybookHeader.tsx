import React from "react";
import { Icon } from "../../ui/Icon";
import { Button } from "../../ui/Button";
import { Typography } from "../../design-system/Typography";

export interface MobilePlaybookHeaderProps {
  title: string;
  playCount: number;
  filterCount?: number;
  onSearchClick: () => void;
  onFilterClick: () => void;
  onStatsClick?: () => void;
  className?: string;
}

/**
 * MobilePlaybookHeader - Simplified mobile header for Playbook page
 *
 * Features:
 * - Title with play count subtitle
 * - Search and filter action buttons
 * - Optional stats button
 * - 64px height for comfortable touch
 * - Sticky positioning support
 *
 * @example
 * ```tsx
 * <MobilePlaybookHeader
 *   title="Playbook"
 *   playCount={42}
 *   filterCount={2}
 *   onSearchClick={() => setShowSearch(true)}
 *   onFilterClick={() => setShowFilters(true)}
 *   onStatsClick={() => setShowStats(true)}
 * />
 * ```
 */
export const MobilePlaybookHeader: React.FC<MobilePlaybookHeaderProps> = ({
  title,
  playCount,
  filterCount = 0,
  onSearchClick,
  onFilterClick,
  onStatsClick,
  className = "",
}) => {
  return (
    <header
      className={`
        flex items-center justify-between
        h-16 px-4 py-3
        bg-primary border-b border-muted
        ${className}
      `}
    >
      {/* Left: Title & Subtitle */}
      <div className="flex-1 min-w-0">
        <Typography
          variant="headline-sm"
          className="text-primary font-semibold leading-tight truncate"
        >
          {title}
        </Typography>
        <Typography
          variant="body-xs"
          className="text-secondary leading-tight"
        >
          {playCount} {playCount === 1 ? "play" : "plays"}
        </Typography>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-2 ml-4">
        {/* Stats Button (Optional) */}
        {onStatsClick && (
          <Button
            variant="ghost"
            size="md"
            onClick={onStatsClick}
            className="h-11 w-11 p-0 flex items-center justify-center"
            aria-label="View stats"
          >
            <Icon name="bar-chart" size="sm" className="h-5 w-5" />
          </Button>
        )}

        {/* Search Button */}
        <Button
          variant="ghost"
          size="md"
          onClick={onSearchClick}
          className="h-11 w-11 p-0 flex items-center justify-center"
          aria-label="Search plays"
        >
          <Icon name="search" size="sm" className="h-5 w-5" />
        </Button>

        {/* Filter Button with Badge */}
        <Button
          variant="ghost"
          size="md"
          onClick={onFilterClick}
          className="h-11 w-11 p-0 flex items-center justify-center relative"
          aria-label="Filter plays"
        >
          <Icon name="filter" size="sm" className="h-5 w-5" />
          {filterCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-brand-jade rounded-full">
              {filterCount}
            </span>
          )}
        </Button>
      </div>
    </header>
  );
};
