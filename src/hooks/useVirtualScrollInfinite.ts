/**
 * Virtual Scroll Hooks
 * Part of Phase 3D: Final Mobile Polish & Performance Optimization
 */
import { useState, useCallback, useRef } from "react";

interface UseVirtualScrollInfiniteProps<T> {
  items: T[];
  loadMore: () => Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
}

export function useVirtualScrollInfinite<T>({
  items,
  loadMore,
  hasMore,
  isLoading,
  threshold = 5,
}: UseVirtualScrollInfiniteProps<T>) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingRef = useRef(false);

  const handleLoadMore = useCallback(async () => {
    if (loadingRef.current || isLoading || !hasMore) {
      return;
    }

    loadingRef.current = true;
    setIsLoadingMore(true);

    try {
      await loadMore();
    } catch (error) {
      console.error("Failed to load more items:", error);
    } finally {
      loadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [loadMore, isLoading, hasMore]);

  // Auto-load when reaching threshold
  const checkAutoLoad = useCallback(
    (visibleEndIndex: number) => {
      const shouldLoad = visibleEndIndex >= items.length - threshold;
      if (shouldLoad && hasMore && !isLoading && !isLoadingMore) {
        handleLoadMore();
      }
    },
    [items.length, threshold, hasMore, isLoading, isLoadingMore, handleLoadMore]
  );

  return {
    isLoadingMore,
    handleLoadMore,
    checkAutoLoad,
  };
}
