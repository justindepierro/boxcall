/**
 * Play Error Types
 *
 * Custom error classes for play-related operations.
 * Provides specific error types for better error handling and user feedback.
 */

/**
 * Base class for all play-related errors
 */
export class PlayError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "PlayError";
  }
}

/**
 * Validation error for a specific field
 */
export class PlayValidationError extends PlayError {
  constructor(
    message: string,
    public readonly field: string,
    code: string = "VALIDATION_ERROR"
  ) {
    super(message, code);
    this.name = "PlayValidationError";
  }

  /**
   * Create from Zod validation error
   */
  static fromZodError(zodError: {
    issues: Array<{ path: (string | number)[]; message: string }>;
  }): PlayValidationError {
    const firstIssue = zodError.issues[0];
    const field = firstIssue?.path.join(".") || "unknown";
    const message = firstIssue?.message || "Validation failed";
    return new PlayValidationError(message, field, "ZOD_VALIDATION");
  }
}

/**
 * Duplicate play error (same name + formation)
 */
export class PlayDuplicateError extends PlayError {
  constructor(
    public readonly existingPlayId?: string,
    public readonly formation?: string,
    public readonly playName?: string
  ) {
    const message =
      formation && playName
        ? `A play named "${playName}" already exists in formation "${formation}"`
        : "A play with this name and formation already exists";
    super(message, "DUPLICATE_PLAY");
    this.name = "PlayDuplicateError";
  }

  /**
   * Create from Supabase 23505 error
   */
  static fromDatabaseError(
    formation?: string,
    playName?: string
  ): PlayDuplicateError {
    return new PlayDuplicateError(undefined, formation, playName);
  }
}

/**
 * Rate limit error
 */
export class PlayRateLimitError extends PlayError {
  constructor(public readonly retryAfterSeconds: number = 60) {
    super(
      `You're creating plays too quickly. Please wait ${retryAfterSeconds} seconds.`,
      "RATE_LIMIT"
    );
    this.name = "PlayRateLimitError";
  }
}

/**
 * Not found error
 */
export class PlayNotFoundError extends PlayError {
  constructor(public readonly playId: string) {
    super(`Play not found: ${playId}`, "NOT_FOUND");
    this.name = "PlayNotFoundError";
  }
}

/**
 * Permission error
 */
export class PlayPermissionError extends PlayError {
  constructor(
    public readonly action: "read" | "update" | "delete" | "create",
    public readonly playId?: string
  ) {
    super(
      playId
        ? `You don't have permission to ${action} this play`
        : `You don't have permission to ${action} plays`,
      "PERMISSION_DENIED"
    );
    this.name = "PlayPermissionError";
  }
}

/**
 * Check if an error is a known play error type
 */
export function isPlayError(error: unknown): error is PlayError {
  return error instanceof PlayError;
}

/**
 * Check if error is a duplicate constraint violation
 */
export function isDuplicateError(error: unknown): boolean {
  if (error instanceof PlayDuplicateError) return true;
  if (error instanceof Error) {
    return (
      error.message.includes("23505") ||
      error.message.includes("duplicate") ||
      (error as { code?: string }).code === "23505"
    );
  }
  return false;
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof PlayRateLimitError) return true;
  if (error instanceof Error) {
    return (
      error.message.toLowerCase().includes("rate limit") ||
      error.message.toLowerCase().includes("too quickly")
    );
  }
  return false;
}

/**
 * Get user-friendly error message from any error
 */
export function getPlayErrorMessage(error: unknown): string {
  // Known play errors have good messages
  if (error instanceof PlayError) {
    return error.message;
  }

  // Zod validation errors
  if (
    error &&
    typeof error === "object" &&
    "issues" in error &&
    Array.isArray((error as { issues: unknown[] }).issues)
  ) {
    const issues = (error as { issues: Array<{ message: string }> }).issues;
    return issues.map((i) => i.message).join(", ");
  }

  // Database constraint errors
  if (error instanceof Error) {
    if ((error as { code?: string }).code === "23505") {
      return "A play with this name and formation already exists. Try a different name.";
    }
    if (
      error.message.includes("Rate limit") ||
      error.message.includes("too quickly")
    ) {
      return error.message;
    }
  }

  // Generic fallback
  return "Something went wrong. Please try again.";
}

/**
 * Format seconds for display (e.g., "1 minute" or "30 seconds")
 */
export function formatRetryTime(seconds: number): string {
  if (seconds >= 60) {
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  }
  return `${seconds} second${seconds === 1 ? "" : "s"}`;
}
