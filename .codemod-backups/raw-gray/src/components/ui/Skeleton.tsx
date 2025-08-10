import React from "react";

/**
 * Professional Skeleton Loading Components
 *
 * Industry-standard loading states that provide smooth user experience
 * while content is loading. Prevents jarring layout shifts and blank screens.
 */

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

const SkeletonBase: React.FC<SkeletonProps> = ({
  className = "",
  width = "100%",
  height = "1rem",
}) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded ${className}`}
    style={{ width, height }}
  />
);

/**
 * Dashboard Card Skeleton - Matches dashboard card structure
 */
export const DashboardCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SkeletonBase width="60%" height="1.5rem" />
        <SkeletonBase width="2rem" height="2rem" className="rounded-full" />
      </div>

      {/* Content lines */}
      <div className="space-y-2">
        <SkeletonBase width="100%" height="1rem" />
        <SkeletonBase width="80%" height="1rem" />
        <SkeletonBase width="60%" height="1rem" />
      </div>

      {/* Footer */}
      <div className="flex space-x-2">
        <SkeletonBase width="4rem" height="2rem" className="rounded-full" />
        <SkeletonBase width="4rem" height="2rem" className="rounded-full" />
      </div>
    </div>
  </div>
);

/**
 * PlayCard Skeleton - Matches playbook card structure
 */
export const PlayCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0 space-y-3">
        {/* Play name */}
        <SkeletonBase width="70%" height="1.5rem" />

        {/* Subtitle */}
        <SkeletonBase width="50%" height="0.875rem" />

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <SkeletonBase
            width="4rem"
            height="1.75rem"
            className="rounded-full"
          />
          <SkeletonBase
            width="3rem"
            height="1.75rem"
            className="rounded-full"
          />
          <SkeletonBase
            width="2.5rem"
            height="1.75rem"
            className="rounded-full"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBase
            key={i}
            width="48px"
            height="48px"
            className="rounded-lg"
          />
        ))}
      </div>
    </div>
  </div>
);

/**
 * Navigation Skeleton - For bottom navigation loading
 */
export const NavigationSkeleton: React.FC = () => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe-area-inset-bottom">
    <div className="px-2 py-1">
      <div className="flex justify-between items-center max-w-sm mx-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center min-w-[60px] py-2"
          >
            <SkeletonBase width="24px" height="24px" className="rounded mb-1" />
            <SkeletonBase width="3rem" height="0.75rem" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * List Skeleton - For loading lists of items
 */
interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({
  items = 3,
  showAvatar = false,
}) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div
        key={i}
        className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200"
      >
        {showAvatar && (
          <SkeletonBase
            width="2.5rem"
            height="2.5rem"
            className="rounded-full flex-shrink-0"
          />
        )}
        <div className="flex-1 space-y-2">
          <SkeletonBase width="60%" height="1rem" />
          <SkeletonBase width="40%" height="0.875rem" />
        </div>
        <SkeletonBase width="2rem" height="2rem" className="rounded-full" />
      </div>
    ))}
  </div>
);

/**
 * Full Page Loading Skeleton - For initial page loads
 */
export const PageLoadingSkeleton: React.FC = () => {
  const CardSkeleton = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <SkeletonBase width="60%" height="1.5rem" />
          <SkeletonBase width="2rem" height="2rem" className="rounded-full" />
        </div>

        {/* Content lines */}
        <div className="space-y-2">
          <SkeletonBase width="100%" height="1rem" />
          <SkeletonBase width="80%" height="1rem" />
          <SkeletonBase width="60%" height="1rem" />
        </div>

        {/* Footer */}
        <div className="flex space-x-2">
          <SkeletonBase width="4rem" height="2rem" className="rounded-full" />
          <SkeletonBase width="4rem" height="2rem" className="rounded-full" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen surface-app">
      {/* Header skeleton */}
      <div className="bg-gradient-to-r from-surface-jade to-surface-jade border-b border-surface-jade-dark">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <SkeletonBase width="200px" height="2rem" />
          <SkeletonBase width="300px" height="1rem" className="mt-2" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="responsive-dashboard-container">
        <div className="responsive-content-grid">
          <div className="profile-section">
            <CardSkeleton />
          </div>
          <div className="trophy-section">
            <CardSkeleton />
          </div>
          <div className="feeds-section">
            <CardSkeleton />
          </div>
          <div className="calendar-section">
            <CardSkeleton />
          </div>
        </div>
      </div>

      {/* Bottom navigation skeleton */}
      <NavigationSkeleton />
    </div>
  );
};
