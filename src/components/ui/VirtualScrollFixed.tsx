/**
 * Virtual Scrolling Component
 * Part of Phase 3D: Final Mobile Polish & Performance Optimization
 */
import React, { useState, useCallback, useRef, useMemo } from "react";

interface VirtualScrollProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  overscan?: number;
  containerHeight?: number;
  bufferSize?: number;
  keyExtractor?: (item: T, index: number) => string | number;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
}

export function VirtualScroll<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className = "",
  onScroll,
  overscan = 5,
  containerHeight,
  keyExtractor = (_, index) => index,
  loading = false,
  loadingComponent,
  emptyComponent,
  onEndReached,
  onEndReachedThreshold = 100,
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const visibleRange = useMemo(() => {
    const containerH = containerHeight || height;
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerH / itemHeight) + overscan,
      items.length - 1
    );

    return { startIndex: Math.max(0, startIndex - overscan), endIndex };
  }, [scrollTop, itemHeight, height, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items
      .slice(visibleRange.startIndex, visibleRange.endIndex + 1)
      .map((item, index) => ({
        item,
        index: visibleRange.startIndex + index,
        key: keyExtractor(item, visibleRange.startIndex + index),
      }));
  }, [items, visibleRange.startIndex, visibleRange.endIndex, keyExtractor]);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = event.currentTarget.scrollTop;
      setScrollTop(newScrollTop);
      onScroll?.(newScrollTop);

      // Check if we should load more items
      if (onEndReached) {
        const { scrollHeight, clientHeight } = event.currentTarget;
        const isNearBottom =
          scrollHeight - (newScrollTop + clientHeight) <= onEndReachedThreshold;
        if (isNearBottom && !loading) {
          onEndReached();
        }
      }
    },
    [onScroll, onEndReached, onEndReachedThreshold, loading]
  );

  // Total height of all items
  const totalHeight = items.length * itemHeight;

  // Offset for visible items
  const offsetY = visibleRange.startIndex * itemHeight;

  if (items.length === 0) {
    return (
      <div
        className={`${className} flex items-center justify-center`}
        style={{ height }}
      >
        {emptyComponent || (
          <div className="text-gray-500 text-center">
            <p>No items to display</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map(({ item, index, key }) => (
            <div
              key={key}
              style={{
                height: itemHeight,
                overflow: "hidden",
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}

          {loading && loadingComponent && (
            <div
              style={{
                height: itemHeight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {loadingComponent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VirtualScroll;
