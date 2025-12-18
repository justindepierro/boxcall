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

// Swipe configuration constants
const SWIPE_CONFIG = {
  THRESHOLD: 50, // Easier to trigger
  MAX_SWIPE: 200, // 3 actions × ~64px + padding
  RUBBER_BAND_FACTOR: 0.3, // Resistance at edges
};

// Action button configuration
interface ActionButtonConfig {
  action: "edit" | "duplicate" | "delete" | "archive";
  label: string;
  icon: string;
  bgColor: string;
  activeColor: string;
  ariaLabel: string;
}

const ACTION_BUTTONS: Record<string, ActionButtonConfig> = {
  edit: {
    action: "edit",
    label: "Edit",
    icon: "edit",
    bgColor: "bg-brand-jade",
    activeColor: "active:bg-brand-jade/80",
    ariaLabel: "Edit play",
  },
  duplicate: {
    action: "duplicate",
    label: "Copy",
    icon: "copy",
    bgColor: "bg-info-500",
    activeColor: "active:bg-info-600",
    ariaLabel: "Duplicate play",
  },
  delete: {
    action: "delete",
    label: "Delete",
    icon: "delete",
    bgColor: "bg-error-500",
    activeColor: "active:bg-error-600",
    ariaLabel: "Delete play",
  },
  archive: {
    action: "archive",
    label: "Archive",
    icon: "folder",
    bgColor: "bg-neutral-500",
    activeColor: "active:bg-neutral-600",
    ariaLabel: "Archive play",
  },
};

// Action button component
const ActionButton: React.FC<{
  config: ActionButtonConfig;
  onClick: () => void;
}> = ({ config, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      flex flex-col items-center justify-center
      w-16 h-full
      ${config.bgColor}
      text-white
      ${config.activeColor}
      transition-colors duration-100
    `}
    aria-label={config.ariaLabel}
  >
    <Icon name={config.icon as any} size="sm" className="mb-0.5" />
    <span className="text-xs font-medium">{config.label}</span>
  </button>
);

// Hook to handle click outside to close
function useClickOutside(
  isOpen: boolean,
  containerRef: React.RefObject<HTMLElement | null>,
  onClose: () => void
) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
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
  }, [isOpen, containerRef, onClose]);
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

  const { THRESHOLD, MAX_SWIPE, RUBBER_BAND_FACTOR } = SWIPE_CONFIG;

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
      if (!hasCrossedThreshold.current && diff >= THRESHOLD) {
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
    [isDragging, isOpen, MAX_SWIPE, THRESHOLD, RUBBER_BAND_FACTOR]
  );

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    const diff = startX.current - currentX.current;

    if (diff >= THRESHOLD) {
      // Snap to open position with haptic
      setSwipeX(-MAX_SWIPE);
      setIsOpen(true);
    } else {
      // Snap back to closed
      reset();
    }
  }, [THRESHOLD, MAX_SWIPE, reset]);

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

        if (!hasCrossedThreshold.current && diff >= THRESHOLD) {
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

        if (diff >= THRESHOLD) {
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
    [isOpen, MAX_SWIPE, THRESHOLD, reset, RUBBER_BAND_FACTOR]
  );

  // Close on click outside
  useClickOutside(isOpen, containerRef, reset);

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
        {onEdit && (
          <ActionButton
            config={ACTION_BUTTONS.edit}
            onClick={() => handleAction("edit")}
          />
        )}
        {onDuplicate && (
          <ActionButton
            config={ACTION_BUTTONS.duplicate}
            onClick={() => handleAction("duplicate")}
          />
        )}
        {onDelete && (
          <ActionButton
            config={ACTION_BUTTONS.delete}
            onClick={() => handleAction("delete")}
          />
        )}
        {onArchive && (
          <ActionButton
            config={ACTION_BUTTONS.archive}
            onClick={() => handleAction("archive")}
          />
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
