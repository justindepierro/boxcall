/**
 * BoxCall Logo Component System
 *
 * Professional logo component that integrates with our design system
 * Supports both logo variants with intelligent sizing and color modes
 *
 * @version 1.0.0
 */

import React from "react";

export type LogoVariant = "icon" | "full"; // icon-only or logo+text
export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type LogoColor = "brand" | "white" | "black" | "current";

export interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  color?: LogoColor;
  className?: string;
  alt?: string;
}

// Size mappings for different contexts
const sizeMap = {
  xs: "h-4", // 16px - inline text
  sm: "h-6", // 24px - small buttons
  md: "h-8", // 32px - navbar, cards
  lg: "h-12", // 48px - auth forms, headers
  xl: "h-16", // 64px - hero sections
  "2xl": "h-20", // 80px - splash screens
} as const;

// Professional logo assets mapping
// Using public assets (these support currentColor for theming)
const logoAssets = {
  icon: {
    brand: "/assets/boxcall-logo.svg", // Uses currentColor
    white: "/assets/boxcall-logo.svg", // Uses currentColor
    black: "/assets/boxcall-logo.svg", // Uses currentColor
    current: "/assets/boxcall-logo.svg", // Uses currentColor
  },
  full: {
    brand: "/assets/boxcall-logo-text.svg", // Uses currentColor
    white: "/assets/boxcall-logo-text.svg", // Uses currentColor
    black: "/assets/boxcall-logo-text.svg", // Uses currentColor
    current: "/assets/boxcall-logo-text.svg", // Uses currentColor
  },
} as const;

// Color classes for proper theming (since SVGs use currentColor)
const colorClasses = {
  brand: "text-jade-600", // Brand green
  white: "text-white", // White
  black: "text-black", // Black
  current: "", // Inherit from parent
} as const;

/**
 * Professional Logo Component
 *
 * Usage Examples:
 * <Logo /> // Default: icon, md, brand
 * <Logo variant="full" size="lg" /> // Full logo, large
 * <Logo variant="icon" size="sm" color="white" /> // Small white icon
 */
export const Logo: React.FC<LogoProps> = ({
  variant = "icon",
  size = "md",
  color = "brand",
  className = "",
  alt = "BoxCall",
}) => {
  const logoSrc = logoAssets[variant][color];
  const sizeClass = sizeMap[size];
  const colorClass = colorClasses[color];

  return (
    <img
      src={logoSrc}
      alt={alt}
      className={`${sizeClass} ${colorClass} ${className}`.trim()}
    />
  );
};

// Convenience components for common use cases
export const LogoIcon = (props: Omit<LogoProps, "variant">) => (
  <Logo variant="icon" {...props} />
);

export const LogoFull = (props: Omit<LogoProps, "variant">) => (
  <Logo variant="full" {...props} />
);

// Context-specific logo components
export const NavbarLogo = () => <Logo variant="icon" size="md" color="brand" />;

export const AuthLogo = () => <Logo variant="full" size="lg" color="brand" />;

export const SidebarLogo = () => (
  <Logo variant="icon" size="sm" color="brand" />
);

export const HeroLogo = () => <Logo variant="full" size="xl" color="brand" />;

export default Logo;
