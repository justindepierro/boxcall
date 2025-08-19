/**
 * Icon Types - Core Type Definitions
 *
 * Centralized type definitions for the icon system
 */

// Removed unused icon name type imports. All icon names are now managed in the unified IconName type below.
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

/**
 * IconName - Unified, maintainable, and professional icon name type
 *
 * Naming guidelines:
 * - Use kebab-case for multi-word names (e.g., 'map-pin', 'chevron-right')
 * - Prefer descriptive, industry-standard names
 * - Add new icons here for traceability and type safety
 * - Keep this list alphabetized for maintainability
 */
export type IconName =
  | "activity"
  | "alert"
  | "alert-circle"
  | "alert-octagon"
  | "alert-triangle"
  | "arrow-down"
  | "arrow-left"
  | "arrow-right"
  | "arrow-up"
  | "award"
  | "bar-chart"
  | "book"
  | "boxcall"
  | "calendar"
  | "camera"
  | "check"
  | "check-circle"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "chevron-up"
  | "clock"
  | "close"
  | "copy"
  | "crown"
  | "database"
  | "delete"
  | "download"
  | "edit"
  | "eye"
  | "eye-off"
  | "file"
  | "filter"
  | "flag"
  | "folder"
  | "forward"
  | "gamepad-2"
  | "grid"
  | "hand"
  | "help-circle"
  | "home"
  | "image"
  | "info"
  | "key"
  | "link"
  | "list"
  | "lock"
  | "mail"
  | "map"
  | "map-pin"
  | "medal"
  | "menu"
  | "message"
  | "minus"
  | "move"
  | "party-popper"
  | "pause"
  | "pen-tool"
  | "phone"
  | "play"
  | "plus"
  | "plus-circle"
  | "pointer"
  | "power"
  | "refresh"
  | "refresh-cw"
  | "rocket"
  | "save"
  | "search"
  | "settings"
  | "shield"
  | "sparkles"
  | "sprout"
  | "star"
  | "tag"
  | "target"
  | "team"
  | "trophy"
  | "type"
  | "undo"
  | "unlock"
  | "upload"
  | "user"
  | "user-plus"
  | "users"
  | "warning"
  | "wifi-off"
  | "wrench"
  | "zap";

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
