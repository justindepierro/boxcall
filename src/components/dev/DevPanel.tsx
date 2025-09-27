/**
 * Unified Developer Tools Panel
 *
 * A comprehensive dev tools panel with tabs for different debugging and development features.
 * Only accessible to authorized developers (justindepierro@gmail.com).
 */

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../app/auth-store";
import { useDesignSystem } from "../design-system/design-system-hooks";

interface DevPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "design-system" | "performance" | "console" | "debug" | "settings";

const DevPanel: React.FC<DevPanelProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { config, getPerformanceMetrics, updateConfig } = useDesignSystem();
  const [activeTab, setActiveTab] = useState<TabType>("design-system");
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 600, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Only show for authorized user
  const isAuthorized = user?.email === "justindepierro@gmail.com";

  // Mouse event handlers for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Resize handlers
  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleResizeMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = Math.max(400, size.width + (e.clientX - dragStart.x));
      const newHeight = Math.max(300, size.height + (e.clientY - dragStart.y));
      setSize({ width: newWidth, height: newHeight });
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [isResizing, size, dragStart]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleResizeMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleResizeMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, handleResizeMouseMove, handleMouseUp]);

  if (!isOpen || !isAuthorized) return null;

  const metrics = getPerformanceMetrics();

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "design-system", label: "Design System", icon: "🎨" },
    { id: "performance", label: "Performance", icon: "📊" },
    { id: "console", label: "Console", icon: "💻" },
    { id: "debug", label: "Debug", icon: "🔧" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div
      className="fixed z-[9999] bg-black/50 backdrop-blur-sm"
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      onClick={onClose}
    >
      <div
        className="bg-surface-card border border-subtle rounded-lg shadow-2xl overflow-hidden"
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height,
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="bg-surface-secondary px-4 py-3 border-b border-subtle flex items-center justify-between cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <h2 className="text-lg font-semibold text-text-primary">
            🛠️ Developer Tools
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary p-1"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-subtle">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-surface-info text-text-info border-b-2 border-text-info"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === "design-system" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">Design System</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Theme:</strong> {config.theme}
                </div>
                <div>
                  <strong>Density:</strong> {config.density}
                </div>
                <div>
                  <strong>Motion:</strong> {config.motion}
                </div>
                <div>
                  <strong>Glassmorphism:</strong> {config.glassmorphism ? "✅" : "❌"}
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-medium mb-2">Quick Actions</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateConfig({ theme: config.theme === "dark" ? "light" : "dark" })}
                    className="px-3 py-1 bg-surface-secondary rounded text-sm hover:bg-surface-hover"
                  >
                    Toggle Theme
                  </button>
                  <button
                    onClick={() => updateConfig({ density: config.density === "compact" ? "comfortable" : "compact" })}
                    className="px-3 py-1 bg-surface-secondary rounded text-sm hover:bg-surface-hover"
                  >
                    Toggle Density
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "performance" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">Performance Metrics</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Load Time:</strong> {metrics.loadTime.toFixed(0)}ms
                </div>
                <div>
                  <strong>LCP:</strong> {metrics.lcp.toFixed(0)}ms
                </div>
                <div>
                  <strong>FID:</strong> {metrics.fid.toFixed(2)}ms
                </div>
                <div>
                  <strong>CLS:</strong> {metrics.cls.toFixed(4)}
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => console.table(metrics)}
                  className="px-3 py-1 bg-surface-secondary rounded text-sm hover:bg-surface-hover"
                >
                  Log to Console
                </button>
              </div>
            </div>
          )}

          {activeTab === "console" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">Console Tools</h3>
              <div className="space-y-2">
                <button
                  onClick={() => console.clear()}
                  className="w-full px-3 py-2 bg-surface-secondary rounded text-sm hover:bg-surface-hover text-left"
                >
                  🧹 Clear Console
                </button>
                <button
                  onClick={() => console.log("Current user:", user)}
                  className="w-full px-3 py-2 bg-surface-secondary rounded text-sm hover:bg-surface-hover text-left"
                >
                  👤 Log Current User
                </button>
                <button
                  onClick={() => console.log("Design system config:", config)}
                  className="w-full px-3 py-2 bg-surface-secondary rounded text-sm hover:bg-surface-hover text-left"
                >
                  🎨 Log Design Config
                </button>
              </div>
            </div>
          )}

          {activeTab === "debug" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">Debug Tools</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Contrast Debug Overlay</span>
                  <button
                    onClick={() => {
                      const current = localStorage.getItem("debugContrast");
                      localStorage.setItem("debugContrast", current ? "" : "true");
                      window.location.reload();
                    }}
                    className="px-3 py-1 bg-surface-secondary rounded text-sm hover:bg-surface-hover"
                  >
                    Toggle
                  </button>
                </div>
                <button
                  onClick={() => {
                    // Force re-render diagnostics
                    window.location.reload();
                  }}
                  className="w-full px-3 py-2 bg-surface-secondary rounded text-sm hover:bg-surface-hover text-left"
                >
                  🔄 Force Reload
                </button>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">Dev Settings</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>User:</strong> {user?.email}
                </div>
                <div>
                  <strong>Environment:</strong> {process.env.NODE_ENV}
                </div>
                <div>
                  <strong>Hotkey:</strong> Ctrl+Shift+D
                </div>
                <div className="mt-4 pt-4 border-t border-subtle">
                  <p className="text-xs text-text-secondary">
                    This panel is only visible to authorized developers.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resize handle */}
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={handleResizeMouseDown}
        >
          <div className="w-full h-full bg-text-secondary opacity-50 hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
};

export default DevPanel;