/**
 * Real-Time Collaboration Service
 * Handles WebSocket connections for live dashboard sharing and collaborative features
 *
 * Phase 2B Sprint 4: Live Dashboard Sharing
 */

export interface CollaborationUser {
  id: string;
  name: string;
  role: "coach" | "player" | "parent" | "admin";
  avatar?: string;
  isOnline: boolean;
  cursor?: {
    x: number;
    y: number;
    widget?: string;
  };
}

export interface DashboardUpdate {
  type:
    | "widget_move"
    | "widget_resize"
    | "widget_edit"
    | "widget_add"
    | "widget_remove";
  widgetId: string;
  userId: string;
  timestamp: number;
  data: {
    position?: { x: number; y: number };
    size?: { width: number; height: number };
    config?: Record<string, unknown>;
    newWidget?: {
      type: string;
      config: Record<string, unknown>;
    };
  };
}

export interface CollaborationSession {
  sessionId: string;
  teamId: string;
  dashboardId: string;
  createdBy: string;
  participants: CollaborationUser[];
  permissions: {
    canEdit: string[]; // user IDs
    canView: string[]; // user IDs
    requireApproval: boolean;
  };
  isActive: boolean;
  createdAt: number;
  lastActivity: number;
}

export interface CursorUpdate {
  userId: string;
  position: { x: number; y: number };
  widget?: string;
  action?: "hovering" | "editing" | "selecting";
}

export interface WebSocketMessage {
  type:
    | "join_session"
    | "leave_session"
    | "user_joined"
    | "user_left"
    | "dashboard_update"
    | "cursor_update"
    | "session_ended";
  sessionId?: string | null;
  userId?: string;
  user?: CollaborationUser | null;
  update?: DashboardUpdate;
  cursor?: CursorUpdate;
}

class RealTimeCollaborationService {
  private ws: WebSocket | null = null;
  private sessionId: string | null = null;
  private currentUser: CollaborationUser | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Event listeners
  private userJoinedListeners: Array<(user: CollaborationUser) => void> = [];
  private userLeftListeners: Array<(userId: string) => void> = [];
  private dashboardUpdateListeners: Array<(update: DashboardUpdate) => void> =
    [];
  private cursorUpdateListeners: Array<(cursor: CursorUpdate) => void> = [];
  private connectionStatusListeners: Array<(connected: boolean) => void> = [];

  /**
   * Initialize collaboration session
   */
  async startSession(
    teamId: string,
    dashboardId: string,
    user: CollaborationUser
  ): Promise<CollaborationSession> {
    this.currentUser = user;

    try {
      // Create or join collaboration session
      const session = await this.createSession(teamId, dashboardId, user);
      this.sessionId = session.sessionId;

      // Establish WebSocket connection
      await this.connect();

      return session;
    } catch (error) {
// console.error("Failed to start collaboration session:", error);
      throw new Error("Could not start collaboration session");
    }
  }

  /**
   * Create new collaboration session
   */
  private async createSession(
    teamId: string,
    dashboardId: string,
    user: CollaborationUser
  ): Promise<CollaborationSession> {
    // TODO: Replace with actual API call
    const session: CollaborationSession = {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      teamId,
      dashboardId,
      createdBy: user.id,
      participants: [user],
      permissions: {
        canEdit: user.role === "coach" ? [user.id] : [],
        canView: [user.id],
        requireApproval: user.role !== "coach",
      },
      isActive: true,
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };

    // In a real implementation, this would be an API call
    return session;
  }

