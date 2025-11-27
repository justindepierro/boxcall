import React from "react";
import { Button } from "../ui";
import { Typography } from "../design-system/Typography";
import { Icon } from "../ui/Icon";
import { Tooltip } from "../ui/Tooltip/Tooltip";
import { useDashboardStore } from "../../stores/dashboardStore";
import type { LayoutSize } from "../../stores/dashboardStore";

/**
 * Dashboard Customization Panel
 * Phase 2A: Smart Dashboard Personalization
 *
 * Provides interface for users to customize their dashboard layout,
 * toggle widgets, adjust sizes, and manage layout presets.
 */

interface DashboardCustomizationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardCustomizationPanel: React.FC<
  DashboardCustomizationPanelProps
> = ({ isOpen, onClose }) => {
  const {
    currentLayout,
    availableLayouts,
    personalizationSettings,
    loading,
    error,
    createLayout,
    toggleWidgetVisibility,
    resizeWidget,
    setPersonalizationSettings,
    clearError,
  } = useDashboardStore();

  const [activeTab, setActiveTab] = React.useState<
    "widgets" | "layouts" | "settings"
  >("widgets");
  const [newLayoutName, setNewLayoutName] = React.useState("");
  const [showCreateLayout, setShowCreateLayout] = React.useState(false);

  if (!isOpen) return null;

  const handleCreateLayout = async () => {
    if (!newLayoutName.trim()) return;

    try {
      await createLayout(newLayoutName, currentLayout || undefined);
      setNewLayoutName("");
      setShowCreateLayout(false);
    } catch (error) {
      console.error("Failed to create layout:", error);
    }
  };

  const handleWidgetSizeChange = (widgetId: string, size: LayoutSize) => {
    resizeWidget(widgetId, size);
  };

  const renderWidgetsTab = () => (
    <div className="space-y-md">
      <Typography variant="headline-sm" className="text-primary">
        Widget Configuration
      </Typography>

      {currentLayout?.widgets.map((widget) => (
        <div
          key={widget.id}
          className="flex items-center justify-between p-md bg-primary rounded-lg border border-muted"
        >
          <div className="flex items-center space-x-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleWidgetVisibility(widget.id)}
              className="p-xs"
              aria-label={`${widget.visible ? "Hide" : "Show"} ${widget.title}`}
            >
              <Icon
                name={widget.visible ? "eye" : "eye-off"}
                size="sm"
                className={
                  widget.visible ? "text-primary" : "text-muted"
                }
              />
            </Button>

            <div>
              <Typography variant="body-md" className="font-medium">
                {widget.title}
              </Typography>
              <Typography variant="body-sm" color="muted">
                {widget.visible ? "Visible" : "Hidden"}
              </Typography>
            </div>
          </div>

          <div className="flex items-center space-x-xs">
            {/* Size selector */}
            <div className="flex bg-subtle rounded-lg p-1">
              {(["small", "medium", "large"] as LayoutSize[]).map((size) => (
                <Button
                  key={size}
                  variant={widget.size === size ? "primary" : "ghost"}
                  size="sm"
                  className="px-xs py-1 text-xs"
                  onClick={() => handleWidgetSizeChange(widget.id, size)}
                >
                  {size.charAt(0).toUpperCase()}
                </Button>
              ))}
            </div>

            {/* Widget settings button */}
            <Button
              variant="ghost"
              size="sm"
              className="p-xs"
              aria-label={`Configure ${widget.title}`}
            >
              <Icon name="settings" size="sm" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLayoutsTab = () => (
    <div className="space-y-md">
      <div className="flex items-center justify-between">
        <Typography variant="headline-sm" className="text-primary">
          Layout Presets
        </Typography>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCreateLayout(true)}
          className="flex items-center space-x-xs"
        >
          <Icon name="plus" size="sm" />
          <span>New Layout</span>
        </Button>
      </div>

      {showCreateLayout && (
        <div className="p-md bg-primary rounded-lg border border-muted">
          <Typography variant="body-md" className="mb-sm font-medium">
            Create New Layout
          </Typography>
          <div className="flex space-x-xs">
            <input
              type="text"
              value={newLayoutName}
              onChange={(e) => setNewLayoutName(e.target.value)}
              placeholder="Layout name..."
              className="flex-1 px-sm py-xs bg-surface-app border border-muted rounded-lg 
                         text-primary placeholder-text-muted focus:outline-none 
                         focus:ring-2 focus:ring-interaction-focus focus:border-interaction-focus"
              onKeyDown={(e) => e.key === "Enter" && handleCreateLayout()}
            />
            <Button
              variant="primary"
              onClick={handleCreateLayout}
              disabled={!newLayoutName.trim()}
            >
              Create
            </Button>
            <Button variant="ghost" onClick={() => setShowCreateLayout(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {availableLayouts.map((layout) => (
        <div
          key={layout.id}
          className={`p-md bg-primary rounded-lg border transition-colors ${
            currentLayout?.id === layout.id
              ? "border-component-badge-primary bg-component-badge-primary-bg"
              : "border-muted hover:border-secondary"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="body-md" className="font-medium">
                {layout.name}
                {layout.isDefault && (
                  <span className="ml-xs px-xs py-1 text-xs bg-jade-100 text-jade-800 rounded-lg">
                    Default
                  </span>
                )}
              </Typography>
              <Typography variant="body-sm" color="muted">
                {layout.widgets.filter((w) => w.visible).length} widgets •
                Updated {new Date(layout.updatedAt).toLocaleDateString()}
              </Typography>
            </div>

            <div className="flex items-center space-x-xs">
              {currentLayout?.id !== layout.id && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // TODO: Implement layout switching
                    console.info("Switch to layout:", layout.id);
                  }}
                >
                  Use
                </Button>
              )}

              {!layout.isDefault && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-error hover:text-error"
                  onClick={() => {
                    // TODO: Implement layout deletion
                    console.info("Delete layout:", layout.id);
                  }}
                >
                  <Icon name="delete" size="sm" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-lg">
      <Typography variant="headline-sm" className="text-primary">
        Dashboard Settings
      </Typography>

      {/* Theme Settings */}
      <div className="space-y-sm">
        <Typography variant="body-md" className="font-medium">
          Appearance
        </Typography>

        <div className="space-y-xs">
          <label className="flex items-center space-x-sm">
            <input
              type="checkbox"
              checked={personalizationSettings.compactMode}
              onChange={(e) =>
                setPersonalizationSettings({
                  ...personalizationSettings,
                  compactMode: e.target.checked,
                })
              }
              className="w-4 h-4 text-component-checkbox-primary bg-surface-app border-secondary rounded-lg 
                         focus:ring-interaction-focus focus:ring-2"
            />
            <Typography variant="body-sm">Compact mode</Typography>
          </label>

          <label className="flex items-center space-x-sm">
            <input
              type="checkbox"
              checked={personalizationSettings.showWelcomeMessages}
              onChange={(e) =>
                setPersonalizationSettings({
                  ...personalizationSettings,
                  showWelcomeMessages: e.target.checked,
                })
              }
              className="w-4 h-4 text-component-checkbox-primary bg-surface-app border-secondary rounded-lg 
                         focus:ring-interaction-focus focus:ring-2"
            />
            <Typography variant="body-sm">Show welcome messages</Typography>
          </label>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="space-y-sm">
        <Typography variant="body-md" className="font-medium">
          Notifications
        </Typography>

        <div className="space-y-xs">
          <label className="flex items-center space-x-sm">
            <input
              type="checkbox"
              checked={personalizationSettings.enableNotifications}
              onChange={(e) =>
                setPersonalizationSettings({
                  ...personalizationSettings,
                  enableNotifications: e.target.checked,
                })
              }
              className="w-4 h-4 text-component-checkbox-primary bg-surface-app border-secondary rounded-lg 
                         focus:ring-interaction-focus focus:ring-2"
            />
            <Typography variant="body-sm">Enable notifications</Typography>
          </label>

          <label className="flex items-center space-x-sm">
            <input
              type="checkbox"
              checked={personalizationSettings.autoRefresh}
              onChange={(e) =>
                setPersonalizationSettings({
                  ...personalizationSettings,
                  autoRefresh: e.target.checked,
                })
              }
              className="w-4 h-4 text-component-checkbox-primary bg-surface-app border-secondary rounded-lg 
                         focus:ring-interaction-focus focus:ring-2"
            />
            <Typography variant="body-sm">Auto-refresh dashboard</Typography>
          </label>
        </div>
      </div>

      {/* Refresh Interval */}
      <div className="space-y-sm">
        <Typography variant="body-md" className="font-medium">
          Refresh Rate
        </Typography>

        <select
          value={personalizationSettings.refreshInterval}
          onChange={(e) =>
            setPersonalizationSettings({
              ...personalizationSettings,
              refreshInterval: parseInt(e.target.value),
            })
          }
          className="w-full px-sm py-xs bg-surface-app border border-muted rounded-lg 
                     text-primary focus:outline-none focus:ring-2 focus:ring-interaction-focus 
                     focus:border-interaction-focus"
          disabled={!personalizationSettings.autoRefresh}
        >
          <option value={60}>1 minute</option>
          <option value={300}>5 minutes</option>
          <option value={600}>10 minutes</option>
          <option value={1800}>30 minutes</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-text-primary/50" onClick={onClose} />

      {/* Panel */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] mx-md bg-surface-app rounded-lg shadow-xl 
                      border border-muted overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-lg border-b border-muted">
          <div>
            <Typography variant="headline-lg" className="text-primary">
              Customize Dashboard
            </Typography>
            <Typography variant="body-sm" color="muted">
              Personalize your workspace for maximum efficiency
            </Typography>
          </div>

          <Tooltip content="Close customization panel (Esc)">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-xs"
              aria-label="Close customization panel"
            >
              <Icon name="close" size="md" />
            </Button>
          </Tooltip>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-md bg-surface-error border-b border-text-error">
            <div className="flex items-center justify-between">
              <Typography variant="body-sm" className="text-error">
                {error}
              </Typography>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="text-error hover:text-error"
              >
                <Icon name="close" size="sm" />
              </Button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-muted">
          <nav
            className="flex space-x-xl px-lg"
            aria-label="Tabs"
          >
            {[
              { id: "widgets", label: "Widgets", icon: "grid" as const },
              { id: "layouts", label: "Layouts", icon: "grid" as const }, // Using grid as layout icon
              { id: "settings", label: "Settings", icon: "settings" as const },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center space-x-xs py-md border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-component-badge-primary text-component-badge-primary"
                    : "border-border text-muted hover:text-primary"
                }`}
              >
                <Icon name={tab.icon} size="sm" />
                <Typography variant="body-sm" className="font-medium">
                  {tab.label}
                </Typography>
              </Button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div
          className="p-lg overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 200px)" }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-2xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-component-spinner-primary" />
            </div>
          ) : (
            <>
              {activeTab === "widgets" && renderWidgetsTab()}
              {activeTab === "layouts" && renderLayoutsTab()}
              {activeTab === "settings" && renderSettingsTab()}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-lg border-t border-muted bg-subtle">
          <Typography variant="body-sm" color="muted">
            Changes are saved automatically
          </Typography>

          <div className="flex space-x-sm">
            <Button variant="outline" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
