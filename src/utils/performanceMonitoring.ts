/**
 * Advanced Performance Monitoring System
 * Part of Phase 3D: Final Mobile Polish & Performance Optimization
 */

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory: PerformanceMemory;
}

interface WindowWithGtag extends Window {
  gtag?: (
    command: string,
    action: string,
    parameters: Record<string, unknown>
  ) => void;
}

interface WindowWithPerformanceMonitor extends Window {
  performanceMonitor?: {
    getMetrics: () => Record<string, number>;
    getScore: () => number;
    checkLeaks: () => Record<string, unknown>;
  };
}

// Core Web Vitals monitoring
class WebVitalsMonitor {
  private static instance: WebVitalsMonitor;
  private metrics: Map<string, number> = new Map();
  private observers: PerformanceObserver[] = [];

  static getInstance(): WebVitalsMonitor {
    if (!WebVitalsMonitor.instance) {
      WebVitalsMonitor.instance = new WebVitalsMonitor();
    }
    return WebVitalsMonitor.instance;
  }

  /** Initialize performance monitoring */
  init() {
    this.measureLCP();
    this.measureFID();
    this.measureCLS();
    this.measureFCP();
    this.measureTTFB();
    this.measureCustomMetrics();
  }

  /** Measure Largest Contentful Paint */
  private measureLCP() {
    if (!("PerformanceObserver" in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
        renderTime: number;
        loadTime: number;
      };

      const lcp = lastEntry.renderTime || lastEntry.loadTime;
      this.metrics.set("LCP", lcp);
      this.reportMetric("LCP", lcp);
    });

