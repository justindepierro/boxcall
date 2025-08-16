/**
 * Advanced Error Boundary System
 * Part of Phase 3D: Final Mobile Polish & Performance Optimization
 */
import React, { Component } from "react";

import { Typography } from "../design-system/Typography";

import { Icon } from "./Icon";
import { TouchFeedback } from "./TouchFeedback";

import type { ReactNode, ErrorInfo } from "react";

declare global {
  function gtag(
    command: string,
    action: string,
    parameters?: Record<string, unknown>
  ): void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
  isRecovering: boolean;
}

interface AdvancedErrorBoundaryProps {
  /** Fallback UI component */
  fallback?: React.ComponentType<ErrorFallbackProps>;
  /** Error event handler */
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Enable automatic retry */
  enableAutoRetry?: boolean;
  /** Auto retry delay in milliseconds */
  autoRetryDelay?: number;
  /** Enable error reporting */
  enableReporting?: boolean;
  /** Component name for debugging */
  componentName?: string;
  /** Children to wrap */
  children: ReactNode;
}

export type { AdvancedErrorBoundaryProps };

interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  errorId: string;
  retryCount: number;
  onRetry: () => void;
  onGoHome: () => void;
  onReportError: () => void;
  canRetry: boolean;
  isRecovering: boolean;
}

