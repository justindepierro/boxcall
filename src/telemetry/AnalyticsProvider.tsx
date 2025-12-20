/**
 * Analytics Provider Component
 *
 * Provides analytics and error tracking context throughout the application
 */
import { useEffect, useState } from "react";

import { analyticsService } from "../services/analytics/AnalyticsService";
import { errorTracking } from "../services/analytics/ErrorTrackingService";
import { AnalyticsContext } from "./analyticsContext";
import { warn } from "../utils/logger";

interface AnalyticsContextType {
  initialized: boolean;
  error: string | null;
}

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
        await analyticsService.initialize();
        await errorTracking.initialize();

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

        if (config.customProperties) {
          analyticsService.setUserProperties(config.customProperties);
        }

        errorTracking.addBreadcrumb("Analytics services initialized", "init");

        if (mounted) {
          setInitialized(true);
          setError(null);
        }
      } catch (err) {
        warn("Failed to initialize analytics services:", err);
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setInitialized(true);
        }
      }
    }

    initializeServices();

    return () => {
      mounted = false;
    };
  }, [user?.id, user, config.customProperties]);

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
 * Development helper component for debugging analytics
 * Analytics debugging now available in DevPanel (Ctrl+Shift+D)
 */
export function AnalyticsDebugger() {
  return null;
}
