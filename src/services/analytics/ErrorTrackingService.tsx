/**
 * Error Tracking Service
 *
 * Comprehensive error tracking and monitoring with Sentry integration
 */

import React from "react";
import * as Sentry from "@sentry/react";
import { debug, error as logError, warn } from "../../utils/logger";

interface ErrorContext {
  user?: {
    id?: string;
    email?: string;
    role?: string;
  };
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  level?: "fatal" | "error" | "warning" | "info" | "debug";
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
}

export class ErrorTrackingService {
  private initialized = false;
  private developmentErrors: Array<{
    error: Error;
    context?: ErrorContext;
    timestamp: number;
  }> = [];

  constructor() {
    this.setupGlobalErrorHandlers();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const dsn = import.meta.env.VITE_SENTRY_DSN;
    const environment = import.meta.env.VITE_ENVIRONMENT || "development";

    // Only initialize Sentry in production or when explicitly enabled
    if (
      !dsn ||
      (!import.meta.env.PROD && import.meta.env.VITE_ENABLE_SENTRY !== "true")
    ) {
      debug("🐛 Error tracking disabled in development");
      this.initialized = true;
      return;
    }

    try {
      Sentry.init({
        dsn,
        environment,
        integrations: [Sentry.browserTracingIntegration()],
        tracesSampleRate: environment === "production" ? 0.1 : 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        beforeSend: (event) => {
          // Filter out non-critical errors in production
          if (environment === "production") {
            if (
              event.exception?.values?.[0]?.value?.includes(
                "ResizeObserver loop limit exceeded"
              )
            ) {
              return null;
            }
            if (
              event.exception?.values?.[0]?.value?.includes(
                "Non-Error promise rejection"
              )
            ) {
              return null;
            }
          }
          return event;
        },
        beforeBreadcrumb: (breadcrumb) => {
          // Filter out noisy breadcrumbs
          if (
            breadcrumb.category === "console" &&
            breadcrumb.level === "debug"
          ) {
            return null;
          }
          return breadcrumb;
        },
      });

      this.initialized = true;
      debug("🐛 Sentry error tracking initialized");
    } catch (error) {
      warn("Failed to initialize Sentry:", error);
      this.initialized = true; // Mark as initialized to prevent retries
    }
  }

