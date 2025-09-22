import React, { useState } from "react";
import { Button } from "./Button";
import { Icon } from "./Icon/Icon";

export interface NotificationBellProps {
  /** Number of unread notifications */
  unreadCount?: number;
  /** Callback when bell is clicked */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Notification Bell Component
 * Shows a bell icon with optional badge for unread notifications
 */
export const NotificationBell: React.FC<NotificationBellProps> = ({
  unreadCount = 0,
  onClick,
  className = "",
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (unreadCount > 0) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }
    onClick?.();
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className="p-2 hover:bg-surface-hover rounded-lg transition-colors relative"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Icon
          name={unreadCount > 0 ? "alert" : "message"}
          size="md"
          className={`text-text-secondary hover:text-text-primary transition-colors ${
            isAnimating ? "animate-pulse" : ""
          }`}
        />
      </Button>

      {/* Unread badge */}
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {unreadCount > 99 ? "99+" : unreadCount}
        </div>
      )}
    </div>
  );
};
