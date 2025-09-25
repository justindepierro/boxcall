// Client-side rate limiting and security utilities
class AuthRateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts = 5;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes
  private readonly baseDelay = 1000; // 1 second

  /**
   * Record a failed authentication attempt
   */
  recordFailedAttempt(identifier: string): void {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];

    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    recentAttempts.push(now);

    this.attempts.set(identifier, recentAttempts);
  }

  /**
   * Check if the identifier is rate limited
   */
  isRateLimited(identifier: string): boolean {
    const attempts = this.attempts.get(identifier) || [];
    const now = Date.now();
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);

    return recentAttempts.length >= this.maxAttempts;
  }

  /**
   * Get the delay before next attempt is allowed
   */
  getDelayMs(identifier: string): number {
    if (!this.isRateLimited(identifier)) return 0;

    const attempts = this.attempts.get(identifier) || [];
    const recentAttempts = attempts.filter(time => Date.now() - time < this.windowMs);

    // Exponential backoff: delay = baseDelay * 2^(attempts - maxAttempts)
    const excessAttempts = recentAttempts.length - this.maxAttempts + 1;
    return this.baseDelay * Math.pow(2, excessAttempts);
  }

  /**
   * Reset attempts for an identifier (on successful auth)
   */
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  /**
   * Clean up old entries periodically
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, attempts] of this.attempts.entries()) {
      const recentAttempts = attempts.filter(time => now - time < this.windowMs);
      if (recentAttempts.length === 0) {
        this.attempts.delete(key);
      } else {
        this.attempts.set(key, recentAttempts);
      }
    }
  }
}

// Global rate limiter instance
export const authRateLimiter = new AuthRateLimiter();

// Clean up old entries every 5 minutes
setInterval(() => authRateLimiter.cleanup(), 5 * 60 * 1000);

/**
 * Utility to get client identifier (IP-based or device-based)
 */
export const getClientIdentifier = (): string => {
  // In a real implementation, this would use a more sophisticated
  // device fingerprinting approach. For now, we'll use a simple approach.
  return navigator.userAgent + (navigator.language || '');
};

/**
 * Check if request should be rate limited
 */
export const checkRateLimit = (identifier?: string): { allowed: boolean; delayMs: number } => {
  const clientId = identifier || getClientIdentifier();
  const isLimited = authRateLimiter.isRateLimited(clientId);

  if (isLimited) {
    return { allowed: false, delayMs: authRateLimiter.getDelayMs(clientId) };
  }

  return { allowed: true, delayMs: 0 };
};

/**
 * Record a failed auth attempt
 */
export const recordFailedAuth = (identifier?: string): void => {
  const clientId = identifier || getClientIdentifier();
  authRateLimiter.recordFailedAttempt(clientId);
};

/**
 * Reset rate limiting on successful auth
 */
export const resetRateLimit = (identifier?: string): void => {
  const clientId = identifier || getClientIdentifier();
  authRateLimiter.reset(clientId);
};