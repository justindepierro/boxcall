/**
 * Redirect Utilities
 *
 * Centralizes safe internal redirect handling.
 *
 * Goals:
 * - Only allow internal, same-origin navigation targets.
 * - Reject protocol-relative URLs ("//evil.com"), absolute URLs, and XSS schemes.
 */

export function isSafeInternalRedirectPath(path: string): boolean {
  if (!path) return false;

  // Must be an absolute path within the SPA
  if (!path.startsWith("/")) return false;

  // Block protocol-relative paths which some routers/browsers treat as external
  if (path.startsWith("//")) return false;

  // Block obvious XSS / external URL patterns
  const lower = path.toLowerCase();
  if (lower.includes("://")) return false;
  if (lower.startsWith("javascript:")) return false;
  if (lower.startsWith("data:")) return false;

  // Disallow backslashes and control chars (defensive)
  if (path.includes("\\")) return false;
  if (/\s/.test(path)) return false;

  return true;
}

/**
 * Builds a same-origin absolute redirect URL for providers like Supabase.
 *
 * Returns a safe absolute URL (e.g. "https://app.com/reset-password")
 * or falls back to the site origin if the provided path is unsafe.
 */
export function createSameOriginRedirectTo(path: string): string {
  const origin = window.location.origin;

  if (!isSafeInternalRedirectPath(path)) {
    return `${origin}/`;
  }

  // URL() safely joins origin + path (preserves query params)
  return new URL(path, origin).toString();
}
