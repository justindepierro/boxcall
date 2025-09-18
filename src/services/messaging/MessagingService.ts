/**
 * Real-Time Messaging Service
 * Phase 2B Sprint 5: Smart Communication Hub
 *
 * Provides integrated messaging capabilities for collaborative dashboards
 * - Context-aware messaging tied to dashboard widgets
 * - Smart notifications and team announcements
 * - Message threading and collaboration context
 */

import { EventEmitter } from "events";

export interface MessageUser {
  id: string;
  name: string;
  role: "coach" | "player" | "admin" | "parent";
  avatar?: string;
  isOnline: boolean;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  type: "message" | "system" | "announcement" | "widget-context";
  threadId?: string;

  // Dashboard context integration
  dashboardContext?: {
    widgetId?: string;
    widgetType?: string;
    dataSnapshot?: Record<string, unknown>;
    action?: "edited" | "commented" | "shared" | "updated";
  };

  // Rich content support
  attachments?: Array<{
    type: "image" | "file" | "chart-snapshot" | "widget-link";
    url: string;
    name: string;
    size?: number;
  }>;

  // Reaction and engagement
  reactions?: Array<{
    userId: string;
    emoji: string;
    timestamp: Date;
  }>;

  readBy?: Array<{
    userId: string;
    timestamp: Date;
  }>;
}

export interface MessageThread {
  id: string;
  title?: string;
  participants: string[];
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;

  // Context linking
  contextType?:
    | "general"
    | "widget-discussion"
    | "team-planning"
    | "goal-tracking";
  contextId?: string;

  // Thread management
  isArchived: boolean;
  isPinned: boolean;
  priority: "low" | "normal" | "high" | "urgent";
}

export interface SmartNotification {
  id: string;
  type: "message" | "mention" | "widget-change" | "team-update" | "system";
  title: string;
  content: string;
  userId: string;
  timestamp: Date;
  isRead: boolean;

  // Action integration
  actionContext?: {
    type: "open-widget" | "join-discussion" | "view-change" | "approve-request";
    widgetId?: string;
    threadId?: string;
    data?: Record<string, unknown>;
  };

  // Smart timing
  deliveryPreferences?: {
    immediate: boolean;
    digest: boolean;
    quiet_hours: boolean;
  };
}

export interface TeamAnnouncement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  timestamp: Date;

  // Targeting and distribution
  targetRoles: Array<"coach" | "player" | "admin" | "parent">;
  targetUsers?: string[];
  priority: "info" | "important" | "urgent";

  // Engagement tracking
  readBy: Array<{
    userId: string;
    timestamp: Date;
  }>;

  // Rich content
  attachments?: Array<{
    type: "image" | "document" | "video" | "dashboard-link";
    url: string;
    name: string;
  }>;

  // Scheduling and expiry
  scheduledFor?: Date;
  expiresAt?: Date;
}

export class MessagingService extends EventEmitter {
  private messages = new Map<string, Message>();
  private threads = new Map<string, MessageThread>();
  private notifications = new Map<string, SmartNotification>();
  private announcements = new Map<string, TeamAnnouncement>();
  private users = new Map<string, MessageUser>();

  // Connection state
  private isConnected = false;
  private currentUserId: string | null = null;

  constructor() {
    super();
    this.setupMockData();
  }

  /**
   * Connection Management
   */
  async connect(userId: string, teamId: string): Promise<void> {
    this.currentUserId = userId;
    this.isConnected = true;

    // In real implementation: WebSocket connection setup
// console.info(
      `[MessagingService] Connected user ${userId} to team ${teamId}`
    );

    this.emit("connected", { userId, teamId });

