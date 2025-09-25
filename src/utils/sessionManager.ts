// Session security and management utilities
import { supabase } from "../lib/supabase";

export interface SessionConfig {
  inactivityTimeout: number; // milliseconds
  sessionCheckInterval: number; // milliseconds
  warningTime: number; // milliseconds before timeout to show warning
}

const DEFAULT_CONFIG: SessionConfig = {
  inactivityTimeout: 2 * 60 * 60 * 1000, // 2 hours
  sessionCheckInterval: 60 * 1000, // 1 minute
  warningTime: 5 * 60 * 1000, // 5 minutes before timeout
};

class SessionManager {
  private config: SessionConfig;
  private lastActivity: number = Date.now();
  private checkInterval: NodeJS.Timeout | null = null;
  private warningTimeout: NodeJS.Timeout | null = null;
  private onWarning?: () => void;
  private onTimeout?: () => void;
  private onActivity?: () => void;

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.bindActivityListeners();
  }

  /**
   * Start session monitoring
   */
  startMonitoring(onWarning?: () => void, onTimeout?: () => void, onActivity?: () => void): void {
    this.onWarning = onWarning;
    this.onTimeout = onTimeout;
    this.onActivity = onActivity;

    this.lastActivity = Date.now();
    this.scheduleChecks();
  }

  /**
   * Stop session monitoring
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    if (this.warningTimeout) {
      clearTimeout(this.warningTimeout);
      this.warningTimeout = null;
    }
    this.removeActivityListeners();
  }

  /**
   * Reset activity timer
   */
  resetActivity(): void {
    this.lastActivity = Date.now();
    this.onActivity?.();

    // Clear any pending warning
    if (this.warningTimeout) {
      clearTimeout(this.warningTimeout);
      this.warningTimeout = null;
    }
  }

  /**
   * Get time until timeout
   */
  getTimeUntilTimeout(): number {
    return Math.max(0, this.config.inactivityTimeout - (Date.now() - this.lastActivity));
  }

  /**
   * Check if session is about to expire
   */
  isNearTimeout(): boolean {
    return this.getTimeUntilTimeout() <= this.config.warningTime;
  }

  /**
   * Force logout
   */
  async forceLogout(): Promise<void> {
    this.stopMonitoring();
    await supabase.auth.signOut();
  }

  private scheduleChecks(): void {
    this.checkInterval = setInterval(() => {
      const timeUntilTimeout = this.getTimeUntilTimeout();

      if (timeUntilTimeout <= 0) {
        // Session expired
        this.onTimeout?.();
        this.forceLogout();
      } else if (timeUntilTimeout <= this.config.warningTime && !this.warningTimeout) {
        // Show warning
        this.onWarning?.();
        this.warningTimeout = setTimeout(() => {
          this.onTimeout?.();
          this.forceLogout();
        }, timeUntilTimeout);
      }
    }, this.config.sessionCheckInterval);
  }

  private bindActivityListeners(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    const handler = () => this.resetActivity();

    events.forEach(event => {
      document.addEventListener(event, handler, true);
    });

    // Store handler for cleanup
    (this as any)._activityHandler = handler;
  }

  private removeActivityListeners(): void {
    const handler = (this as any)._activityHandler;
    if (handler) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      events.forEach(event => {
        document.removeEventListener(event, handler, true);
      });
    }
  }
}

// Global session manager instance
export const sessionManager = new SessionManager();

/**
 * Validate current session with server
 */
export const validateSession = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      return false;
    }

    // Check if session is expired
    const now = Date.now() / 1000;
    if (session.expires_at && session.expires_at < now) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

/**
 * Get session info
 */
export const getSessionInfo = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      return null;
    }

    return {
      user: session.user,
      expiresAt: session.expires_at,
      timeUntilExpiry: session.expires_at ? (session.expires_at * 1000) - Date.now() : null,
    };
  } catch {
    return null;
  }
};

/**
 * Check for concurrent sessions (basic implementation)
 * In a production app, you'd want server-side tracking of active sessions
 */
export const checkConcurrentSessions = async (): Promise<{ isValid: boolean; message?: string }> => {
  // This is a basic implementation. For production, you'd want to:
  // 1. Track active sessions in database
  // 2. Allow only N concurrent sessions per user
  // 3. Provide session management UI

  const sessionInfo = await getSessionInfo();
  if (!sessionInfo) {
    return { isValid: false, message: 'No active session' };
  }

  // For now, just validate the current session
  const isValid = await validateSession();
  return {
    isValid,
    message: isValid ? undefined : 'Session is invalid or expired'
  };
};