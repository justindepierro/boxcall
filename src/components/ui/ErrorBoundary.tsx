import React, { Component } from "react";

import { telemetry } from "../../telemetry/dispatcher";
import { TelemetryEventTypes } from "../../telemetry/events";
// Use ModularIcon for lightweight, per-icon dynamic imports
import { Typography } from "../design-system";

import { Button } from "./Button";
import Icon from "./Icon/Icon";

import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, send to error reporting service
    if (process.env.NODE_ENV === "production") {
      this.reportError(error, errorInfo);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // TODO: Integrate with error reporting service (Sentry, LogRocket, etc.)
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.log("Error report:", errorReport);
    try {
      telemetry.enqueue({
        type: TelemetryEventTypes.ErrorBoundary,
        data: errorReport,
      });
    } catch (_) {
      // swallow telemetry errors
    }
    // Example: sendToErrorService(errorReport);
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default professional error UI with recovery options
      return (
        <div className="min-h-screen surface-app flex items-center justify-center p-4">
          <div className="max-w-md w-full surface-card elevation-modal rounded-md p-6 mx-4">
            {/* Error Icon and Title */}
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Icon name="alert-triangle" className="h-6 w-6 text-red-600" />
              </div>
              <Typography
                variant="headline-lg"
                className="text-text-primary mb-2"
              >
                Something went wrong
              </Typography>
              <Typography variant="body-md" className="text-text-secondary">
                We encountered an unexpected error. Don't worry, our team has
                been notified and is working on it.
              </Typography>
            </div>

            {/* Development Error Details */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mb-6 p-4 surface-subtle border border-subtle rounded-lg">
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium text-red-800 mb-2">
                    <Icon
                      name="settings"
                      aria-label="wrench"
                      className="inline h-4 w-4 align-middle text-current"
                    />{" "}
                    Error Details (Development Only)
                  </summary>
                  <div className="mt-2 p-3 surface-card border rounded text-xs font-mono">
                    <div className="text-red-600 mb-2">
                      <strong>Message:</strong> {this.state.error.message}
                    </div>
                    <div className="text-text-secondary whitespace-pre-wrap">
                      <strong>Stack:</strong>
                      {this.state.error.stack}
                    </div>
                  </div>
                </details>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={this.handleRetry}
                variant="primary"
                size="sm"
                className="w-full flex items-center justify-center"
                icon={<Icon name="refresh" className="h-4 w-4" />}
                iconPosition="left"
              >
                Try Again
              </Button>

              <Button
                onClick={() => (window.location.href = "/")}
                variant="secondary"
                size="sm"
                className="w-full flex items-center justify-center"
                icon={<Icon name="home" className="h-4 w-4" />}
                iconPosition="left"
              >
                Go to Dashboard
              </Button>

              <Button
                onClick={() => window.location.reload()}
                variant="ghost"
                size="sm"
                className="w-full flex items-center justify-center text-text-muted hover:text-text-primary"
                icon={<Icon name="message" className="h-4 w-4" />}
                iconPosition="left"
              >
                Reload Page
              </Button>
            </div>

            {/* Help Text */}
            <div className="mt-6 pt-4 border-t border-subtle text-center">
              <Typography variant="caption" className="text-text-muted">
                If this problem persists, please contact support with the error
                details above.
              </Typography>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
};
