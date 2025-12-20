/**
 * Unified Developer Tools Panel
 *
 * A comprehensive dev tools panel with tabs for different debugging and development features.
 * Only accessible to authorized developers (configured via env).
 */

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../app/auth-store";
import { useApp } from "../core/useApp";
import { PerformanceDashboard } from "./PerformanceDashboard";
import { isSuperAdminEmail } from "../../config/superAdmin";
import { AuthMonitorTab } from "./dev-panel/tabs/AuthMonitorTab";
import { ConsoleTab } from "./dev-panel/tabs/ConsoleTab";
import { DebugTab } from "./dev-panel/tabs/DebugTab";
import { DesignSystemTab } from "./dev-panel/tabs/DesignSystemTab";
import { SettingsTab } from "./dev-panel/tabs/SettingsTab";

interface DevPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType =
  | "design-system"
  | "performance"
  | "auth"
  | "console"
  | "debug"
  | "settings";

const DevPanel: React.FC<DevPanelProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { designConfig: config, updateDesignConfig: updateConfig } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>("design-system");
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 600, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Only show for authorized user
  const isAuthorized = isSuperAdminEmail(user?.email ?? null);

  // Mouse event handlers for dragging
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      }
    },
    [position]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart]
  );

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

  const handleResizeMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = Math.max(400, size.width + (e.clientX - dragStart.x));
        const newHeight = Math.max(
          300,
          size.height + (e.clientY - dragStart.y)
        );
        setSize({ width: newWidth, height: newHeight });
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    },
    [isResizing, size, dragStart]
  );

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

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "design-system", label: "Design System", icon: "🎨" },
    { id: "performance", label: "Performance", icon: "📊" },
    { id: "auth", label: "Auth Monitor", icon: "🔐" },
    { id: "console", label: "Console", icon: "💻" },
    { id: "debug", label: "Debug", icon: "🔧" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div
      className="fixed z-[9999] bg-white dark:bg-navy-800 border border-neutral-200 dark:border-navy-600 rounded-lg shadow-2xl overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      {/* Header */}
      <div
        className="bg-secondary/90 px-md py-sm border-b border-muted flex items-center justify-between cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <h2 className="text-lg font-semibold text-primary">
          🛠️ Developer Tools
        </h2>
        <button
          onClick={onClose}
          className="text-secondary hover:text-primary p-xs"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-muted">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-md py-xs text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-info/20 text-info border-b-2 border-text-info"
                : "text-secondary hover:text-primary hover:bg-surface-hover"
            }`}
          >
            <span className="mr-xs">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-md">
        {activeTab === "design-system" && (
          <DesignSystemTab
            config={config as any}
            updateConfig={updateConfig as any}
          />
        )}

        {activeTab === "auth" && <AuthMonitorTab />}

        {activeTab === "performance" && (
          <div className="p-md">
            <PerformanceDashboard />
          </div>
        )}

        {activeTab === "console" && <ConsoleTab user={user} config={config} />}

        {activeTab === "debug" && (
          <DebugTab
            onToggleContrastDebug={() => {
              void import("../../dev/contrastDebug").then((mod) => {
                mod.toggleContrastDebug();
              });
            }}
          />
        )}

        {activeTab === "settings" && (
          <SettingsTab userEmail={user?.email} mode={import.meta.env.MODE} />
        )}
      </div>

      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={handleResizeMouseDown}
      >
        {/* Resize handle */}
        <div className="w-full h-full bg-text-secondary opacity-50 hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};

export default DevPanel;
