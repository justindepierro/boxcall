/**
 * Analytics Provider Component
 *
 * Provides analytics and error tracking context throughout the application
 */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
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
  }, [user?.id, user, config.customProperties]);

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
 * Analytics debugging now available in DevPanel (Ctrl+Shift+D)
 */
export function AnalyticsDebugger() {
  // Analytics info now in DevPanel instead of floating button
  return null;
}
