/**
 * useMobileProgressiveLoading Hook
 * Handles mobile infinite scroll and progressive loading
 */

import { useState, useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import type { Play } from "../../../../types/play";

const MOBILE_INITIAL_PLAYS = 4;

interface UseMobileProgressiveLoadingProps {
  displayPlays: Play[];
  isMobile: boolean;
  mobileListExpanded: boolean;
  onMobileListExpand?: () => void;
}

interface UseMobileProgressiveLoadingResult {
  visiblePlays: Play[];
  hasMorePlays: boolean;
  isLoadingMore: boolean;
  loadMoreRef: (node?: Element | null) => void;
  mobileVisibleCount: number;
  loadMore: () => void;
  loadAll: () => void;
}

export function useMobileProgressiveLoading({
  displayPlays,
  isMobile,
  mobileListExpanded,
  onMobileListExpand,
}: UseMobileProgressiveLoadingProps): UseMobileProgressiveLoadingResult {
  const [mobileVisibleCount, setMobileVisibleCount] =
    useState(MOBILE_INITIAL_PLAYS);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Intersection Observer for automatic loading
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
    rootMargin: "200px",
  });

  // Keep mobile list count in sync with filters/search changes and expansion state
  useEffect(() => {
    if (!isMobile) return;

    setMobileVisibleCount((prev) => {
      const maxVisible = displayPlays.length;
      if (mobileListExpanded) {
        return maxVisible;
      }

      const baseCount = Math.min(MOBILE_INITIAL_PLAYS, maxVisible);
      if (prev < baseCount) {
        return baseCount;
      }
      return Math.min(prev, maxVisible);
    });
  }, [isMobile, displayPlays.length, mobileListExpanded]);

  const visiblePlays = useMemo(() => {
    if (!isMobile) {
      return displayPlays;
    }
    const limit = Math.min(mobileVisibleCount, displayPlays.length);
    return displayPlays.slice(0, limit);
  }, [isMobile, mobileVisibleCount, displayPlays]);

  const hasMorePlays =
    isMobile && mobileVisibleCount < displayPlays.length && !mobileListExpanded;

  // Auto-load more when scroll trigger is visible
  useEffect(() => {
    if (inView && hasMorePlays && !isLoadingMore) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setMobileVisibleCount((prev) => {
          const next = Math.min(prev + 20, displayPlays.length);
          if (next === displayPlays.length) {
            onMobileListExpand?.();
          }
          return next;
        });
        setIsLoadingMore(false);
      }, 300);
    }
  }, [
    inView,
    hasMorePlays,
    isLoadingMore,
    displayPlays.length,
    onMobileListExpand,
  ]);

  const loadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setMobileVisibleCount((prev) => {
        const next = Math.min(prev + 20, displayPlays.length);
        if (next === displayPlays.length) {
          onMobileListExpand?.();
        }
        return next;
      });
      setIsLoadingMore(false);
    }, 300);
  };

  const loadAll = () => {
    setMobileVisibleCount(displayPlays.length);
    onMobileListExpand?.();
  };

  return {
    visiblePlays,
    hasMorePlays,
    isLoadingMore,
    loadMoreRef,
    mobileVisibleCount,
    loadMore,
    loadAll,
  };
}

export { MOBILE_INITIAL_PLAYS };
