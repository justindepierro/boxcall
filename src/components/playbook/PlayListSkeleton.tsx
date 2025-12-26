import { memo } from "react";
import { Skeleton } from "../ui/Skeleton";
import { Card } from "../ui/Card";
import { useIsMobile } from "../../hooks/useBreakpoint";

/**
 * PlayListSkeleton Component
 *
 * Loading skeleton for PlayList while data is being fetched.
 * Shows placeholder cards with animated shimmer effect.
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
    const isMobile = useIsMobile();

    const isGrid = viewMode === "grid";
    const containerClassName = isGrid
      ? `grid ${isMobile ? "grid-cols-1 gap-3" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"}`
      : "space-y-4";

    const headerPaddingClass = isMobile && isGrid ? "p-3" : "";
    const iconSizeClass = isMobile && isGrid ? "w-3 h-3" : "w-4 h-4";
    const titleWidthClass = isMobile && isGrid ? "w-full" : "w-3/4";
    const chip1WidthClass = isMobile && isGrid ? "w-12" : "w-16";
    const chip2WidthClass = isMobile && isGrid ? "w-14" : "w-20";
    const stat1WidthClass = isMobile && isGrid ? "w-16" : "w-24";
    const stat2WidthClass = isMobile && isGrid ? "w-14" : "w-20";

    return (
      <div className={containerClassName}>
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} variant="default">
            <div className={`space-y-3 ${headerPaddingClass}`.trim()}>
              {/* Header Row */}
              <div className="flex items-start gap-3">
                <Skeleton className={`${iconSizeClass} rounded-lg`} />
                <div className="flex-1 space-y-2">
                  <Skeleton className={`h-5 ${titleWidthClass}`} />
                  <div className="flex gap-2">
                    <Skeleton
                      className={`h-6 ${chip1WidthClass} rounded-full`}
                    />
                    <Skeleton
                      className={`h-6 ${chip2WidthClass} rounded-full`}
                    />
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex gap-4">
                <Skeleton className={`h-4 ${stat1WidthClass}`} />
                <Skeleton className={`h-4 ${stat2WidthClass}`} />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Skeleton
                  className={`h-8 ${isMobile && viewMode === "grid" ? "w-8" : "w-8"} rounded-lg`}
                />
                <Skeleton
                  className={`h-8 ${isMobile && viewMode === "grid" ? "w-8" : "w-8"} rounded-lg`}
                />
                <Skeleton
                  className={`h-8 ${isMobile && viewMode === "grid" ? "w-8" : "w-8"} rounded-lg`}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
);

PlayListSkeleton.displayName = "PlayListSkeleton";
