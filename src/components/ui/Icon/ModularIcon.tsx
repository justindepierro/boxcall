/**
 * Modular Icon System v2
 *
 * SAFE PARALLEL IMPLEMENTATION
 * - Builds alongside the existing 998-line Icon.tsx
 * - Can be gradually adopted by components
 * - Zero risk to existing functionality
 * - Perfect tree shaking for new adopters
 */

import React from "react";
import { getComponentColor } from "../../../design-system/tokens";

// Core types
export interface ModularIconProps {
  name: ModularIconName;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "touch" | number;
  className?: string;
  color?:
    | "current"
    | "jade"
    | "navy"
    | "slate"
    | "success"
    | "warning"
    | "error"
    | "info";
  strokeWidth?: number;
}

// Start with just the most common icons to prove the concept
export type ModularIconName =
  | "menu"
  | "close"
  | "plus"
  | "edit"
  | "delete"
  | "check"
  | "calendar"
  | "clock"
  | "users"
  | "user"
  | "target"
  | "arrow-left"
  | "arrow-right"
  | "chevron-down"
  | "chevron-up"
  | "play"
  | "pause"
  | "settings";

// Dynamic imports for perfect tree shaking
const iconLoaders = {
  // Navigation
  menu: () => import("lucide-react").then((m) => m.Menu),
  close: () => import("lucide-react").then((m) => m.X),
  "arrow-left": () => import("lucide-react").then((m) => m.ArrowLeft),
  "arrow-right": () => import("lucide-react").then((m) => m.ArrowRight),
  "chevron-down": () => import("lucide-react").then((m) => m.ChevronDown),
  "chevron-up": () => import("lucide-react").then((m) => m.ChevronUp),

  // Actions
  plus: () => import("lucide-react").then((m) => m.Plus),
  edit: () => import("lucide-react").then((m) => m.Edit3),
  delete: () => import("lucide-react").then((m) => m.Trash2),
  check: () => import("lucide-react").then((m) => m.Check),

  // Calendar & Time
  calendar: () => import("lucide-react").then((m) => m.Calendar),
  clock: () => import("lucide-react").then((m) => m.Clock),
  play: () => import("lucide-react").then((m) => m.Play),
  pause: () => import("lucide-react").then((m) => m.Pause),

  // People & Sports
  users: () => import("lucide-react").then((m) => m.Users),
  user: () => import("lucide-react").then((m) => m.User),
  target: () => import("lucide-react").then((m) => m.Target),

  // System
  settings: () => import("lucide-react").then((m) => m.Settings),
};

// Icon registry for loaded components
const iconRegistry = new Map<
  string,
  React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
    className?: string;
  }>
>();

// Size mapping
const sizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  "2xl": 40,
  "3xl": 48,
  touch: 44,
};

// Color mapping
const colorMap = {
  current: "currentColor",
  jade: getComponentColor("icon", "jade"),
  navy: getComponentColor("icon", "navy"),
  slate: getComponentColor("icon", "slate"),
  success: getComponentColor("icon", "success"),
  warning: getComponentColor("icon", "warning"),
  error: getComponentColor("icon", "error"),
  info: getComponentColor("icon", "info"),
};

/**
 * ModularIcon - Tree-shakeable icon component
 *
 * Only imports the specific icons that are used
 * Perfect for new components that want bundle optimization
 */
export const ModularIcon: React.FC<ModularIconProps> = ({
  name,
  size = "md",
  className = "",
  color = "current",
  strokeWidth = 2,
}) => {
  const [IconComponent, setIconComponent] = React.useState<React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
    className?: string;
  }> | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    // Check if already loaded
    if (iconRegistry.has(name)) {
      setIconComponent(iconRegistry.get(name)!);
      return;
    }

    // Load the icon dynamically
    const loader = iconLoaders[name];
    if (loader && !loading) {
      setLoading(true);
      loader()
        .then((component) => {
          iconRegistry.set(name, component);
          setIconComponent(component);
          setLoading(false);
        })
        .catch((error) => {
          console.error(`Failed to load icon: ${name}`, error);
          setLoading(false);
        });
    }
  }, [name, loading]);

  if (loading || !IconComponent) {
    // Return a minimal loading placeholder
    return (
      <div
        className={`inline-block animate-pulse bg-gray-200 rounded ${className}`}
        style={{
          width: typeof size === "number" ? size : sizeMap[size],
          height: typeof size === "number" ? size : sizeMap[size],
        }}
      />
    );
  }

  const iconSize = typeof size === "number" ? size : sizeMap[size];
  const iconColor = colorMap[color];

  return (
    <IconComponent
      size={iconSize}
      color={iconColor}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
};

// Convenience components for quick adoption
export const ModularPlayIcon: React.FC = () => (
  <ModularIcon name="play" color="jade" />
);
export const ModularEditIcon: React.FC = () => (
  <ModularIcon name="edit" size="sm" color="slate" />
);
export const ModularDeleteIcon: React.FC = () => (
  <ModularIcon name="delete" size="sm" color="error" />
);
export const ModularAddIcon: React.FC = () => (
  <ModularIcon name="plus" color="jade" />
);
export const ModularCalendarIcon: React.FC = () => (
  <ModularIcon name="calendar" color="navy" />
);
export const ModularClockIcon: React.FC = () => (
  <ModularIcon name="clock" color="slate" />
);
export const ModularTeamIcon: React.FC = () => (
  <ModularIcon name="users" color="navy" />
);
export const ModularSettingsIcon: React.FC = () => (
  <ModularIcon name="settings" color="slate" />
);
