import React, { useState, useRef, useEffect } from "react";
import { useAuthProfile } from "../../app/auth-store";
import { useDevMode } from "../../app/dev-mode-hooks";
import type { DevMode } from "../../app/dev-mode-types";
import { useTheme } from "../../hooks/useTheme";
interface ConsolidatedDevToolsProps {
  onTogglePerformance?: () => void;
  onOpenStorybook?: () => void;
  onOpenBundleAnalyzer?: () => void;
}
interface PerformanceData {
  navigation: PerformanceTiming;
  resources: PerformanceResourceTiming[];
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}
type TabType = "dev-mode" | "performance" | "tools";
export const ConsolidatedDevTools: React.FC<ConsolidatedDevToolsProps> = ({
  onTogglePerformance,
  onOpenStorybook,
  onOpenBundleAnalyzer,
}) => {
  const { devMode, setDevMode, isDevMode } = useDevMode();
  const { toggleTheme } = useTheme();
  const profile = useAuthProfile();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("dev-mode");
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [perfData, setPerfData] = useState<PerformanceData | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Performance data collection
  useEffect(() => {
    if (import.meta.env.PROD) return;
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
    const interval = setInterval(collectPerformanceData, 5000);
    return () => clearInterval(interval);
  }, []);
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        setIsCollapsed(!isCollapsed);
      }
      if (e.metaKey && isDevMode && ["1", "2", "3", "4", "5"].includes(e.key)) {
        e.preventDefault();
        const routes = [
          "/dashboard",
          "/calendar",
          "/team/1",
          "/admin",
          "/super-admin",
        ];
        const routeIndex = parseInt(e.key) - 1;
        const route = routes[routeIndex];
        if (route) {
          window.location.href = route;
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isCollapsed, isDevMode]);
  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".controls")) return;
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
  // Only show in development environment
  if (import.meta.env.PROD) {
    return null;
  }
  const getOpacity = () => {
    if (isActive || isHovered || !isCollapsed) return 0.95;
    if (isCollapsed) return 0.25;
    return 0.65;
  };
  const devModes: Array<{
    mode: DevMode;
    label: string;
    description: string;
    color: string;
  }> = [
    {
      mode: "production",
      label: "Production",
      description: "Normal app behavior",
      color: "bg-gray-100 text-gray-800",
    },
    {
      mode: "super_admin_real",
      label: "Super Admin (Real)",
      description: "Your real team data",
      color: "bg-emerald-100 text-emerald-800",
    },
    {
      mode: "super_admin_mock",
      label: "Super Admin (Mock)",
      description: "Mock Dev Team",
      color: "bg-purple-100 text-purple-800",
    },
    {
      mode: "view_as_head_coach",
      label: "Head Coach",
      description: "Head coach experience",
      color: "bg-green-100 text-green-800",
    },
    {
      mode: "view_as_coach",
      label: "Assistant Coach",
      description: "Assistant coach experience",
      color: "bg-blue-100 text-blue-800",
    },
    {
      mode: "view_as_player",
      label: "Player",
      description: "Player experience",
      color: "bg-orange-100 text-orange-800",
    },
  ];
  // Collapsed floating button
  if (isCollapsed) {
    return (
      <div
        ref={panelRef}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: "fixed",
          top: position.y,
          left: position.x,
          zIndex: 10000,
          opacity: getOpacity(),
          transition: "opacity 0.3s ease-in-out",
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg transition-all duration-200 controls"
          style={{
            width: "48px",
            height: "48px",
            border: "none",
            fontSize: "18px",
          }}
          title="Open Dev Tools (⌘⇧D)"
        >
          🛠️
        </button>
      </div>
    );
  }
  // Expanded panel
  return (
    <div
      ref={panelRef}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "fixed",
        top: position.y,
        left: position.x,
        zIndex: 10000,
        opacity: getOpacity(),
        transition: "opacity 0.3s ease-in-out",
        cursor: isDragging ? "grabbing" : "grab",
        width: "360px",
      }}
      className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-emerald-500 text-white p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🛠️</span>
          <h3 className="font-semibold text-sm">Dev Tools</h3>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="text-white hover:text-gray-200 controls"
          title="Collapse (⌘⇧D)"
        >
          ✕
        </button>
      </div>
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {[
            { id: "dev-mode", label: "Dev Mode", icon: "🎭" },
            { id: "performance", label: "Performance", icon: "⚡" },
            { id: "tools", label: "Tools", icon: "🔧" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center space-x-1 px-3 py-2 text-xs font-medium controls ${
                activeTab === tab.id
                  ? "border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Tab Content */}
      <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
        {activeTab === "dev-mode" && (
          <>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Dev Mode
              </label>
              <select
                value={devMode}
                onChange={(e) => setDevMode(e.target.value as DevMode)}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1 controls"
              >
                {devModes.map(({ mode, label }) => (
                  <option key={mode} value={mode}>
                    {label}
                  </option>
                ))}
              </select>
              {isDevMode && (
                <div className="mt-1 text-xs text-gray-500">
                  Role: {devModes.find((m) => m.mode === devMode)?.description}
                </div>
              )}
            </div>
            {isDevMode && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Quick Nav (⌘1-5)
                </label>
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { key: "1", label: "Dashboard", href: "/dashboard" },
                    { key: "2", label: "Calendar", href: "/calendar" },
                    { key: "3", label: "Team", href: "/team/1" },
                    { key: "4", label: "Admin", href: "/admin" },
                    { key: "5", label: "Super Admin", href: "/super-admin" },
                  ].map(({ key, label, href }) => (
                    <button
                      key={key}
                      onClick={() => (window.location.href = href)}
                      className="px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded text-left controls"
                    >
                      ⌘{key} {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="text-xs text-gray-500 border-t pt-2">
              <div>User: {profile?.full_name || "Unknown"}</div>
              <div>Real Role: {profile?.role || "none"}</div>
              <div>
                Effective Role:{" "}
                {isDevMode
                  ? devModes.find((m) => m.mode === devMode)?.label
                  : profile?.role}
              </div>
            </div>
          </>
        )}
        {activeTab === "performance" && (
          <>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Memory Usage
              </label>
              {perfData?.memory && (
                <div className="space-y-2">
                  <div className="text-xs">
                    <div className="flex justify-between">
                      <span>JS Heap Used:</span>
                      <span className="font-mono">
                        {(perfData.memory.usedJSHeapSize / 1024 / 1024).toFixed(
                          1
                        )}
                        MB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>JS Heap Total:</span>
                      <span className="font-mono">
                        {(
                          perfData.memory.totalJSHeapSize /
                          1024 /
                          1024
                        ).toFixed(1)}
                        MB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Heap Limit:</span>
                      <span className="font-mono">
                        {(
                          perfData.memory.jsHeapSizeLimit /
                          1024 /
                          1024
                        ).toFixed(1)}
                        MB
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (perfData.memory.usedJSHeapSize /
                            perfData.memory.jsHeapSizeLimit) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Load Times
              </label>
              <div className="text-xs space-y-1">
                {perfData?.navigation && (
                  <>
                    <div className="flex justify-between">
                      <span>DOM Ready:</span>
                      <span className="font-mono">
                        {perfData.navigation.domContentLoadedEventEnd -
                          perfData.navigation.navigationStart}
                        ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Load Complete:</span>
                      <span className="font-mono">
                        {perfData.navigation.loadEventEnd -
                          perfData.navigation.navigationStart}
                        ms
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Resources
              </label>
              <div className="text-xs">
                <div className="flex justify-between">
                  <span>Total Resources:</span>
                  <span className="font-mono">
                    {perfData?.resources.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
        {activeTab === "tools" && (
          <>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Quick Actions
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={toggleTheme}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded controls"
                >
                  Toggle Theme
                </button>
                {onTogglePerformance && (
                  <button
                    onClick={onTogglePerformance}
                    className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded controls"
                  >
                    Performance
                  </button>
                )}
                {onOpenStorybook && (
                  <button
                    onClick={onOpenStorybook}
                    className="px-2 py-1 text-xs bg-purple-100 hover:bg-purple-200 rounded controls"
                  >
                    Storybook
                  </button>
                )}
                {onOpenBundleAnalyzer && (
                  <button
                    onClick={onOpenBundleAnalyzer}
                    className="px-2 py-1 text-xs bg-orange-100 hover:bg-orange-200 rounded controls"
                  >
                    Bundle
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Developer Actions
              </label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => window.location.reload()}
                  className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 rounded controls"
                >
                  🔄 Reload Page
                </button>
                <button
                  onClick={() => localStorage.clear()}
                  className="px-2 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 rounded controls"
                >
                  🗑️ Clear LocalStorage
                </button>
                <button
                  onClick={() => console.clear()}
                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded controls"
                >
                  🧹 Clear Console
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
