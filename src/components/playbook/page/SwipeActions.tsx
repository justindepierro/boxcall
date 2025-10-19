import React, { useState, useRef, useCallback, useEffect } from "react";
import { Icon } from "../../ui/Icon";

interface SwipeActionsProps {
  children: React.ReactNode;
  playId: string;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
}

/**
 * Swipeable action drawer for play cards
 * 
 * Design specs:
 * - Swipe threshold: 60px (easy to trigger)
 * - Max swipe: 240px (reveals 3 actions)
 * - Action width: 80px each
 * - Animation: 200ms cubic-bezier
 * - Haptic feedback at threshold
 * 
 * Gestures:
 * - Swipe left: Reveal actions (Delete, Duplicate, Archive)
 * - Swipe right: Quick edit (or reset if actions showing)
 * - Tap outside: Reset to closed
 * 
 * Usage:
 * Wrap MobilePlayCard in this component to enable swipe actions
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
  const startX = useRef(0);
  const currentX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 60; // Minimum swipe to trigger action reveal
  const MAX_SWIPE = 240; // Maximum swipe distance (3 actions × 80px)

  // Reset swipe position
  const reset = useCallback(() => {
    setSwipeX(0);
    setIsOpen(false);
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
  }, []);

  // Handle touch move
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      currentX.current = e.touches[0].clientX;
      const diff = startX.current - currentX.current;

      // Only allow swipe left (negative X)
      if (diff > 0) {
        const newSwipeX = Math.min(diff, MAX_SWIPE);
        setSwipeX(-newSwipeX);

        // Update open state at threshold
        if (!isOpen && newSwipeX >= SWIPE_THRESHOLD) {
          setIsOpen(true);
        }
      } else if (isOpen) {
        // Allow swipe right to close if already open
        const newSwipeX = Math.max(diff, 0);
        setSwipeX(-newSwipeX);
      }
    },
    [isOpen, MAX_SWIPE, SWIPE_THRESHOLD]
  );

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    const diff = startX.current - currentX.current;

    if (diff >= SWIPE_THRESHOLD) {
      // Snap to open position
      setSwipeX(-MAX_SWIPE);
      setIsOpen(true);
    } else {
      // Snap back to closed
      reset();
    }
  }, [SWIPE_THRESHOLD, MAX_SWIPE, reset]);

  // Handle mouse down (for desktop testing)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    startX.current = e.clientX;
    currentX.current = e.clientX;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      currentX.current = moveEvent.clientX;
      const diff = startX.current - currentX.current;

      if (diff > 0) {
        const newSwipeX = Math.min(diff, MAX_SWIPE);
        setSwipeX(-newSwipeX);

        if (!isOpen && newSwipeX >= SWIPE_THRESHOLD) {
          setIsOpen(true);
        }
      } else if (isOpen) {
        const newSwipeX = Math.max(diff, 0);
        setSwipeX(-newSwipeX);
      }
    };

    const handleMouseUp = () => {
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
  }, [isOpen, MAX_SWIPE, SWIPE_THRESHOLD, reset]);

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
      reset();

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
    },
    [reset, onEdit, onDuplicate, onDelete, onArchive]
  );

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden touch-pan-y"
      data-play-id={playId}
    >
      {/* Action buttons (hidden behind card) */}
      <div className="absolute right-0 top-0 h-full flex">
        {/* Edit Action */}
        {onEdit && (
          <button
            type="button"
            onClick={() => handleAction("edit")}
            className="
              flex flex-col items-center justify-center
              w-20 h-full
              bg-primary-500
              text-white
              hover:bg-primary-600
              active:bg-primary-700
              transition-colors duration-150
            "
            aria-label="Edit play"
          >
            <Icon name="edit" size="md" className="mb-1" />
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
              w-20 h-full
              bg-info-500
              text-white
              hover:bg-info-600
              active:bg-info-700
              transition-colors duration-150
            "
            aria-label="Duplicate play"
          >
            <Icon name="copy" size="md" className="mb-1" />
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
              w-20 h-full
              bg-error-500
              text-white
              hover:bg-error-600
              active:bg-error-700
              transition-colors duration-150
            "
            aria-label="Delete play"
          >
            <Icon name="delete" size="md" className="mb-1" />
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
              w-20 h-full
              bg-surface-muted
              text-primary
              hover:bg-surface-secondary
              active:bg-surface-tertiary
              transition-colors duration-150
            "
            aria-label="Archive play"
          >
            <Icon name="folder" size="md" className="mb-1" />
            <span className="text-xs font-medium">Archive</span>
          </button>
        )}
      </div>

      {/* Card (swipeable) */}
      <div
        className="relative bg-surface-primary transition-transform duration-200 ease-out"
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
