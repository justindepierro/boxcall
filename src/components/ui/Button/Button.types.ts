/**
 * BoxCall Button Component Types
 *
 * TypeScript definitions for the Button component system
 */
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant =
  | "primary" // Primary brand button
  | "secondary" // Secondary action button
  | "outline" // Outline style button
  | "ghost" // Minimal ghost button
  | "glass" // Glassmorphism effect button
  | "subtle" // Low-emphasis neutral button
  | "link" // Text link style
  | "brandLink" // Strong brand-colored textual link button
  | "neutralLink" // Neutral gray textual link
  | "infoLink" // Informational blue textual link
  | "dangerLink" // Destructive textual link
  | "danger" // High-emphasis destructive commit button
  | "success" // Success/confirmation button
  | "warning"; // Warning/caution button
export type ButtonSize =
  | "xs" // Extra small button
  | "sm" // Small button
  | "md" // Medium button (default)
  | "lg" // Large button
  | "xl"; // Extra large button
export type ButtonIconPosition = "left" | "right" | "only";
export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Button variant for styling */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Button content */
  children?: ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Icon element */
  icon?: ReactNode;
  /** Icon position */
  iconPosition?: ButtonIconPosition;
  /** Additional CSS classes */
  className?: string;
  /** Button type */
  type?: "button" | "submit" | "reset";
}
export interface ButtonVariantStyles {
  base: string;
  hover: string;
  active: string;
  disabled: string;
  focus: string;
}
export interface ButtonSizeStyles {
  padding: string;
  fontSize: string;
  iconSize: string;
  height: string;
}
export type ButtonStylesConfig = Record<ButtonVariant, ButtonVariantStyles>;
export type ButtonSizeConfig = Record<ButtonSize, ButtonSizeStyles>;
