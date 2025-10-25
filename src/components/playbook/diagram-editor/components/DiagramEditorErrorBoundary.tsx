/**
 * Error Boundary for Diagram Editor
 *
 * Catches errors from Pixi.js canvas operations and provides graceful fallback.
 * Prevents entire app from crashing when canvas errors occur.
 */

import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@components/ui/Button/Button";

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

export class DiagramEditorErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console for debugging
    console.error("❌ Diagram Editor Error:", error);
    console.error("Component Stack:", errorInfo.componentStack);

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call optional error callback
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    // Reset error state to retry rendering
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-surface-primary p-spacing-xl">
          <div className="flex max-w-md flex-col items-center gap-spacing-md text-center">
            {/* Icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-bg">
              <AlertCircle className="h-8 w-8 text-error-600" />
            </div>

            {/* Title */}
            <h2 className="text-heading-md font-semibold text-text-primary">
              Diagram Editor Error
            </h2>

            {/* Description */}
            <p className="text-body-md text-text-secondary">
              {this.state.error?.message ||
                "Something went wrong with the diagram editor. This might be due to a canvas rendering issue or invalid diagram data."}
            </p>

            {/* Error details (in development only) */}
            {import.meta.env.DEV && this.state.errorInfo && (
              <details className="mt-spacing-sm w-full text-left">
                <summary className="cursor-pointer text-body-sm text-text-secondary hover:text-text-primary">
                  Technical Details
                </summary>
                <pre className="mt-spacing-xs overflow-x-auto rounded-md bg-surface-secondary p-spacing-sm text-body-xs text-text-primary">
                  {this.state.error?.stack}
                  {"\n\n"}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            {/* Actions */}
            <div className="mt-spacing-md flex gap-spacing-sm">
              <Button variant="primary" size="md" onClick={this.handleReset}>
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </div>

            {/* Help text */}
            <p className="mt-spacing-md text-body-sm text-text-tertiary">
              If this error persists, try refreshing the page or contact
              support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
