/**
 * React Hook for Real-Time Messaging
 * Phase 2B Sprint 5: Smart Communication Hub
 *
 * Provides reactive interface to messaging service with dashboard context integration
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  messagingService,
  type Message,
  type MessageThread,
  type SmartNotification,
  type TeamAnnouncement,
  type MessageUser,
} from "../services/messaging/MessagingService";

export interface UseMessagingOptions {
  userId: string;
  teamId: string;
  autoConnect?: boolean;
  enableNotifications?: boolean;
}

export interface MessagingState {
  isConnected: boolean;
  currentUser: MessageUser | null;
  onlineUsers: MessageUser[];

  // Messages and threads
  messages: Message[];
  threads: MessageThread[];
  activeThread: MessageThread | null;

  // Notifications and announcements
  notifications: SmartNotification[];
  unreadCount: number;
  announcements: TeamAnnouncement[];

  // UI state
  isLoading: boolean;
  error: string | null;
}

export interface UseMessagingReturn extends MessagingState {
  // Connection management
  connect: () => Promise<void>;
  disconnect: () => void;

  // Message operations
  sendMessage: (content: string, threadId?: string) => Promise<Message>;
  sendWidgetMessage: (
    content: string,
    widgetId: string,
    widgetType: string,
    action: "edited" | "commented" | "shared" | "updated",
    dataSnapshot?: Record<string, unknown>
  ) => Promise<Message>;
  markAsRead: (messageId: string) => Promise<void>;

  // Thread management
  createThread: (
    title: string,
    participants: string[],
    contextId?: string
  ) => Promise<MessageThread>;
  setActiveThread: (threadId: string | null) => void;
  getWidgetDiscussions: (widgetId: string) => Promise<Message[]>;

  // Notifications
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;

  // Announcements
  createAnnouncement: (
    title: string,
    content: string,
    targetRoles: Array<"coach" | "player" | "admin" | "parent">,
    priority?: "info" | "important" | "urgent"
  ) => Promise<TeamAnnouncement>;

  // User management
  updateStatus: (isOnline: boolean) => Promise<void>;

  // Real-time updates
  refreshData: () => Promise<void>;
}

export function useMessaging({
  userId,
  teamId,
  autoConnect = true,
  enableNotifications = true,
}: UseMessagingOptions): UseMessagingReturn {
  const [state, setState] = useState<MessagingState>({
    isConnected: false,
    currentUser: null,
    onlineUsers: [],
    messages: [],
    threads: [],
    activeThread: null,
    notifications: [],
    unreadCount: 0,
    announcements: [],
    isLoading: false,
    error: null,
  });

  const refreshTimeoutRef = useRef<number | null>(null);

  /**
   * Data Refresh
   */
  const refreshData = useCallback(async () => {
    try {
      const [threads, notifications, announcements, onlineUsers] =
        await Promise.all([
          messagingService.getThreads(userId),
          messagingService.getNotifications(userId),
          messagingService.getAnnouncements(),
          messagingService.getOnlineUsers(),
        ]);

      const unreadCount = notifications.filter(
        (n: SmartNotification) => !n.isRead
      ).length;

      setState((prev) => ({
        ...prev,
        threads,
        notifications,
        announcements,
        onlineUsers,
        unreadCount,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Failed to refresh data",
      }));
    }
  }, [userId]);

  /**
   * Connection Management
   */
  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await messagingService.connect(userId, teamId);
      await refreshData();

      setState((prev) => ({
        ...prev,
        isConnected: true,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Connection failed",
        isLoading: false,
      }));
    }
  }, [userId, teamId, refreshData]);

  const disconnect = useCallback(() => {
    messagingService.disconnect();
    setState((prev) => ({
      ...prev,
      isConnected: false,
      currentUser: null,
      onlineUsers: [],
    }));
  }, []);

  /**
   * Message Operations
   */
  const sendMessage = useCallback(
    async (content: string, threadId?: string): Promise<Message> => {
      const message = await messagingService.sendMessage(content, threadId);

      // Update local state
      setState((prev) => ({
        ...prev,
        messages: threadId ? prev.messages : [...prev.messages, message],
      }));

      // Refresh threads to get updated message counts
      window.setTimeout(refreshData, 100);

      return message;
    },
    [refreshData]
  );

  const sendWidgetMessage = useCallback(
    async (
      content: string,
      widgetId: string,
      widgetType: string,
      action: "edited" | "commented" | "shared" | "updated",
      dataSnapshot?: Record<string, unknown>
    ): Promise<Message> => {
      const message = await messagingService.sendWidgetContextMessage(
        content,
        widgetId,
        widgetType,
        action,
        dataSnapshot
      );

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, message],
      }));

      return message;
    },
    []
  );

  const markAsRead = useCallback(
    async (messageId: string): Promise<void> => {
      await messagingService.markMessageAsRead(messageId, userId);

      // Update local state
      setState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                readBy: [
                  ...(msg.readBy || []),
                  { userId, timestamp: new Date() },
                ],
              }
            : msg
        ),
      }));
    },
    [userId]
  );

  /**
   * Thread Management
   */
  const createThread = useCallback(
    async (
      title: string,
      participants: string[],
      contextId?: string
    ): Promise<MessageThread> => {
      const thread = await messagingService.createThread(
        title,
        participants,
        contextId ? "widget-discussion" : "general",
        contextId
      );

      setState((prev) => ({
        ...prev,
        threads: [thread, ...prev.threads],
      }));

      return thread;
    },
    []
  );

  const setActiveThread = useCallback(
    (threadId: string | null) => {
      const thread = threadId
        ? state.threads.find((t) => t.id === threadId) || null
        : null;
      setState((prev) => ({ ...prev, activeThread: thread }));

      // Load messages for active thread
      if (thread && threadId) {
        messagingService.getMessages(threadId).then((messages: Message[]) => {
          setState((prev) => ({ ...prev, messages }));
        });
      }
    },
    [state.threads]
  );

  const getWidgetDiscussions = useCallback(
    async (widgetId: string): Promise<Message[]> => {
      return await messagingService.getWidgetDiscussions(widgetId);
    },
    []
  );

  /**
   * Notification Management
   */
  const markNotificationAsRead = useCallback(
    async (notificationId: string): Promise<void> => {
      await messagingService.markNotificationAsRead(notificationId);

      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));
    },
    []
  );

  const clearAllNotifications = useCallback(async (): Promise<void> => {
    // Mark all as read
    const readPromises = state.notifications
      .filter((n) => !n.isRead)
      .map((n) => messagingService.markNotificationAsRead(n.id));

    await Promise.all(readPromises);

    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  }, [state.notifications]);

  /**
   * Announcement Management
   */
  const createAnnouncement = useCallback(
    async (
      title: string,
      content: string,
      targetRoles: Array<"coach" | "player" | "admin" | "parent">,
      priority: "info" | "important" | "urgent" = "info"
    ): Promise<TeamAnnouncement> => {
      const announcement = await messagingService.createAnnouncement({
        title,
        content,
        authorId: userId,
        authorName: state.currentUser?.name || "Unknown",
        targetRoles,
        priority,
      });

      setState((prev) => ({
        ...prev,
        announcements: [announcement, ...prev.announcements],
      }));

      return announcement;
    },
    [userId, state.currentUser?.name]
  );

  /**
   * User Management
   */
  const updateStatus = useCallback(
    async (isOnline: boolean): Promise<void> => {
      await messagingService.updateUserStatus(userId, isOnline);

      setState((prev) => ({
        ...prev,
        currentUser: prev.currentUser
          ? { ...prev.currentUser, isOnline }
          : null,
      }));
    },
    [userId]
  );

  /**
   * Event Listeners Setup
   */
  useEffect(() => {
    const handleMessageSent = (message: Message) => {
      setState((prev) => ({
        ...prev,
        messages:
          prev.activeThread?.id === message.threadId
            ? [...prev.messages, message]
            : prev.messages,
      }));
    };

    const handleThreadUpdated = (thread: MessageThread) => {
      setState((prev) => ({
        ...prev,
        threads: prev.threads.map((t) => (t.id === thread.id ? thread : t)),
        activeThread:
          prev.activeThread?.id === thread.id ? thread : prev.activeThread,
      }));
    };

    const handleNotificationCreated = (notification: SmartNotification) => {
      if (
        notification.userId === userId ||
        notification.userId === "broadcast"
      ) {
        setState((prev) => ({
          ...prev,
          notifications: [notification, ...prev.notifications],
          unreadCount: prev.unreadCount + 1,
        }));

        // Browser notification if enabled
        if (
          enableNotifications &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          new Notification(notification.title, {
            body: notification.content,
            icon: "/favicon.ico",
          });
        }
      }
    };

    const handleAnnouncementCreated = (announcement: TeamAnnouncement) => {
      setState((prev) => ({
        ...prev,
        announcements: [announcement, ...prev.announcements],
      }));
    };

    // Register event listeners
    messagingService.on("message-sent", handleMessageSent);
    messagingService.on("thread-updated", handleThreadUpdated);
    messagingService.on("notification-created", handleNotificationCreated);
    messagingService.on("announcement-created", handleAnnouncementCreated);

    return () => {
      messagingService.off("message-sent", handleMessageSent);
      messagingService.off("thread-updated", handleThreadUpdated);
      messagingService.off("notification-created", handleNotificationCreated);
      messagingService.off("announcement-created", handleAnnouncementCreated);
    };
  }, [userId, enableNotifications, state.activeThread?.id]);

  /**
   * Auto-connect and periodic refresh
   */
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, [autoConnect, connect]);

  useEffect(() => {
    if (state.isConnected) {
      // Periodic refresh every 30 seconds
      refreshTimeoutRef.current = window.setTimeout(refreshData, 30000);
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, [state.isConnected, refreshData]);

  /**
   * Browser notification permission
   */
  useEffect(() => {
    if (
      enableNotifications &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  }, [enableNotifications]);

  return {
    ...state,
    connect,
    disconnect,
    sendMessage,
    sendWidgetMessage,
    markAsRead,
    createThread,
    setActiveThread,
    getWidgetDiscussions,
    markNotificationAsRead,
    clearAllNotifications,
    createAnnouncement,
    updateStatus,
    refreshData,
  };
}
