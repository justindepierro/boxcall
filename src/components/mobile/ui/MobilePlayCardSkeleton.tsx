import React from "react";
import { Skeleton } from "../../ui/Skeleton";

/**
 * MobilePlayCardSkeleton Component
 *
 * Skeleton loading state that matches MobilePlayCard layout exactly.
 * Uses Facebook-style shimmer effect for perceived speed.
 *
 * Features:
 * - Matches MobilePlayCard structure (thumbnail, title, badges, actions)
 * - Smooth shimmer animation
 * - Same dimensions for zero layout shift
 */
export const MobilePlayCardSkeleton: React.FC = () => {
  return (
    <div className="flex items-stretch w-full bg-surface-card border border-border border-l-4 border-l-neutral-300 rounded-xl shadow-sm overflow-hidden">
      {/* Thumbnail skeleton - 80x80px like MobilePlayCard */}
      <div className="w-20 h-20 flex-shrink-0">
        <Skeleton className="w-full h-full rounded-none" />
      </div>

      {/* Content skeleton */}
      <div className="flex-1 min-w-0 py-3 pr-2 space-y-2">
        {/* Title */}
        <Skeleton className="h-5 w-3/4" />

        {/* Badges row */}
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-10 rounded-md" />
        </div>

        {/* Play type */}
        <Skeleton className="h-3 w-12" />
      </div>

      {/* Action buttons skeleton */}
      <div className="flex flex-col items-center justify-center gap-1 px-2 py-2 border-l border-border">
        <Skeleton className="w-11 h-11 rounded-lg" />
        <Skeleton className="w-11 h-11 rounded-lg" />
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