    try {
      observer.observe({ type: "largest-contentful-paint", buffered: true });
      this.observers.push(observer);
    } catch (_error) {
// console.warn("LCP measurement not supported");
    }
  }

  /** Measure First Input Delay */
  private measureFID() {
    if (!("PerformanceObserver" in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const fidEntry = entry as PerformanceEntry & {
          processingStart: number;
        };
        if ("processingStart" in fidEntry) {
          const fid = fidEntry.processingStart - fidEntry.startTime;
          this.metrics.set("FID", fid);
          this.reportMetric("FID", fid);
        }
      });
    });

    try {
      observer.observe({ type: "first-input", buffered: true });
      this.observers.push(observer);
    } catch (_error) {
// console.warn("FID measurement not supported");
    }
  }

  /** Measure Cumulative Layout Shift */
  private measureCLS() {
    if (!("PerformanceObserver" in window)) return;

    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const clsEntry = entry as PerformanceEntry & {
          value: number;
          hadRecentInput: boolean;
        };
        if ("value" in clsEntry && "hadRecentInput" in clsEntry) {
          if (!clsEntry.hadRecentInput) {
            clsValue += clsEntry.value;
          }
        }
      });

      this.metrics.set("CLS", clsValue);
      this.reportMetric("CLS", clsValue);
    });

    try {
      observer.observe({ type: "layout-shift", buffered: true });
      this.observers.push(observer);
    } catch (_error) {
// console.warn("CLS measurement not supported");
    }
  }

  /** Measure First Contentful Paint */
  private measureFCP() {
    if (!("PerformanceObserver" in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(
        (entry) => entry.name === "first-contentful-paint"
      );

      if (fcpEntry) {
        this.metrics.set("FCP", fcpEntry.startTime);
        this.reportMetric("FCP", fcpEntry.startTime);
      }
    });

    try {
      observer.observe({ type: "paint", buffered: true });
      this.observers.push(observer);
    } catch (_error) {
// console.warn("FCP measurement not supported");
    }
  }

  /** Measure Time to First Byte */
  private measureTTFB() {
    const navigationEntry = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;

    if (navigationEntry) {
      const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      this.metrics.set("TTFB", ttfb);
      this.reportMetric("TTFB", ttfb);
    }
  }

  /** Measure custom BoxCall-specific metrics */
  private measureCustomMetrics() {
    // Time to Interactive for our app
    this.measureTimeToInteractive();

    // Bundle size tracking
    this.measureBundleSize();

    // Memory usage tracking
    this.measureMemoryUsage();

    // Touch response time
    this.measureTouchResponseTime();
  }

  /** Measure Time to Interactive for BoxCall */
  private measureTimeToInteractive() {
    const checkInteractive = () => {
      // Check if main navigation is rendered and interactive
      const mainNav = document.querySelector('[data-testid="main-navigation"]');
      const playsList = document.querySelector('[data-testid="plays-list"]');

      if (mainNav && playsList) {
        const tti = performance.now();
        this.metrics.set("TTI", tti);
        this.reportMetric("TTI", tti);
        return;
      }

      // Check again in 100ms if not ready
      if (performance.now() < 10000) {
        // Give up after 10 seconds
        setTimeout(checkInteractive, 100);
      }
    };

    setTimeout(checkInteractive, 0);
  }

  /** Measure bundle size impact */
  private measureBundleSize() {
    // Measure initial bundle size
    const resources = performance.getEntriesByType(
      "resource"
    ) as PerformanceResourceTiming[];
    let totalSize = 0;
    let jsSize = 0;
    let cssSize = 0;

    resources.forEach((resource) => {
      if (resource.transferSize) {
        totalSize += resource.transferSize;

        if (resource.name.includes(".js")) {
          jsSize += resource.transferSize;
        } else if (resource.name.includes(".css")) {
          cssSize += resource.transferSize;
        }
      }
    });

    this.metrics.set("BundleSize", totalSize);
    this.metrics.set("JSSize", jsSize);
    this.metrics.set("CSSSize", cssSize);

    this.reportMetric("BundleSize", totalSize);
    this.reportMetric("JSSize", jsSize);
    this.reportMetric("CSSSize", cssSize);
  }

  /** Measure memory usage */
  private measureMemoryUsage() {
    if ("memory" in performance) {
      const memory = (performance as PerformanceWithMemory).memory;
      const usedMemory = memory.usedJSHeapSize;
      const totalMemory = memory.totalJSHeapSize;
      const memoryLimit = memory.jsHeapSizeLimit;

      this.metrics.set("MemoryUsed", usedMemory);
      this.metrics.set("MemoryTotal", totalMemory);
      this.metrics.set("MemoryLimit", memoryLimit);

      this.reportMetric("MemoryUsed", usedMemory);

      // Start continuous monitoring
      this.startMemoryMonitoring();
    }
  }

  /** Start continuous memory monitoring */
  private startMemoryMonitoring() {
    const monitorMemory = () => {
      if ("memory" in performance) {
        const memory = (performance as PerformanceWithMemory).memory;
        const usedMemory = memory.usedJSHeapSize;
        const currentUsed = this.metrics.get("MemoryUsed") || 0;

        // Update peak memory usage
        if (usedMemory > currentUsed) {
          this.metrics.set("MemoryPeak", usedMemory);

          // Alert if memory usage is high
          if (usedMemory > 150 * 1024 * 1024) {
            // 150MB
// console.warn(
              "High memory usage detected:",
              usedMemory / 1024 / 1024,
              "MB"
            );
          }
        }

        this.metrics.set("MemoryUsed", usedMemory);
      }
    };

    // Monitor every 5 seconds
    setInterval(monitorMemory, 5000);
  }

  /** Measure touch response time */
  private measureTouchResponseTime() {
    let touchStartTime = 0;

    document.addEventListener(
      "touchstart",
      (_event) => {
        touchStartTime = performance.now();
      },
      { passive: true }
    );

    document.addEventListener(
      "touchend",
      (_event) => {
        if (touchStartTime > 0) {
          const responseTime = performance.now() - touchStartTime;

          // Track average touch response time
          const currentAvg = this.metrics.get("TouchResponseTime") || 0;
          const newAvg =
            currentAvg === 0 ? responseTime : (currentAvg + responseTime) / 2;

          this.metrics.set("TouchResponseTime", newAvg);

          if (responseTime > 100) {
            // Alert on slow responses
// console.warn("Slow touch response:", responseTime, "ms");
          }

          touchStartTime = 0;
        }
      },
      { passive: true }
    );
  }

  /** Report metric to analytics/monitoring service */
  private reportMetric(name: string, value: number) {
    // Development logging
    if (process.env.NODE_ENV === "development") {
// console.info(
        `📊 ${name}:`,
        Math.round(value * 100) / 100,
        this.getMetricUnit(name)
      );
    }

    // In production, send to analytics service
    if (process.env.NODE_ENV === "production") {
      // Send to analytics service (Google Analytics, DataDog, etc.)
      this.sendToAnalytics(name, value);
    }

    // Check against performance targets
    this.checkPerformanceTarget(name, value);
  }

  /** Send metrics to analytics service */
  private sendToAnalytics(name: string, value: number) {
    // Example: Google Analytics 4 custom event
    const windowWithGtag = window as WindowWithGtag;
    if (typeof windowWithGtag.gtag !== "undefined") {
      windowWithGtag.gtag("event", "performance_metric", {
        metric_name: name,
        metric_value: value,
        custom_parameter: true,
      });
    }

    // Example: Custom analytics endpoint
    fetch("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        value,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {
      // Silently fail for analytics
    });
  }

  /** Check if metric meets performance targets */
  private checkPerformanceTarget(name: string, value: number) {
    const targets: Record<string, number> = {
      LCP: 2500, // 2.5s
      FID: 100, // 100ms
      CLS: 0.1, // 0.1
      FCP: 1800, // 1.8s
      TTFB: 600, // 600ms
      TTI: 3000, // 3s
      TouchResponseTime: 100, // 100ms
      MemoryPeak: 150 * 1024 * 1024, // 150MB
    };

    const target = targets[name];
    if (target && value > target) {
// console.warn(
        `⚠️ Performance target missed for ${name}:`,
        value,
        ">",
        target
      );

      // In production, alert monitoring system
      if (process.env.NODE_ENV === "production") {
        this.alertPerformanceIssue(name, value, target);
      }
    }
  }

  /** Alert monitoring system of performance issues */
  private alertPerformanceIssue(name: string, value: number, target: number) {
    // Send alert to monitoring service (Sentry, DataDog, etc.)
// console.error("Performance threshold exceeded:", {
      metric: name,
      value,
      target,
      timestamp: new Date().toISOString(),
    });
  }

  /** Get the appropriate unit for a metric */
  private getMetricUnit(name: string): string {
    const units: Record<string, string> = {
      LCP: "ms",
      FID: "ms",
      CLS: "",
      FCP: "ms",
      TTFB: "ms",
      TTI: "ms",
      TouchResponseTime: "ms",
      BundleSize: "bytes",
      JSSize: "bytes",
      CSSSize: "bytes",
      MemoryUsed: "bytes",
      MemoryPeak: "bytes",
    };

    return units[name] || "";
  }

  /** Get current metrics snapshot */
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  /** Get performance score based on Core Web Vitals */
  getPerformanceScore(): number {
    const lcp = this.metrics.get("LCP") || 0;
    const fid = this.metrics.get("FID") || 0;
    const cls = this.metrics.get("CLS") || 0;

    let score = 100;

    // LCP scoring (40% weight)
    if (lcp > 4000) score -= 40;
    else if (lcp > 2500) score -= 20;

    // FID scoring (30% weight)
    if (fid > 300) score -= 30;
    else if (fid > 100) score -= 15;

    // CLS scoring (30% weight)
    if (cls > 0.25) score -= 30;
    else if (cls > 0.1) score -= 15;

    return Math.max(0, score);
  }

  /** Clean up observers */
  cleanup() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

