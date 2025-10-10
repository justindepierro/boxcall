/**
 * Development Logger Utility
 *
 * Provides controlled logging that:
 * - Only logs in development mode
 * - Adds consistent prefixes
 * - Supports debug mode toggle
 * - Can be easily disabled in production
 */

const isDev = import.meta.env.DEV;
const isDebugMode = import.meta.env.VITE_DEBUG === "true";

export const devLogger = {
  /**
   * Log errors - always shown in dev mode
   */
  error: (...args: any[]) => {
    if (isDev) {
      console.error("🔴 [ERROR]", ...args);
    }
  },

  /**
   * Log warnings - always shown in dev mode
   */
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn("⚠️  [WARN]", ...args);
    }
  },

  /**
   * Log info - always shown in dev mode
   */
  info: (...args: any[]) => {
    if (isDev) {
      console.info("ℹ️  [INFO]", ...args);
    }
  },

  /**
   * Debug logging - only when VITE_DEBUG=true
   */
  debug: (...args: any[]) => {
    if (isDev && isDebugMode) {
      console.debug("🐛 [DEBUG]", ...args);
    }
  },

  /**
   * Performance logging - only when VITE_DEBUG=true
   */
  perf: (label: string, fn: () => void) => {
    if (isDev && isDebugMode) {
      performance.mark(`${label}-start`);
      fn();
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
      const measure = performance.getEntriesByName(label)[0];
      console.log(`⏱️  [PERF] ${label}: ${measure.duration.toFixed(2)}ms`);
    } else {
      fn();
    }
  },

  /**
   * Log API requests - only when VITE_DEBUG=true
   */
  api: (method: string, url: string, data?: any) => {
    if (isDev && isDebugMode) {
      console.groupCollapsed(`🌐 [API] ${method} ${url}`);
      if (data) console.log("Data:", data);
      console.groupEnd();
    }
  },

  /**
   * Log component lifecycle - only when VITE_DEBUG=true
   */
  component: (
    name: string,
    action: "mount" | "unmount" | "update",
    data?: any
  ) => {
    if (isDev && isDebugMode) {
      const emoji =
        action === "mount" ? "🟢" : action === "unmount" ? "🔴" : "🔄";
      console.log(`${emoji} [COMPONENT] ${name} - ${action}`, data || "");
    }
  },

  /**
   * Group related logs
   */
  group: (label: string, fn: () => void, collapsed = true) => {
    if (isDev) {
      if (collapsed) {
        console.groupCollapsed(label);
      } else {
        console.group(label);
      }
      fn();
      console.groupEnd();
    }
  },
};

/**
 * Production error tracking
 * In production, critical errors should be sent to error tracking service
 */
export const trackError = (error: Error, context?: Record<string, any>) => {
  if (!isDev) {
    // TODO: Send to Sentry, LogRocket, or similar
    console.error("Production error:", error, context);
  } else {
    devLogger.error(error, context);
  }
};

/**
 * Example usage:
 *
 * import { devLogger } from '@/utils/devLogger';
 *
 * // Basic logging
 * devLogger.info('User logged in', { userId: 123 });
 * devLogger.error('Failed to fetch data', error);
 *
 * // Debug mode only
 * devLogger.debug('Component state:', componentState);
 *
 * // Performance monitoring
 * devLogger.perf('fetchUsers', () => {
 *   // expensive operation
 * });
 *
 * // Grouped logs
 * devLogger.group('User Actions', () => {
 *   devLogger.info('Action 1');
 *   devLogger.info('Action 2');
 * });
 */
