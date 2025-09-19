/**
 * Global error handling utilities for BoxCall
 * Provides consistent error logging, reporting, and user feedback
 */

export interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  timestamp: string;
  userAgent: string;
  userId?: string;
  sessionId?: string;
  context?: Record<string, unknown>;
}

export interface ValidationErrorItem {
  field: string;
  message: string;
  code: string;
}

export class BoxCallError extends Error {
  public code: string;
  public context?: Record<string, unknown>;
  public userMessage?: string;

  constructor(
    message: string,
    code: string = "UNKNOWN_ERROR",
    context?: Record<string, unknown>,
    userMessage?: string
  ) {
    super(message);
    this.name = "BoxCallError";
    this.code = code;
    this.context = context;
    this.userMessage = userMessage;
  }
}

// Common error types
export class NetworkError extends BoxCallError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(
      message,
      "NETWORK_ERROR",
      context,
      "Network connection issue. Please check your internet connection."
    );
  }
}

export class ValidationError extends BoxCallError {
  public validationErrors: ValidationErrorItem[];

  constructor(
    message: string,
    validationErrors: ValidationErrorItem[],
    context?: Record<string, unknown>
  ) {
    super(
      message,
      "VALIDATION_ERROR",
      context,
      "Please check your input and try again."
    );
    this.validationErrors = validationErrors;
  }
}

export class AuthenticationError extends BoxCallError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(
      message,
      "AUTH_ERROR",
      context,
      "Authentication required. Please log in again."
    );
  }
}

export class PermissionError extends BoxCallError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(
      message,
      "PERMISSION_ERROR",
      context,
      "You do not have permission to perform this action."
    );
  }
}

// Global error handler
class ErrorHandler {
  private errorQueue: ErrorReport[] = [];
  private isOnline = navigator.onLine;

  constructor() {
    this.setupGlobalHandlers();
    this.setupNetworkHandlers();
  }

  private setupGlobalHandlers() {
    // Handle uncaught JavaScript errors
    window.addEventListener("error", (event) => {
      this.handleError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.handleError(
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason)),
        { type: "unhandledrejection" }
      );
    });
  }

  private setupNetworkHandlers() {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
    });
  }

  public handleError(_error: Error, context?: Record<string, unknown>) {
    const errorReport: ErrorReport = {
      message: _error.message,
      stack: _error.stack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      context,
    };

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      // console.error("Error caught by ErrorHandler:", error, context);
    }

    // Queue for reporting
    this.errorQueue.push(errorReport);

    // Attempt to send immediately if online
    if (this.isOnline) {
      this.flushErrorQueue();
    }

    // Store in localStorage as backup
    this.storeErrorLocally(errorReport);
  }

  private async flushErrorQueue() {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      await this.sendErrors(errors);
      this.clearLocalErrors();
    } catch (_error) {
      // Put errors back in queue if sending failed
      this.errorQueue.unshift(...errors);
      // console.warn("Failed to send error reports:", error);
    }
  }

  private async sendErrors(_errors: ErrorReport[]) {
    // TODO: Integrate with actual error reporting service
    if (process.env.NODE_ENV === "development") {
      // console.info("Would send error reports:", errors);
      return;
    }

    // Example implementation:
    // await fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ errors }),
    // });
  }

  private storeErrorLocally(error: ErrorReport) {
    try {
      const stored = localStorage.getItem("boxcall_errors");
      const errors = stored ? JSON.parse(stored) : [];
      errors.push(error);

      // Keep only last 10 errors to avoid storage bloat
      if (errors.length > 10) {
        errors.splice(0, errors.length - 10);
      }

      localStorage.setItem("boxcall_errors", JSON.stringify(errors));
    } catch {
      // console.warn("Failed to store error locally");
    }
  }

  private clearLocalErrors() {
    try {
      localStorage.removeItem("boxcall_errors");
    } catch {
      // console.warn("Failed to clear local errors");
    }
  }

  // Get stored errors (for debugging or manual reporting)
  public getStoredErrors(): ErrorReport[] {
    try {
      const stored = localStorage.getItem("boxcall_errors");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

// Create global instance
export const errorHandler = new ErrorHandler();

// Utility functions for common error scenarios
export const handleApiError = (
  error: unknown,
  context?: Record<string, unknown>
) => {
  if (error instanceof Error) {
    errorHandler.handleError(error, { ...context, type: "api_error" });
  } else {
    errorHandler.handleError(new Error(String(error)), {
      ...context,
      type: "api_error",
    });
  }
};

export const handleValidationError = (
  validationErrors: ValidationErrorItem[],
  context?: Record<string, unknown>
) => {
  const error = new ValidationError(
    "Validation failed",
    validationErrors,
    context
  );
  errorHandler.handleError(error, { type: "validation_error" });
};

export const handleNetworkError = (
  error: unknown,
  context?: Record<string, unknown>
) => {
  const networkError =
    error instanceof Error
      ? new NetworkError(error.message, context)
      : new NetworkError("Network request failed", context);

  errorHandler.handleError(networkError, { type: "network_error" });
};

// React hook for error handling
export const useErrorHandler = () => {
  return {
    handleError: errorHandler.handleError.bind(errorHandler),
    handleApiError,
    handleValidationError,
    handleNetworkError,
    getStoredErrors: errorHandler.getStoredErrors.bind(errorHandler),
  };
};
