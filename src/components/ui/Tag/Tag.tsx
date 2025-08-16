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
    "surface-subtle text-gray-700 dark:bg-gray-700/60 dark:text-gray-200 border border-subtle dark:border-gray-600",
  info: "surface-subtle text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-subtle dark:border-blue-700",
  success:
    "surface-subtle text-green-700 dark:bg-green-900/40 dark:text-green-300 border border-subtle dark:border-green-700",
  warning:
    "surface-subtle text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border border-subtle dark:border-yellow-700",
  danger:
    "surface-subtle text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-subtle dark:border-red-700",
  accent:
    "surface-subtle text-jade-700 dark:bg-jade-900/30 dark:text-jade-300 border border-subtle dark:border-jade-700",
  outline:
    "bg-transparent text-text-secondary border border-gray-300 dark:border-gray-600 dark:text-gray-300",
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
