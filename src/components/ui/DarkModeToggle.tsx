import React from "react";
import { Button } from "./Button/Button";
import { Icon } from "./Icon";
import { useDesignSystem } from "../design-system/DesignSystemProvider";

/**
 * Dark Mode Toggle Component
 *
 * Sophisticated theme switcher with smooth transitions and system preference detection
 */

export interface DarkModeToggleProps {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show label text */
  showLabel?: boolean;
  /** Custom className */
  className?: string;
  /** Haptic feedback type */
  hapticType?: "light" | "medium" | "heavy";
}

export const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
  size = "md",
  showLabel = false,
  className = "",
  hapticType = "medium",
}) => {
  const { config, updateConfig } = useDesignSystem();

  const toggleTheme = () => {
    const newTheme = config.theme === "dark" ? "light" : "dark";
    updateConfig({ theme: newTheme });
  };

  const isDark = config.theme === "dark";
  const isAuto = config.theme === "auto";

  // Determine icon based on current state
  const getIcon = () => {
    if (isAuto) return "monitor"; // System preference
    return isDark ? "sun" : "moon";
  };

  const getLabel = () => {
    if (isAuto) return "Auto";
    return isDark ? "Light" : "Dark";
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={toggleTheme}
      hapticType={hapticType}
      className={`transition-all duration-200 ${className}`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <Icon name={getIcon()} className="transition-transform duration-200" />
      {showLabel && (
        <span className="ml-2 transition-opacity duration-200">
          {getLabel()}
        </span>
      )}
    </Button>
  );
};

/**
 * Advanced Theme Selector
 *
 * Full theme selection with system preference detection
 */

export interface ThemeSelectorProps {
  /** Orientation */
  orientation?: "horizontal" | "vertical";
  /** Show system preference option */
  showAuto?: boolean;
  /** Custom className */
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  orientation = "horizontal",
  showAuto = true,
  className = "",
}) => {
  const { config, updateConfig } = useDesignSystem();

  const themes = [
    { value: "light", label: "Light", icon: "sun" },
    { value: "dark", label: "Dark", icon: "moon" },
    ...(showAuto ? [{ value: "auto", label: "Auto", icon: "monitor" }] : []),
  ] as const;

  const containerClasses = orientation === "horizontal"
    ? "flex space-x-1"
    : "flex flex-col space-y-1";

  return (
    <div className={`${containerClasses} ${className}`}>
      {themes.map((theme) => (
        <Button
          key={theme.value}
          variant={config.theme === theme.value ? "secondary" : "ghost"}
          size="sm"
          onClick={() => updateConfig({ theme: theme.value as any })}
          hapticType="light"
          className="justify-start transition-all duration-200"
        >
          <Icon name={theme.icon} className="mr-2" />
          {theme.label}
        </Button>
      ))}
    </div>
  );
};

/**
 * Theme-aware surface colors hook
 */

export const useThemeColors = () => {
  const { config } = useDesignSystem();
  const isDark = config.theme === "dark" ||
    (config.theme === "auto" && typeof window !== "undefined" &&
     window.matchMedia("(prefers-color-scheme: dark)").matches);

  return {
    isDark,
    theme: config.theme,
    // Surface colors
    surface: {
      primary: isDark ? "bg-dark-surface-primary" : "bg-surface-primary",
      secondary: isDark ? "bg-dark-surface-secondary" : "bg-surface-secondary",
      tertiary: isDark ? "bg-dark-surface-tertiary" : "bg-surface-tertiary",
      accent: isDark ? "bg-dark-surface-accent" : "bg-navy-900",
    },
    // Text colors
    text: {
      primary: isDark ? "text-dark-text-primary" : "text-text-primary",
      secondary: isDark ? "text-dark-text-secondary" : "text-text-secondary",
      tertiary: isDark ? "text-dark-text-tertiary" : "text-text-tertiary",
      inverse: isDark ? "text-dark-text-inverse" : "text-surface-primary",
    },
    // Interactive colors
    interactive: {
      hover: isDark ? "hover:bg-dark-interactive-hover" : "hover:bg-surface-tertiary",
      active: isDark ? "active:bg-dark-interactive-active" : "active:bg-border",
      focus: "focus:ring-electric-500",
    },
  };
};

export default DarkModeToggle;