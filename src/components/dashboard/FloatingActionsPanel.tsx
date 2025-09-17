import React, { useState } from "react";
import { Button } from "../ui";
import { Icon } from "../ui/Icon";
import { DevTools } from "../dev";
import { DashboardCustomizationPanel } from "./DashboardCustomizationPanel";

/**
 * Consolidated Floating Actions Panel
 *
 * Replaces scattered bottom-right elements with a unified interface:
 * - Development tools
 * - Dashboard customization
 * - Collaborative features
 * - Quick settings
 */
export const FloatingActionsPanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);

  return (
    <>
      {/* Main floating action button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex flex-col items-end space-y-3">
          {/* Expanded action buttons */}
          {isExpanded && (
            <div className="flex flex-col space-y-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
              {/* Collaboration button */}
              <Button
                onClick={() => (window.location.href = "/collaborative-demo")}
                className="w-12 h-12 rounded-full bg-blue-600 text-text-on-primary shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                title="Team Collaboration & Planning"
              >
                <Icon name="message" size="sm" />
              </Button>

              {/* Customization button */}
              <Button
                onClick={() => setShowCustomization(true)}
                className="w-12 h-12 rounded-full bg-purple-600 text-text-on-primary shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                title="Dashboard Customization"
              >
                <Icon name="settings" size="sm" />
              </Button>

              {/* Development tools in development mode */}
              {process.env.NODE_ENV === "development" && (
                <div className="w-12 h-12">
                  <DevTools />
                </div>
              )}
            </div>
          )}

          {/* Primary toggle button */}
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center ${
              isExpanded
                ? "bg-red-600 text-white rotate-45"
                : "bg-primary text-text-on-primary"
            }`}
            title={isExpanded ? "Close Actions" : "Quick Actions"}
          >
            <Icon name={isExpanded ? "close" : "plus"} size="lg" />
          </Button>
        </div>
      </div>

      {/* Customization panel */}
      <DashboardCustomizationPanel
        isOpen={showCustomization}
        onClose={() => setShowCustomization(false)}
      />
    </>
  );
};
