/**
 * Logging Utilities Module
 * 
 * Provides centralized logging with configurable levels and environment-aware output.
 * Reduces console spam in production while maintaining full debugging in development.
 * 
 * @module logger
 * @example
 * ```typescript
 * import { auth, success, error, debug } from './utils/logger';
 * 
 * auth("User signed in:", userId);
 * success("Data loaded successfully");
 * error("Failed to fetch:", error);
 * debug("Verbose debugging info"); // Only in dev
 * ```
 */

/**
 * Log level enumeration
 * Controls which messages are displayed based on severity
 * 
 * @enum {number}
 */
export enum LogLevel {
  /** Verbose debugging (development only) */
  DEBUG = 0,
  /** General informational messages */
  INFO = 1,
  /** Warning messages for potential issues */
  WARN = 2,
  /** Error messages for failures (always shown) */
  ERROR = 3,
  /** Disable all logging */
  NONE = 4,
}

/**
 * Logger class - Centralized logging with level control
 * 
 * Automatically adjusts based on environment:
 * - Development: Shows all logs (DEBUG level)
 * - Production: Only WARN and ERROR
 */
class Logger {
  private level: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    // In production, only show WARN and ERROR
    // In development, show all logs
    this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
  }

  /**
   * Set the minimum log level to display
   * Messages below this level will be suppressed
   * 
   * @param level - The minimum level to display
   * @example logger.setLevel(LogLevel.ERROR); // Only errors
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Get current log level
   * @returns Current minimum log level
   */
  getLevel(): LogLevel {
    return this.level;
  }

  /**
   * Debug logs - Verbose debugging information
   * Only displayed in development environment
   * 
   * @param message - The debug message
   * @param args - Additional arguments to log
   * @example debug("Session check", { userId, timestamp });
   */
  debug(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(`🔍 ${message}`, ...args);
    }
  }

  /**
   * Info logs - General informational messages
   * 
   * @param message - The info message
   * @param args - Additional arguments to log
   * @example info("Profile loaded", profile);
   */
  info(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.log(`ℹ️ ${message}`, ...args);
    }
  }

  /**
   * Warning logs - Potential issues
   * Always displayed (even in production)
   * 
   * @param message - The warning message
   * @param args - Additional arguments to log
   * @example warn("Cache miss, refetching");
   */
  warn(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(`⚠️ ${message}`, ...args);
    }
  }

  /**
   * Error logs - Critical failures and exceptions
   * Always displayed (even in production)
   * 
   * @param message - The error message
   * @param args - Additional arguments (typically error objects)
   * @example error("Failed to fetch:", fetchError);
   */
  error(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(`❌ ${message}`, ...args);
    }
  }

  /**
   * Success logs - Positive outcomes
   * 
   * @param message - The success message
   * @param args - Additional arguments to log
   * @example success("Login completed successfully");
   */
  success(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.log(`✅ ${message}`, ...args);
    }
  }

  /**
   * Auth-specific logs - Authentication events
   * Prefixed with 🔐 for easy filtering
   * 
   * @param message - The auth event message
   * @param args - Additional arguments to log
   * @example auth("User signed in:", userId);
   */
  auth(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.log(`🔐 ${message}`, ...args);
    }
  }

  /**
   * Navigation logs - Routing events
   * Prefixed with 🔀 for easy filtering
   * 
   * @param message - The navigation event message
   * @param args - Additional arguments to log
   * @example nav("Navigated to:", newRoute);
   */
  nav(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(`🔀 ${message}`, ...args);
    }
  }

  /**
   * Group logs together
   * Creates a collapsible log group
   * 
   * @param title - The group title
   * @param callback - Function containing logs to group
   * @example
   * logger.group("Login Flow", () => {
   *   auth("Checking credentials");
   *   success("Login complete");
   * });
   */
  group(title: string, callback: () => void): void {
    if (this.level <= LogLevel.DEBUG) {
      console.group(title);
      callback();
      console.groupEnd();
    }
  }

  /**
   * Collapsed group logs
   * Same as group() but starts collapsed
   * 
   * @param title - The group title
   * @param callback - Function containing logs to group
   * @example
   * logger.groupCollapsed("Details", () => {
   *   debug("Session ID:", sessionId);
   * });
   */
  groupCollapsed(title: string, callback: () => void): void {
    if (this.level <= LogLevel.DEBUG) {
      console.groupCollapsed(title);
      callback();
      console.groupEnd();
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience methods for direct use
export const { debug, info, warn, error, success, auth, nav, group, groupCollapsed } = logger;

/**
 * Development-only logs
 * Completely stripped in production builds
 * 
 * @param message - The dev log message
 * @param args - Additional arguments to log
 * @example devLog("Debug state:", { user, session });
 */
export function devLog(message: string, ...args: any[]): void {
  if (import.meta.env.DEV) {
    console.log(`💻 [DEV] ${message}`, ...args);
  }
}

/**
 * Performance timing utility - Start timer
 * Useful for measuring operation duration
 * 
 * @param label - The timer label
 * @example
 * timeStart("data-fetch");
 * await fetchData();
 * timeEnd("data-fetch"); // Shows elapsed time
 */
export function timeStart(label: string): void {
  if (import.meta.env.DEV) {
    console.time(label);
  }
}

/**
 * Performance timing utility - End timer
 * Shows elapsed time since timeStart() was called
 * 
 * @param label - The timer label (must match timeStart)
 */
export function timeEnd(label: string): void {
  if (import.meta.env.DEV) {
    console.timeEnd(label);
  }
}

/**
 * Trace function calls (development only)
 * Shows stack trace for debugging call chains
 * 
 * @param funcName - The function being traced
 * @param args - Optional arguments to log
 * @example trace("fetchUserProfile", { userId });
 */
export function trace(funcName: string, args?: any): void {
  if (import.meta.env.DEV) {
    console.trace(`📍 ${funcName}`, args);
  }
}
