import { memo } from "react";
import { Skeleton } from "../ui/Skeleton";
import { Card } from "../ui/Card";

/**
 * PlayListSkeleton Component
 *
 * Loading skeleton for PlayList while data is being fetched.
 * Shows placeholder cards with animated shimmer effect.
 *
 * Mobile-first: Single column on mobile, responsive grid on larger screens.
 *
 * @example
 * ```tsx
 * {loading && <PlayListSkeleton count={6} />}
 * ```
 */

export interface PlayListSkeletonProps {
  /** Number of skeleton cards to show */
  count?: number;
  /** Display mode */
  viewMode?: "list" | "grid";
}

export const PlayListSkeleton = memo<PlayListSkeletonProps>(
  ({ count = 6, viewMode = "list" }) => {
    const isGrid = viewMode === "grid";

    // Mobile-first: single column, then responsive breakpoints
    const containerClassName = isGrid
      ? "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
      : "space-y-4";

    return (
      <div className={containerClassName}>
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} variant="default">
            <div className={`space-y-3 ${isGrid ? "p-3 sm:p-4" : ""}`}>
              {/* Header Row */}
              <div className="flex items-start gap-3">
                <Skeleton className="w-3 h-3 sm:w-4 sm:h-4 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-full sm:w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-12 sm:w-16 rounded-full" />
                    <Skeleton className="h-6 w-14 sm:w-20 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex gap-4">
                <Skeleton className="h-4 w-16 sm:w-24" />
                <Skeleton className="h-4 w-14 sm:w-20" />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
);

PlayListSkeleton.displayName = "PlayListSkeleton";
