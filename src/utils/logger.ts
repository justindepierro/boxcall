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

type LogPrimitive = string | number | boolean | null | undefined;

const REDACTED = "[REDACTED]";
const REDACTED_EMAIL = "[REDACTED_EMAIL]";
const REDACTED_TOKEN = "[REDACTED_TOKEN]";

const SENSITIVE_KEY_PATTERN = /(pass(word)?|secret|token|access[_-]?token|refresh[_-]?token|api[_-]?key|authorization|cookie|set-cookie|session)/i;

// JWTs commonly start with "eyJ" and contain 3 base64url segments.
const JWT_PATTERN = /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g;
const BEARER_PATTERN = /(bearer)\s+([a-z0-9._~+/=-]+)/gi;

// Conservative email detector (PII). This can over-match; better to redact.
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

function scrubString(value: string): string {
  // Order matters: JWT/Bearer first, then email.
  return value
    .replace(JWT_PATTERN, REDACTED_TOKEN)
    .replace(BEARER_PATTERN, (_m, bearer) => `${bearer} ${REDACTED_TOKEN}`)
    .replace(EMAIL_PATTERN, REDACTED_EMAIL);
}

function scrubError(err: unknown): unknown {
  if (!(err instanceof Error)) return err;

  // Create a shallow clone so we don't mutate the original error.
  const clone = new Error(scrubString(err.message));
  clone.name = err.name;
  // Stack can sometimes include querystrings; scrub defensively.
  if (typeof err.stack === "string") {
    clone.stack = scrubString(err.stack);
  }
  return clone;
}

function scrubUnknown(value: unknown, depth = 0, seen = new WeakSet<object>()): unknown {
  if (value == null) return value as LogPrimitive;
  if (typeof value === "string") return scrubString(value);
  if (typeof value === "number" || typeof value === "boolean") return value;

  const scrubbedError = scrubError(value);
  if (scrubbedError !== value) return scrubbedError;

  if (depth > 4) return "[TRUNCATED]";

  if (Array.isArray(value)) {
    return value.map((item) => scrubUnknown(item, depth + 1, seen));
  }

  if (typeof value === "object") {
    if (seen.has(value as object)) return "[CIRCULAR]";
    seen.add(value as object);

    const record: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEY_PATTERN.test(key)) {
        record[key] = REDACTED;
      } else {
        record[key] = scrubUnknown(val, depth + 1, seen);
      }
    }
    return record;
  }

  return value;
}

function scrubArgs(args: unknown[]): unknown[] {
  return args.map((arg) => scrubUnknown(arg));
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
    const isTest = import.meta.env.MODE === "test";
    this.isDevelopment = import.meta.env.DEV && !isTest;
    // In production (and test), only show WARN and ERROR
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
      console.debug(`🔍 ${scrubString(message)}`, ...scrubArgs(args));
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
      console.log(`ℹ️ ${scrubString(message)}`, ...scrubArgs(args));
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
      console.warn(`⚠️ ${scrubString(message)}`, ...scrubArgs(args));
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
      console.error(`❌ ${scrubString(message)}`, ...scrubArgs(args));
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
      console.log(`✅ ${scrubString(message)}`, ...scrubArgs(args));
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
      console.log(`🔐 ${scrubString(message)}`, ...scrubArgs(args));
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
      console.log(`🔀 ${scrubString(message)}`, ...scrubArgs(args));
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

// Export convenience methods for direct use with proper binding
// Binding ensures 'this' context is preserved when methods are destructured
export const debug = logger.debug.bind(logger);
export const info = logger.info.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);
export const logError = logger.error.bind(logger); // Alias for error (used throughout codebase)
export const success = logger.success.bind(logger);
export const auth = logger.auth.bind(logger);
export const logAuth = logger.auth.bind(logger); // Alias for auth
export const nav = logger.nav.bind(logger);
export const group = logger.group.bind(logger);
export const groupCollapsed = logger.groupCollapsed.bind(logger);

/**
 * Development-only logs
 * Completely stripped in production builds
 *
 * @param message - The dev log message
 * @param args - Additional arguments to log
 * @example devLog("Debug state:", { user, session });
 */
export function devLog(message: string, ...args: any[]): void {
  if (import.meta.env.DEV && import.meta.env.MODE !== "test") {
    console.log(`💻 [DEV] ${scrubString(message)}`, ...scrubArgs(args));
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
  if (import.meta.env.DEV && import.meta.env.MODE !== "test") {
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
  if (import.meta.env.DEV && import.meta.env.MODE !== "test") {
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
