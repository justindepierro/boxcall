// Notifications Component
// Displays user notifications (mentions, reactions, follows, etc.)

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { socialService } from "../../services/socialService";
import type { Notification } from "../../types/social";
import { logError } from "../../utils/logger";

interface NotificationsBellProps {
  userId: string;
  onNotificationClick?: (notification: Notification) => void;
}

export const NotificationsBell: React.FC<NotificationsBellProps> = ({
  userId,
  onNotificationClick,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const result = await socialService.getNotifications();
      setNotifications(result.notifications);
      setUnreadCount(result.unread_count);
    } catch (error) {
      logError("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Add new notification and update count
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, loadNotifications]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await socialService.markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      logError("Failed to mark notification as read:", error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    onNotificationClick?.(notification);
    setShowDropdown(false);
  };

  // Format notification message
  const formatNotificationMessage = (notification: Notification): string => {
    return notification.message || notification.title;
  };

  // Get notification icon
  const getNotificationIcon = (type: string): string => {
    switch (type) {
      case "reaction":
        return "👍";
      case "follow":
        return "👤";
      case "comment":
        return "💬";
      case "mention":
        return "@";
      default:
        return "🔔";
    }
  };

  return (
    <div className="relative overflow-visible">
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-secondary hover:text-primary focus:outline-none focus:ring-2 focus:ring-text-info rounded-full overflow-visible"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-5-5V7a3 3 0 00-6 0v5l-5 5h5m0 0v1a3 3 0 006 0v-1m-6 0h6"
          />
        </svg>

        {/* Unread indicator */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-text-error text-inverse text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-primary border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-border">
            <h3 className="text-lg font-semibold">Notifications</h3>
          </div>

          {(() => {
            if (loading) {
              return (
                <div className="p-4 text-center text-muted">
                  Loading notifications...
                </div>
              );
            }
            if (notifications.length === 0) {
              return (
                <div className="p-4 text-center text-muted">
                  No notifications yet
                </div>
              );
            }
            return (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={(() => {
                      const base =
                        "w-full p-4 text-left hover:bg-secondary focus:outline-none focus:bg-secondary ";
                      if (!notification.is_read) return `${base}bg-info/20`;
                      return base;
                    })()}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <span className="text-lg">
                          {getNotificationIcon(notification.notification_type)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-primary">
                          {formatNotificationMessage(notification)}
                        </p>
                        <p className="text-xs text-muted mt-1">
                          {new Date(
                            notification.created_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-text-info rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            );
          })()}

          {notifications.length > 0 && (
            <div className="p-4 border-t border-border">
              <button
                onClick={() => {
                  // Mark all as read
                  notifications.forEach((n) => {
                    if (!n.is_read) markAsRead(n.id);
                  });
                }}
                className="text-sm text-info hover:text-info"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
