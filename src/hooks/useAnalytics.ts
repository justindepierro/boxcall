/**
 * Analytics and Error Tracking Hooks
 *
 * React hooks for seamless integration of analytics and error tracking
 */

import React, { useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { analyticsService } from "../services/analytics/AnalyticsService";
import { errorTracking } from "../services/analytics/ErrorTrackingService";

// Analytics Hook
export function useAnalytics() {
  const location = useLocation();
  const pageViewTracked = useRef(false);

  // Track page views automatically
  useEffect(() => {
    if (!pageViewTracked.current) {
      analyticsService.trackPageView(location.pathname);
      pageViewTracked.current = true;
    }

    return () => {
      pageViewTracked.current = false;
    };
  }, [location.pathname]);

  const trackEvent = useCallback(
    (eventName: string, properties?: Record<string, any>) => {
      analyticsService.trackEvent(eventName, {
        ...properties,
        page: location.pathname,
      });
    },
    [location.pathname]
  );

  const trackUserAction = useCallback(
    (action: string, target?: string, properties?: Record<string, any>) => {
      analyticsService.trackEvent("user_action", {
        action,
        target,
        ...properties,
        page: location.pathname,
      });
    },
    [location.pathname]
  );

  const trackError = useCallback(
    (error: Error, context?: Record<string, any>) => {
      errorTracking.captureError(error, {
        extra: {
          ...context,
          page: location.pathname,
        },
        tags: {
          source: "user_interaction",
        },
      });
    },
    [location.pathname]
  );

  const trackTiming = useCallback(
    (name: string, startTime: number, properties?: Record<string, any>) => {
      const duration = performance.now() - startTime;
      analyticsService.trackEvent("timing", {
        name,
        duration,
        ...properties,
        page: location.pathname,
      });
    },
    [location.pathname]
  );

  const trackConversion = useCallback(
    (goal: string, value?: number, properties?: Record<string, any>) => {
      analyticsService.trackEvent("conversion", {
        goal,
        value,
        ...properties,
        page: location.pathname,
      });
    },
    [location.pathname]
  );

  return {
    trackEvent,
    trackUserAction,
    trackError,
    trackTiming,
    trackConversion,
  };
}

// Error Tracking Hook
export function useErrorTracking() {
  const location = useLocation();

  const captureError = useCallback(
    (error: Error, context?: Record<string, any>) => {
      errorTracking.captureError(error, {
        extra: {
          ...context,
          page: location.pathname,
        },
      });
    },
    [location.pathname]
  );

  const captureMessage = useCallback(
    (
      message: string,
      level: "info" | "warning" | "error" = "info",
      context?: Record<string, any>
    ) => {
      errorTracking.captureMessage(message, {
        level,
        extra: {
          ...context,
          page: location.pathname,
        },
      });
    },
    [location.pathname]
  );

  const captureApiError = useCallback(
    (error: Error, endpoint: string, method: string, statusCode?: number) => {
      errorTracking.captureApiError(error, endpoint, method, statusCode);
    },
    []
  );

  const captureUserAction = useCallback(
    (error: Error, action: string, component?: string) => {
      errorTracking.captureUserAction(error, action, component);
    },
    []
  );

  const addBreadcrumb = useCallback(
    (message: string, category?: string, data?: Record<string, any>) => {
      errorTracking.addBreadcrumb(message, category, {
        ...data,
        page: location.pathname,
      });
    },
    [location.pathname]
  );

  return {
    captureError,
    captureMessage,
    captureApiError,
    captureUserAction,
    addBreadcrumb,
  };
}

// Performance Monitoring Hook
export function usePerformanceMonitoring() {
  const trackLoadTime = useCallback((label: string, startTime?: number) => {
    const endTime = performance.now();
    const loadTime = startTime ? endTime - startTime : endTime;

    analyticsService.trackEvent("performance", {
      metric: "load_time",
      label,
      value: loadTime,
      unit: "ms",
    });

    errorTracking.recordPerformanceMetric({
      name: `load_time_${label}`,
      value: loadTime,
      unit: "ms",
    });
  }, []);

  const trackRenderTime = useCallback(
    (componentName: string, renderTime: number) => {
      analyticsService.trackEvent("performance", {
        metric: "render_time",
        component: componentName,
        value: renderTime,
        unit: "ms",
      });

      errorTracking.recordPerformanceMetric({
        name: `render_time_${componentName}`,
        value: renderTime,
        unit: "ms",
        tags: { component: componentName },
      });
    },
    []
  );

  const trackApiCall = useCallback(
    (
      endpoint: string,
      method: string,
      duration: number,
      statusCode: number
    ) => {
      analyticsService.trackEvent("api_call", {
        endpoint,
        method,
        duration,
        status_code: statusCode,
      });

      if (duration > 2000) {
        // Flag slow API calls
        errorTracking.capturePerformanceIssue(
          `Slow API call: ${method} ${endpoint}`,
          "api_response_time",
          duration
        );
      }
    },
    []
  );

  const measureComponentRender = useCallback(
    <T extends React.ComponentType<any>>(
      Component: T,
      componentName?: string
    ): T => {
      const WrappedComponent = (props: React.ComponentProps<T>) => {
        const renderStart = useRef<number>(0);
        const name =
          componentName || Component.displayName || Component.name || "Unknown";

        useEffect(() => {
          renderStart.current = performance.now();
        });

        useEffect(() => {
          if (renderStart.current) {
            const renderTime = performance.now() - renderStart.current;
            trackRenderTime(name, renderTime);
          }
        });

        return React.createElement(Component, props);
      };

      WrappedComponent.displayName = `withPerformanceMonitoring(${componentName || Component.displayName || Component.name})`;
      return WrappedComponent as T;
    },
    [trackRenderTime]
  );

  return {
    trackLoadTime,
    trackRenderTime,
    trackApiCall,
    measureComponentRender,
  };
}

// User Identification Hook
export function useUserTracking() {
  const { trackEvent } = useAnalytics();

  const identifyUser = useCallback(
    (userId: string, properties?: Record<string, any>) => {
      analyticsService.identifyUser(userId, properties);
      errorTracking.setUser({
        id: userId,
        ...properties,
      });

      trackEvent("user_identified", { userId, ...properties });
    },
    [trackEvent]
  );

  const updateUserProperties = useCallback(
    (properties: Record<string, any>) => {
      analyticsService.setUserProperties(properties);
      trackEvent("user_properties_updated", properties);
    },
    [trackEvent]
  );

  const trackUserEvent = useCallback(
    (eventName: string, properties?: Record<string, any>) => {
      trackEvent(`user_${eventName}`, properties);
    },
    [trackEvent]
  );

  const clearUser = useCallback(() => {
    analyticsService.reset();
    errorTracking.setUser(undefined);
    trackEvent("user_logged_out");
  }, [trackEvent]);

  return {
    identifyUser,
    updateUserProperties,
    trackUserEvent,
    clearUser,
  };
}

// Feature Flag Integration Hook
export function useFeatureTracking() {
  const { trackEvent } = useAnalytics();

  const trackFeatureUsage = useCallback(
    (featureName: string, properties?: Record<string, any>) => {
      trackEvent("feature_used", {
        feature: featureName,
        ...properties,
      });
    },
    [trackEvent]
  );

  const trackFeatureFlag = useCallback(
    (flagName: string, variant: string, properties?: Record<string, any>) => {
      trackEvent("feature_flag_evaluated", {
        flag: flagName,
        variant,
        ...properties,
      });
    },
    [trackEvent]
  );

  const trackExperiment = useCallback(
    (
      experimentName: string,
      variant: string,
      properties?: Record<string, any>
    ) => {
      trackEvent("experiment_exposure", {
        experiment: experimentName,
        variant,
        ...properties,
      });
    },
    [trackEvent]
  );

  return {
    trackFeatureUsage,
    trackFeatureFlag,
    trackExperiment,
  };
}

// Component-level tracking HOC
export function withAnalytics<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = (props: P) => {
    const { trackEvent } = useAnalytics();
    const name =
      componentName || Component.displayName || Component.name || "Unknown";

    useEffect(() => {
      trackEvent("component_mounted", { component: name });

      return () => {
        trackEvent("component_unmounted", { component: name });
      };
    }, [trackEvent, name]);

    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withAnalytics(${componentName || Component.displayName || Component.name})`;
  return WrappedComponent;
}
