import React, { useState, useRef, useCallback, useEffect } from "react";
import { Icon } from "../../ui/Icon";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";

interface SwipeActionsProps {
  children: React.ReactNode;
  playId: string;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
}

/**
 * Swipeable action drawer for play cards - Improved UX
 *
 * Design specs:
 * - Swipe threshold: 50px (easier trigger)
 * - Max swipe: 200px (reveals actions smoothly)
 * - Action width: 64px each (more compact)
 * - Animation: Spring physics for natural feel
 * - Haptic feedback at threshold crossing
 *
 * Gestures:
 * - Swipe left: Reveal actions (Edit, Copy, Delete)
 * - Swipe right: Quick close
 * - Tap outside: Reset to closed
 *
 * UX improvements:
 * - Haptic feedback when crossing threshold
 * - Visual rubber-banding at edges
 * - Faster, more responsive animations
 * - Better touch tracking
 */
export const SwipeActions: React.FC<SwipeActionsProps> = ({
  children,
  playId,
  onEdit,
  onDuplicate,
  onDelete,
  onArchive,
}) => {
  const [swipeX, setSwipeX] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasCrossedThreshold = useRef(false);

  const SWIPE_THRESHOLD = 50; // Easier to trigger
  const MAX_SWIPE = 200; // 3 actions × ~64px + padding
  const RUBBER_BAND_FACTOR = 0.3; // Resistance at edges

  // Reset swipe position
  const reset = useCallback(() => {
    setSwipeX(0);
    setIsOpen(false);
    setIsDragging(false);
    hasCrossedThreshold.current = false;
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
    setIsDragging(true);
    hasCrossedThreshold.current = false;
  }, []);

  // Handle touch move with rubber banding
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;

      currentX.current = e.touches[0].clientX;
      const diff = startX.current - currentX.current;

      // Haptic feedback when crossing threshold
      if (!hasCrossedThreshold.current && diff >= SWIPE_THRESHOLD) {
        hasCrossedThreshold.current = true;
        triggerHapticFeedback("light");
      }

      // Only allow swipe left (positive diff = left swipe)
      if (diff > 0) {
        let newSwipeX: number;
        if (diff <= MAX_SWIPE) {
          newSwipeX = diff;
        } else {
          // Rubber band effect past max
          const overflow = diff - MAX_SWIPE;
          newSwipeX = MAX_SWIPE + overflow * RUBBER_BAND_FACTOR;
        }
        setSwipeX(-newSwipeX);
      } else if (isOpen) {
        // Allow swipe right to close
        const closeAmount = Math.min(Math.abs(diff), MAX_SWIPE);
        setSwipeX(-(MAX_SWIPE - closeAmount));
      }
    },
    [isDragging, isOpen, MAX_SWIPE, SWIPE_THRESHOLD]
  );

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    const diff = startX.current - currentX.current;

    if (diff >= SWIPE_THRESHOLD) {
      // Snap to open position with haptic
      setSwipeX(-MAX_SWIPE);
      setIsOpen(true);
    } else {
      // Snap back to closed
      reset();
    }
  }, [SWIPE_THRESHOLD, MAX_SWIPE, reset]);

  // Handle mouse down (for desktop testing)
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      startX.current = e.clientX;
      currentX.current = e.clientX;
      setIsDragging(true);
      hasCrossedThreshold.current = false;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        currentX.current = moveEvent.clientX;
        const diff = startX.current - currentX.current;

        if (!hasCrossedThreshold.current && diff >= SWIPE_THRESHOLD) {
          hasCrossedThreshold.current = true;
        }

        if (diff > 0) {
          let newSwipeX: number;
          if (diff <= MAX_SWIPE) {
            newSwipeX = diff;
          } else {
            const overflow = diff - MAX_SWIPE;
            newSwipeX = MAX_SWIPE + overflow * RUBBER_BAND_FACTOR;
          }
          setSwipeX(-newSwipeX);
        } else if (isOpen) {
          const closeAmount = Math.min(Math.abs(diff), MAX_SWIPE);
          setSwipeX(-(MAX_SWIPE - closeAmount));
        }
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        const diff = startX.current - currentX.current;

        if (diff >= SWIPE_THRESHOLD) {
          setSwipeX(-MAX_SWIPE);
          setIsOpen(true);
        } else {
          reset();
        }

        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [isOpen, MAX_SWIPE, SWIPE_THRESHOLD, reset, RUBBER_BAND_FACTOR]
  );

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        reset();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, reset]);

  // Handle action clicks
  const handleAction = useCallback(
    (action: "edit" | "duplicate" | "delete" | "archive") => {
      triggerHapticFeedback("medium");
      reset();

      // Small delay to let animation complete
      setTimeout(() => {
        switch (action) {
          case "edit":
            onEdit?.();
            break;
          case "duplicate":
            onDuplicate?.();
            break;
          case "delete":
            onDelete?.();
            break;
          case "archive":
            onArchive?.();
            break;
        }
      }, 100);
    },
    [reset, onEdit, onDuplicate, onDelete, onArchive]
  );

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-xl"
      data-play-id={playId}
    >
      {/* Action buttons (hidden behind card) - Improved design */}
      <div className="absolute right-0 top-0 h-full flex items-stretch">
        {/* Edit Action */}
        {onEdit && (
          <button
            type="button"
            onClick={() => handleAction("edit")}
            className="
              flex flex-col items-center justify-center
              w-16 h-full
              bg-brand-jade
              text-white
              active:bg-brand-jade/80
              transition-colors duration-100
            "
            aria-label="Edit play"
          >
            <Icon name="edit" size="sm" className="mb-0.5" />
            <span className="text-xs font-medium">Edit</span>
          </button>
        )}

        {/* Duplicate Action */}
        {onDuplicate && (
          <button
            type="button"
            onClick={() => handleAction("duplicate")}
            className="
              flex flex-col items-center justify-center
              w-16 h-full
              bg-info-500
              text-white
              active:bg-info-600
              transition-colors duration-100
            "
            aria-label="Duplicate play"
          >
            <Icon name="copy" size="sm" className="mb-0.5" />
            <span className="text-xs font-medium">Copy</span>
          </button>
        )}

        {/* Delete Action */}
        {onDelete && (
          <button
            type="button"
            onClick={() => handleAction("delete")}
            className="
              flex flex-col items-center justify-center
              w-16 h-full
              bg-error-500
              text-white
              active:bg-error-600
              transition-colors duration-100
            "
            aria-label="Delete play"
          >
            <Icon name="delete" size="sm" className="mb-0.5" />
            <span className="text-xs font-medium">Delete</span>
          </button>
        )}

        {/* Archive Action (optional) */}
        {onArchive && (
          <button
            type="button"
            onClick={() => handleAction("archive")}
            className="
              flex flex-col items-center justify-center
              w-16 h-full
              bg-neutral-500
              text-white
              active:bg-neutral-600
              transition-colors duration-100
            "
            aria-label="Archive play"
          >
            <Icon name="folder" size="sm" className="mb-0.5" />
            <span className="text-xs font-medium">Archive</span>
          </button>
        )}
      </div>

      {/* Card (swipeable) - Improved animation */}
      <div
        className={`
          relative 
          bg-surface-primary 
          transition-transform 
          ${isDragging ? "duration-0" : "duration-200 ease-out"}
        `}
        style={{
          transform: `translateX(${swipeX}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {children}
      </div>
    </div>
  );
};
