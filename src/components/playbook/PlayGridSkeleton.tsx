import { memo } from "react";
import { Skeleton } from "../ui/Skeleton";
import { Card } from "../ui/Card";

/**
 * PlayGridSkeleton Component
 *
 * Loading skeleton for PlayGrid while data is being fetched.
 * Shows placeholder cards with animated shimmer effect.
 *
 * @example
 * ```tsx
 * {loading && <PlayGridSkeleton count={6} />}
 * ```
 */

export interface PlayGridSkeletonProps {
  /** Number of skeleton cards to show */
  count?: number;
  /** Display mode */
  viewMode?: "list" | "grid";
}

export const PlayGridSkeleton = memo<PlayGridSkeletonProps>(
  ({ count = 6, viewMode = "list" }) => {
    return (
      <div
        className={`
        ${viewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" : "space-y-4"}
      `}
      >
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} variant="glass">
            <div className="space-y-3">
              {/* Header Row */}
              <div className="flex items-start gap-3">
                <Skeleton className="w-4 h-4 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
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

PlayGridSkeleton.displayName = "PlayGridSkeleton";
