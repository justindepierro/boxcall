/**
 * Simple Dev Tools - Clean, working dev tools
 */

import React, { useState, useEffect } from "react";
import type { DevMode } from "../../types/dev";
import { DEV_MODE_CONFIGS } from "../../app/dev-mode-types";
import { useDevMode } from "../../app/dev-mode-hooks";
import { systemMonitor } from "./system-monitor";
import { devActions } from "./dev-actions";

export const SimpleDevTools: React.FC = () => {
  const { devMode, setDevMode } = useDevMode();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-show briefly on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);

      // Auto-hide after 3 seconds
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);

      return () => clearTimeout(hideTimer);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Don't show in production
  if (import.meta.env.PROD) return null;

  const handleModeSwitch = async (newMode: DevMode) => {
    setIsLoading(true);
    await devActions.switchMode(newMode);
    setDevMode(newMode);
    setIsLoading(false);
  };

  const currentConfig = DEV_MODE_CONFIGS[devMode];

  if (!isVisible) {
    return (
      <div
        className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 cursor-pointer"
        onMouseEnter={() => setIsVisible(true)}
        style={{
          transform: "translate(-50%, 80%)",
        }}
      >
        <div className="bg-slate-900 text-white px-4 py-2 rounded-t-lg text-sm">
          Dev: {currentConfig.label}
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50 transition-all duration-300"
      onMouseLeave={() => !isExpanded && setIsVisible(false)}
    >
      <div className="w-80 bg-slate-900 text-white shadow-xl rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full bg-${currentConfig.color}-500`}
            />
            <span className="font-medium text-sm">{currentConfig.label}</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            {isExpanded ? "▼" : "▲"}
          </button>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-3 space-y-3">
            {/* Mode Switcher */}
            <div>
              <div className="text-xs text-slate-400 mb-2">Switch Mode:</div>
              <div className="space-y-1">
                {Object.entries(DEV_MODE_CONFIGS).map(([mode, config]) => (
                  <button
                    key={mode}
                    onClick={() => handleModeSwitch(mode as DevMode)}
                    disabled={isLoading || devMode === mode}
                    className={`w-full text-left p-2 rounded text-xs transition-colors ${
                      devMode === mode
                        ? "bg-slate-700 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full bg-${config.color}-500`}
                      />
                      <span className="font-medium">{config.label}</span>
                    </div>
                    <div className="text-slate-400 text-xs mt-1">
                      {config.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div>
              <div className="text-xs text-slate-400 mb-2">Quick Actions:</div>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={async () => {
                    setIsLoading(true);
                    await systemMonitor.testDatabaseConnection();
                    setIsLoading(false);
                  }}
                  disabled={isLoading}
                  className="px-3 py-2 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded transition-colors"
                >
                  Test DB
                </button>
                <button
                  onClick={async () => {
                    setIsLoading(true);
                    await devActions.exportDebugInfo();
                    setIsLoading(false);
                  }}
                  disabled={isLoading}
                  className="px-3 py-2 text-xs bg-green-600 hover:bg-green-700 disabled:bg-slate-600 rounded transition-colors"
                >
                  Export
                </button>
                <button
                  onClick={async () => {
                    setIsLoading(true);
                    await devActions.clearTestData();
                    setIsLoading(false);
                  }}
                  disabled={isLoading}
                  className="px-3 py-2 text-xs bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-600 rounded transition-colors"
                >
                  Clear Test
                </button>
                <button
                  onClick={async () => {
                    setIsLoading(true);
                    await devActions.resetToProduction();
                    setIsLoading(false);
                  }}
                  disabled={isLoading}
                  className="px-3 py-2 text-xs bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 rounded transition-colors"
                >
                  Production
                </button>
              </div>
            </div>

            {/* Status */}
            <div>
              <div className="text-xs text-slate-400 mb-1">System Status:</div>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Mode:</span>
                  <span className="font-mono">{devMode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Environment:</span>
                  <span className="font-mono">
                    {import.meta.env.DEV ? "development" : "production"}
                  </span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setIsExpanded(false);
                setIsVisible(false);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-700 hover:bg-slate-600 rounded transition-colors"
            >
              Close Dev Tools
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
