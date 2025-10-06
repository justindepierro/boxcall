import { memo } from "react";
import { Icon } from "../ui/Icon/Icon";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";

/**
 * PlayGridErrorState Component
 *
 * Error state displayed when PlayGrid fails to load data.
 * Provides user-friendly error message and retry action.
 *
 * @example
 * ```tsx
 * {error && <PlayGridErrorState error={error} onRetry={refreshData} />}
 * ```
 */

export interface PlayGridErrorStateProps {
  /** Error message or object */
  error: string | Error;
  /** Retry callback function */
  onRetry?: () => void;
}

export const PlayGridErrorState = memo<PlayGridErrorStateProps>(
  ({ error, onRetry }) => {
    const errorMessage =
      typeof error === "string" ? error : error.message || "Unknown error";

    // Determine error type for better messaging
    const isNetworkError =
      errorMessage.toLowerCase().includes("network") ||
      errorMessage.toLowerCase().includes("fetch");
    const isAuthError =
      errorMessage.toLowerCase().includes("auth") ||
      errorMessage.toLowerCase().includes("permission");

    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        {/* Error Icon */}
        <div className="w-20 h-20 rounded-2xl bg-status-error-bg dark:bg-status-error-bg-dark flex items-center justify-center mb-6">
          <Icon
            name="alert-triangle"
            className="w-10 h-10 text-status-error dark:text-status-error-text-dark"
          />
        </div>

        {/* Error Message */}
        <Typography
          variant="headline-md"
          className="text-text-primary mb-2 text-center"
        >
          {isNetworkError && "Connection Error"}
          {isAuthError && "Authentication Error"}
          {!isNetworkError && !isAuthError && "Something Went Wrong"}
        </Typography>

        <Typography
          variant="body"
          className="text-text-secondary mb-6 text-center max-w-md"
        >
          {isNetworkError &&
            "Unable to load plays. Please check your internet connection."}
          {isAuthError &&
            "You don't have permission to view this playbook. Please contact your coach."}
          {!isNetworkError &&
            !isAuthError &&
            "We encountered an error loading your playbook."}
        </Typography>

        {/* Technical Details (for debugging) */}
        {process.env.NODE_ENV === "development" && (
          <details className="mb-6 max-w-md w-full">
            <summary className="cursor-pointer text-sm text-text-muted hover:text-text-secondary">
              Technical Details
            </summary>
            <pre className="mt-2 p-3 bg-surface-muted dark:bg-slate-800 rounded-lg text-xs overflow-auto">
              {errorMessage}
            </pre>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {onRetry && (
            <Button onClick={onRetry} variant="primary">
              <Icon name="refresh-cw" className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          <Button onClick={() => window.location.reload()} variant="secondary">
            Reload Page
          </Button>
        </div>

        {/* Help Link */}
        <Typography variant="body-sm" className="text-text-muted mt-6">
          Still having issues?{" "}
          <a
            href="/contact"
            className="text-brand-primary dark:text-brand-accent hover:underline"
          >
            Contact Support
          </a>
        </Typography>
      </div>
    );
  }
);

PlayGridErrorState.displayName = "PlayGridErrorState";
