import React, { useEffect, useState } from "react";

interface PerformanceData {
  navigation: PerformanceTiming;
  resources: PerformanceResourceTiming[];
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

export const PerformanceMonitor: React.FC = () => {
  const [perfData, setPerfData] = useState<PerformanceData | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const collectPerformanceData = () => {
      const navigation = performance.timing;
      const resources = performance.getEntriesByType(
        "resource"
      ) as PerformanceResourceTiming[];
      const memory = (
        performance as unknown as {
          memory?: {
            usedJSHeapSize: number;
            totalJSHeapSize: number;
            jsHeapSizeLimit: number;
          };
        }
      ).memory;

      setPerfData({ navigation, resources, memory });
    };

    // Collect initial data
    collectPerformanceData();

    // Update every 5 seconds
    const interval = setInterval(collectPerformanceData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!perfData || process.env.NODE_ENV !== "development") {
    return null;
  }

  const loadTime =
    perfData.navigation.loadEventEnd - perfData.navigation.navigationStart;
  const domContentLoaded =
    perfData.navigation.domContentLoadedEventEnd -
    perfData.navigation.navigationStart;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "12px",
        borderRadius: "8px",
        fontSize: "12px",
        zIndex: 9999,
        minWidth: "200px",
      }}
    >
      <h4 style={{ margin: "0 0 8px 0" }}>⚡ Performance</h4>
      <div>Load Time: {loadTime}ms</div>
      <div>DOM Ready: {domContentLoaded}ms</div>
      <div>Resources: {perfData.resources.length}</div>
      {perfData.memory && (
        <div>
          Memory: {(perfData.memory.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB
        </div>
      )}
    </div>
  );
};
