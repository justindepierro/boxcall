/**
 * Authentication Constants
 *
 * Centralized configuration values for authentication system.
 * All time values are in milliseconds unless otherwise noted.
 */

// ============================================================================
// PROFILE CACHE
// ============================================================================

/**
 * Time-to-live for profile cache entries
 * Profiles are cached to reduce database queries
 * @default 5 minutes (300,000 ms)
 */
export const PROFILE_CACHE_TTL = 5 * 60 * 1000;

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Maximum number of session refresh attempts before forcing logout
 * Prevents infinite retry loops when refresh is failing
 * @default 3 attempts
 */
export const MAX_REFRESH_ATTEMPTS = 3;

/**
 * Delay between session refresh retry attempts
 * Gives the network/server time to recover before retry
 * @default 30 seconds (30,000 ms)
 */
export const REFRESH_RETRY_DELAY = 30000;

/**
 * Interval for checking session expiration
 * Background job runs on this schedule
 * @default 5 minutes (300,000 ms)
 */
export const SESSION_CHECK_INTERVAL = 5 * 60 * 1000;

/**
 * Time before session expiration to trigger refresh (in seconds)
 * If token expires within this window, it will be refreshed proactively
 * @default 10 minutes (600 seconds)
 */
export const SESSION_REFRESH_THRESHOLD = 600;

/**
 * Conversion factor for milliseconds to seconds
 * Used when comparing timestamps in different units
 * @default 1000 (ms per second)
 */
export const MS_PER_SECOND = 1000;

// ============================================================================
// NETWORK RESILIENCE
// ============================================================================

/**
 * Maximum number of retry attempts for network operations
 * Applies to auth requests, profile fetches, etc.
 * @default 3 attempts
 */
export const NETWORK_MAX_RETRIES = 3;

/**
 * Base delay for exponential backoff (in milliseconds)
 * First retry waits this long, subsequent retries increase exponentially
 * @default 1 second (1,000 ms)
 */
export const NETWORK_BASE_DELAY = 1000;

/**
 * Maximum delay for exponential backoff (in milliseconds)
 * Caps the retry delay to prevent excessive waiting
 * @default 10 seconds (10,000 ms)
 */
export const NETWORK_MAX_DELAY = 10000;

// ============================================================================
// RATE LIMITING
// ============================================================================

/**
 * Maximum failed auth attempts before rate limiting kicks in
 * After this many failures, user must wait before retrying
 * @default 5 attempts (defined in authRateLimit.ts, documented here)
 */
export const MAX_FAILED_AUTH_ATTEMPTS = 5;

/**
 * Rate limit lockout duration (in milliseconds)
 * How long user must wait after hitting rate limit
 * @default 15 minutes (900,000 ms) (defined in authRateLimit.ts, documented here)
 */
export const RATE_LIMIT_DURATION = 15 * 60 * 1000;

// ============================================================================
// TIMEOUTS
// ============================================================================

/**
 * Network request timeout (in milliseconds)
 * Maximum time to wait for auth requests to complete
 * @default 30 seconds (30,000 ms)
 */
export const NETWORK_TIMEOUT = 30000;

/**
 * Session storage item keys
 * Used for persisting auth state across page refreshes
 */
export const STORAGE_KEYS = {
  /** Key for storing return URL after login */
  RETURN_URL: "boxcall_return_url",
  /** Key for Zustand auth state persistence */
  AUTH_STATE: "boxcall-auth-store",
} as const;

// ============================================================================
// URL PATTERNS
// ============================================================================

/**
 * Routes that should not be used as return URLs
 * Prevents redirect loops and security issues
 */
export const EXCLUDED_RETURN_ROUTES = [
  "/login",
  "/logout",
  "/signup",
  "/auth",
] as const;

/**
 * Default destination after successful login
 * Used when no return URL is specified
 */
export const DEFAULT_LOGIN_DESTINATION = "/dashboard";

// ============================================================================
// ERROR CODES
// ============================================================================

/**
 * Postgres error code for "no rows returned"
 * Used when checking if profile exists
 */
export const POSTGRES_NO_ROWS_CODE = "PGRST116";

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/**
 * Type for storage keys to ensure type safety
 */
export type StorageKey = keyof typeof STORAGE_KEYS;

/**
 * Type for excluded routes
 */
export type ExcludedRoute = (typeof EXCLUDED_RETURN_ROUTES)[number];
