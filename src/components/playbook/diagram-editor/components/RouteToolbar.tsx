/**
 * RouteToolbar - UI controls for route drawing and editing
 *
 * Features:
 * - Route type selector (Primary/Hot/Check)
 * - Draw/Edit/Delete mode toggles
 * - Route styling options
 * - Active tool indicator
 */

import React, { useState } from "react";
import { Icon } from "@components/ui/Icon/Icon";
import type { IconName } from "@components/ui/Icon/Icon";
import type { RouteType } from "@components/playbook/diagram-editor";
import { triggerHapticFeedback } from "@lib/hapticFeedback";

export interface RouteToolbarProps {
  // Current state
  activeTool: "select" | "draw-route" | "edit-waypoint";
  selectedRouteType: RouteType;
  isRouteSelected: boolean;

  // Callbacks
  onToolChange: (tool: "select" | "draw-route" | "edit-waypoint") => void;
  onRouteTypeChange: (type: RouteType) => void;
  onDeleteRoute?: () => void;
  onClearAllRoutes?: () => void;
}

/**
 * Route type display configuration
 */
const ROUTE_TYPE_CONFIG: Record<
  RouteType,
  {
    label: string;
    icon: IconName;
    color: string;
    description: string;
  }
> = {
  primary: {
    label: "Primary",
    icon: "activity",
    color: "jade",
    description: "Main read - Solid line",
  },
  hot: {
    label: "Hot",
    icon: "zap",
    color: "orange",
    description: "Hot route - Dashed line",
  },
  check: {
    label: "Check",
    icon: "shield",
    color: "neutral",
    description: "Check-down - Dotted line",
  },
};

export const RouteToolbar: React.FC<RouteToolbarProps> = ({
  activeTool,
  selectedRouteType,
  isRouteSelected,
  onToolChange,
  onRouteTypeChange,
  onDeleteRoute,
  onClearAllRoutes,
}) => {
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  // Handle tool selection with haptic feedback
  const handleToolChange = (tool: typeof activeTool) => {
    triggerHapticFeedback("selection");
    onToolChange(tool);
  };

  // Handle route type change with haptic feedback
  const handleRouteTypeChange = (type: RouteType) => {
    triggerHapticFeedback("selection");
    onRouteTypeChange(type);
    setShowTypeDropdown(false);
  };

  // Handle delete route
  const handleDeleteRoute = () => {
    if (!onDeleteRoute) return;
    triggerHapticFeedback("warning");
    if (confirm("Delete this route?")) {
      onDeleteRoute();
    }
  };

  // Handle clear all routes
  const handleClearAllRoutes = () => {
    if (!onClearAllRoutes) return;
    triggerHapticFeedback("warning");
    if (confirm("Delete all routes? This cannot be undone.")) {
      onClearAllRoutes();
    }
  };

  const currentTypeConfig = ROUTE_TYPE_CONFIG[selectedRouteType];

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-surface rounded-lg border border-border shadow-sm">
      {/* Section Label */}
      <div className="flex items-center gap-2 text-xs text-content-secondary font-medium pr-3 border-r border-border">
        <Icon name="activity" size="sm" />
        <span>Routes</span>
      </div>

      {/* Drawing Tools */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleToolChange("select")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTool === "select"
              ? "bg-jade-600 text-white shadow-sm"
              : "bg-surface-secondary text-content-secondary hover:bg-surface-tertiary"
          }`}
          title="Select Mode (V)"
        >
          <Icon name="pointer" size="sm" />
          <span>Select</span>
        </button>

        <button
          onClick={() => handleToolChange("draw-route")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTool === "draw-route"
              ? "bg-jade-600 text-white shadow-sm"
              : "bg-surface-secondary text-content-secondary hover:bg-surface-tertiary"
          }`}
          title="Draw Route (R)"
        >
          <Icon name="edit" size="sm" />
          <span>Draw</span>
        </button>

        <button
          onClick={() => handleToolChange("edit-waypoint")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTool === "edit-waypoint"
              ? "bg-jade-600 text-white shadow-sm"
              : "bg-surface-secondary text-content-secondary hover:bg-surface-tertiary"
          }`}
          title="Edit Waypoints (E)"
        >
          <Icon name="move" size="sm" />
          <span>Edit</span>
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-border"></div>

      {/* Route Type Selector */}
      <div className="relative">
        <button
          onClick={() => {
            triggerHapticFeedback("selection");
            setShowTypeDropdown(!showTypeDropdown);
          }}
          className="px-3 py-1.5 rounded-full text-xs font-medium bg-surface-secondary hover:bg-surface-tertiary transition-colors flex items-center gap-2"
          title={currentTypeConfig.description}
        >
          <Icon name={currentTypeConfig.icon as any} size="sm" />
          <span className={`text-${currentTypeConfig.color}-600 font-semibold`}>
            {currentTypeConfig.label}
          </span>
          <Icon name="chevron-down" size="xs" />
        </button>

        {/* Dropdown Menu */}
        {showTypeDropdown && (
          <>
            {/* Click-outside overlay */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowTypeDropdown(false)}
            />

            {/* Dropdown content */}
            <div className="absolute top-full left-0 mt-1 w-64 bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-50">
              {(Object.keys(ROUTE_TYPE_CONFIG) as RouteType[]).map((type) => {
                const config = ROUTE_TYPE_CONFIG[type];
                const isSelected = type === selectedRouteType;

                return (
                  <button
                    key={type}
                    onClick={() => handleRouteTypeChange(type)}
                    className={`w-full px-4 py-3 text-left hover:bg-surface-secondary transition-colors flex items-start gap-3 ${
                      isSelected ? "bg-surface-tertiary" : ""
                    }`}
                  >
                    <Icon name={config.icon as any} size="md" />
                    <div className="flex-1">
                      <div
                        className={`text-sm font-semibold text-${config.color}-600`}
                      >
                        {config.label}
                        {isSelected && (
                          <span className="ml-2 text-jade-600">✓</span>
                        )}
                      </div>
                      <div className="text-xs text-content-tertiary mt-0.5">
                        {config.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-border"></div>

      {/* Route Actions */}
      <div className="flex items-center gap-1">
        {/* Delete Selected Route */}
        <button
          onClick={handleDeleteRoute}
          disabled={!isRouteSelected || !onDeleteRoute}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
            isRouteSelected && onDeleteRoute
              ? "bg-error-500 text-white hover:bg-error-600 shadow-sm"
              : "bg-surface-tertiary text-content-tertiary cursor-not-allowed opacity-50"
          }`}
          title="Delete Selected Route (Delete)"
        >
          <Icon name="delete" size="sm" />
          <span>Delete</span>
        </button>

        {/* Clear All Routes */}
        {onClearAllRoutes && (
          <button
            onClick={handleClearAllRoutes}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-surface-secondary hover:bg-surface-tertiary text-content-secondary transition-colors flex items-center gap-1.5"
            title="Clear All Routes"
          >
            <Icon name="x-circle" size="sm" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Help Text */}
      {activeTool === "draw-route" && (
        <div className="ml-auto text-xs text-content-tertiary italic">
          Click a player to start, then click to add waypoints. Double-click to
          finish.
        </div>
      )}
      {activeTool === "edit-waypoint" && (
        <div className="ml-auto text-xs text-content-tertiary italic">
          Drag waypoint circles to modify route shape.
        </div>
      )}
    </div>
  );
};
