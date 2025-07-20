/**
 * Extracts a human-readable message from various error types.
 * Falls back to "Unknown error" if no message is available.
 *
 * @param {any} error - The error object (could be string, Error, or API error).
 * @returns {string} - Extracted error message.
 */
export function formatError(error) {
  if (!error) return 'Unknown error';

  // If it's already a string
  if (typeof error === 'string') return error;

  // Check for standard Error object
  if (error instanceof Error) return error.message;

  // For objects with a `message` property (optional chaining)
  return error?.message || 'Unknown error';
}

/**
 * Normalizes API or form errors into a single string.
 * Useful for displaying errors in the UI.
 *
 * @param {any} error
 * @returns {string}
 */
export function normalizeError(error) {
  // Safely access nested properties
  if (typeof error === 'object') {
    return error?.message || error?.error_description || error?.error || JSON.stringify(error);
  }

  return String(error);
}
