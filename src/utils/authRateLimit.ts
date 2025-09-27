// Client-side rate limiting and security utilities

// CSRF Protection
class CSRFProtection {
  private token: string | null = null;
  private tokenExpiry: number = 0;

  /**
   * Generate or retrieve CSRF token
   */
  async getToken(): Promise<string> {
    const now = Date.now();

    // Return existing token if still valid (15 minutes)
    if (this.token && this.tokenExpiry > now) {
      return this.token;
    }

    // Generate new token
    this.token = this.generateSecureToken();
    this.tokenExpiry = now + (15 * 60 * 1000); // 15 minutes

    // Store in session storage for persistence
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('csrf_token', this.token);
      sessionStorage.setItem('csrf_expiry', this.tokenExpiry.toString());
    }

    return this.token;
  }

  /**
   * Validate CSRF token
   */
  validateToken(token: string): boolean {
    return this.token === token && this.tokenExpiry > Date.now();
  }

  /**
   * Generate a cryptographically secure random token
   */
  private generateSecureToken(): string {
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback for server-side or older browsers
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Initialize from stored token
   */
  initialize(): void {
    if (typeof window === 'undefined') return;

    const storedToken = sessionStorage.getItem('csrf_token');
    const storedExpiry = sessionStorage.getItem('csrf_expiry');

    if (storedToken && storedExpiry) {
      const expiry = parseInt(storedExpiry, 10);
      if (expiry > Date.now()) {
        this.token = storedToken;
        this.tokenExpiry = expiry;
      } else {
        // Token expired, clean up
        sessionStorage.removeItem('csrf_token');
        sessionStorage.removeItem('csrf_expiry');
      }
    }
  }
}

// Security Headers and Request Protection
class RequestSecurity {
  /**
   * Add security headers to requests
   */
  static addSecurityHeaders(headers: Record<string, string> = {}): Record<string, string> {
    return {
      ...headers,
      'X-Requested-With': 'XMLHttpRequest',
      'X-Client-Version': process.env.REACT_APP_VERSION || '1.0.0',
      'X-Client-Platform': 'web',
    };
  }

  /**
   * Validate request origin for additional security
   */
  static validateOrigin(): boolean {
    if (typeof window === 'undefined') return true;

    const currentOrigin = window.location.origin;
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://boxcall.com',
      // Add your production domains here
    ];

    return allowedOrigins.includes(currentOrigin);
  }

  /**
   * Detect suspicious activity
   */
  static detectSuspiciousActivity(): boolean {
    if (typeof window === 'undefined') return false;

    // Check for automation indicators
    const webdriver = (navigator as any).webdriver;
    const headless = /HeadlessChrome/.test(navigator.userAgent);

    return !!(webdriver || headless);
  }
}

// Enhanced Rate Limiting with Server Coordination
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

// Export security utilities
export const csrfProtection = new CSRFProtection();
export { RequestSecurity };

// Initialize CSRF protection on module load
if (typeof window !== 'undefined') {
  csrfProtection.initialize();
}

// Network Resilience Utilities
export class NetworkResilience {
  /**
   * Retry a function with exponential backoff
   */
  static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
    maxDelay: number = 30000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on authentication errors or client errors
        if (this.isNonRetryableError(error)) {
          throw error;
        }

        if (attempt === maxRetries) {
          throw lastError;
        }

        // Calculate delay with exponential backoff and jitter
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        const jitter = Math.random() * 0.1 * delay; // Add 10% jitter
        const finalDelay = delay + jitter;

        console.warn(`🔄 Network request failed, retrying in ${finalDelay.toFixed(0)}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, finalDelay));
      }
    }

    throw lastError!;
  }

  /**
   * Check if an error should not be retried
   */
  private static isNonRetryableError(error: any): boolean {
    // Authentication errors
    if (error?.message?.includes('Invalid login credentials')) return true;
    if (error?.message?.includes('Email not confirmed')) return true;

    // Client errors (4xx)
    if (error?.status >= 400 && error?.status < 500) return true;

    // Network errors that should be retried
    if (error?.name === 'NetworkError') return false;
    if (error?.message?.includes('fetch')) return false;
    if (error?.code === 'NETWORK_ERROR') return false;

    return false;
  }

  /**
   * Check if the user is online
   */
  static isOnline(): boolean {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine;
  }

  /**
   * Wait for online status
   */
  static async waitForOnline(timeout: number = 30000): Promise<boolean> {
    if (this.isOnline()) return true;

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        window.removeEventListener('online', onlineHandler);
        resolve(false);
      }, timeout);

      const onlineHandler = () => {
        clearTimeout(timeoutId);
        window.removeEventListener('online', onlineHandler);
        resolve(true);
      };

      window.addEventListener('online', onlineHandler);
    });
  }

  /**
   * Queue operations for when back online
   */
  private static offlineQueue: Array<() => Promise<void>> = [];

  static queueForOnline(operation: () => Promise<void>): void {
    if (this.isOnline()) {
      operation().catch(console.error);
      return;
    }

    this.offlineQueue.push(operation);

    // Set up online handler if not already set
    if (this.offlineQueue.length === 1) {
      const onlineHandler = () => {
        window.removeEventListener('online', onlineHandler);
        this.processOfflineQueue();
      };
      window.addEventListener('online', onlineHandler);
    }
  }

  private static async processOfflineQueue(): Promise<void> {
    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const operation of queue) {
      try {
        await operation();
      } catch (error) {
        console.error('Failed to process queued operation:', error);
      }
    }
  }
}