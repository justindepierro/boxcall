import React, { useEffect, useState, useRef } from "react";

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
  const [isVisible, setIsVisible] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const monitorRef = useRef<HTMLDivElement>(null);

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

    collectPerformanceData();
    const interval = setInterval(collectPerformanceData, 1000);
    return () => clearInterval(interval);
  }, []);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".controls")) return; // Don't drag when clicking controls

    setIsDragging(true);
    const rect = monitorRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Keyboard shortcut to toggle visibility
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "P" && e.ctrlKey && e.shiftKey) {
        setIsVisible(!isVisible);
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isVisible]);

  if (!isVisible) {
    // Minimized floating button
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "rgba(0,0,0,0.8)",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          fontSize: "16px",
          cursor: "pointer",
          zIndex: 9999,
        }}
        title="Show Performance Monitor (Ctrl+Shift+P)"
      >
        ⚡
      </button>
    );
  }

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
      ref={monitorRef}
      onMouseDown={handleMouseDown}
      style={{
        position: "fixed",
        top: position.y,
        left: position.x,
        background: "rgba(0,0,0,0.9)",
        color: "white",
        padding: "8px",
        borderRadius: "8px",
        fontSize: "11px",
        zIndex: 9999,
        minWidth: "180px",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* Header with controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: isCollapsed ? "0" : "6px",
          cursor: "grab",
        }}
      >
        <span style={{ fontWeight: "bold", fontSize: "10px" }}>
          ⚡ Performance
        </span>
        <div className="controls" style={{ display: "flex", gap: "4px" }}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: "10px",
              padding: "2px 4px",
            }}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? "▼" : "▲"}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: "10px",
              padding: "2px 4px",
            }}
            title="Hide (Ctrl+Shift+P)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div style={{ fontSize: "10px", lineHeight: "1.3" }}>
          <div>Load: {loadTime}ms</div>
          <div>DOM: {domContentLoaded}ms</div>
          <div>Resources: {perfData.resources.length}</div>
          {perfData.memory && (
            <div>
              Mem: {(perfData.memory.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB
            </div>
          )}
          <div
            style={{
              fontSize: "8px",
              marginTop: "4px",
              opacity: 0.6,
            }}
          >
            Ctrl+Shift+P to toggle
          </div>
        </div>
      )}
    </div>
  );
};
