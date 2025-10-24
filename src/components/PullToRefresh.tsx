import { useRef, useState, useCallback, type ReactNode } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Icon } from "./ui/Icon/Icon";

interface PullToRefreshProps {
  /** Content to wrap with pull-to-refresh */
  children: ReactNode;
  /** Callback when refresh is triggered */
  onRefresh: () => Promise<void>;
  /** Whether pull-to-refresh is enabled (default: true) */
  enabled?: boolean;
  /** Pull distance threshold to trigger refresh (default: 80px) */
  threshold?: number;
  /** Class name for container */
  className?: string;
}

/**
 * PullToRefresh Component
 *
 * Native mobile pull-to-refresh gesture with smooth animations.
 *
 * Features:
 * - Touch gesture detection
 * - Smooth spring animations
 * - Loading indicator
 * - Haptic-ready (visual feedback)
 *
 * @example
 * ```tsx
 * <PullToRefresh onRefresh={async () => await refetchData()}>
 *   <PlayGrid />
 * </PullToRefresh>
 * ```
 */
export function PullToRefresh({
  children,
  onRefresh,
  enabled = true,
  threshold = 80,
  className = "",
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const pullDistance = useMotionValue(0);

  // Transform pull distance to rotation for spinner
  const rotate = useTransform(pullDistance, [0, threshold], [0, 360]);
  const scale = useTransform(
    pullDistance,
    [0, threshold / 2, threshold],
    [0, 0.8, 1]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || isRefreshing) return;

      const scrollTop = containerRef.current?.scrollTop || 0;
      // Only allow pull-to-refresh when at the top
      if (scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    },
    [enabled, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || isRefreshing || !isPulling) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY.current;

      // Only allow pulling down
      if (deltaY > 0) {
        // Add resistance as you pull further
        const resistance = 0.5;
        const distance = Math.min(deltaY * resistance, threshold * 1.5);
        pullDistance.set(distance);
      }
    },
    [enabled, isRefreshing, isPulling, pullDistance, threshold]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!enabled || isRefreshing || !isPulling) return;

    setIsPulling(false);
    const distance = pullDistance.get();

    if (distance >= threshold) {
      // Trigger refresh
      setIsRefreshing(true);

      // Animate to threshold position
      await animate(pullDistance, threshold, {
        type: "spring",
        stiffness: 300,
        damping: 30,
      });

      try {
        await onRefresh();
      } catch (error) {
        console.error("Refresh failed:", error);
      } finally {
        // Animate back to 0
        await animate(pullDistance, 0, {
          type: "spring",
          stiffness: 300,
          damping: 30,
        });
        setIsRefreshing(false);
      }
    } else {
      // Snap back
      animate(pullDistance, 0, {
        type: "spring",
        stiffness: 300,
        damping: 30,
      });
    }
  }, [enabled, isRefreshing, isPulling, pullDistance, threshold, onRefresh]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {/* Pull-to-refresh indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none z-50"
        style={{
          height: pullDistance,
          opacity: useTransform(pullDistance, [0, threshold], [0, 1]),
        }}
      >
        <motion.div
          className="bg-surface-primary rounded-full p-3 shadow-lg"
          style={{
            scale,
            rotate: isRefreshing ? 0 : rotate,
          }}
          animate={
            isRefreshing
              ? {
                  rotate: [0, 360],
                  transition: {
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  },
                }
              : {}
          }
        >
          <Icon
            name="refresh-cw"
            className={`h-5 w-5 ${isRefreshing ? "text-brand-primary" : "text-text-secondary"}`}
          />
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{
          y: pullDistance,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
