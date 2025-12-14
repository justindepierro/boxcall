/**
 * Performance Monitoring System
 *
 * Comprehensive Real User Monitoring (RUM) for tracking app performance
 * Measures Core Web Vitals, component performance, and custom metrics
 */

// Core Web Vitals tracking
interface WebVitalsMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  timestamp: number;
  sessionId: string;
}

// Performance regression detection
interface PerformanceBaseline {
  LCP: { p50: number; p75: number; p95: number };
  INP: { p50: number; p75: number; p95: number };
  CLS: { p50: number; p75: number; p95: number };
  FCP: { p50: number; p75: number; p95: number };
  TTFB: { p50: number; p75: number; p95: number };
  lastUpdated: string;
}

// TypeScript definition for Chrome's memory API
interface MemoryInfo {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

interface PerformanceMetrics {
  // Core Web Vitals
  LCP?: WebVitalsMetric; // Largest Contentful Paint
  INP?: WebVitalsMetric; // Interaction to Next Paint (replaced FID)
  CLS?: WebVitalsMetric; // Cumulative Layout Shift
  FCP?: WebVitalsMetric; // First Contentful Paint
  TTFB?: WebVitalsMetric; // Time to First Byte

  // Custom metrics
  navigationTiming?: PerformanceTiming;
  memoryUsage?: MemoryInfo;
  bundleLoadTime?: number;
  routeChangeTime?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];
  private isEnabled: boolean;
  private sessionId: string;
  private baseline: PerformanceBaseline | null = null;

  constructor() {
    this.isEnabled = !import.meta.env.DEV && "performance" in window;
    this.sessionId = this.generateSessionId();

    if (this.isEnabled) {
      this.initializeMonitoring();
      this.loadBaseline();
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async loadBaseline(): Promise<void> {
    // Load baseline from localStorage or fetch from server
    try {
      const stored = localStorage.getItem("performance-baseline");
      if (stored) {
        this.baseline = JSON.parse(stored);
      }
    } catch (error) {
      console.warn("Failed to load performance baseline:", error);
    }
  }

  private initializeMonitoring() {
    // Initialize Web Vitals monitoring
    this.initWebVitals();

    // Initialize navigation timing
    this.trackNavigationTiming();

    // Initialize memory monitoring
    this.trackMemoryUsage();

    // Track performance entries
    this.initPerformanceObserver();
  }

  private initWebVitals() {
    // Dynamic import to avoid blocking bundle
    import("web-vitals")
      .then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
        onCLS((metric) => this.recordMetric("CLS", metric));
        onINP((metric) => this.recordMetric("INP", metric));
        onFCP((metric) => this.recordMetric("FCP", metric));
        onLCP((metric) => this.recordMetric("LCP", metric));
        onTTFB((metric) => this.recordMetric("TTFB", metric));
      })
      .catch(() => {
        // Fallback if web-vitals is not available
        console.warn("Web Vitals monitoring not available");
      });
  }

  private recordMetric(name: string, metric: { value: number }) {
    const rating = this.getRating(name, metric.value);
    const webVitalsMetric: WebVitalsMetric = {
      name,
      value: metric.value,
      rating,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };

    // Store the metric with proper typing
    (this.metrics as Record<string, WebVitalsMetric>)[name] = webVitalsMetric;

    // Report to analytics service
    this.reportMetric(webVitalsMetric);
  }

  private getRating(
    name: string,
    value: number
  ): "good" | "needs-improvement" | "poor" {
    const thresholds: Record<string, [number, number]> = {
      CLS: [0.1, 0.25],
      INP: [200, 500], // Updated from FID
      FCP: [1800, 3000],
      LCP: [2500, 4000],
      TTFB: [800, 1800],
    };

    const [good, poor] = thresholds[name] || [0, 0];

    if (value <= good) return "good";
    if (value <= poor) return "needs-improvement";
    return "poor";
  }

  private trackNavigationTiming() {
    if ("performance" in window && "timing" in performance) {
      window.addEventListener("load", () => {
        setTimeout(() => {
          this.metrics.navigationTiming = performance.timing;
          this.calculateBundleLoadTime();
        }, 0);
      });
    }
  }

