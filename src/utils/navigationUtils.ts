/**
 * Navigation Utilities
 * Helper functions for managing navigation state and return URLs
 */

import { 
  STORAGE_KEYS, 
  EXCLUDED_RETURN_ROUTES, 
  DEFAULT_LOGIN_DESTINATION 
} from './authConstants';

const RETURN_URL_PARAM = 'returnUrl';

/**
 * Saves the current path as the return URL
 * @param path - The path to save (defaults to current location)
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
 * Gets the saved return URL and clears it
 * @param defaultUrl - URL to return if no saved URL exists
 * @returns The return URL or default
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
 * @param search - URL search string (e.g., "?returnUrl=/playbook")
 * @returns The return URL or null
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
 * @param returnUrl - The URL to return to after login
 * @returns Login URL with returnUrl parameter
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
 * @param url - The URL to check
 * @returns True if auth route
 */
function isAuthRoute(url: string): boolean {
  return EXCLUDED_RETURN_ROUTES.some(route => url.startsWith(route));
}

/**
 * Validates a return URL is safe to navigate to
 * @param url - The URL to validate
 * @returns True if safe
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
 * Priority: query param > session storage > default
 * @param search - URL search string
 * @param defaultUrl - Default URL if none saved
 * @returns Safe return URL
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
