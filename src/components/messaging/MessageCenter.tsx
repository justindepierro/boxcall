import React, { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, Bell, Users, Search, Plus } from "lucide-react";
import { useMessaging } from "../../hooks/useMessaging";
import { Button } from "../ui/Button";
import type {
  Message,
  MessageThread,
  SmartNotification,
} from "../../services/messaging/MessagingService";

interface MessageCenterProps {
  userId: string;
  teamId: string;
  dashboardContext?: {
    currentWidget?: string;
    widgetData?: Record<string, unknown>;
  };
  className?: string;
}

interface MessageListProps {
  messages: Message[];
  onReply: (messageId: string) => void;
  currentUserId: string;
}

interface ThreadDisplay extends MessageThread {
  unreadCount?: number;
  lastMessage?: Message;
}

interface ThreadListProps {
  threads: ThreadDisplay[];
  activeThread: ThreadDisplay | null;
  onSelectThread: (thread: ThreadDisplay) => void;
  onCreateThread: () => void;
}

interface NotificationDisplay extends SmartNotification {
  priority?: "info" | "important" | "urgent";
}

interface NotificationPanelProps {
  notifications: NotificationDisplay[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

/**
 * Message List Component - Shows messages in the active thread
 */
const MessageList: React.FC<MessageListProps> = ({
  messages,
  onReply,
  currentUserId,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.senderId === currentUserId ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.senderId === currentUserId
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-900"
            }`}
          >
            <div className="text-sm font-medium mb-1">{message.senderName}</div>
            <div className="text-sm">{message.content}</div>
            <div className="text-xs mt-1 opacity-75">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
            <Button
              onClick={() => onReply(message.id)}
              variant="ghost"
              size="xs"
              className="mt-2 text-xs opacity-75 hover:opacity-100"
            >
              Reply
            </Button>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

/**
 * Thread List Component - Shows available message threads
 */
const ThreadList: React.FC<ThreadListProps> = ({
  threads,
  activeThread,
  onSelectThread,
  onCreateThread,
}) => {
  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Messages</h2>
          <Button
            onClick={onCreateThread}
            variant="ghost"
            size="sm"
            className="p-2 text-text-muted hover:text-text-secondary hover:bg-gray-100 rounded-lg"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {threads.map((thread) => (
          <Button
            key={thread.id}
            onClick={() => onSelectThread(thread)}
            variant="ghost"
            className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-100 ${
              activeThread?.id === thread.id ? "bg-blue-50 border-blue-200" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-text-primary truncate">
                {thread.title}
              </h3>
              {(thread.unreadCount || 0) > 0 && (
                <span className="bg-blue-500 text-text-inverse text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {thread.unreadCount || 0}
                </span>
              )}
            </div>

            <div className="text-sm text-text-secondary truncate mb-1">
              {thread.lastMessage?.content || "No messages yet"}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-text-muted">
                <Users className="h-3 w-3 mr-1" />
                {thread.participants.length} participants
              </div>
              <div className="text-xs text-text-muted">
                {thread.lastMessage?.timestamp
                  ? new Date(thread.lastMessage.timestamp).toLocaleDateString()
                  : ""}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

/**
 * Notification Panel Component - Shows smart notifications
 */
const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            Notifications
          </h2>
          <Button
            onClick={onMarkAllAsRead}
            variant="ghost"
            size="sm"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Mark all read
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 border-b border-gray-100 ${
              !notification.isRead ? "bg-blue-50" : ""
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <Bell className="h-4 w-4 text-text-muted mr-2" />
                  <h4 className="font-medium text-text-primary text-sm">
                    {notification.title}
                  </h4>
                </div>

                <p className="text-sm text-text-secondary mb-2">
                  {notification.content}
                </p>

                <div className="flex items-center text-xs text-text-muted">
                  <span>
                    {new Date(notification.timestamp).toLocaleString()}
                  </span>
                  {notification.priority === "urgent" && (
                    <span className="ml-2 bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                      Urgent
                    </span>
                  )}
                </div>
              </div>

              {!notification.isRead && (
                <Button
                  onClick={() => onMarkAsRead(notification.id)}
                  variant="ghost"
                  size="xs"
                  className="ml-2 text-xs text-blue-600 hover:text-blue-700"
                >
                  Mark read
                </Button>
              )}
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="p-8 text-center text-text-muted">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Main Message Center Component - Smart Communication Hub
 */
export const MessageCenter: React.FC<MessageCenterProps> = ({
  userId,
  teamId,
  dashboardContext,
  className = "",
}) => {
  const [messageInput, setMessageInput] = useState("");
  const [activeView, setActiveView] = useState<"threads" | "notifications">(
    "threads"
  );

  const {
    isConnected,
    threads,
    activeThread,
    messages,
    notifications,
    unreadCount,
    sendMessage,
    sendWidgetMessage,
    setActiveThread,
    markNotificationAsRead,
    clearAllNotifications,
    createThread,
  } = useMessaging({
    userId,
    teamId,
    autoConnect: true,
    enableNotifications: true,
  });

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !isConnected) return;

    try {
      if (dashboardContext?.currentWidget) {
        // Send contextual widget message
        await sendWidgetMessage(
          messageInput,
          dashboardContext.currentWidget,
          "dashboard-widget",
          "commented",
          dashboardContext.widgetData
        );
      } else {
        // Send regular message
        await sendMessage(messageInput, activeThread?.id);
      }

      setMessageInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateThread = () => {
    const title = prompt("Enter thread title:");
    if (title) {
      createThread(title, [userId]);
    }
  };

  const handleSelectThread = (thread: ThreadDisplay) => {
    setActiveThread(thread.id);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-lg border border-gray-200 flex h-[600px] ${className}`}
    >
      {/* Thread List */}
      {activeView === "threads" && (
        <ThreadList
          threads={threads}
          activeThread={activeThread}
          onSelectThread={handleSelectThread}
          onCreateThread={handleCreateThread}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {activeThread ? (
                <>
                  <MessageSquare className="h-5 w-5 text-text-muted mr-2" />
                  <h1 className="text-lg font-semibold text-text-primary">
                    {activeThread.title}
                  </h1>
                </>
              ) : (
                <h1 className="text-lg font-semibold text-text-primary">
                  Select a conversation
                </h1>
              )}

              {dashboardContext?.currentWidget && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Widget: {dashboardContext.currentWidget}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setActiveView("threads")}
                variant={activeView === "threads" ? "secondary" : "ghost"}
                size="sm"
                className="p-2 rounded-lg"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>

              <Button
                onClick={() => setActiveView("notifications")}
                variant={activeView === "notifications" ? "secondary" : "ghost"}
                size="sm"
                className="relative p-2 rounded-lg"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-text-inverse text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>

              <div
                className={`h-3 w-3 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`}
              />
            </div>
          </div>
        </div>

        {/* Messages or Empty State */}
        {activeThread ? (
          <MessageList
            messages={messages}
            onReply={(messageId) => {
              // Handle reply functionality
              console.log("Reply to message:", messageId);
            }}
            currentUserId={userId}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-muted">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">
                Select a conversation to start messaging
              </p>
              <p className="text-sm mt-2">
                {dashboardContext?.currentWidget
                  ? `Chat about ${dashboardContext.currentWidget} widget`
                  : "Choose from the conversations on the left"}
              </p>
            </div>
          </div>
        )}

        {/* Message Input */}
        {activeThread && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    dashboardContext?.currentWidget
                      ? `Message about ${dashboardContext.currentWidget}...`
                      : "Type your message..."
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                />
              </div>

              <Button
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || !isConnected}
                variant="primary"
                size="sm"
                className="bg-blue-500 text-text-inverse p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Notification Panel */}
      {activeView === "notifications" && (
        <NotificationPanel
          notifications={notifications}
          onMarkAsRead={markNotificationAsRead}
          onMarkAllAsRead={clearAllNotifications}
        />
      )}
    </div>
  );
};

export default MessageCenter;
