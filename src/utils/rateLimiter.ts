/**
 * Rate Limiter Utility
 *
 * Prevents abuse by limiting the rate of operations per user
 * Uses in-memory storage with automatic cleanup
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(cleanupIntervalMs: number = 60000) {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, cleanupIntervalMs);
  }

  /**
   * Check if request is allowed
   * @returns true if allowed, false if rate limited
   */
  check(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const limit = this.limits.get(key);

    // No previous limit or limit expired
    if (!limit || now > limit.resetAt) {
      this.limits.set(key, {
        count: 1,
        resetAt: now + config.windowMs,
      });
      return true;
    }

    // Over limit
    if (limit.count >= config.maxRequests) {
      return false;
    }

    // Increment count
    limit.count++;
    return true;
  }

  /**
   * Check and throw error if rate limited
   */
  checkOrThrow(key: string, config: RateLimitConfig): void {
    if (!this.check(key, config)) {
      throw new RateLimitError(
        config.message ||
          `Rate limit exceeded. Please wait before trying again.`,
        config.windowMs
      );
    }
  }

  /**
   * Get remaining requests in current window
   */
  getRemaining(key: string, maxRequests: number): number {
    const limit = this.limits.get(key);
    if (!limit || Date.now() > limit.resetAt) {
      return maxRequests;
    }
    return Math.max(0, maxRequests - limit.count);
  }

  /**
   * Get time until limit resets (in ms)
   */
  getResetTime(key: string): number | null {
    const limit = this.limits.get(key);
    if (!limit) return null;

    const now = Date.now();
    if (now > limit.resetAt) return null;

    return limit.resetAt - now;
  }

  /**
   * Reset limit for a specific key
   */
  reset(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Clear all limits
   */
  clearAll(): void {
    this.limits.clear();
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.limits.forEach((limit, key) => {
      if (now > limit.resetAt) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.limits.delete(key));

    if (keysToDelete.length > 0) {
      console.debug(
        `[RateLimiter] Cleaned up ${keysToDelete.length} expired entries`
      );
    }
  }

  /**
   * Stop cleanup interval
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.limits.clear();
  }
}

// ========================================
// Rate Limit Error Class
// ========================================

export class RateLimitError extends Error {
  public readonly retryAfterMs: number;

  constructor(message: string, retryAfterMs: number) {
    super(message);
    this.name = "RateLimitError";
    this.retryAfterMs = retryAfterMs;
  }

  get retryAfterSeconds(): number {
    return Math.ceil(this.retryAfterMs / 1000);
  }
}

// ========================================
// Pre-configured Rate Limiters
// ========================================

// Global singleton instance
export const rateLimiter = new RateLimiter();

// Common rate limit configurations
export const RateLimitPresets = {
  // Play operations
  PLAY_CREATE: {
    maxRequests: 10,
    windowMs: 60000, // 10 plays per minute
    message: "You're creating plays too quickly. Please wait a moment.",
  },

  PLAY_UPDATE: {
    maxRequests: 30,
    windowMs: 60000, // 30 updates per minute
    message: "You're updating plays too quickly. Please slow down.",
  },

  PLAY_DELETE: {
    maxRequests: 5,
    windowMs: 60000, // 5 deletions per minute
    message: "You're deleting plays too quickly. Please wait a moment.",
  },

  PLAY_BULK_UPDATE: {
    maxRequests: 3,
    windowMs: 60000, // 3 bulk operations per minute
    message: "You're performing bulk operations too quickly. Please wait.",
  },

  // Search operations
  SEARCH_QUERY: {
    maxRequests: 60,
    windowMs: 60000, // 60 searches per minute (1 per second)
    message: "You're searching too quickly. Please slow down.",
  },

  // Diagram operations
  DIAGRAM_SAVE: {
    maxRequests: 20,
    windowMs: 60000, // 20 diagram saves per minute
    message: "You're saving diagrams too quickly. Please wait a moment.",
  },

  // Export operations
  PDF_EXPORT: {
    maxRequests: 5,
    windowMs: 300000, // 5 PDF exports per 5 minutes
    message: "You're exporting PDFs too quickly. Please wait a few minutes.",
  },

  // Authentication
  AUTH_ATTEMPT: {
    maxRequests: 5,
    windowMs: 300000, // 5 attempts per 5 minutes
    message: "Too many login attempts. Please wait 5 minutes.",
  },

  // API calls (general)
  API_CALL: {
    maxRequests: 100,
    windowMs: 60000, // 100 API calls per minute
    message: "You're making too many requests. Please slow down.",
  },
} as const;

// ========================================
// Helper Functions
// ========================================

/**
 * Create a rate-limited version of a function
 */
export function withRateLimit<T extends (...args: any[]) => any>(
  fn: T,
  limitKey: string,
  config: RateLimitConfig
): T {
  return ((...args: Parameters<T>) => {
    rateLimiter.checkOrThrow(limitKey, config);
    return fn(...args);
  }) as T;
}

/**
 * Get user-specific rate limit key
 */
export function getUserRateLimitKey(
  userId: string | undefined,
  action: string
): string {
  return `${action}:${userId || "anonymous"}`;
}

/**
 * Get team-specific rate limit key
 */
export function getTeamRateLimitKey(
  teamId: string | undefined,
  action: string
): string {
  return `${action}:team:${teamId || "none"}`;
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError;
}