export class AdvancedErrorBoundary extends Component<
  AdvancedErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: AdvancedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
      retryCount: 0,
      isRecovering: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate unique error ID for tracking
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const {
      onError,
      enableReporting = true,
      componentName = "Unknown",
    } = this.props;
    const { errorId } = this.state;

    // Update state with error info
    this.setState({ errorInfo });

    // Call custom error handler
    onError?.(error, errorInfo, errorId);

    // Report error to monitoring services
    if (enableReporting) {
      this.reportError(error, errorInfo, errorId, componentName);
    }

    // Auto retry if enabled
    if (
      this.props.enableAutoRetry &&
      this.state.retryCount < (this.props.maxRetries || 3)
    ) {
      this.scheduleAutoRetry();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  /** Report error to monitoring services */
  private reportError = (
    error: Error,
    errorInfo: ErrorInfo,
    errorId: string,
    componentName: string
  ) => {
    // Enhanced error data for reporting
    const errorData = {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      componentName,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      buildVersion: process.env.REACT_APP_VERSION || "unknown",
    };

    // Send to monitoring services
    this.sendToSentry(errorData);
    this.sendToAnalytics(errorData);
    this.logToConsole(errorData);
  };

  /** Send error to Sentry */
  private sendToSentry = (errorData: Record<string, unknown>) => {
    try {
      // Example Sentry integration
      const windowWithSentry = window as {
        Sentry?: {
          captureException: (error: Error, options?: unknown) => void;
        };
      };
      if (
        typeof window !== "undefined" &&
        windowWithSentry.Sentry &&
        this.state.error
      ) {
        windowWithSentry.Sentry.captureException(this.state.error, {
          tags: {
            component: errorData.componentName,
            errorId: errorData.errorId,
          },
          extra: errorData,
        });
      }
    } catch (_e) {
      console.warn("Failed to send error to Sentry:", _e);
    }
  };

  /** Send error to analytics */
  private sendToAnalytics = (errorData: Record<string, unknown>) => {
    try {
      // Example Google Analytics integration
      if (typeof gtag !== "undefined") {
        gtag("event", "exception", {
          description: errorData.message,
          fatal: false,
          custom_map: {
            error_id: errorData.errorId,
            component: errorData.componentName,
          },
        });
      }

      // Custom analytics endpoint
      fetch("/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(errorData),
      }).catch(() => {
        // Silently fail for analytics
      });
    } catch (_e) {
      console.warn("Failed to send error to analytics:", _e);
    }
  };

  /** Enhanced console logging */
  private logToConsole = (errorData: Record<string, unknown>) => {
    console.group(`🚨 Error Boundary: ${errorData.componentName}`);
    console.error("Error ID:", errorData.errorId);
    console.error("Message:", errorData.message);
    console.error("Stack:", errorData.stack);
    console.error("Component Stack:", errorData.componentStack);
    console.error("Timestamp:", errorData.timestamp);
    console.error("Full Error Data:", errorData);
    console.groupEnd();
  };

  /** Get user ID for error tracking */
  private getUserId = (): string => {
    // Implementation depends on your auth system
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        return JSON.parse(userData).id || "anonymous";
      }
    } catch (_e) {
      // Ignore errors
    }
    return "anonymous";
  };

  /** Get session ID for error tracking */
  private getSessionId = (): string => {
    try {
      let sessionId = sessionStorage.getItem("sessionId");
      if (!sessionId) {
        sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem("sessionId", sessionId);
      }
      return sessionId;
    } catch (_e) {
      return `session-${Date.now()}`;
    }
  };

  /** Schedule automatic retry */
  private scheduleAutoRetry = () => {
    const delay = this.props.autoRetryDelay || 3000;

    this.setState({ isRecovering: true });

    this.retryTimeout = setTimeout(() => {
      this.handleRetry();
    }, delay);
  };

  /** Handle manual retry */
  private handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1,
        isRecovering: false,
      });
    }
  };

  /** Handle go to home */
  private handleGoHome = () => {
    // Navigate to home page
    window.location.href = "/";
  };

  /** Handle error reporting */
  private handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    const { componentName = "Unknown" } = this.props;

    if (error && errorInfo) {
      // Force re-report error with user feedback flag
      this.reportError(
        error,
        errorInfo,
        `${errorId}-user-reported`,
        componentName
      );

      // Show user feedback
      alert("Thank you for reporting this error. Our team will investigate.");
    }
  };

  render() {
    const { hasError, error, errorInfo, errorId, retryCount, isRecovering } =
      this.state;
    const {
      children,
      fallback: FallbackComponent,
      maxRetries = 3,
    } = this.props;

    if (hasError && error && errorInfo) {
      const canRetry = retryCount < maxRetries;

      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={error}
            errorInfo={errorInfo}
            errorId={errorId}
            retryCount={retryCount}
            onRetry={this.handleRetry}
            onGoHome={this.handleGoHome}
            onReportError={this.handleReportError}
            canRetry={canRetry}
            isRecovering={isRecovering}
          />
        );
      }

      return (
        <DefaultErrorFallback
          error={error}
          errorInfo={errorInfo}
          errorId={errorId}
          retryCount={retryCount}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          onReportError={this.handleReportError}
          canRetry={canRetry}
          isRecovering={isRecovering}
        />
      );
    }

    return children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorId,
  retryCount,
  onRetry,
  onGoHome,
  onReportError,
  canRetry,
  isRecovering,
}) => {
  return (
    <div className="min-h-screen surface-app flex items-center justify-center p-4">
      <div className="max-w-md w-full surface-card elevation-modal rounded-lg shadow-lg p-6 text-center">
        <div className="mb-4">
          <Icon
            name="alert-triangle"
            size="xl"
            className="text-red-500 mx-auto mb-4"
          />
          <Typography variant="headline-md" className="text-text-primary mb-2">
            Something went wrong
          </Typography>
          <Typography variant="body-md" className="text-text-secondary mb-4">
            We encountered an unexpected error. Don't worry, we've been notified
            and are working on a fix.
          </Typography>
        </div>

        {/* Error details for development */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-4 p-3 surface-subtle rounded text-left">
            <Typography
              variant="body-sm"
              className="text-text-primary font-mono"
            >
              <strong>Error:</strong> {error.message}
            </Typography>
            <Typography variant="body-xs" className="text-text-secondary mt-1">
              ID: {errorId}
            </Typography>
            {retryCount > 0 && (
              <Typography variant="body-xs" className="text-text-secondary">
                Retry attempts: {retryCount}
              </Typography>
            )}
          </div>
        )}

        <div className="space-y-3">
          {/* Retry button */}
          {canRetry && (
            <TouchFeedback
              className={`
                w-full py-3 px-4 rounded-lg font-medium transition-all
                ${
                  isRecovering
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-team-primary text-text-primary hover:bg-team-primary/90"
                }
              `}
              onPress={isRecovering ? undefined : onRetry}
              disabled={isRecovering}
            >
              <div className="flex items-center justify-center space-x-2">
                <Icon name="refresh-cw" size="sm" />
                <span>{isRecovering ? "Recovering..." : "Try Again"}</span>
              </div>
            </TouchFeedback>
          )}

          {/* Home button */}
          <TouchFeedback
            className="w-full py-3 px-4 border-subtle rounded-lg font-medium text-text-primary surface-subtle-hover transition-all"
            onPress={onGoHome}
          >
            <div className="flex items-center justify-center space-x-2">
              <Icon name="home" size="sm" />
              <span>Go Home</span>
            </div>
          </TouchFeedback>

          {/* Report error button */}
          <TouchFeedback
            className="w-full py-2 px-4 text-text-muted hover:text-text-primary transition-colors"
            onPress={onReportError}
          >
            <div className="flex items-center justify-center space-x-2">
              <Icon name="bug" size="xs" />
              <Typography variant="body-sm">Report this issue</Typography>
            </div>
          </TouchFeedback>
        </div>

        {!canRetry && (
          <Typography variant="body-sm" className="text-text-muted mt-4">
            Maximum retry attempts reached. Please refresh the page or contact
            support if the issue persists.
          </Typography>
        )}
      </div>
    </div>
  );
};

export default AdvancedErrorBoundary;