// Memory leak detection
class MemoryLeakDetector {
  private static instance: MemoryLeakDetector;
  private componentCounts: Map<string, number> = new Map();
  private eventListenerCounts: Map<string, Set<EventListener>> = new Map();
  private intervalIds: Set<number> = new Set();
  private timeoutIds: Set<number> = new Set();

  static getInstance(): MemoryLeakDetector {
    if (!MemoryLeakDetector.instance) {
      MemoryLeakDetector.instance = new MemoryLeakDetector();
    }
    return MemoryLeakDetector.instance;
  }

  /** Track component mount */
  trackComponentMount(componentName: string) {
    const current = this.componentCounts.get(componentName) || 0;
    this.componentCounts.set(componentName, current + 1);
  }

  /** Track component unmount */
  trackComponentUnmount(componentName: string) {
    const current = this.componentCounts.get(componentName) || 0;
    if (current > 0) {
      this.componentCounts.set(componentName, current - 1);
    }
  }

  /** Track event listener addition */
  trackEventListener(event: string, listener: EventListener) {
    if (!this.eventListenerCounts.has(event)) {
      this.eventListenerCounts.set(event, new Set());
    }
    this.eventListenerCounts.get(event)!.add(listener);
  }

  /** Track event listener removal */
  trackEventListenerRemoval(event: string, listener: EventListener) {
    const listeners = this.eventListenerCounts.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /** Track interval creation */
  trackInterval(id: number) {
    this.intervalIds.add(id);
  }

  /** Track interval clearance */
  trackIntervalClear(id: number) {
    this.intervalIds.delete(id);
  }

  /** Track timeout creation */
  trackTimeout(id: number) {
    this.timeoutIds.add(id);
  }

  /** Track timeout clearance */
  trackTimeoutClear(id: number) {
    this.timeoutIds.delete(id);
  }

  /** Check for potential memory leaks */
  checkForLeaks(): {
    components: Record<string, number>;
    eventListeners: Record<string, number>;
    intervals: number;
    timeouts: number;
    hasLeaks: boolean;
  } {
    const componentLeaks: Record<string, number> = {};
    const eventListenerLeaks: Record<string, number> = {};

    // Check component counts
    this.componentCounts.forEach((count, name) => {
      if (count > 10) {
        // Alert if more than 10 instances of same component
        componentLeaks[name] = count;
      }
    });

    // Check event listener counts
    this.eventListenerCounts.forEach((listeners, event) => {
      if (listeners.size > 50) {
        // Alert if more than 50 listeners for same event
        eventListenerLeaks[event] = listeners.size;
      }
    });

    const hasLeaks =
      Object.keys(componentLeaks).length > 0 ||
      Object.keys(eventListenerLeaks).length > 0 ||
      this.intervalIds.size > 20 ||
      this.timeoutIds.size > 100;

    if (hasLeaks) {
// console.warn("🚨 Potential memory leaks detected:", {
        components: componentLeaks,
        eventListeners: eventListenerLeaks,
        intervals: this.intervalIds.size,
        timeouts: this.timeoutIds.size,
      });
    }

    return {
      components: Object.fromEntries(this.componentCounts),
      eventListeners: eventListenerLeaks,
      intervals: this.intervalIds.size,
      timeouts: this.timeoutIds.size,
      hasLeaks,
    };
  }

  /** Start automatic leak detection */
  startMonitoring() {
    setInterval(() => {
      this.checkForLeaks();
    }, 30000); // Check every 30 seconds
  }
}

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  const webVitalsMonitor = WebVitalsMonitor.getInstance();
  const memoryLeakDetector = MemoryLeakDetector.getInstance();

  webVitalsMonitor.init();
  memoryLeakDetector.startMonitoring();

  // Export to window for debugging
  if (process.env.NODE_ENV === "development") {
    const windowWithMonitor = window as WindowWithPerformanceMonitor;
    windowWithMonitor.performanceMonitor = {
      getMetrics: () => webVitalsMonitor.getMetrics(),
      getScore: () => webVitalsMonitor.getPerformanceScore(),
      checkLeaks: () => memoryLeakDetector.checkForLeaks(),
    };
  }
};

export { WebVitalsMonitor, MemoryLeakDetector };
