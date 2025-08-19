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
import type { IconName } from "./types";
export type ModularIconName = IconName;

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
    // Debug: log requested icon name and registry status
    if (!iconLoaders[name]) {
      console.warn(
        `[ModularIcon] Requested icon name '${name}' does NOT exist in iconLoaders registry.`
      );
    } else {
      console.info(
        `[ModularIcon] Requested icon name '${name}' found in iconLoaders registry.`
      );
    }
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
          const pascalName = name
            .split(/[-_]/)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join("");
          let Comp: LucideComponent | undefined = undefined;
          console.log(
            `[ModularIcon] Dynamic import for '${name}' returned:`,
            mod
          );
          if (mod && typeof mod === "object") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const modAny = mod as any;
            console.log(
              `[ModularIcon] Checking for named export '${pascalName}' in module:`,
              Object.keys(modAny)
            );
            if (
              modAny[pascalName] &&
              typeof modAny[pascalName] === "function"
            ) {
              Comp = modAny[pascalName] as LucideComponent;
              console.log(
                `[ModularIcon] Found named export '${pascalName}' for '${name}'.`
              );
            } else if (modAny.default && typeof modAny.default === "function") {
              Comp = modAny.default as LucideComponent;
              console.log(`[ModularIcon] Using default export for '${name}'.`);
            } else {
              console.warn(
                `[ModularIcon] Neither named nor default export found for '${name}'.`
              );
            }
          } else if (typeof mod === "function") {
            Comp = mod as LucideComponent;
            console.log(
              `[ModularIcon] Module itself is a function for '${name}'.`
            );
          }
          if (!Comp) {
            console.error(
              `[ModularIcon] Could not extract icon component for '${name}' (PascalCase: '${pascalName}') from module:`,
              mod
            );
          }
          if (Comp) {
            iconRegistry.set(name, Comp);
            if (!cancelled) setIconComponent(Comp);
          }
          if (!cancelled) setLoading(false);
        })
        .catch((error) => {
          if (!cancelled) {
            console.error(
              `[ModularIcon] Failed to load icon: '${name}'`,
              error
            );
            setLoading(false);
          }
        });
    }
    return () => {
      cancelled = true;
    };
  }, [name, loading]);

  if (loading || !IconComponent) {
    // Return a minimal loading placeholder (span for safe nesting)
    return (
      <span
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
