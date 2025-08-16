/**
 * Icon Types - Core Type Definitions
 *
 * Centralized type definitions for the icon system
 */

import type { ActionIconName } from "./categories/ActionIcons";
import type { BusinessIconName } from "./categories/BusinessIcons";
import type { CalendarIconName } from "./categories/CalendarIcons";
import type { MediaIconName } from "./categories/MediaIcons";
import type { NavigationIconName } from "./categories/NavigationIcons";
import type { SportsIconName } from "./categories/SportsIcons";
import type { SystemIconName } from "./categories/SystemIcons";
import type { LucideProps } from "lucide-react";

export interface IconProps {
  name: IconName;
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

// Base icon props from Lucide
export type LucideIconProps = LucideProps;

// Combined icon name type from all categories
export type IconName =
  | NavigationIconName
  | ActionIconName
  | CalendarIconName
  | SportsIconName
  | BusinessIconName
  | MediaIconName
  | SystemIconName
  | "boxcall"; // Custom icon

// Size mapping
export const sizeMap = {
  xs: 12, // Tight UI elements
  sm: 16, // Default small buttons
  md: 20, // Standard icons
  lg: 24, // Larger buttons
  xl: 32, // Headers, prominent actions
  "2xl": 40, // Coach-friendly size
  "3xl": 48, // Extra large for accessibility
  touch: 44, // Minimum touch target (44px recommended)
};

// Color mapping type
export type IconColor = IconProps["color"];
export type IconSize = IconProps["size"];

// Deprecated legacy icon types. Do not import.
export {};