  /**
   * Establish WebSocket connection
   */
  private async connect(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        // TODO: Replace with actual WebSocket endpoint
        const wsUrl =
          process.env.NODE_ENV === "production"
            ? `wss://${window.location.host}/ws/collaboration`
            : "ws://localhost:3001/ws/collaboration";

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;

          // Send initial join message
          this.sendMessage({
            type: "join_session",
            sessionId: this.sessionId,
            user: this.currentUser,
          });

          this.notifyConnectionStatus(true);
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.notifyConnectionStatus(false);
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
// console.error("WebSocket error:", error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case "user_joined":
        if (message.user) {
          this.userJoinedListeners.forEach((listener) =>
            listener(message.user as CollaborationUser)
          );
        }
        break;

      case "user_left":
        if (message.userId) {
          this.userLeftListeners.forEach((listener) =>
            listener(message.userId as string)
          );
        }
        break;

      case "dashboard_update":
        if (message.update) {
          this.dashboardUpdateListeners.forEach((listener) =>
            listener(message.update as DashboardUpdate)
          );
        }
        break;

      case "cursor_update":
        if (message.cursor) {
          this.cursorUpdateListeners.forEach((listener) =>
            listener(message.cursor as CursorUpdate)
          );
        }
        break;

      case "session_ended":
        this.endSession();
        break;

      default:
// console.warn("Unknown message type:", message.type);
    }
  }

  /**
   * Send message through WebSocket
   */
  private sendMessage(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
// console.warn("Cannot send message: WebSocket not connected");
    }
  }

  /**
   * Handle WebSocket reconnection
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
// console.error("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;

    setTimeout(() => {
      if (!this.isConnected && this.sessionId) {
// console.info(`Reconnection attempt ${this.reconnectAttempts}`);
        this.connect().catch(console.error);
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  /**
   * Send dashboard update to all participants
   */
  sendDashboardUpdate(
    update: Omit<DashboardUpdate, "userId" | "timestamp">
  ): void {
    if (!this.currentUser) return;

    const fullUpdate: DashboardUpdate = {
      ...update,
      userId: this.currentUser.id,
      timestamp: Date.now(),
    };

    this.sendMessage({
      type: "dashboard_update",
      sessionId: this.sessionId,
      update: fullUpdate,
    });
  }

  /**
   * Send cursor position update
   */
  sendCursorUpdate(cursor: Omit<CursorUpdate, "userId">): void {
    if (!this.currentUser) return;

    const fullCursor: CursorUpdate = {
      ...cursor,
      userId: this.currentUser.id,
    };

    this.sendMessage({
      type: "cursor_update",
      sessionId: this.sessionId,
      cursor: fullCursor,
    });
  }

  /**
   * End collaboration session
   */
  endSession(): void {
    if (this.ws) {
      this.sendMessage({
        type: "leave_session",
        sessionId: this.sessionId,
        userId: this.currentUser?.id,
      });

      this.ws.close();
      this.ws = null;
    }

    this.sessionId = null;
    this.currentUser = null;
    this.isConnected = false;
    this.notifyConnectionStatus(false);
  }

  /**
   * Check if user has edit permissions
   */
  canEdit(userId: string, session: CollaborationSession): boolean {
    return session.permissions.canEdit.includes(userId);
  }

  /**
   * Check if user has view permissions
   */
  canView(userId: string, session: CollaborationSession): boolean {
    return session.permissions.canView.includes(userId);
  }

  /**
   * Event listener management
   */
  onUserJoined(listener: (user: CollaborationUser) => void): () => void {
    this.userJoinedListeners.push(listener);
    return () => {
      const index = this.userJoinedListeners.indexOf(listener);
      if (index > -1) this.userJoinedListeners.splice(index, 1);
    };
  }

  onUserLeft(listener: (userId: string) => void): () => void {
    this.userLeftListeners.push(listener);
    return () => {
      const index = this.userLeftListeners.indexOf(listener);
      if (index > -1) this.userLeftListeners.splice(index, 1);
    };
  }

  onDashboardUpdate(listener: (update: DashboardUpdate) => void): () => void {
    this.dashboardUpdateListeners.push(listener);
    return () => {
      const index = this.dashboardUpdateListeners.indexOf(listener);
      if (index > -1) this.dashboardUpdateListeners.splice(index, 1);
    };
  }

  onCursorUpdate(listener: (cursor: CursorUpdate) => void): () => void {
    this.cursorUpdateListeners.push(listener);
    return () => {
      const index = this.cursorUpdateListeners.indexOf(listener);
      if (index > -1) this.cursorUpdateListeners.splice(index, 1);
    };
  }

  onConnectionStatus(listener: (connected: boolean) => void): () => void {
    this.connectionStatusListeners.push(listener);
    return () => {
      const index = this.connectionStatusListeners.indexOf(listener);
      if (index > -1) this.connectionStatusListeners.splice(index, 1);
    };
  }

  private notifyConnectionStatus(connected: boolean): void {
    this.connectionStatusListeners.forEach((listener) => listener(connected));
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get current session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Get current user
   */
  getCurrentUser(): CollaborationUser | null {
    return this.currentUser;
  }
}

// Export singleton instance
export const collaborationService = new RealTimeCollaborationService();
export default collaborationService;
