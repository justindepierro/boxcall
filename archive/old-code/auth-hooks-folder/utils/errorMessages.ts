/**
 * Convert Supabase auth errors to user-friendly, actionable messages
 *
 * Provides context-aware error messages with clear next steps for users
 *
 * @param error - The error object from Supabase auth operations
 * @returns A user-friendly error message with actionable guidance
 */
export function getAuthErrorMessage(error: any): string {
  if (!error) {
    return "An unexpected error occurred. Please refresh the page and try again.";
  }

  const message = error.message?.toLowerCase() || "";
  const status = error.status;

  // Invalid credentials - most common auth error
  if (message.includes("invalid login credentials")) {
    return "Invalid email or password. Please double-check your credentials and try again. Forgot your password? Use the reset link below.";
  }

  // Email not confirmed - user needs to take action
  if (message.includes("email not confirmed")) {
    return "Email not verified yet. Please check your inbox for the confirmation email. Can't find it? Check your spam folder or request a new confirmation email.";
  }

  // Rate limiting - time-based lockout
  if (message.includes("too many requests") || status === 429) {
    return "Too many login attempts detected. For security, please wait 5-10 minutes before trying again. This helps protect your account from unauthorized access.";
  }

  // User not found - might be typo or wrong account
  if (message.includes("user not found")) {
    return "No account found with this email address. Please check the email for typos, or create a new account if you haven't registered yet.";
  }

  // Weak password - needs stronger password
  if (message.includes("weak password")) {
    return "Password is too weak. Please choose a stronger password with at least 8 characters, including uppercase, lowercase, numbers, and symbols.";
  }

  // Signup disabled - system-level restriction
  if (message.includes("signup disabled")) {
    return "New registrations are temporarily disabled. Please contact support if you need access, or try again later.";
  }

  // Invalid email format
  if (message.includes("email address is invalid")) {
    return "The email address format is invalid. Please enter a valid email like: user@example.com";
  }

  // Password length requirement
  if (message.includes("password should be at least")) {
    return "Password must be at least 6 characters long. For better security, we recommend using 8+ characters with a mix of letters, numbers, and symbols.";
  }

  // Network errors - connectivity issues
  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("timeout")
  ) {
    return "Network connection issue detected. Please check your internet connection and try again. If the problem persists, try refreshing the page.";
  }

  // Session expired - user needs to re-authenticate
  if (
    message.includes("session") &&
    (message.includes("expired") || message.includes("invalid"))
  ) {
    return "Your session has expired for security reasons. Please sign in again to continue.";
  }

  // Fallback with original message for debugging
  const originalMessage = error.message || "Authentication failed";
  return `${originalMessage}. If this problem continues, please contact support with error code: ${status || "UNKNOWN"}`;
}
