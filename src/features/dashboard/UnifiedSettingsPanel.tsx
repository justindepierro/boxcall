import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui";
import { Icon } from "../../components/ui/Icon/Icon";
import { Typography } from "../../components/design-system/Typography";
import { DashboardCustomizationPanel } from "./DashboardCustomizationPanel";
import { debug } from "../../utils/logger";
import { requestDevPanelControl } from "../../utils/devPanelControl";

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

import type { IconName } from "../../components/ui/Icon";

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

// Tool menu item component
const ToolMenuItem: React.FC<{
  item: ToolItem;
  onAction: () => void;
}> = ({ item, onAction }) => (
  <Button
    variant="ghost"
    size="sm"
    className="w-full justify-start p-2 h-auto"
    onClick={onAction}
  >
    <div className="flex items-start gap-2 w-full">
      <Icon name={item.icon} size="xs" className="mt-0.5" />
      <div className="flex-1 text-left">
        <div className="text-sm font-medium">{item.label}</div>
        {item.description && (
          <div className="text-xs text-muted">{item.description}</div>
        )}
      </div>
    </div>
  </Button>
);

// Category section with expandable items
const CategorySection: React.FC<{
  category: ToolCategory;
  isActive: boolean;
  onToggle: () => void;
  onItemAction: (action: () => void) => void;
  isDev: boolean;
}> = ({ category, isActive, onToggle, onItemAction, isDev }) => (
  <div className="mb-2">
    <Button
      variant="ghost"
      className="w-full justify-start p-3 h-auto"
      onClick={onToggle}
    >
      <div className="flex items-center gap-3 w-full">
        <Icon name={category.icon} size="sm" />
        <span className="flex-1 text-left">{category.label}</span>
        <Icon name={isActive ? "chevron-up" : "chevron-down"} size="xs" />
      </div>
    </Button>

    {isActive && (
      <div className="ml-4 mt-2 space-y-1 animate-in slide-in-from-top-1 fade-in duration-150">
        {category.items
          .filter((item) => isDev || !item.devOnly)
          .map((item) => (
            <ToolMenuItem
              key={item.id}
              item={item}
              onAction={() => onItemAction(item.action)}
            />
          ))}
      </div>
    )}
  </div>
);

// Settings floating panel
const SettingsPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  categories: ToolCategory[];
  activeCategory: string | null;
  onCategoryClick: (categoryId: string) => void;
  isDev: boolean;
}> = ({
  isOpen,
  onClose,
  categories,
  activeCategory,
  onCategoryClick,
  isDev,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-16 right-0 w-80 bg-primary rounded-lg shadow-xl border border-muted animate-in slide-in-from-bottom-2 fade-in duration-200">
      <div className="p-4 border-b border-muted">
        <Typography
          variant="headline-sm"
          className="flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <Icon name="settings" size="sm" />
            Settings & Tools
          </span>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
            <Icon name="close" size="sm" />
          </Button>
        </Typography>
      </div>

      <div className="p-2 max-h-96 overflow-y-auto">
        {categories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            isActive={activeCategory === category.id}
            onToggle={() => onCategoryClick(category.id)}
            onItemAction={(action) => {
              action();
              onClose();
            }}
            isDev={isDev}
          />
        ))}
      </div>
    </div>
  );
};

export const UnifiedSettingsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const navigate = useNavigate();

  const isDev = import.meta.env.DEV;

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
            debug("dashboard.reset_layout");
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
          action: () => navigate("/collaborative-demo"),
          description: "Access team collaboration features",
        },
        {
          id: "sharing",
          label: "Share Dashboard",
          icon: "link",
          action: () => {
            // Add sharing logic
            debug("dashboard.share");
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
          action: () =>
            requestDevPanelControl({
              action: "open",
              source: "unified-settings-panel",
            }),
          description: "Access development tools and debugging",
          devOnly: true,
        },
        {
          id: "logs",
          label: "View Logs",
          icon: "list",
          action: () => {
            // Add logs logic
            debug("dashboard.view_logs");
            requestDevPanelControl({
              action: "open",
              source: "unified-settings-panel",
            });
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
        <SettingsPanel
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          categories={filteredCategories}
          activeCategory={activeCategory}
          onCategoryClick={handleCategoryClick}
          isDev={isDev}
        />

        {/* Toggle button */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full transition-all duration-200 flex items-center justify-center ${
            isOpen
              ? "bg-text-error hover:bg-text-error/90 text-on-primary rotate-45"
              : "bg-primary hover:bg-primary/90 text-on-primary"
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
    </>
  );
};
