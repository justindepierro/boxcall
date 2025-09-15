import React, { useState } from "react";
import { Button } from "../ui";
import { Icon } from "../ui/Icon/Icon";
import { Typography } from "../design-system/Typography";
import { DashboardCustomizationPanel } from "./DashboardCustomizationPanel";

/**
 * Unified Settings & Tools Panel
 *
 * Clean, organized interface that consolidates all scattered UI elements:
 * - User dashboard customization
 * - Development tools (dev mode only)
 * - Collaboration features
 * - System settings
 * - Quick actions
 *
 * Replaces multiple scattered floating elements with one organized panel.
 */

import type { IconName } from "../ui/Icon";

interface ToolCategory {
  id: string;
  label: string;
  icon: IconName;
  items: ToolItem[];
  devOnly?: boolean;
}

interface ToolItem {
  id: string;
  label: string;
  icon: IconName;
  action: () => void;
  description?: string;
  devOnly?: boolean;
}

export const UnifiedSettingsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);

  const isDev = process.env.NODE_ENV === "development";

  const toolCategories: ToolCategory[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "grid",
      items: [
        {
          id: "customize",
          label: "Customize Layout",
          icon: "settings",
          action: () => setShowCustomization(true),
          description: "Personalize your dashboard layout and widgets",
        },
        {
          id: "reset",
          label: "Reset Layout",
          icon: "refresh-cw",
          action: () => {
            // Add reset logic
            console.info("Reset dashboard layout");
          },
          description: "Reset dashboard to default layout",
        },
      ],
    },
    {
      id: "collaboration",
      label: "Team Tools",
      icon: "users",
      items: [
        {
          id: "team-demo",
          label: "Team Collaboration",
          icon: "message",
          action: () => (window.location.href = "/collaborative-demo"),
          description: "Access team collaboration features",
        },
        {
          id: "sharing",
          label: "Share Dashboard",
          icon: "link",
          action: () => {
            // Add sharing logic
            console.info("Share dashboard");
          },
          description: "Share your dashboard with team members",
        },
      ],
    },
    {
      id: "development",
      label: "Dev Tools",
      icon: "activity",
      devOnly: true,
      items: [
        {
          id: "dev-panel",
          label: "Development Panel",
          icon: "activity",
          action: () => setShowDevTools(true),
          description: "Access development tools and debugging",
          devOnly: true,
        },
        {
          id: "logs",
          label: "View Logs",
          icon: "list",
          action: () => {
            // Add logs logic
            console.info("View system logs");
          },
          description: "View application logs and debug info",
          devOnly: true,
        },
      ],
    },
  ];

  const filteredCategories = isDev
    ? toolCategories
    : toolCategories.filter((cat) => !cat.devOnly);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };

  return (
    <>
      {/* Main floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        {isOpen && (
          <div className="absolute bottom-16 right-0 w-80 bg-surface-card rounded-lg shadow-xl border border-subtle animate-in slide-in-from-bottom-2 fade-in duration-200">
            <div className="p-4 border-b border-subtle">
              <Typography
                variant="headline-sm"
                className="flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Icon name="settings" size="sm" />
                  Settings & Tools
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-1"
                >
                  <Icon name="close" size="sm" />
                </Button>
              </Typography>
            </div>

            <div className="p-2 max-h-96 overflow-y-auto">
              {filteredCategories.map((category) => (
                <div key={category.id} className="mb-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-3 h-auto"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Icon name={category.icon} size="sm" />
                      <span className="flex-1 text-left">{category.label}</span>
                      <Icon
                        name={
                          activeCategory === category.id
                            ? "chevron-up"
                            : "chevron-down"
                        }
                        size="xs"
                      />
                    </div>
                  </Button>

                  {activeCategory === category.id && (
                    <div className="ml-4 mt-2 space-y-1 animate-in slide-in-from-top-1 fade-in duration-150">
                      {category.items
                        .filter((item) => isDev || !item.devOnly)
                        .map((item) => (
                          <div key={item.id}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start p-2 h-auto"
                              onClick={() => {
                                item.action();
                                setIsOpen(false);
                              }}
                            >
                              <div className="flex items-start gap-2 w-full">
                                <Icon
                                  name={item.icon}
                                  size="xs"
                                  className="mt-0.5"
                                />
                                <div className="flex-1 text-left">
                                  <div className="text-sm font-medium">
                                    {item.label}
                                  </div>
                                  {item.description && (
                                    <div className="text-xs text-text-muted">
                                      {item.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toggle button */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center ${
            isOpen
              ? "bg-red-600 text-text-on-primary rotate-45"
              : "bg-primary text-text-on-primary"
          }`}
          title={isOpen ? "Close Settings" : "Settings & Tools"}
        >
          <Icon name={isOpen ? "close" : "settings"} size="lg" />
        </Button>
      </div>

      {/* Panels */}
      <DashboardCustomizationPanel
        isOpen={showCustomization}
        onClose={() => setShowCustomization(false)}
      />

      {isDev && showDevTools && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center">
          <div className="bg-surface-card rounded-lg shadow-xl max-w-4xl max-h-[80vh] w-full mx-4 overflow-hidden">
            <div className="p-4 border-b border-subtle flex justify-between items-center">
              <Typography variant="headline-sm">Development Tools</Typography>
              <Button variant="ghost" onClick={() => setShowDevTools(false)}>
                <Icon name="close" size="sm" />
              </Button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <Typography variant="body-md" className="text-text-muted">
                Development tools interface will be embedded here.
                <br />
                <small>
                  Note: DevTools component has been temporarily simplified for
                  the unified interface.
                </small>
              </Typography>

              {/* Placeholder for dev tools content */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
                  <span>Debug Mode</span>
                  <Button variant="outline" size="sm">
                    Toggle
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
                  <span>Console Logs</span>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
                  <span>Performance</span>
                  <Button variant="outline" size="sm">
                    Monitor
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
