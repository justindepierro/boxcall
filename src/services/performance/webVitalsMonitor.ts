/**
 * Web Vitals Performance Monitoring
 *
 * Tracks Core Web Vitals and custom performance metrics:
 * - LCP (Largest Contentful Paint) - Loading performance
 * - FID (First Input Delay) - Interactivity
 * - CLS (Cumulative Layout Shift) - Visual stability
 * - FCP (First Contentful Paint) - Initial render
 * - TTFB (Time to First Byte) - Server response
 *
 * Also tracks custom metrics:
 * - API response times
 * - Component render times
 * - Database query performance
 */

import { onCLS, onLCP, onFCP, onTTFB, onINP, type Metric } from "web-vitals";
import React from "react";

// Performance thresholds (milliseconds)
// Note: INP (Interaction to Next Paint) replaces FID in web-vitals v4
const THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  INP: { good: 200, needsImprovement: 500 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 },
} as const;

interface PerformanceMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  timestamp: number;
}

class WebVitalsMonitor {
  private metrics: PerformanceMetric[] = [];
  private apiMetrics: Map<string, number[]> = new Map();
  private customMarks: Map<string, number> = new Map();

  constructor() {
    if (typeof window !== "undefined") {
      this.initWebVitals();
    }
  }

  /**
   * Initialize Web Vitals tracking
   */
  private initWebVitals(): void {
    onLCP(this.handleMetric.bind(this, "LCP"));
    onINP(this.handleMetric.bind(this, "INP")); // Replaces FID in web-vitals v4
    onCLS(this.handleMetric.bind(this, "CLS"));
    onFCP(this.handleMetric.bind(this, "FCP"));
    onTTFB(this.handleMetric.bind(this, "TTFB"));
  }

  /**
   * Handle Web Vitals metric callback
   */
  private handleMetric(name: string, metric: Metric): void {
    const rating = this.getRating(name, metric.value);
    const perfMetric: PerformanceMetric = {
      name,
      value: metric.value,
      rating,
      timestamp: Date.now(),
    };

    this.metrics.push(perfMetric);

    // Log to console in development
    if (import.meta.env.DEV) {
      const icon =
        rating === "good" ? "✅" : rating === "needs-improvement" ? "⚠️" : "❌";
      console.log(
        `${icon} ${name}: ${metric.value.toFixed(2)}${name === "CLS" ? "" : "ms"} (${rating})`
      );
    }

    // Send to analytics in production
    if (import.meta.env.PROD) {
      this.sendToAnalytics(perfMetric);
    }
  }

  /**
   * Determine rating based on thresholds
   */
  private getRating(
    name: string,
    value: number
  ): "good" | "needs-improvement" | "poor" {
    const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
    if (!threshold) return "good";

    if (value <= threshold.good) return "good";
    if (value <= threshold.needsImprovement) return "needs-improvement";
    return "poor";
  }

  /**
   * Track API call performance
   */
  trackAPICall(endpoint: string, duration: number): void {
    const metrics = this.apiMetrics.get(endpoint) || [];
    metrics.push(duration);
    this.apiMetrics.set(endpoint, metrics);

    // Log slow API calls (>2s)
    if (duration > 2000 && import.meta.env.DEV) {
      console.warn(`🐌 Slow API call: ${endpoint} took ${duration}ms`);
    }
  }

  /**
   * Start a custom performance mark
   */
  startMark(name: string): void {
    this.customMarks.set(name, performance.now());
  }

  /**
   * End a custom performance mark and return duration
   */
  endMark(name: string): number | null {
    const startTime = this.customMarks.get(name);
    if (!startTime) return null;

    const duration = performance.now() - startTime;
    this.customMarks.delete(name);

    if (import.meta.env.DEV) {
      console.log(`⏱️  ${name}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * Track component render time
   */
  trackRender(componentName: string, duration: number): void {
    if (duration > 50 && import.meta.env.DEV) {
      console.warn(
        `🐌 Slow render: ${componentName} took ${duration.toFixed(2)}ms`
      );
    }
  }

  /**
   * Get API metrics summary
   */
  getAPIMetrics(): Record<string, { count: number; avg: number; max: number }> {
    const summary: Record<string, { count: number; avg: number; max: number }> =
      {};

    this.apiMetrics.forEach((durations, endpoint) => {
      const count = durations.length;
      const avg = durations.reduce((a, b) => a + b, 0) / count;
      const max = Math.max(...durations);
      summary[endpoint] = { count, avg, max };
    });

    return summary;
  }

  /**
   * Get all Web Vitals metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get performance summary
   */
  getSummary(): {
    webVitals: PerformanceMetric[];
    apiMetrics: Record<string, { count: number; avg: number; max: number }>;
    rating: "good" | "needs-improvement" | "poor";
  } {
    const goodCount = this.metrics.filter((m) => m.rating === "good").length;
    const totalCount = this.metrics.length;
    const goodPercentage = totalCount > 0 ? goodCount / totalCount : 1;

    let overallRating: "good" | "needs-improvement" | "poor";
    if (goodPercentage >= 0.75) overallRating = "good";
    else if (goodPercentage >= 0.5) overallRating = "needs-improvement";
    else overallRating = "poor";

    return {
      webVitals: this.getMetrics(),
      apiMetrics: this.getAPIMetrics(),
      rating: overallRating,
    };
  }

  /**
   * Send metrics to analytics service
   * Replace with your analytics provider (e.g., Google Analytics, Mixpanel)
   */
  private sendToAnalytics(metric: PerformanceMetric): void {
    // Example: Send to Google Analytics
    if (typeof window !== "undefined" && "gtag" in window) {
      const gtag = (window as any).gtag;
      if (gtag) {
        gtag("event", metric.name, {
          event_category: "Web Vitals",
          event_label: metric.rating,
          value: Math.round(metric.value),
          non_interaction: true,
        });
      }
    }

    // Example: Send to custom analytics endpoint
    if (import.meta.env.VITE_ANALYTICS_ENDPOINT) {
      fetch(import.meta.env.VITE_ANALYTICS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "web-vitals",
          metric: metric.name,
          value: metric.value,
          rating: metric.rating,
          timestamp: metric.timestamp,
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      }).catch((err) => {
        // Silently fail - don't disrupt user experience
        if (import.meta.env.DEV) {
          console.error("Failed to send analytics:", err);
        }
      });
    }
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.apiMetrics.clear();
    this.customMarks.clear();
  }
}

// Singleton instance
export const webVitalsMonitor = new WebVitalsMonitor();

// Expose to window for debugging
if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as any).__webVitalsMonitor = webVitalsMonitor;
}

/**
 * React Hook for tracking component render performance
 */
export function usePerformanceMonitor(componentName: string) {
  const startTime = performance.now();

  return () => {
    const duration = performance.now() - startTime;
    webVitalsMonitor.trackRender(componentName, duration);
  };
}

/**
 * HOC for tracking component render performance
 *
 * @example
 * const TrackedComponent = withPerformanceMonitoring(MyComponent, 'MyComponent');
 */
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> {
  const TrackedComponent = (props: P) => {
    const trackRender = usePerformanceMonitor(componentName);

    React.useEffect(() => {
      trackRender();
    });

    return React.createElement(WrappedComponent, props);
  };

  TrackedComponent.displayName = `WithPerformanceMonitoring(${componentName})`;
  return TrackedComponent;
}
