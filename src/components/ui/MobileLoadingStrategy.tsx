/**
 * Advanced mobile loading strategy component for production-ready loading experiences
 * Part of Phase 3A: Critical Performance & Error Handling
 */
import React, { useState, useEffect } from "react";
import { Icon } from "./Icon/Icon";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { useMobileErrorHandler } from "../../hooks/useMobileErrorHandler";
import {
  DashboardCardSkeleton,
  PlayCardSkeleton,
  ListSkeleton,
  NavigationSkeleton,
  PageLoadingSkeleton,
} from "./Skeleton.tsx";
import { MobileErrorState, OfflineErrorState } from "./MobileErrorState";
import { Typography } from "../design-system/Typography";

interface LoadingStrategyProps {
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Show network-aware loading hints */
  showNetworkHints?: boolean;
  /** Minimum loading time (prevents flash) */
  minLoadingTime?: number;
  /** Maximum loading time before timeout */
  maxLoadingTime?: number;
  /** Loading skeleton type */
  skeletonType?: "dashboard" | "play" | "list" | "page" | "navigation";
  /** Custom skeleton component */
  skeleton?: React.ReactNode;
  /** Success content */
  children?: React.ReactNode;
  /** Retry handler */
  onRetry?: () => void;
  /** Loading complete handler */
  onLoadingComplete?: () => void;
  /** Timeout handler */
  onTimeout?: () => void;
  /** Custom className */
  className?: string;
}

export const MobileLoadingStrategy: React.FC<LoadingStrategyProps> = ({
  isLoading = false,
  error = null,
  showNetworkHints = true,
  minLoadingTime = 500,
  maxLoadingTime = 15000,
  skeletonType = "page",
  skeleton,
  children,
  onRetry,
  onLoadingComplete,
  onTimeout,
  className = "",
}) => {
  const [hasMinTimeElapsed, setHasMinTimeElapsed] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const networkStatus = useNetworkStatus();
  const { errorState, handleError, clearError } = useMobileErrorHandler();

  // Handle minimum loading time to prevent flash
  useEffect(() => {
    if (isLoading) {
      setHasMinTimeElapsed(false);
      setHasTimedOut(false);

      const minTimer = setTimeout(() => {
        setHasMinTimeElapsed(true);
      }, minLoadingTime);

      const maxTimer = setTimeout(() => {
        setHasTimedOut(true);
        if (onTimeout) {
          onTimeout();
        }
      }, maxLoadingTime);

      return () => {
        clearTimeout(minTimer);
        clearTimeout(maxTimer);
      };
    } else if (hasMinTimeElapsed && onLoadingComplete) {
      onLoadingComplete();
    }
  }, [
    isLoading,
    minLoadingTime,
    maxLoadingTime,
    hasMinTimeElapsed,
    onLoadingComplete,
    onTimeout,
  ]);

  // Handle errors
  useEffect(() => {
    if (error) {
      handleError(error);
    } else {
      clearError();
    }
  }, [error, handleError, clearError]);

  const handleRetry = () => {
    clearError();
    setHasTimedOut(false);
    if (onRetry) {
      onRetry();
    }
  };

  const renderSkeleton = () => {
    if (skeleton) {
      return skeleton;
    }

    switch (skeletonType) {
      case "dashboard":
        return <DashboardCardSkeleton />;
      case "play":
        return <PlayCardSkeleton />;
      case "list":
        return <ListSkeleton />;
      case "navigation":
        return <NavigationSkeleton />;
      case "page":
      default:
        return <PageLoadingSkeleton />;
    }
  };

  const renderNetworkHint = () => {
    if (!showNetworkHints || !isLoading) return null;

    if (!networkStatus.isOnline) {
      return (
        <div className="mt-4 p-3 surface-subtle border border-subtle rounded-lg">
          <Typography
            variant="body-sm"
            className="text-text-warning text-center"
          >
            <Icon
              name="wifi-off"
              className="inline h-4 w-4 align-middle text-text-warning"
            />{" "}
            You're offline. Content will sync when connection returns.
          </Typography>
        </div>
      );
    }

    if (networkStatus.isSlowConnection) {
      return (
        <div className="mt-4 p-3 surface-subtle border border-subtle rounded-lg">
          <Typography variant="body-sm" className="text-text-info text-center">
            <Icon
              name="clock"
              className="inline h-4 w-4 align-middle text-text-info"
            />{" "}
            Slow connection detected. This might take a moment...
          </Typography>
        </div>
      );
    }

    return null;
  };

  const renderTimeoutState = () => (
    <MobileErrorState
      type="timeout"
      title="This is taking too long"
      message="The request is taking longer than expected. This might be due to a slow connection or server issues."
      onRetry={handleRetry}
      showHome
      className={className}
    />
  );

  // If offline, show offline state
  if (!networkStatus.isOnline && !isLoading) {
    return (
      <OfflineErrorState
        title="You're offline"
        message="Your plays and data will sync automatically when you're back online."
        showRetry={false}
        className={className}
      />
    );
  }

  // If there's an error or error state, show error component
  if (error || errorState) {
    return (
      <MobileErrorState
        type={errorState?.type || "generic"}
        title={errorState?.title}
        message={errorState?.message || error?.message}
        onRetry={handleRetry}
        showHome
        className={className}
      />
    );
  }

  // If loading has timed out, show timeout state
  if (hasTimedOut && isLoading) {
    return renderTimeoutState();
  }

  // If still loading and min time hasn't elapsed, show skeleton
  if (isLoading && !hasMinTimeElapsed) {
    return (
      <div className={`${className}`}>
        {renderSkeleton()}
        {renderNetworkHint()}
      </div>
    );
  }

  // If loading but min time has elapsed, continue showing skeleton until complete
  if (isLoading && hasMinTimeElapsed) {
    return (
      <div className={`${className}`}>
        {renderSkeleton()}
        {renderNetworkHint()}
      </div>
    );
  }

  // Show success content
  return <>{children}</>;
};

// Wrapper component for common loading patterns
export const MobilePageLoader: React.FC<{
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  children: React.ReactNode;
}> = ({ isLoading, error, onRetry, children }) => (
  <MobileLoadingStrategy
    isLoading={isLoading}
    error={error}
    onRetry={onRetry}
    skeletonType="page"
    showNetworkHints
    className="min-h-screen"
  >
    {children}
  </MobileLoadingStrategy>
);

export const MobileContentLoader: React.FC<{
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  type?: "dashboard" | "play" | "list";
  children: React.ReactNode;
}> = ({ isLoading, error, onRetry, type = "dashboard", children }) => (
  <MobileLoadingStrategy
    isLoading={isLoading}
    error={error}
    onRetry={onRetry}
    skeletonType={type}
    showNetworkHints={false}
    minLoadingTime={200}
    maxLoadingTime={10000}
  >
    {children}
  </MobileLoadingStrategy>
);

export default MobileLoadingStrategy;
