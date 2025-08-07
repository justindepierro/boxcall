/**
 * Advanced Gesture Components for Mobile Touch Experience
 * Part of Phase 3C: Professional Touch Experience
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { RefreshCw, ChevronDown } from 'lucide-react';
import { Typography } from '../design-system/Typography';

// Pull-to-refresh component
interface PullToRefreshProps {
  /** Refresh handler */
  onRefresh: () => Promise<void>;
  /** Pull threshold in pixels */
  threshold?: number;
  /** Loading state */
  isRefreshing?: boolean;
  /** Custom loading indicator */
  loadingIndicator?: React.ReactNode;
  /** Children content */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  threshold = 80,
  isRefreshing = false,
  loadingIndicator,
  children,
  className = '',
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);
    const adjustedDistance = Math.min(distance * 0.5, threshold * 1.5); // Damping effect

    setPullDistance(adjustedDistance);

    if (adjustedDistance > 10) {
      e.preventDefault(); // Prevent scrolling when pulling
    }
  }, [isPulling, startY, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;

    setIsPulling(false);

    if (pullDistance >= threshold && !isRefreshing) {
      await onRefresh();
    }

    // Smooth return animation
    setPullDistance(0);
  }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const showIndicator = pullDistance > 10 || isRefreshing;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        transform: `translateY(${isRefreshing ? threshold / 2 : pullDistance}px)`,
        transition: isPulling ? 'none' : 'transform 300ms cubic-bezier(0.2, 0, 0, 1)',
      }}
    >
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none"
        style={{
          height: threshold,
          transform: `translateY(-${threshold}px)`,
          opacity: showIndicator ? 1 : 0,
          transition: 'opacity 200ms ease-out',
        }}
      >
        {loadingIndicator || (
          <div className="flex flex-col items-center space-y-2">
            <div
              className={`transition-transform duration-200 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
              style={{
                transform: `rotate(${pullProgress * 180}deg)`,
              }}
            >
              {isRefreshing ? (
                <RefreshCw className="h-6 w-6 text-team-primary" />
              ) : (
                <ChevronDown className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <Typography variant="caption" className="text-gray-500">
              {isRefreshing 
                ? 'Refreshing...'
                : pullProgress >= 1 
                  ? 'Release to refresh' 
                  : 'Pull to refresh'
              }
            </Typography>
          </div>
        )}
      </div>

      {children}
    </div>
  );
};

// Swipeable item component for lists
interface SwipeableItemProps {
  /** Left swipe actions */
  leftActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    color: 'blue' | 'green' | 'red' | 'yellow' | 'gray';
    action: () => void;
  }>;
  /** Right swipe actions */
  rightActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    color: 'blue' | 'green' | 'red' | 'yellow' | 'gray';
    action: () => void;
  }>;
  /** Swipe threshold */
  threshold?: number;
  /** Item content */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
}

export const SwipeableItem: React.FC<SwipeableItemProps> = ({
  leftActions = [],
  rightActions = [],
  threshold = 80,
  children,
  className = '',
}) => {
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isActionsVisible, setIsActionsVisible] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const colorStyles = {
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    red: 'bg-red-500 text-white',
    yellow: 'bg-yellow-500 text-white',
    gray: 'bg-gray-500 text-white',
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return;

    const currentX = e.touches[0].clientX;
    const distance = currentX - startX;
    
    // Apply damping for smoother feel
    const dampedDistance = distance * 0.8;
    setSwipeDistance(dampedDistance);

    // Show actions when threshold is reached
    if (Math.abs(dampedDistance) >= threshold && !isActionsVisible) {
      setIsActionsVisible(true);
    }
  }, [isSwiping, startX, threshold, isActionsVisible]);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping) return;

    setIsSwiping(false);

    // Snap back if not enough swipe distance
    if (Math.abs(swipeDistance) < threshold) {
      setSwipeDistance(0);
      setIsActionsVisible(false);
    } else {
      // Snap to action position
      const snapDistance = swipeDistance > 0 ? threshold : -threshold;
      setSwipeDistance(snapDistance);
    }
  }, [isSwiping, swipeDistance, threshold]);

  const handleActionClick = useCallback((action: () => void) => {
    action();
    setSwipeDistance(0);
    setIsActionsVisible(false);
  }, []);

  const resetSwipe = useCallback(() => {
    setSwipeDistance(0);
    setIsActionsVisible(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (itemRef.current && !itemRef.current.contains(e.target as Node)) {
        resetSwipe();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [resetSwipe]);

  const actions = swipeDistance > 0 ? leftActions : rightActions;

  return (
    <div ref={itemRef} className={`relative overflow-hidden ${className}`}>
      {/* Action buttons */}
      {isActionsVisible && actions.length > 0 && (
        <div
          className={`absolute top-0 bottom-0 flex items-center ${
            swipeDistance > 0 ? 'left-0' : 'right-0'
          }`}
          style={{ width: Math.abs(swipeDistance) }}
        >
          {actions.map((action, index) => (
            <button
              key={index}
              className={`flex-1 h-full flex flex-col items-center justify-center space-y-1 ${
                colorStyles[action.color]
              }`}
              onClick={() => handleActionClick(action.action)}
            >
              {action.icon && <div className="text-sm">{action.icon}</div>}
              <Typography variant="caption" className="text-current">
                {action.label}
              </Typography>
            </button>
          ))}
        </div>
      )}

      {/* Item content */}
      <div
        className="bg-white relative z-10"
        style={{
          transform: `translateX(${swipeDistance}px)`,
          transition: isSwiping ? 'none' : 'transform 300ms cubic-bezier(0.2, 0, 0, 1)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};

// Long press context menu
interface LongPressMenuProps {
  /** Menu items */
  items: Array<{
    label: string;
    icon?: React.ReactNode;
    action: () => void;
    destructive?: boolean;
  }>;
  /** Long press duration in ms */
  duration?: number;
  /** Children trigger element */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
}

export const LongPressMenu: React.FC<LongPressMenuProps> = ({
  items,
  duration = 500,
  children,
  className = '',
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleLongPressStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
      setMenuPosition({ x, y });
    }

    longPressTimer.current = setTimeout(() => {
      setIsMenuOpen(true);
      // Add haptic-style feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, duration);
  }, [duration]);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleMenuItemClick = useCallback((action: () => void) => {
    action();
    setIsMenuOpen(false);
  }, []);

  const handleClickOutside = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMenuOpen, handleClickOutside]);

  return (
    <div ref={elementRef} className={`relative ${className}`}>
      <div
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        onTouchCancel={handleLongPressEnd}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
      >
        {children}
      </div>

      {/* Context menu */}
      {isMenuOpen && (
        <div
          className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[150px]"
          style={{
            left: menuPosition.x,
            top: menuPosition.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {items.map((item, index) => (
            <button
              key={index}
              className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 transition-colors ${
                item.destructive ? 'text-red-600' : 'text-gray-900'
              }`}
              onClick={() => handleMenuItemClick(item.action)}
            >
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              <Typography variant="body-sm" className="text-current">
                {item.label}
              </Typography>
            </button>
          ))}
        </div>
      )}

      {/* Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={handleClickOutside}
        />
      )}
    </div>
  );
};

export default PullToRefresh;
