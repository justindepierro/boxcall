/**
 * LoadMoreButton Component
 * Renders the load more / infinite scroll trigger
 */

import React from "react";
import { Button } from "../../../ui/Button/Button";

interface LoadMoreButtonProps {
  loadMoreRef: (node?: Element | null) => void;
  isLoadingMore: boolean;
  remainingCount: number;
  onLoadMore: () => void;
  variant?: "incremental" | "all";
  totalCount?: number;
}

export const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  loadMoreRef,
  isLoadingMore,
  remainingCount,
  onLoadMore,
  variant = "incremental",
  totalCount,
}) => {
  return (
    <div ref={loadMoreRef} className="flex justify-center py-6">
      {isLoadingMore ? (
        <div className="flex items-center gap-2 text-secondary">
          <div className="w-5 h-5 border-2 border-brand-jade border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">
            {variant === "all" ? "Loading..." : "Loading more..."}
          </span>
        </div>
      ) : (
        <Button
          onClick={onLoadMore}
          variant="secondary"
          className="w-full max-w-xs"
        >
          {variant === "all"
            ? `See All ${totalCount} Plays`
            : `Load More (${remainingCount} remaining)`}
        </Button>
      )}
    </div>
  );
};