  private setupGlobalErrorHandlers(): void {
    // Global error handler
    window.addEventListener("error", (event) => {
      this.captureError(new Error(event.message), {
        extra: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
        level: "error",
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener("unhandledrejection", (event) => {
      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));

      this.captureError(error, {
        tags: { type: "unhandled_promise_rejection" },
        level: "error",
      });
    });
  }

  async captureError(error: Error, context?: ErrorContext): Promise<void> {
    if (!this.initialized) await this.initialize();

    if (this.initialized && Sentry.getClient()) {
      // Sentry is available
      Sentry.withScope((scope) => {
        if (context?.user) {
          scope.setUser(context.user);
        }
        if (context?.tags) {
          Object.entries(context.tags).forEach(([key, value]) => {
            scope.setTag(key, value);
          });
        }
        if (context?.extra) {
          Object.entries(context.extra).forEach(([key, value]) => {
            scope.setExtra(key, value);
          });
        }
        if (context?.level) {
          scope.setLevel(context.level);
        }

        Sentry.captureException(error);
      });
    } else {
      // Fallback for development
      this.developmentErrors.push({
        error,
        context,
        timestamp: Date.now(),
      });

      logError("🐛 Error captured:", error, context);

      // Keep only last 100 errors in development
      if (this.developmentErrors.length > 100) {
        this.developmentErrors = this.developmentErrors.slice(-100);
      }
    }
  }

  async captureMessage(
    message: string,
    context?: Omit<ErrorContext, "level"> & { level?: ErrorContext["level"] }
  ): Promise<void> {
    if (!this.initialized) await this.initialize();

    if (this.initialized && Sentry.getClient()) {
      Sentry.withScope((scope) => {
        if (context?.user) {
          scope.setUser(context.user);
        }
        if (context?.tags) {
          Object.entries(context.tags).forEach(([key, value]) => {
            scope.setTag(key, value);
          });
        }
        if (context?.extra) {
          Object.entries(context.extra).forEach(([key, value]) => {
            scope.setExtra(key, value);
          });
        }

        Sentry.captureMessage(message, context?.level || "info");
      });
    } else {
      debug(
        `🐛 Message captured (${context?.level || "info"}):`,
        message,
        context
      );
    }
  }

  setUser(user: ErrorContext["user"]): void {
    if (this.initialized && Sentry.getClient()) {
      Sentry.setUser(user || null);
    }
  }

  addBreadcrumb(
    message: string,
    category?: string,
    data?: Record<string, any>
  ): void {
    if (this.initialized && Sentry.getClient()) {
      Sentry.addBreadcrumb({
        message,
        category: category || "custom",
        data,
        timestamp: Date.now() / 1000,
      });
    }
  }

  recordPerformanceMetric(metric: PerformanceMetric): void {
    if (this.initialized && Sentry.getClient()) {
      Sentry.withScope((scope) => {
        if (metric.tags) {
          Object.entries(metric.tags).forEach(([key, value]) => {
            scope.setTag(key, value);
          });
        }

        // Add as breadcrumb for now since metrics API may not be available
        Sentry.addBreadcrumb({
          message: `Performance metric: ${metric.name}`,
          category: "performance",
          data: {
            name: metric.name,
            value: metric.value,
            unit: metric.unit,
          },
        });
      });
    }
  }

  // Development helper methods
  getDevelopmentErrors(): Array<{
    error: Error;
    context?: ErrorContext;
    timestamp: number;
  }> {
    return this.developmentErrors;
  }

  clearDevelopmentErrors(): void {
    this.developmentErrors = [];
  }

  // Convenience methods for common error scenarios
  async captureApiError(
    error: Error,
    endpoint: string,
    method: string,
    statusCode?: number
  ): Promise<void> {
    await this.captureError(error, {
      tags: {
        type: "api_error",
        endpoint,
        method,
        status_code: statusCode?.toString() || "unknown",
      },
      extra: {
        endpoint,
        method,
        statusCode,
      },
      level: "error",
    });
  }

  async captureUserAction(
    error: Error,
    action: string,
    component?: string
  ): Promise<void> {
    await this.captureError(error, {
      tags: {
        type: "user_action_error",
        action,
        component: component || "unknown",
      },
      extra: {
        action,
        component,
      },
      level: "error",
    });
  }

  async capturePerformanceIssue(
    message: string,
    metric: string,
    value: number
  ): Promise<void> {
    await this.captureMessage(`Performance issue: ${message}`, {
      tags: {
        type: "performance_issue",
        metric,
      },
      extra: {
        metric,
        value,
      },
      level: "warning",
    });
  }
}

// Singleton instance
export const errorTracking = new ErrorTrackingService();

// React Error Boundary HOC
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  }
) {
  return Sentry.withErrorBoundary(Component, {
    fallback: ({ error, resetError }) => {
      const FallbackComponent = options?.fallback;
      if (FallbackComponent) {
        return (
          <FallbackComponent error={error as Error} resetError={resetError} />
        );
      }

      return (
        <div className="p-4 border border-error-200 rounded-lg bg-error-bg">
          <h3 className="text-error-800 font-semibold mb-2">
            Something went wrong
          </h3>
          <p className="text-error-600 text-sm mb-4">
            {(error as Error)?.message || "Unknown error"}
          </p>
          <button
            onClick={resetError}
            className="px-3 py-1 bg-error-600 text-white rounded text-sm hover:bg-error-700"
          >
            Try again
          </button>
        </div>
      );
    },
    beforeCapture: (scope, error, errorInfo) => {
      scope.setTag("errorBoundary", true);
      scope.setExtra("errorInfo", errorInfo);
      if (options?.onError && typeof errorInfo === "object") {
        options.onError(error as Error, errorInfo as React.ErrorInfo);
      }
    },
  });
}
