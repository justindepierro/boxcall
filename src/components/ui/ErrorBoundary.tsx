import type { ErrorInfo, ReactNode } from "react";
import { ModularIcon as Icon } from "./Icon";
import { telemetry } from "../../telemetry/dispatcher";
import { TelemetryEventTypes } from "../../telemetry/events";
import React, { Component } from "react";
// Use ModularIcon for lightweight, per-icon dynamic imports
import { Button } from "./Button";
import { Typography } from "../design-system";
import { debug, logError } from "../../utils/logger";
import { requestAppReset } from "../../utils/appReset";
import { softNavigate } from "../../utils/softNavigate";

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
    logError("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, send to error reporting service
    if (import.meta.env.PROD) {
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

    debug("[ErrorBoundary] Error report:", errorReport);
    try {
      telemetry.enqueue({
        type: TelemetryEventTypes.ErrorBoundary,
        data: errorReport,
      });
    } catch {
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
          <div className="max-w-md w-full bg-primary elevation-modal rounded-lg p-6 mx-4">
            {/* Error Icon and Title */}
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-surface-error mb-4">
                <Icon name="alert-triangle" className="h-6 w-6 text-error" />
              </div>
              <Typography variant="headline-lg" className="text-primary mb-2">
                Something went wrong
              </Typography>
              <Typography variant="body-md" className="text-secondary">
                We encountered an unexpected error. Don't worry, our team has
                been notified and is working on it.
              </Typography>
            </div>

            {/* Development Error Details */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-subtle border border-muted rounded-lg">
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium text-error mb-2">
                    <Icon
                      name="wrench"
                      aria-label="wrench"
                      className="inline h-4 w-4 align-middle text-primary"
                    />{" "}
                    Error Details (Development Only)
                  </summary>
                  <div className="mt-2 p-3 bg-primary border rounded-lg text-xs font-mono">
                    <div className="text-error mb-2">
                      <strong>Message:</strong> {this.state.error.message}
                    </div>
                    <div className="text-secondary whitespace-pre-wrap">
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
                icon={<Icon name="refresh-cw" className="h-4 w-4" />}
                iconPosition="left"
              >
                Try Again
              </Button>

              <Button
                onClick={() => {
                  softNavigate("/", { replace: true });
                  requestAppReset("error-boundary-home");
                }}
                variant="secondary"
                size="sm"
                className="w-full flex items-center justify-center"
                icon={<Icon name="home" className="h-4 w-4" />}
                iconPosition="left"
              >
                Go to Dashboard
              </Button>

              <Button
                onClick={() => requestAppReset("error-boundary-reload")}
                variant="ghost"
                size="sm"
                className="w-full flex items-center justify-center text-muted hover:text-primary"
                icon={<Icon name="message" className="h-4 w-4" />}
                iconPosition="left"
              >
                Reload Page
              </Button>
            </div>

            {/* Help Text */}
            <div className="mt-6 pt-4 border-t border-muted text-center">
              <Typography variant="caption" className="text-muted">
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
