/**
 * NotificationBell Component
 * Displays unread notification count and dropdown with recent notifications
 */

import React, { useState, useEffect, useRef } from "react";
import { Bell, X, Check } from "lucide-react";
import { NotificationsService } from "../../services/notificationsService";
import type { NotificationWithUser } from "../../services/notificationsService";
import { formatDistanceToNow } from "date-fns";
import { Avatar } from "./Avatar";
import { useNavigate } from "react-router-dom";

export const NotificationBell: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationWithUser[]>(
    []
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load unread count
  const loadUnreadCount = async () => {
    const count = await NotificationsService.getUnreadCount();
    setUnreadCount(count);
  };

  // Load notifications
  const loadNotifications = async () => {
    setLoading(true);
    const notifs = await NotificationsService.getNotifications({ limit: 10 });
    setNotifications(notifs);
    setLoading(false);
  };

  useEffect(() => {
    loadUnreadCount();

    // Poll for unread count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  // Load notifications when dropdown opens
  useEffect(() => {
    if (showDropdown) {
      loadNotifications();
    }
  }, [showDropdown]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  const handleMarkAsRead = async (
    notificationId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    await NotificationsService.markAsRead(notificationId);
    await loadNotifications();
    await loadUnreadCount();
  };

  const handleMarkAllAsRead = async () => {
    await NotificationsService.markAllAsRead();
    await loadNotifications();
    await loadUnreadCount();
  };

  const handleNotificationClick = async (
    notification: NotificationWithUser
  ) => {
    // Mark as read
    if (!notification.read) {
      await NotificationsService.markAsRead(notification.id);
      await loadUnreadCount();
    }

    // Navigate to announcement
    if (notification.announcement_id) {
      navigate(`/team/${notification.announcement_id}`);
      setShowDropdown(false);
    }
  };

  const handleDeleteNotification = async (
    notificationId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    await NotificationsService.deleteNotification(notificationId);
    await loadNotifications();
    await loadUnreadCount();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-lg hover:bg-surface-muted transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-secondary" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-error-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-surface-primary rounded-lg shadow-xl z-50 max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-subtle flex items-center justify-between">
            <h3 className="font-semibold text-primary">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-accent hover:text-accent-hover transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center text-muted">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-muted">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`
                      p-4 border-b border-border last:border-b-0 cursor-pointer
                      hover:bg-surface-muted transition-colors
                      ${!notification.read ? "bg-blue-50" : ""}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      {notification.triggered_by_user && (
                        <Avatar
                          src={notification.triggered_by_user.avatar_url}
                          name={notification.triggered_by_user.display_name}
                          size="sm"
                        />
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary">
                          {notification.title}
                        </p>
                        <p className="text-xs text-secondary mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted mt-1">
                          {formatDistanceToNow(
                            new Date(notification.created_at),
                            {
                              addSuffix: true,
                            }
                          )}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <button
                            onClick={(e) =>
                              handleMarkAsRead(notification.id, e)
                            }
                            className="p-1 rounded hover:bg-surface-secondary transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4 text-accent" />
                          </button>
                        )}
                        <button
                          onClick={(e) =>
                            handleDeleteNotification(notification.id, e)
                          }
                          className="p-1 rounded hover:bg-surface-secondary transition-colors"
                          title="Delete"
                        >
                          <X className="w-4 h-4 text-secondary" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-border text-center">
              <button
                onClick={() => {
                  navigate("/notifications");
                  setShowDropdown(false);
                }}
                className="text-sm text-accent hover:text-accent-hover transition-colors"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
