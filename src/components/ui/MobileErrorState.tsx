/**
 * Mobile-optimized error state components for production-ready error handling
 * Part of Phase 3A: Critical Performance & Error Handling
 */
import React from "react";
import { Button } from "./Button";
import { ModularIcon as Icon } from "./Icon";
import { Typography } from "../design-system/Typography";

export interface MobileErrorStateProps {
  /** Error type determines the appropriate UI and messaging */
  type?: "network" | "server" | "generic" | "offline" | "timeout";
  /** Custom error title */
  title?: string;
  /** Custom error message */
  message?: string;
  /** Show retry button */
  showRetry?: boolean;
  /** Retry button handler */
  onRetry?: () => void;
  /** Show home button */
  showHome?: boolean;
  /** Home button handler */
  onHome?: () => void;
  /** Additional custom actions */
  actions?: React.ReactNode;
  /** Compact mode for smaller spaces */
  compact?: boolean;
  /** Custom className */
  className?: string;
}

const ERROR_CONFIGURATIONS = {
  network: {
    icon: "wifi-off" as const,
    defaultTitle: "Network Error",
    defaultMessage: "Please check your internet connection and try again.",
    color: "text-text-warning",
    bgColor: "bg-surface-warning",
  },
  server: {
    icon: "server" as const,
    defaultTitle: "Server Error",
    defaultMessage:
      "Our servers are experiencing issues. Please try again in a moment.",
    color: "text-text-error",
    bgColor: "bg-surface-error",
  },
  offline: {
    icon: "wifi-off" as const,
    defaultTitle: "You're Offline",
    defaultMessage:
      "Check your connection and try again when you're back online.",
    color: "text-text-tertiary",
    bgColor: "surface-subtle",
  },
  timeout: {
    icon: "refresh-cw" as const,
    defaultTitle: "Request Timeout",
    defaultMessage: "This is taking longer than usual. Please try again.",
    color: "text-text-warning",
    bgColor: "bg-surface-warning",
  },
  generic: {
    icon: "alert-triangle" as const,
    defaultTitle: "Something went wrong",
    defaultMessage: "We encountered an unexpected error. Please try again.",
    color: "text-text-error",
    bgColor: "bg-surface-error",
  },
};

export const MobileErrorState: React.FC<MobileErrorStateProps> = ({
  type = "generic",
  title,
  message,
  showRetry = true,
  onRetry,
  showHome = false,
  onHome,
  actions,
  compact = false,
  className = "",
}) => {
  const config = ERROR_CONFIGURATIONS[type];
  const IconName = config.icon;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry behavior - reload page
      window.location.reload();
    }
  };

  const handleHome = () => {
    if (onHome) {
      onHome();
    } else {
      // Default home behavior
      window.location.href = "/";
    }
  };

  if (compact) {
    return (
      <div
        className={`flex items-center justify-between p-4 surface-card rounded-lg ${className}`}
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${config.bgColor}`}>
            <Icon name={IconName} size="sm" className={config.color} />
          </div>
          <div>
            <Typography
              variant="body-sm"
              className="text-text-primary font-medium"
            >
              {title || config.defaultTitle}
            </Typography>
            <Typography variant="caption" className="text-text-muted">
              {message || config.defaultMessage}
            </Typography>
          </div>
        </div>
        {showRetry && (
          <Button
            onClick={handleRetry}
            variant="ghost"
            size="xs"
            className="flex-shrink-0 p-2 h-auto text-team-primary hover:surface-subtle"
            icon={<Icon name="refresh-cw" size="sm" />}
            iconPosition="only"
            aria-label="Retry"
          />
        )}
      </div>
    );
  }

  return (
    <div className={`text-center p-6 ${className}`}>
      {/* Error Icon */}
      <div
        className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${config.bgColor} mb-4`}
      >
        <Icon name={IconName} size="lg" className={config.color} />
      </div>

      {/* Error Content */}
      <div className="mb-6">
        <Typography variant="headline-md" className="text-text-primary mb-2">
          {title || config.defaultTitle}
        </Typography>
        <Typography
          variant="body-md"
          className="text-text-secondary content-narrow"
        >
          {message || config.defaultMessage}
        </Typography>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {showRetry && (
          <Button
            onClick={handleRetry}
            variant="primary"
            size="sm"
            className="w-full flex items-center justify-center"
            icon={<Icon name="refresh-cw" size="sm" />}
            iconPosition="left"
          >
            Try Again
          </Button>
        )}

        {showHome && (
          <Button
            onClick={handleHome}
            variant="secondary"
            size="sm"
            className="w-full flex items-center justify-center"
            icon={<Icon name="home" size="sm" />}
            iconPosition="left"
          >
            Go Home
          </Button>
        )}

        {actions}
      </div>
    </div>
  );
};

// Pre-configured error state components for common scenarios
export const NetworkErrorState: React.FC<
  Omit<MobileErrorStateProps, "type">
> = (props) => <MobileErrorState {...props} type="network" />;

export const ServerErrorState: React.FC<Omit<MobileErrorStateProps, "type">> = (
  props
) => <MobileErrorState {...props} type="server" />;

export const OfflineErrorState: React.FC<
  Omit<MobileErrorStateProps, "type">
> = (props) => <MobileErrorState {...props} type="offline" />;

export const TimeoutErrorState: React.FC<
  Omit<MobileErrorStateProps, "type">
> = (props) => <MobileErrorState {...props} type="timeout" />;

export default MobileErrorState;
