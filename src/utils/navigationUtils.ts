/**
 * Navigation Utilities Module
 * 
 * Helper functions for managing navigation state and return URLs.
 * Enables "go back to where you were" functionality after authentication.
 * 
 * @module navigationUtils
 * @example
 * ```typescript
 * // Save current location before redirect
 * saveReturnUrl('/playbook/42');
 * 
 * // After login, get destination
 * const destination = getLoginDestination(location.search);
 * navigate(destination); // Returns to /playbook/42
 * ```
 */

import { 
  STORAGE_KEYS, 
  EXCLUDED_RETURN_ROUTES, 
  DEFAULT_LOGIN_DESTINATION 
} from './authConstants';

const RETURN_URL_PARAM = 'returnUrl';

/**
 * Saves the current path as the return URL
 * Stores URL in sessionStorage for retrieval after login
 * Auth-related URLs are automatically excluded
 * 
 * @param path - The path to save (defaults to current location)
 * @example
 * ```typescript
 * // Before redirecting to login
 * saveReturnUrl('/playbook/42');
 * // Or use current location
 * saveReturnUrl();
 * ```
 */
export function saveReturnUrl(path?: string): void {
  try {
    const url = path || window.location.pathname + window.location.search;
    // Don't save auth-related URLs
    if (isAuthRoute(url)) {
      return;
    }
    sessionStorage.setItem(STORAGE_KEYS.RETURN_URL, url);
    console.debug('🔖 Saved return URL:', url);
  } catch (error) {
    console.warn('Failed to save return URL:', error);
  }
}

/**
 * Gets the saved return URL and clears it from storage
 * Returns default URL if no saved URL exists or if saved URL is invalid
 * 
 * @param defaultUrl - URL to return if no saved URL exists
 * @returns The return URL or default
 * @example
 * ```typescript
 * const destination = getAndClearReturnUrl('/dashboard');
 * navigate(destination);
 * ```
 */
export function getAndClearReturnUrl(defaultUrl = DEFAULT_LOGIN_DESTINATION): string {
  try {
    const url = sessionStorage.getItem(STORAGE_KEYS.RETURN_URL);
    sessionStorage.removeItem(STORAGE_KEYS.RETURN_URL);
    
    if (url && !isAuthRoute(url)) {
      console.debug('🔖 Retrieved return URL:', url);
      return url;
    }
  } catch (error) {
    console.warn('Failed to get return URL:', error);
  }
  return defaultUrl;
}

/**
 * Gets return URL from query parameter
 * Parses ?returnUrl= from URL search string
 * 
 * @param search - URL search string (e.g., "?returnUrl=/playbook")
 * @returns The return URL or null if not found/invalid
 * @example
 * ```typescript
 * const url = getReturnUrlFromQuery(location.search);
 * if (url) navigate(url);
 * ```
 */
export function getReturnUrlFromQuery(search: string): string | null {
  try {
    const params = new URLSearchParams(search);
    const returnUrl = params.get(RETURN_URL_PARAM);
    
    if (returnUrl && !isAuthRoute(returnUrl)) {
      console.debug('🔖 Found return URL in query:', returnUrl);
      return returnUrl;
    }
  } catch (error) {
    console.warn('Failed to parse return URL from query:', error);
  }
  return null;
}

/**
 * Creates a login URL with return URL parameter
 * Automatically excludes auth routes from return URL
 * 
 * @param returnUrl - The URL to return to after login
 * @returns Login URL with returnUrl query parameter
 * @example
 * ```typescript
 * // User on /playbook → redirect to login
 * const loginUrl = createLoginUrl('/playbook');
 * // Returns: "/login?returnUrl=%2Fplaybook"
 * navigate(loginUrl);
 * ```
 */
export function createLoginUrl(returnUrl?: string): string {
  const url = returnUrl || window.location.pathname + window.location.search;
  
  // Don't add return URL for auth routes
  if (isAuthRoute(url)) {
    return '/login';
  }
  
  return `/login?${RETURN_URL_PARAM}=${encodeURIComponent(url)}`;
}

/**
 * Checks if a URL is an auth-related route
 * Auth routes should not be saved as return URLs
 * 
 * @param url - The URL to check
 * @returns True if auth route (login, signup, etc.)
 * @internal
 */
function isAuthRoute(url: string): boolean {
  return EXCLUDED_RETURN_ROUTES.some(route => url.startsWith(route));
}

/**
 * Validates a return URL is safe to navigate to
 * Prevents XSS attacks and redirect loops
 * 
 * Security checks:
 * - Must start with "/" (relative path only)
 * - Cannot be an auth route
 * - Cannot contain protocols (http://, javascript:, data:, etc.)
 * 
 * @param url - The URL to validate
 * @returns True if safe to use as return URL
 * @example
 * ```typescript
 * isValidReturnUrl("/playbook");     // ✓ true
 * isValidReturnUrl("/login");        // ✗ false (auth route)
 * isValidReturnUrl("http://evil.com"); // ✗ false (external)
 * isValidReturnUrl("javascript:alert(1)"); // ✗ false (XSS)
 * ```
 */
export function isValidReturnUrl(url: string): boolean {
  try {
    // Must start with / (relative path)
    if (!url.startsWith('/')) {
      return false;
    }
    
    // Must not be an auth route
    if (isAuthRoute(url)) {
      return false;
    }
    
    // Must not be a protocol (prevent XSS)
    if (url.includes('://') || url.startsWith('javascript:') || url.startsWith('data:')) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets the final destination after login
 * Checks multiple sources in priority order:
 * 1. Query parameter (?returnUrl=)
 * 2. Session storage
 * 3. Default URL
 * 
 * All URLs are validated for safety before use
 * 
 * @param search - URL search string from location
 * @param defaultUrl - Default URL if none saved (defaults to /dashboard)
 * @returns Safe, validated return URL
 * @example
 * ```typescript
 * // In LoginPage after successful auth
 * const destination = getLoginDestination(location.search);
 * navigate(destination);
 * ```
 */
export function getLoginDestination(search: string, defaultUrl = DEFAULT_LOGIN_DESTINATION): string {
  // 1. Check query parameter
  const queryUrl = getReturnUrlFromQuery(search);
  if (queryUrl && isValidReturnUrl(queryUrl)) {
    sessionStorage.removeItem(STORAGE_KEYS.RETURN_URL); // Clear storage if using query
    return queryUrl;
  }
  
  // 2. Check session storage
  const storedUrl = getAndClearReturnUrl(defaultUrl);
  if (storedUrl !== defaultUrl && isValidReturnUrl(storedUrl)) {
    return storedUrl;
  }
  
  // 3. Return default
  return defaultUrl;
}
