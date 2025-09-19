/**
 * Error Boundary Utilities
 * Part of Phase 3D: Final Mobile Polish & Performance Optimization
 */
import type { ErrorInfo } from "react";

// Hook for using error boundary programmatically
export const useErrorHandler = () => {
  return (error: Error, _errorInfo?: ErrorInfo) => {
    // Throw error to be caught by nearest error boundary
    setTimeout(() => {
      throw error;
    }, 0);
  };
};

// Error reporting utility
export const reportError = (
  error: Error,
  context?: {
    component?: string;
    userId?: string;
    additionalInfo?: Record<string, unknown>;
  }
) => {
  const errorData = {
    errorId: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    component: context?.component || "Unknown",
    userId: context?.userId || "anonymous",
    ...context?.additionalInfo,
  };

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    // console.error("Manual Error Report:", errorData);
  }

  // Send to error tracking services
  // This would integrate with your error tracking service
  try {
    fetch("/api/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(errorData),
    }).catch(() => {
      // Silently fail for error reporting
    });
  } catch (_e) {
    // Ignore errors in error reporting
  }
};

// Error boundary test utility
export const triggerError = (message = "Test error") => {
  throw new Error(message);
};
