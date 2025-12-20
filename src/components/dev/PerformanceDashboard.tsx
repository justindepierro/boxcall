/**
 * Performance Dashboard Component for Dev Panel
 *
 * Displays real-time performance metrics within the developer tools panel
 */

import React, { useState, useEffect } from "react";
import { debug } from "../../utils/logger";
import { getVitalsSnapshot } from "../../telemetry/initWebVitals";

interface PerformanceMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  unit: string;
}

// TypeScript definition for Chrome's memory API
interface MemoryInfo {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

function getWebVitalsRating(
  name: "CLS" | "LCP" | "INP" | "FCP" | "TTFB",
  value: number
): "good" | "needs-improvement" | "poor" {
  const thresholds: Record<string, [number, number]> = {
    CLS: [0.1, 0.25],
    INP: [200, 500],
    FCP: [1800, 3000],
    LCP: [2500, 4000],
    TTFB: [800, 1800],
  };

  const [good, poor] = thresholds[name] ?? [0, 0];
  if (value <= good) return "good";
  if (value <= poor) return "needs-improvement";
  return "poor";
}

function getBundleLoadTimeMs(): number | null {
  if (typeof window === "undefined" || !window.performance) return null;
  const navigation = window.performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  if (!navigation) return null;
  const loadTime = navigation.loadEventEnd - navigation.fetchStart;
  return Number.isFinite(loadTime) && loadTime >= 0 ? loadTime : null;
}

function getMemoryUsage(): MemoryInfo | null {
  if (typeof window === "undefined" || !window.performance) return null;
  const perf = window.performance as any;
  return perf.memory ? (perf.memory as MemoryInfo) : null;
}

export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const updateMetrics = () => {
    const vitals = getVitalsSnapshot();
    const formattedMetrics: PerformanceMetric[] = [];

    // Format Core Web Vitals
    if (vitals.LCP) {
      formattedMetrics.push({
        name: "LCP (Largest Contentful Paint)",
        value: vitals.LCP.value,
        rating: getWebVitalsRating("LCP", vitals.LCP.value),
        unit: "ms",
      });
    }

    if (vitals.INP) {
      formattedMetrics.push({
        name: "INP (Interaction to Next Paint)",
        value: vitals.INP.value,
        rating: getWebVitalsRating("INP", vitals.INP.value),
        unit: "ms",
      });
    }

    if (vitals.CLS) {
      formattedMetrics.push({
        name: "CLS (Cumulative Layout Shift)",
        value: vitals.CLS.value,
        rating: getWebVitalsRating("CLS", vitals.CLS.value),
        unit: "",
      });
    }

    if (vitals.FCP) {
      formattedMetrics.push({
        name: "FCP (First Contentful Paint)",
        value: vitals.FCP.value,
        rating: getWebVitalsRating("FCP", vitals.FCP.value),
        unit: "ms",
      });
    }

    if (vitals.TTFB) {
      formattedMetrics.push({
        name: "TTFB (Time to First Byte)",
        value: vitals.TTFB.value,
        rating: getWebVitalsRating("TTFB", vitals.TTFB.value),
        unit: "ms",
      });
    }

    const bundleLoadTime = getBundleLoadTimeMs();
    if (bundleLoadTime !== null) {
      formattedMetrics.push({
        name: "Bundle Load Time",
        value: bundleLoadTime,
        rating: bundleLoadTime < 3000 ? "good" : "needs-improvement",
        unit: "ms",
      });
    }

    // Memory usage
    const memoryUsage = getMemoryUsage();
    if (memoryUsage) {
      const memoryMB = memoryUsage.usedJSHeapSize / (1024 * 1024);
      formattedMetrics.push({
        name: "Memory Usage",
        value: memoryMB,
        rating: (() => {
          if (memoryMB < 50) return "good";
          if (memoryMB < 100) return "needs-improvement";
          return "poor";
        })(),
        unit: "MB",
      });
    }

    setMetrics(formattedMetrics);
  };

  useEffect(() => {
    // Update immediately and then every 5 seconds
    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    updateMetrics();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleLogMetrics = () => {
    debug("📊 Web Vitals Snapshot", getVitalsSnapshot());
    debug("📦 Bundle Load Time (ms)", getBundleLoadTimeMs());
    debug("🧠 Memory Usage", getMemoryUsage());
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "good":
        return "text-success-600 bg-success-bg border-success-200";
      case "needs-improvement":
        return "text-warning-600 bg-warning-bg border-warning-200";
      case "poor":
        return "text-error-600 bg-error-bg border-error-200";
      default:
        return "text-secondary bg-secondary border";
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === "ms") {
      return value < 1000
        ? `${Math.round(value)}ms`
        : `${(value / 1000).toFixed(2)}s`;
    }
    if (unit === "MB") {
      return `${value.toFixed(1)}MB`;
    }
    return value.toFixed(3);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary">
          Real User Monitoring (RUM)
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1 bg-secondary rounded-lg text-sm hover:bg-surface-hover disabled:opacity-50 transition-colors"
          >
            {isRefreshing ? "↻" : "🔄"} Refresh
          </button>
          <button
            onClick={handleLogMetrics}
            className="px-3 py-1 bg-secondary rounded-lg text-sm hover:bg-surface-hover transition-colors"
          >
            📋 Log to Console
          </button>
        </div>
      </div>

      {metrics.length === 0 ? (
        <div className="text-center py-8 text-secondary">
          <div className="text-4xl mb-2">📊</div>
          <p>Performance metrics are being collected...</p>
          <p className="text-xs mt-1">
            Try navigating around the app to generate data
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {metrics.map((metric) => (
            <div
              key={metric.name}
              className="flex items-center justify-between p-3 rounded-lg border bg-primary"
            >
              <div>
                <div className="font-medium text-primary text-sm">
                  {metric.name}
                </div>
                <div className="text-xs text-secondary mt-1">
                  Core Web Vitals • Real User Metrics
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-mono border ${getRatingColor(metric.rating)}`}
              >
                {formatValue(metric.value, metric.unit)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-muted pt-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-primary">
            Performance Guide
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success-500 rounded-full"></div>
            <span className="text-secondary">Good</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
            <span className="text-secondary">Needs Improvement</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-error-500 rounded-full"></div>
            <span className="text-secondary">Poor</span>
          </div>
        </div>
        <div className="mt-3 text-xs text-tertiary">
          Performance metrics are collected automatically and update every 5
          seconds.
        </div>
      </div>
    </div>
  );
};