  private calculateBundleLoadTime() {
    const timing = performance.timing;
    if (timing) {
      const bundleLoadTime = timing.loadEventEnd - timing.navigationStart;
      this.metrics.bundleLoadTime = bundleLoadTime;

      this.reportMetric({
        name: "bundleLoadTime",
        value: bundleLoadTime,
        rating: (() => {
          if (bundleLoadTime < 3000) return "good";
          if (bundleLoadTime < 5000) return "needs-improvement";
          return "poor";
        })(),
        timestamp: Date.now(),
        sessionId: this.sessionId,
      });
    }
  }

  private trackMemoryUsage() {
    if ("memory" in performance) {
      setInterval(() => {
        this.metrics.memoryUsage = (performance as any).memory;
      }, 30000); // Check every 30 seconds
    }
  }

  private initPerformanceObserver() {
    try {
      // Long Tasks observer
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) {
            this.reportMetric({
              name: "longTask",
              value: entry.duration,
              rating: "poor",
              timestamp: Date.now(),
              sessionId: this.sessionId,
            });
          }
        });
      });
      longTaskObserver.observe({ entryTypes: ["longtask"] });
      this.observers.push(longTaskObserver);

      // Resource timing observer
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const resource = entry as PerformanceResourceTiming;
          if (resource.duration > 1000) {
            // Resources taking > 1s
            this.reportMetric({
              name: "slowResource",
              value: resource.duration,
              rating: "needs-improvement",
              timestamp: Date.now(),
              sessionId: this.sessionId,
            });
          }
        });
      });
      resourceObserver.observe({ entryTypes: ["resource"] });
      this.observers.push(resourceObserver);
    } catch (error) {
      console.warn("Performance Observer not supported:", error);
    }
  }

  // Track route changes
  trackRouteChange(_routeName: string) {
    const startTime = performance.now();

    return () => {
      const routeChangeTime = performance.now() - startTime;
      this.metrics.routeChangeTime = routeChangeTime;

      this.reportMetric({
        name: "routeChange",
        value: routeChangeTime,
        rating: (() => {
          if (routeChangeTime < 200) return "good";
          if (routeChangeTime < 500) return "needs-improvement";
          return "poor";
        })(),
        timestamp: Date.now(),
        sessionId: this.sessionId,
      });
    };
  }

  // Track component render performance
  trackComponentRender(componentName: string) {
    const startTime = performance.now();

    return () => {
      const renderTime = performance.now() - startTime;

      if (import.meta.env.DEV) {
        console.info(`⚡ ${componentName} render: ${renderTime.toFixed(2)}ms`);
      }

      if (renderTime > 16) {
        // Components taking > 1 frame (16ms)
        this.reportMetric({
          name: "componentRender",
          value: renderTime,
          rating: (() => {
            if (renderTime < 16) return "good";
            if (renderTime < 50) return "needs-improvement";
            return "poor";
          })(),
          timestamp: Date.now(),
          sessionId: this.sessionId,
        });
      }
    };
  }

  // Report metrics to analytics service
  private reportMetric(metric: WebVitalsMetric) {
    if (!this.isEnabled) return;

    // In production, send to your analytics service
    if (!import.meta.env.DEV) {
      // Example: Send to Google Analytics, DataDog, etc.
      // gtag('event', metric.name, {
      //   custom_map: { metric_value: 'value' },
      //   value: metric.value,
      //   metric_rating: metric.rating
      // });

      console.info(
        `📊 Performance Metric: ${metric.name} = ${metric.value}ms (${metric.rating})`
      );
    }
  }

  // Get current metrics snapshot
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Cleanup observers
  disconnect() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for component performance tracking
export const useComponentPerformance = (componentName: string) => {
  if (!import.meta.env.DEV) {
    const endTracking = performanceMonitor.trackComponentRender(componentName);

    return () => {
      endTracking();
    };
  }

  return () => {}; // No-op in development
};

// React hook for route performance tracking
export const useRoutePerformance = (routeName: string) => {
  if (!import.meta.env.DEV) {
    const endTracking = performanceMonitor.trackRouteChange(routeName);

    return () => {
      endTracking();
    };
  }

  return () => {}; // No-op in development
};

// Cleanup on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    performanceMonitor.disconnect();
  });
}
