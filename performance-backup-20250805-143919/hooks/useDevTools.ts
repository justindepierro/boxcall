import { useState, useCallback } from "react";

export const useDevTools = () => {
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(true);
  const [showDevPanel, setShowDevPanel] = useState(true);

  const togglePerformanceMonitor = useCallback(() => {
    setShowPerformanceMonitor((prev) => !prev);
  }, []);

  const openStorybook = useCallback(() => {
    window.open("http://localhost:6006", "_blank");
  }, []);

  const openBundleAnalyzer = useCallback(async () => {
    try {
      // Run bundle analyzer
      const response = await fetch("/api/analyze-bundle");
      if (response.ok) {
        window.open("/bundle-report.html", "_blank");
      } else {
        console.log("Run: npm run analyze");
      }
    } catch (_error) {
      console.log("To analyze bundle, run: npm run analyze");
    }
  }, []);

  const hideAllDevTools = useCallback(() => {
    setShowPerformanceMonitor(false);
    setShowDevPanel(false);
  }, []);

  const showAllDevTools = useCallback(() => {
    setShowPerformanceMonitor(true);
    setShowDevPanel(true);
  }, []);

  return {
    showPerformanceMonitor,
    showDevPanel,
    togglePerformanceMonitor,
    openStorybook,
    openBundleAnalyzer,
    hideAllDevTools,
    showAllDevTools,
    setShowDevPanel,
  };
};
