import { clsx } from "clsx";
import React from "react";

export type TagVariant =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "accent"
  | "outline";

export interface TagProps {
  children: React.ReactNode;
  variant?: TagVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  interactive?: boolean; // force interactive styling
}

const sizeStyles: Record<NonNullable<TagProps["size"]>, string> = {
  sm: "px-2 py-0.5 text-[11px] leading-tight rounded-full",
  md: "px-2.5 py-0.5 text-xs leading-tight rounded-full",
  lg: "px-3 py-1 text-sm rounded-full",
};

// Semantic palette aligned with psychological system but lower elevation than Badge
const variantStyles: Record<TagVariant, string> = {
  neutral:
    "surface-subtle text-text-secondary dark:bg-surface-secondary dark:text-text-inverse border border-subtle dark:border-text-tertiary",
  info: "surface-subtle text-text-info dark:bg-surface-info dark:text-text-info border border-subtle dark:border-text-info",
  success:
    "surface-subtle text-text-success dark:bg-surface-success dark:text-text-success border border-subtle dark:border-text-success",
  warning:
    "surface-subtle text-text-warning dark:bg-surface-warning dark:text-text-warning border border-subtle dark:border-text-warning",
  danger:
    "surface-subtle text-text-error dark:bg-surface-error dark:text-text-error border border-subtle dark:border-text-error",
  accent:
    "surface-subtle text-jade-700 dark:bg-jade-900/30 dark:text-jade-300 border border-subtle dark:border-jade-700",
  outline:
    "text-text-secondary border border-border-light dark:border-text-tertiary dark:text-border-light",
};

export const Tag: React.FC<TagProps> = ({
  children,
  variant = "neutral",
  size = "sm",
  className,
  onClick,
  interactive,
}) => {
  const interactiveStyles =
    onClick || interactive
      ? "cursor-pointer hover:brightness-105 active:brightness-95 transition-colors"
      : "";
  return (
    <span
      className={clsx(
        "inline-flex items-center font-medium whitespace-nowrap select-none",
        sizeStyles[size],
        variantStyles[variant],
        interactiveStyles,
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </span>
  );
};

export default Tag;
