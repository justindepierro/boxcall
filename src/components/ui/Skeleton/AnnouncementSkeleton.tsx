/**
 * AnnouncementSkeleton Component
 * Facebook-style skeleton loading state for announcements
 * Improves perceived performance during data fetching
 */

import React from "react";

export const AnnouncementSkeleton: React.FC = () => {
  return (
    <article className="bg-surface-primary border-b border-subtle">
      <div className="px-4 py-3">
        <div className="flex gap-3">
          {/* Avatar skeleton */}
          <div className="w-10 h-10 rounded-full bg-surface-muted animate-pulse" />

          {/* Content skeleton */}
          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-center gap-2 mb-2">
              <div className="h-4 w-32 bg-surface-muted rounded animate-pulse" />
              <div className="h-3 w-16 bg-surface-muted rounded animate-pulse" />
            </div>

            {/* Title */}
            <div className="h-5 w-3/4 bg-surface-muted rounded animate-pulse mb-2" />

            {/* Content lines */}
            <div className="space-y-2 mb-3">
              <div className="h-4 w-full bg-surface-muted rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-surface-muted rounded animate-pulse" />
              <div className="h-4 w-4/5 bg-surface-muted rounded animate-pulse" />
            </div>

            {/* Reaction/comment buttons */}
            <div className="flex items-center gap-4 pt-2">
              <div className="h-8 w-20 bg-surface-muted rounded-lg animate-pulse" />
              <div className="h-8 w-24 bg-surface-muted rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

/**
 * Multiple skeletons for initial feed load
 */
export const AnnouncementListSkeleton: React.FC<{ count?: number }> = ({
  count = 3,
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <AnnouncementSkeleton key={i} />
      ))}
    </>
  );
};