    // Load user's unread messages and notifications
    this.loadUnreadContent(userId);
  }

  disconnect(): void {
    this.isConnected = false;
    this.currentUserId = null;
    this.emit("disconnected");
  }

  isUserConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Message Management
   */
  async sendMessage(
    content: string,
    threadId?: string,
    dashboardContext?: Message["dashboardContext"]
  ): Promise<Message> {
    if (!this.currentUserId) {
      throw new Error("User not connected");
    }

    const message: Message = {
      id: this.generateId(),
      content,
      senderId: this.currentUserId,
      senderName: this.users.get(this.currentUserId)?.name || "Unknown",
      timestamp: new Date(),
      type: dashboardContext ? "widget-context" : "message",
      threadId,
      dashboardContext,
      reactions: [],
      readBy: [{ userId: this.currentUserId, timestamp: new Date() }],
    };

    this.messages.set(message.id, message);

    // Add to thread if specified
    if (threadId) {
      const thread = this.threads.get(threadId);
      if (thread) {
        thread.messages.push(message);
        thread.updatedAt = new Date();
        this.emit("thread-updated", thread);
      }
    }

    this.emit("message-sent", message);

    // Generate smart notifications for participants
    this.generateSmartNotifications(message, threadId);

    return message;
  }

  async getMessages(threadId?: string, limit = 50): Promise<Message[]> {
    if (threadId) {
      const thread = this.threads.get(threadId);
      return thread?.messages.slice(-limit) || [];
    }

    // Get recent messages across all threads
    return Array.from(this.messages.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async markMessageAsRead(messageId: string, userId?: string): Promise<void> {
    const message = this.messages.get(messageId);
    const targetUserId = userId || this.currentUserId;

    if (message && targetUserId) {
      const existingRead = message.readBy?.find(
        (r) => r.userId === targetUserId
      );
      if (!existingRead) {
        message.readBy = message.readBy || [];
        message.readBy.push({ userId: targetUserId, timestamp: new Date() });
        this.emit("message-read", { messageId, userId: targetUserId });
      }
    }
  }

  /**
   * Thread Management
   */
  async createThread(
    title: string,
    participants: string[],
    contextType?: MessageThread["contextType"],
    contextId?: string
  ): Promise<MessageThread> {
    const thread: MessageThread = {
      id: this.generateId(),
      title,
      participants,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      contextType,
      contextId,
      isArchived: false,
      isPinned: false,
      priority: "normal",
    };

    this.threads.set(thread.id, thread);
    this.emit("thread-created", thread);

    return thread;
  }

  async getThreads(userId?: string): Promise<MessageThread[]> {
    const targetUserId = userId || this.currentUserId;
    if (!targetUserId) return [];

    return Array.from(this.threads.values())
      .filter((thread) => thread.participants.includes(targetUserId))
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  /**
   * Smart Notifications
   */
  async getNotifications(userId?: string): Promise<SmartNotification[]> {
    const targetUserId = userId || this.currentUserId;
    if (!targetUserId) return [];

    return Array.from(this.notifications.values())
      .filter((n) => n.userId === targetUserId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.isRead = true;
      this.emit("notification-read", notification);
    }
  }

  /**
   * Team Announcements
   */
  async createAnnouncement(
    announcement: Omit<TeamAnnouncement, "id" | "timestamp" | "readBy">
  ): Promise<TeamAnnouncement> {
    const newAnnouncement: TeamAnnouncement = {
      ...announcement,
      id: this.generateId(),
      timestamp: new Date(),
      readBy: [],
    };

    this.announcements.set(newAnnouncement.id, newAnnouncement);
    this.emit("announcement-created", newAnnouncement);

    // Generate notifications for targeted users
    this.generateAnnouncementNotifications(newAnnouncement);

    return newAnnouncement;
  }

  async getAnnouncements(): Promise<TeamAnnouncement[]> {
    return Array.from(this.announcements.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * Dashboard Context Integration
   */
  async sendWidgetContextMessage(
    content: string,
    widgetId: string,
    widgetType: string,
    action: "edited" | "commented" | "shared" | "updated",
    dataSnapshot?: Record<string, unknown>
  ): Promise<Message> {
    return this.sendMessage(content, undefined, {
      widgetId,
      widgetType,
      dataSnapshot,
      action,
    });
  }

  async getWidgetDiscussions(widgetId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((m) => m.dashboardContext?.widgetId === widgetId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * User Management
   */
  async updateUserStatus(userId: string, isOnline: boolean): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.isOnline = isOnline;
      this.emit("user-status-changed", { userId, isOnline });
    }
  }

  async getOnlineUsers(): Promise<MessageUser[]> {
    return Array.from(this.users.values()).filter((u) => u.isOnline);
  }

  /**
   * Private Helper Methods
   */
  private generateSmartNotifications(
    message: Message,
    threadId?: string
  ): void {
    // Generate notifications for thread participants
    if (threadId) {
      const thread = this.threads.get(threadId);
      if (thread) {
        thread.participants.forEach((userId) => {
          if (userId !== message.senderId) {
            const notification: SmartNotification = {
              id: this.generateId(),
              type: "message",
              title: `New message from ${message.senderName}`,
              content: message.content.substring(0, 100),
              userId,
              timestamp: new Date(),
              isRead: false,
              actionContext: {
                type: "join-discussion",
                threadId,
              },
            };

            this.notifications.set(notification.id, notification);
            this.emit("notification-created", notification);
          }
        });
      }
    }

    // Widget context notifications
    if (message.dashboardContext) {
      const notification: SmartNotification = {
        id: this.generateId(),
        type: "widget-change",
        title: `Widget ${message.dashboardContext.action}`,
        content: `${message.senderName} ${message.dashboardContext.action} ${message.dashboardContext.widgetType}`,
        userId: "broadcast", // Would be broadcast to relevant users
        timestamp: new Date(),
        isRead: false,
        actionContext: {
          type: "open-widget",
          widgetId: message.dashboardContext.widgetId,
          data: message.dashboardContext.dataSnapshot,
        },
      };

      this.notifications.set(notification.id, notification);
      this.emit("notification-created", notification);
    }
  }

  private generateAnnouncementNotifications(
    announcement: TeamAnnouncement
  ): void {
    // Generate notifications for targeted users/roles
    const notification: SmartNotification = {
      id: this.generateId(),
      type: "team-update",
      title: announcement.title,
      content: announcement.content.substring(0, 150),
      userId: "broadcast", // Would target based on announcement.targetRoles
      timestamp: new Date(),
      isRead: false,
    };

    this.notifications.set(notification.id, notification);
    this.emit("notification-created", notification);
  }

  private loadUnreadContent(userId: string): void {
    // Load unread messages and notifications for user
    // In real implementation: database query
// console.info(
      `[MessagingService] Loading unread content for user ${userId}`
    );
  }

  private setupMockData(): void {
    // Create mock users
    const mockUsers: MessageUser[] = [
      { id: "user-1", name: "Coach Johnson", role: "coach", isOnline: true },
      { id: "user-2", name: "Alex Chen", role: "player", isOnline: true },
      { id: "user-3", name: "Sarah Williams", role: "player", isOnline: false },
      { id: "user-4", name: "Mike Foster", role: "admin", isOnline: true },
    ];

    mockUsers.forEach((user) => this.users.set(user.id, user));

    // Create mock thread
    const mockThread: MessageThread = {
      id: "thread-1",
      title: "Team Performance Discussion",
      participants: ["user-1", "user-2", "user-3"],
      messages: [],
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      updatedAt: new Date(),
      contextType: "widget-discussion",
      contextId: "adaptive-chart-1",
      isArchived: false,
      isPinned: true,
      priority: "normal",
    };

    this.threads.set(mockThread.id, mockThread);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

// Singleton instance
export const messagingService = new MessagingService();
