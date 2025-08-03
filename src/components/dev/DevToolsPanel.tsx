import React, { useState, useRef, useEffect } from "react";

interface DevToolsPanelProps {
  onTogglePerformance: () => void;
  onOpenStorybook: () => void;
  onOpenBundleAnalyzer: () => void;
}

export const DevToolsPanel: React.FC<DevToolsPanelProps> = ({
  onTogglePerformance,
  onOpenStorybook,
  onOpenBundleAnalyzer,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".controls")) return; // Don't drag when clicking controls

    setIsDragging(true);
    setIsActive(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
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
      // Keep active state for a bit after dragging
      setTimeout(() => setIsActive(false), 1000);
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

  // Calculate opacity based on state
  const getOpacity = () => {
    if (isActive || isHovered || !isCollapsed) return 0.95; // Very opaque when actively using
    if (isCollapsed) return 0.3; // Very transparent when just sitting there
    return 0.7; // Medium opacity in between
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: "fixed",
          top: position.y,
          left: position.x,
          background: "rgba(59, 130, 246, 0.9)",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          fontSize: "16px",
          cursor: "pointer",
          zIndex: 10000,
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          opacity: isHovered ? 0.9 : 0.3,
          transition: "opacity 0.2s ease-in-out",
        }}
        title="Show Dev Tools (Super Admin Mode)"
      >
        🛠️
      </button>
    );
  }

  return (
    <div
      ref={panelRef}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => {
        setIsHovered(true);
        setIsActive(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setTimeout(() => setIsActive(false), 500);
      }}
      style={{
        position: "fixed",
        top: position.y,
        left: position.x,
        background: `rgba(17, 24, 39, ${getOpacity()})`,
        color: "white",
        padding: "12px",
        borderRadius: "8px",
        fontSize: "12px",
        zIndex: 10000,
        minWidth: "200px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        border: "1px solid rgba(59, 130, 246, 0.3)",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        transition: "opacity 0.3s ease-in-out, background 0.2s ease-in-out",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: isCollapsed ? "0" : "12px",
          paddingBottom: isCollapsed ? "0" : "8px",
          borderBottom: isCollapsed
            ? "none"
            : "1px solid rgba(255,255,255,0.1)",
          cursor: "grab",
        }}
      >
        <span
          style={{
            fontWeight: "bold",
            fontSize: "13px",
            color: "#60a5fa",
          }}
        >
          🛠️ Super Admin Mode
        </span>
        <div className="controls" style={{ display: "flex", gap: "4px" }}>
          <button
            onClick={() => {
              setIsCollapsed(!isCollapsed);
              setIsActive(true);
              setTimeout(() => setIsActive(false), 1000);
            }}
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: "10px",
              padding: "2px 4px",
            }}
            title={isCollapsed ? "Expand Dev Tools" : "Collapse Dev Tools"}
          >
            {isCollapsed ? "▼" : "▲"}
          </button>
          <button
            onClick={() => {
              setIsVisible(false);
              setIsActive(false);
            }}
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: "10px",
              padding: "2px 4px",
            }}
            title="Hide Dev Tools"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Performance Tools */}
          <div>
            <div
              style={{ fontSize: "10px", opacity: 0.7, marginBottom: "4px" }}
            >
              Performance
            </div>
            <button
              onClick={() => {
                onTogglePerformance();
                setIsActive(true);
                setTimeout(() => setIsActive(false), 1000);
              }}
              style={{
                background: "rgba(59, 130, 246, 0.2)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                color: "white",
                padding: "6px 8px",
                borderRadius: "4px",
                fontSize: "11px",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
              }}
            >
              ⚡ Performance Monitor
            </button>
          </div>

          {/* Development Tools */}
          <div>
            <div
              style={{ fontSize: "10px", opacity: 0.7, marginBottom: "4px" }}
            >
              Development
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <button
                onClick={() => {
                  onOpenStorybook();
                  setIsActive(true);
                  setTimeout(() => setIsActive(false), 1000);
                }}
                style={{
                  background: "rgba(34, 197, 94, 0.2)",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  color: "white",
                  padding: "6px 8px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                📚 Storybook
              </button>
              <button
                onClick={() => {
                  onOpenBundleAnalyzer();
                  setIsActive(true);
                  setTimeout(() => setIsActive(false), 1000);
                }}
                style={{
                  background: "rgba(168, 85, 247, 0.2)",
                  border: "1px solid rgba(168, 85, 247, 0.3)",
                  color: "white",
                  padding: "6px 8px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                📦 Bundle Analyzer
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div
              style={{ fontSize: "10px", opacity: 0.7, marginBottom: "4px" }}
            >
              Quick Actions
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <button
                onClick={() => {
                  window.open("/test-web-vitals.html", "_blank");
                  setIsActive(true);
                  setTimeout(() => setIsActive(false), 1000);
                }}
                style={{
                  background: "rgba(245, 158, 11, 0.2)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  color: "white",
                  padding: "6px 8px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                🧪 Web Vitals Test
              </button>
              <button
                onClick={() => {
                  const script = document.createElement("script");
                  script.textContent = `
                    console.log('🚀 Super Admin Debug Info:');
                    console.log('React Version:', React.version);
                    console.log('Environment:', process.env.NODE_ENV);
                    console.log('Performance:', performance.now());
                    console.log('Memory:', performance.memory);
                  `;
                  document.head.appendChild(script);
                  console.log("🛠️ Debug info logged to console");
                  setIsActive(true);
                  setTimeout(() => setIsActive(false), 1000);
                }}
                style={{
                  background: "rgba(239, 68, 68, 0.2)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "white",
                  padding: "6px 8px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                🐛 Debug Console
              </button>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div
            style={{
              fontSize: "9px",
              opacity: 0.5,
              marginTop: "8px",
              paddingTop: "8px",
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Shortcuts: Ctrl+Shift+P (Performance) • Drag to move
          </div>
        </div>
      )}
    </div>
  );
};
