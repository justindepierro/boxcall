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
import { iconRegistry, iconLoaders } from "./iconSingletons";

// Note: prefer CSS variables over static token hex so icons adapt to theme

// Core types
export interface ModularIconProps {
  name: ModularIconName;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "touch" | number;
  className?: string;
  color?:
    | "current"
    | "primary"
    | "secondary"
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
  | "plus-circle"
  | "minus"
  | "edit"
  | "delete"
  | "check"
  | "alert-triangle"
  | "warning"
  | "error"
  | "info"
  | "alert"
  | "tag"
  | "calendar"
  | "clock"
  | "users"
  | "user"
  | "user-plus"
  | "target"
  | "trophy"
  | "award"
  | "star"
  | "trending-up"
  | "zap"
  | "flag"
  | "shield"
  | "activity"
  | "map"
  | "map-pin"
  | "message"
  | "home"
  | "refresh-cw"
  | "wrench"
  | "help-circle"
  | "bug"
  | "wifi-off"
  | "server"
  | "save"
  | "download"
  | "upload"
  | "search"
  | "filter"
  | "image"
  | "camera"
  | "arrow-left"
  | "arrow-right"
  | "arrow-up"
  | "arrow-down"
  | "chevron-down"
  | "chevron-up"
  | "chevron-left"
  | "chevron-right"
  | "play"
  | "pause"
  | "team"
  | "book"
  | "file"
  | "pdf"
  | "copy"
  | "folder"
  | "database"
  | "phone"
  | "mail"
  | "eye"
  | "eye-off"
  | "lock"
  | "unlock"
  | "key"
  | "hash"
  | "clipboard-list"
  | "check-circle"
  | "grid"
  | "power"
  | "pointer"
  | "hand"
  | "move"
  | "pen-tool"
  | "link"
  | "sparkles"
  | "crown"
  | "toggle-right"
  | "toggle-left"
  | "back"
  | "forward"
  | "settings"
  | "gamepad-2"
  | "inbox"
  | "flask-conical"
  | "sprout"
  | "lightbulb"
  | "rocket"
  | "party-popper"
  | "type"
  | "list"
  | "circle"
  | "graduation-cap"
  | "shirt"
  | "bar-chart"
  | "chart";

// Dynamic imports for perfect tree shaking (limited to our supported set)
type LucideComponent = React.ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}>;

// Icon registry for loaded components
// export const iconRegistry = new Map<ModularIconName, LucideComponent>();

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

// Color mapping — use semantic CSS variables so values switch with [data-theme]
const colorMap: Record<NonNullable<ModularIconProps["color"]>, string> = {
  current: "currentColor",
  // Primary/brand uses interactive brand color; secondary/slate use text tokens
  primary: "var(--semantic-primary)",
  secondary: "var(--semantic-text-secondary)",
  jade: "var(--semantic-text-brand)",
  navy: "var(--color-navy-700)",
  slate: "var(--color-gray-500)",
  success: "var(--semantic-success)",
  warning: "var(--semantic-warning)",
  error: "var(--semantic-error)",
  info: "var(--semantic-primary-hover)",
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
    // Avoid running in non-browser environments (e.g., after JSDOM teardown)
    if (typeof window === "undefined") return;

    let cancelled = false;
    // Check if already loaded
    if (iconRegistry.has(name)) {
      // Skip state updates if unmounted
      if (!cancelled) setIconComponent(iconRegistry.get(name)!);
      return;
    }

    // Load the icon dynamically (per-icon subpath to avoid bundling the whole library)
    const loader = iconLoaders[name];
    if (loader && !loading) {
      setLoading(true);
      loader()
        .then((mod) => {
          if (cancelled) return;
          const component = mod as
            | { default?: LucideComponent }
            | LucideComponent;
          const Comp = (
            typeof component === "function"
              ? component
              : (component as { default?: LucideComponent }).default
          ) as LucideComponent;
          if (Comp) {
            iconRegistry.set(name, Comp);
            if (!cancelled) setIconComponent(Comp);
          }
          if (!cancelled) setLoading(false);
        })
        .catch((error) => {
          if (!cancelled) {
            console.error(`Failed to load icon: ${name}`, error);
            setLoading(false);
          }
        });
    }
    return () => {
      cancelled = true;
    };
  }, [name, loading]);

  if (loading || !IconComponent) {
    // Return a minimal loading placeholder
    return (
      <div
        className={`inline-block animate-pulse bg-[var(--semantic-bg-muted)] border border-subtle rounded shadow-inner ${className}`}
        data-icon-placeholder="true"
        aria-hidden
        style={{
          width: typeof size === "number" ? size : sizeMap[size],
          height: typeof size === "number" ? size : sizeMap[size],
          // Provide fallbacks to ensure visibility when CSS variables are not resolved yet
          backgroundColor: "var(--semantic-bg-muted, #e5e7eb)",
          borderColor: "var(--semantic-border, #9ca3af)",
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
  <ModularIcon name="play" color="primary" />
);
export const ModularEditIcon: React.FC = () => (
  <ModularIcon name="edit" size="sm" color="secondary" />
);
export const ModularDeleteIcon: React.FC = () => (
  <ModularIcon name="delete" size="sm" color="error" />
);
export const ModularAddIcon: React.FC = () => (
  <ModularIcon name="plus" color="primary" />
);
export const ModularCalendarIcon: React.FC = () => (
  <ModularIcon name="calendar" color="navy" />
);
export const ModularClockIcon: React.FC = () => (
  <ModularIcon name="clock" color="secondary" />
);
export const ModularTeamIcon: React.FC = () => (
  <ModularIcon name="users" color="navy" />
);
export const ModularSettingsIcon: React.FC = () => (
  <ModularIcon name="settings" color="secondary" />
);
