import React from "react";
import { Skeleton } from "../../ui/Skeleton";

/**
 * MobilePlayCardSkeleton Component
 *
 * Skeleton loading state that matches PlayCard list view layout exactly.
 * Uses Facebook-style shimmer effect for perceived speed.
 *
 * Dimensions matched from PlayCardListHeader:
 * - Thumbnail: w-24 (96px) x h-16 (64px) with rounded-lg
 * - Title: text-lg for comfortable, text-base for compact
 * - Badge row: gap-1.5, small badge heights
 * - Action buttons: sm size with gap-1
 *
 * Features:
 * - Matches PlayCardListHeader structure exactly
 * - Zero layout shift when content loads
 * - Smooth shimmer animation
 */
export const MobilePlayCardSkeleton: React.FC = () => {
  return (
    <div className="bg-surface-card border border-border rounded-xl shadow-sm p-5 space-y-3">
      {/* Header row - matches PlayCardListHeader flex layout */}
      <div className="flex items-center gap-4">
        {/* Thumbnail skeleton - matches w-24 h-16 from PlayCardListHeader */}
        <div className="shrink-0 w-24 h-16 rounded-lg overflow-hidden">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>

        {/* Content skeleton - matches flex-1 min-w-0 structure */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title row */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-3/5" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Badge row - matches gap-1.5 from BadgeRow */}
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-6 w-14 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        </div>

        {/* Action buttons - matches ActionButtons structure */}
        <div className="flex items-center gap-1 ml-4">
          <Skeleton className="w-8 h-8 rounded-md" />
          <Skeleton className="w-8 h-8 rounded-md" />
          <Skeleton className="w-8 h-8 rounded-md" />
        </div>
      </div>
    </div>
  );
};

/**
 * MobilePlayCardSkeletonList Component
 *
 * Renders multiple skeleton cards for loading states.
 */
export const MobilePlayCardSkeletonList: React.FC<{ count?: number }> = ({
  count = 4,
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <MobilePlayCardSkeleton key={i} />
      ))}
    </div>
  );
};
