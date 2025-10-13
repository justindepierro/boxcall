/**
 * Authentication constants and configuration values
 */

// Cache configuration
export const PROFILE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Session refresh configuration
export const MAX_REFRESH_ATTEMPTS = 3;
export const REFRESH_RETRY_DELAY = 5000; // 5 seconds
export const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
export const SESSION_REFRESH_THRESHOLD = 5 * 60; // 5 minutes in seconds
export const MS_PER_SECOND = 1000;

// Network resilience configuration
export const NETWORK_MAX_RETRIES = 3;
export const NETWORK_BASE_DELAY = 1000; // 1 second
export const NETWORK_MAX_DELAY = 10000; // 10 seconds

// Database error codes
export const POSTGRES_NO_ROWS_CODE = "PGRST116"; // PostgresT error code for no rows
