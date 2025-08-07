/**
 * Integration examples for Phase 3A Advanced Mobile Polish components
 * Demonstrates how to use the new loading and error handling system
 */
import React, { useState } from "react";
import {
  MobileLoadingStrategy,
  MobilePageLoader,
  MobileContentLoader,
} from "../components/ui/MobileLoadingStrategy";
import {
  MobileErrorState,
  NetworkErrorState,
  OfflineErrorState,
} from "../components/ui/MobileErrorState";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useMobileErrorHandler } from "../hooks/useMobileErrorHandler";
import { useProgressiveLoading } from "../hooks/useProgressiveLoading";

// Example 1: Simple page-level loading
export const SimpleDashboardPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  React.useEffect(() => {
    // Simulate initial load
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  return (
    <MobilePageLoader isLoading={isLoading} error={error} onRetry={handleRetry}>
      <div className="p-4">
        <h1 className="text-2xl font-bold">Dashboard Content</h1>
        <p>Your actual dashboard content goes here...</p>
      </div>
    </MobilePageLoader>
  );
};

// Example 2: Advanced loading with custom configuration
export const AdvancedPlaysList: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { errorState, handleError, clearError } = useMobileErrorHandler();
  const networkStatus = useNetworkStatus();

  const loadPlays = React.useCallback(async () => {
    setIsLoading(true);
    clearError();

    try {
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate network error for demo
          if (!networkStatus.isOnline) {
            reject(new Error("network: Unable to load plays"));
          } else {
            resolve("success");
          }
        }, 1500);
      });
    } catch (error) {
      handleError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [networkStatus.isOnline, handleError, clearError]);

  React.useEffect(() => {
    loadPlays();
  }, [loadPlays]);

  return (
    <MobileLoadingStrategy
      isLoading={isLoading}
      error={errorState ? new Error(errorState.message) : null}
      skeletonType="list"
      showNetworkHints
      minLoadingTime={500}
      maxLoadingTime={10000}
      onRetry={loadPlays}
      onTimeout={() => handleError(new Error("timeout: Request took too long"))}
      className="p-4"
    >
      <div>
        <h2 className="text-xl font-semibold mb-4">Team Plays</h2>
        <div className="space-y-2">
          <div className="p-3 bg-white rounded-lg shadow">Play 1</div>
          <div className="p-3 bg-white rounded-lg shadow">Play 2</div>
          <div className="p-3 bg-white rounded-lg shadow">Play 3</div>
        </div>
      </div>
    </MobileLoadingStrategy>
  );
};

// Example 3: Progressive loading with staggered content
export const ProgressiveDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { isStepVisible } = useProgressiveLoading(4, 300);

  const loadPlays = React.useCallback(async () => {
    // Simulate API call logic
    return Promise.resolve();
  }, []);

  React.useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    loadPlays();
  }, [loadPlays]);

  if (isLoading) {
    return (
      <MobileContentLoader isLoading onRetry={() => window.location.reload()}>
        <div>Loading...</div>
      </MobileContentLoader>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Step 1: Header */}
      <div
        className={`transition-opacity duration-500 ${isStepVisible(0) ? "opacity-100" : "opacity-0"}`}
      >
        <h1 className="text-2xl font-bold">Team Dashboard</h1>
      </div>

      {/* Step 2: Stats */}
      <div
        className={`transition-opacity duration-500 ${isStepVisible(1) ? "opacity-100" : "opacity-0"}`}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-100 rounded-lg">
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-gray-600">Total Plays</div>
          </div>
          <div className="p-4 bg-green-100 rounded-lg">
            <div className="text-2xl font-bold">8</div>
            <div className="text-sm text-gray-600">Active Players</div>
          </div>
        </div>
      </div>

      {/* Step 3: Recent Activity */}
      <div
        className={`transition-opacity duration-500 ${isStepVisible(2) ? "opacity-100" : "opacity-0"}`}
      >
        <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
        <div className="space-y-2">
          <div className="p-3 bg-white rounded-lg shadow">
            Play "Wing Right" updated
          </div>
          <div className="p-3 bg-white rounded-lg shadow">
            Player John added
          </div>
        </div>
      </div>

      {/* Step 4: Quick Actions */}
      <div
        className={`transition-opacity duration-500 ${isStepVisible(3) ? "opacity-100" : "opacity-0"}`}
      >
        <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-2">
          <button className="p-3 bg-team-primary text-white rounded-lg">
            Add Play
          </button>
          <button className="p-3 bg-gray-200 text-gray-900 rounded-lg">
            View Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

// Example 4: Network-aware component
export const NetworkAwareContent: React.FC = () => {
  const networkStatus = useNetworkStatus();

  if (!networkStatus.isOnline) {
    return (
      <OfflineErrorState
        title="You're offline"
        message="Don't worry, your changes will sync when you're back online."
        showRetry={false}
      />
    );
  }

  if (networkStatus.isSlowConnection) {
    return (
      <div className="p-4">
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            🐌 Slow connection detected. Some features may take longer to load.
          </p>
        </div>
        {/* Your content here */}
        <div>Content optimized for slow connections...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-2 text-green-600 text-sm flex items-center">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
        Connected ({networkStatus.effectiveType})
      </div>
      {/* Your normal content here */}
      <div>Full-featured content...</div>
    </div>
  );
};

// Example 5: Error handling patterns
export const ErrorHandlingExample: React.FC = () => {
  const [error, setError] = useState<"network" | "server" | "timeout" | null>(
    null
  );

  const simulateError = (type: "network" | "server" | "timeout") => {
    setError(type);
  };

  const clearError = () => {
    setError(null);
  };

  if (error === "network") {
    return <NetworkErrorState onRetry={clearError} />;
  }

  if (error === "server") {
    return (
      <MobileErrorState
        type="server"
        title="Server is down"
        message="Our servers are temporarily unavailable. Please try again in a few minutes."
        onRetry={clearError}
        showHome
      />
    );
  }

  if (error === "timeout") {
    return (
      <MobileErrorState
        type="timeout"
        title="Request timeout"
        message="This request is taking longer than expected. Please check your connection and try again."
        onRetry={clearError}
      />
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Error Simulation</h2>
      <div className="space-y-2">
        <button
          onClick={() => simulateError("network")}
          className="block w-full p-3 bg-orange-500 text-white rounded-lg"
        >
          Simulate Network Error
        </button>
        <button
          onClick={() => simulateError("server")}
          className="block w-full p-3 bg-red-500 text-white rounded-lg"
        >
          Simulate Server Error
        </button>
        <button
          onClick={() => simulateError("timeout")}
          className="block w-full p-3 bg-yellow-500 text-white rounded-lg"
        >
          Simulate Timeout Error
        </button>
      </div>
    </div>
  );
};
