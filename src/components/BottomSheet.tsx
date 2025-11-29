import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useDrag } from "@use-gesture/react";
import { useScrollLock } from "../hooks/useScrollLock";

interface BottomSheetProps {
  /** Content to display in the bottom sheet */
  children: React.ReactNode;
  /** Snap points as percentages of viewport height (0-1) */
  snapPoints?: number[];
  /** Initial snap point index */
  initialSnapPoint?: number;
  /** Callback when snap point changes */
  onSnapPointChange?: (snapPoint: number) => void;
  /** Background backdrop opacity (0-1) */
  backdropOpacity?: number;
  /** Whether to show the drag handle */
  showHandle?: boolean;
  /** Z-index for the bottom sheet */
  zIndex?: number;
}

/**
 * BottomSheet - Mobile-first draggable bottom sheet component
 *
 * Features:
 * - Draggable with gesture support
 * - Snap points at 80px, 50%, and 90% of viewport height
 * - Smooth spring animations
 * - Backdrop with tap-to-minimize
 * - Fully accessible
 */
export function BottomSheet({
  children,
  snapPoints = [0.08, 0.5, 0.9], // Default: peek, half, full
  initialSnapPoint = 0,
  onSnapPointChange,
  backdropOpacity = 0.3,
  showHandle = true,
  zIndex = 40,
}: BottomSheetProps) {
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 1000
  );
  const [currentSnapIndex, setCurrentSnapIndex] = useState(initialSnapPoint);
  const sheetRef = useRef<HTMLDivElement>(null);

  // 🚀 PERFORMANCE: Lock body scroll when sheet is significantly open (>10%)
  const isSheetOpen = snapPoints[currentSnapIndex] > 0.1;
  useScrollLock(isSheetOpen);

  // Motion value for Y position (pixels from bottom)
  const y = useMotionValue(viewportHeight * (1 - snapPoints[initialSnapPoint]));

  // Transform Y position to backdrop opacity
  const backdropOpacityValue = useTransform(
    y,
    [0, viewportHeight * 0.5],
    [backdropOpacity, 0]
  );

  // Update viewport height on resize
  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Animate to specific snap point
  const animateToSnapPoint = (snapIndex: number) => {
    const targetY = viewportHeight * (1 - snapPoints[snapIndex]);

    animate(y, targetY, {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    });

    setCurrentSnapIndex(snapIndex);
    onSnapPointChange?.(snapPoints[snapIndex]);
  };

  // Find nearest snap point
  const findNearestSnapPoint = (currentY: number): number => {
    const currentPercentage = 1 - currentY / viewportHeight;

    let nearestIndex = 0;
    let minDistance = Math.abs(snapPoints[0] - currentPercentage);

    for (let i = 1; i < snapPoints.length; i++) {
      const distance = Math.abs(snapPoints[i] - currentPercentage);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }

    return nearestIndex;
  };

  // Gesture handler for dragging
  const bind = useDrag(
    ({ down, movement: [, my], velocity: [, vy] }) => {
      // Calculate new Y position
      const newY = viewportHeight * (1 - snapPoints[currentSnapIndex]) + my;

      // Constrain to viewport bounds
      const constrainedY = Math.max(
        0,
        Math.min(viewportHeight * (1 - snapPoints[snapPoints.length - 1]), newY)
      );

      if (down) {
        // While dragging, update position directly
        y.set(constrainedY);
      } else {
        // On release, snap to nearest point
        // Consider velocity for flick gestures
        let targetIndex = findNearestSnapPoint(constrainedY);

        // If velocity is high, snap to next point in direction of movement
        if (Math.abs(vy) > 0.5) {
          if (vy > 0 && currentSnapIndex > 0) {
            // Flick down - minimize
            targetIndex = currentSnapIndex - 1;
          } else if (vy < 0 && currentSnapIndex < snapPoints.length - 1) {
            // Flick up - expand
            targetIndex = currentSnapIndex + 1;
          }
        }

        animateToSnapPoint(targetIndex);
      }
    },
    {
      axis: "y",
      pointer: { touch: true },
      from: () => [0, y.get()],
    }
  );

  // Handle backdrop tap to minimize
  const handleBackdropTap = () => {
    if (currentSnapIndex > 0) {
      animateToSnapPoint(0); // Go to peek state
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black pointer-events-auto"
        style={{
          opacity: backdropOpacityValue,
          zIndex: zIndex - 1,
        }}
        onClick={handleBackdropTap}
        initial={{ opacity: 0 }}
        animate={{ opacity: currentSnapIndex > 0 ? backdropOpacity : 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* Bottom Sheet */}
      <motion.div
        ref={sheetRef}
        className="fixed left-0 right-0 bg-primary rounded-t-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{
          y,
          bottom: 0,
          height: `${snapPoints[snapPoints.length - 1] * 100}vh`,
          zIndex,
          touchAction: "none",
        }}
        initial={{ y: viewportHeight }}
        animate={{ y: viewportHeight * (1 - snapPoints[initialSnapPoint]) }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 0.8,
        }}
      >
        {/* Drag Handle */}
        {showHandle && (
          <div
            {...bind()}
            className="flex justify-center items-center py-3 cursor-grab active:cursor-grabbing touch-none"
            role="button"
            aria-label="Drag to resize bottom sheet"
            tabIndex={0}
          >
            <div className="w-12 h-1.5 bg-border rounded-full" />
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </motion.div>
    </>
  );
}

/**
 * BottomSheetHeader - Optional header component for bottom sheet
 */
export function BottomSheetHeader({
  title,
  onClose,
}: {
  title: string;
  onClose?: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
      <h2 className="text-lg font-semibold text-primary">{title}</h2>
      {onClose && (
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-5 h-5 text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
