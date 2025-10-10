/**
 * Diagram Error Boundary
 * 
 * Catches and gracefully handles errors during Pixi initialization
 * and rendering, providing fallback UI and debugging information.
 */

import React, { Component } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../../../../components/ui/Icon/Icon';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class DiagramErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('🔴 Diagram Editor Error:', error);
    console.error('Error Info:', errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to analytics/monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service (Sentry, etc.)
      // trackError('DiagramEditorError', { error, errorInfo });
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      const isWebGLError = error?.message.includes('WebGL') || 
                          error?.message.includes('context');
      
      return (
        <div className="flex h-full w-full items-center justify-center bg-surface p-8">
          <div className="max-w-2xl rounded-lg border border-border bg-surface-card p-8 shadow-lg">
            {/* Error Icon */}
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-error-bg p-4">
                <Icon 
                  name="warning" 
                  className="h-10 w-10 text-error-600" 
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Error Title */}
            <h2 className="mb-2 text-center text-2xl font-bold text-content-primary">
              {isWebGLError 
                ? 'Graphics Initialization Failed' 
                : 'Diagram Editor Error'}
            </h2>

            {/* Error Description */}
            <p className="mb-6 text-center text-content-secondary">
              {isWebGLError ? (
                <>
                  Your browser or device doesn't support WebGL graphics,
                  which is required for the diagram editor.
                </>
              ) : (
                <>
                  An unexpected error occurred while loading the diagram editor.
                  Please try refreshing the page.
                </>
              )}
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && error && (
              <details className="mb-6 rounded-md bg-surface-tertiary p-4">
                <summary className="cursor-pointer font-semibold text-content-primary hover:text-content-secondary">
                  Technical Details
                </summary>
                <div className="mt-2 space-y-2">
                  <div>
                    <div className="text-sm font-medium text-content-primary">
                      Error:
                    </div>
                    <pre className="mt-1 overflow-x-auto rounded bg-surface p-2 text-xs text-error-600">
                      {error.message}
                    </pre>
                  </div>
                  {errorInfo && (
                    <div>
                      <div className="text-sm font-medium text-content-primary">
                        Component Stack:
                      </div>
                      <pre className="mt-1 overflow-x-auto rounded bg-surface p-2 text-xs text-content-secondary">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Suggestions */}
            <div className="mb-6 rounded-md bg-blue-50 p-4">
              <h3 className="mb-2 text-sm font-semibold text-blue-900">
                Try these solutions:
              </h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-blue-800">
                {isWebGLError ? (
                  <>
                    <li>Update your browser to the latest version</li>
                    <li>Try a different browser (Chrome, Firefox, or Safari)</li>
                    <li>Check if hardware acceleration is enabled in browser settings</li>
                    <li>If on mobile, try the desktop version</li>
                  </>
                ) : (
                  <>
                    <li>Refresh the page to reload the editor</li>
                    <li>Clear your browser cache and try again</li>
                    <li>Update your browser to the latest version</li>
                    <li>If the problem persists, contact support</li>
                  </>
                )}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="rounded-lg bg-surface-secondary px-4 py-2 text-sm font-medium text-content-primary transition-colors hover:bg-surface-tertiary focus:outline-none focus:ring-2 focus:ring-jade-500"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="rounded-lg bg-jade-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-jade-600 focus:outline-none focus:ring-2 focus:ring-jade-500 focus:ring-offset-2"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
