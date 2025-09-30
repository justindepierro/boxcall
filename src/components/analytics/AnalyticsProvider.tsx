/**
 * Analytics Provider Component
 *
 * Provides analytics and error tracking context throughout the application
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { analyticsService } from "../../services/analytics/AnalyticsService";
import { errorTracking } from "../../services/analytics/ErrorTrackingService";

interface AnalyticsContextType {
  initialized: boolean;
  error: string | null;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  initialized: false,
  error: null,
});

export const useAnalyticsContext = () => useContext(AnalyticsContext);

interface AnalyticsProviderProps {
  children: React.ReactNode;
  /**
   * User information for analytics and error tracking
   */
  user?: {
    id: string;
    email?: string;
    role?: string;
    [key: string]: any;
  } | null;
  /**
   * Additional configuration options
   */
  config?: {
    enableInDevelopment?: boolean;
    customProperties?: Record<string, any>;
  };
}

export function AnalyticsProvider({
  children,
  user,
  config = {},
}: AnalyticsProviderProps) {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initializeServices() {
      try {
        // Initialize analytics service
        await analyticsService.initialize();

        // Initialize error tracking service
        await errorTracking.initialize();

        // Set user context if provided
        if (user) {
          analyticsService.identifyUser(user.id, {
            email: user.email,
            role: user.role,
            ...user,
          });

          errorTracking.setUser({
            id: user.id,
            email: user.email,
            role: user.role,
          });
        }

        // Set global properties
        if (config.customProperties) {
          analyticsService.setUserProperties(config.customProperties);
        }

        // Add initial breadcrumb
        errorTracking.addBreadcrumb("Analytics services initialized", "init");

        if (mounted) {
          setInitialized(true);
          setError(null);
        }
      } catch (err) {
        console.warn("Failed to initialize analytics services:", err);
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setInitialized(true); // Still mark as initialized to prevent retries
        }
      }
    }

    initializeServices();

    return () => {
      mounted = false;
    };
  }, [user?.id, config.customProperties]);

  // Update user context when user changes
  useEffect(() => {
    if (!initialized) return;

    if (user) {
      analyticsService.identifyUser(user.id, {
        email: user.email,
        role: user.role,
        ...user,
      });

      errorTracking.setUser({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      errorTracking.addBreadcrumb("User context updated", "user", {
        userId: user.id,
        role: user.role,
      });
    } else {
      analyticsService.reset();
      errorTracking.setUser(undefined);
      errorTracking.addBreadcrumb("User context cleared", "user");
    }
  }, [user, initialized]);

  const contextValue: AnalyticsContextType = {
    initialized,
    error,
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

/**
 * HOC for automatic analytics initialization
 */
export function withAnalyticsProvider<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    enableInDevelopment?: boolean;
    customProperties?: Record<string, any>;
  }
) {
  return function WrappedComponent(props: P) {
    return (
      <AnalyticsProvider config={options}>
        <Component {...props} />
      </AnalyticsProvider>
    );
  };
}

/**
 * Development helper component for debugging analytics
 */
export function AnalyticsDebugger() {
  const { initialized, error } = useAnalyticsContext();
  const [showDebug, setShowDebug] = useState(false);
  const [devErrors, setDevErrors] = useState<any[]>([]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      // Update development errors periodically
      const interval = setInterval(() => {
        setDevErrors(errorTracking.getDevelopmentErrors());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, []);

  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className={`px-3 py-1 rounded text-sm font-mono transition-colors ${
          initialized
            ? error
              ? "bg-yellow-500 text-white"
              : "bg-green-500 text-white"
            : "bg-gray-500 text-white"
        }`}
        title={
          error
            ? `Analytics Error: ${error}`
            : initialized
              ? "Analytics Initialized"
              : "Analytics Initializing..."
        }
      >
        📊 {error ? "⚠️" : initialized ? "✅" : "⏳"}
      </button>

      {showDebug && (
        <div className="absolute bottom-10 right-0 w-96 max-h-96 overflow-auto bg-white border border-gray-300 rounded shadow-lg">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-sm">Analytics Debug</h3>
            <div className="text-xs text-gray-600 mt-1">
              Status:{" "}
              {initialized
                ? error
                  ? `Error: ${error}`
                  : "Initialized"
                : "Initializing..."}
            </div>
          </div>

          <div className="p-3">
            <div className="mb-3">
              <h4 className="font-medium text-sm mb-1">
                Recent Errors ({devErrors.length})
              </h4>
              {devErrors.length === 0 ? (
                <div className="text-xs text-gray-500">No errors recorded</div>
              ) : (
                <div className="space-y-1 max-h-32 overflow-auto">
                  {devErrors.slice(-5).map((errorRecord, index) => (
                    <div
                      key={index}
                      className="text-xs p-2 bg-red-50 border border-red-200 rounded"
                    >
                      <div className="font-medium text-red-800">
                        {errorRecord.error.message}
                      </div>
                      <div className="text-red-600 mt-1">
                        {new Date(errorRecord.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  analyticsService.trackEvent("debug_test_event", {
                    timestamp: Date.now(),
                    source: "debug_panel",
                  });
                }}
                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                Test Event
              </button>
              <button
                onClick={() => {
                  errorTracking.captureMessage("Debug test message", {
                    level: "info",
                    extra: { source: "debug_panel" },
                  });
                }}
                className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
              >
                Test Message
              </button>
              <button
                onClick={() => {
                  errorTracking.clearDevelopmentErrors();
                  setDevErrors([]);
                }}
                className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
