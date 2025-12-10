import React from "react";
import { Skeleton } from "../../ui/Skeleton";

/**
 * MobilePracticeCardSkeleton Component
 *
 * Skeleton loading state that matches MobilePracticeCard layout.
 * Uses Facebook-style shimmer effect for perceived speed.
 */
export const MobilePracticeCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
      {/* Main Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Icon skeleton */}
          <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />

          {/* Title & Description */}
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 mt-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 dark:border-neutral-800">
        <Skeleton className="h-4 w-20" />

        <div className="flex items-center gap-0.5">
          <Skeleton className="w-11 h-11 rounded-lg" />
          <Skeleton className="w-11 h-11 rounded-lg" />
          <Skeleton className="w-11 h-11 rounded-lg" />
          <Skeleton className="w-11 h-11 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

/**
 * MobileGamePlanCardSkeleton Component
 *
 * Skeleton loading state that matches MobileGamePlanCard layout.
 */
export const MobileGamePlanCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
      {/* Main Content */}
      <div className="p-4">
        {/* Header with opponent badge */}
        <div className="flex items-start gap-3">
          {/* Plan Icon */}
          <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />

          {/* Title & Opponent */}
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          </div>
        </div>

        {/* Date & Stats */}
        <div className="flex items-center gap-4 mt-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800">
        {/* PDF Export button skeleton */}
        <div className="flex flex-col">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-3 w-16 mt-1" />
        </div>

        {/* Secondary Actions */}
        <div className="flex items-center gap-0.5">
          <Skeleton className="w-11 h-11 rounded-lg" />
          <Skeleton className="w-11 h-11 rounded-lg" />
          <Skeleton className="w-11 h-11 rounded-lg" />
          <Skeleton className="w-11 h-11 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

/**
 * MobilePracticeCardSkeletonList Component
 */
export const MobilePracticeCardSkeletonList: React.FC<{ count?: number }> = ({
  count = 3,
}) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <MobilePracticeCardSkeleton key={i} />
      ))}
    </div>
  );
};

/**
 * MobileGamePlanCardSkeletonList Component
 */
export const MobileGamePlanCardSkeletonList: React.FC<{ count?: number }> = ({
  count = 3,
}) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <MobileGamePlanCardSkeleton key={i} />
      ))}
    </div>
  );
};
