/**
 * Logging Utilities
 * Centralized logging with configurable levels
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

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
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Get current log level
   */
  getLevel(): LogLevel {
    return this.level;
  }

  /**
   * Debug logs (verbose, development only)
   */
  debug(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(`🔍 ${message}`, ...args);
    }
  }

  /**
   * Info logs (general information)
   */
  info(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.log(`ℹ️ ${message}`, ...args);
    }
  }

  /**
   * Warning logs (potential issues)
   */
  warn(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(`⚠️ ${message}`, ...args);
    }
  }

  /**
   * Error logs (errors and exceptions)
   */
  error(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(`❌ ${message}`, ...args);
    }
  }

  /**
   * Success logs (positive outcomes)
   */
  success(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.log(`✅ ${message}`, ...args);
    }
  }

  /**
   * Auth-specific logs (authentication events)
   */
  auth(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.log(`🔐 ${message}`, ...args);
    }
  }

  /**
   * Navigation logs (routing events)
   */
  nav(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(`🔀 ${message}`, ...args);
    }
  }

  /**
   * Group logs together
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

// Export convenience methods
export const { debug, info, warn, error, success, auth, nav, group, groupCollapsed } = logger;

/**
 * Development-only logs
 * These are completely stripped in production builds
 */
export function devLog(message: string, ...args: any[]): void {
  if (import.meta.env.DEV) {
    console.log(`💻 [DEV] ${message}`, ...args);
  }
}

/**
 * Performance timing utility
 */
export function timeStart(label: string): void {
  if (import.meta.env.DEV) {
    console.time(label);
  }
}

export function timeEnd(label: string): void {
  if (import.meta.env.DEV) {
    console.timeEnd(label);
  }
}

/**
 * Trace function calls (development only)
 */
export function trace(funcName: string, args?: any): void {
  if (import.meta.env.DEV) {
    console.trace(`📍 ${funcName}`, args);
  }
}
