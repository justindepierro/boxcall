import React from "react";
import { clsx } from "clsx";

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
    "bg-gray-100 text-gray-700 dark:bg-gray-700/60 dark:text-gray-200 border border-gray-200 dark:border-gray-600",
  info:
    "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-700",
  success:
    "bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-700",
  warning:
    "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700",
  danger:
    "bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-700",
  accent:
    "bg-jade-50 text-jade-700 dark:bg-jade-900/30 dark:text-jade-300 border border-jade-200 dark:border-jade-700",
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

export function mapCategoryToTagVariant(category: string): TagVariant {
  switch (category) {
    case "offense":
    case "conditioning":
      return "accent";
    case "defense":
      return "danger";
    case "special-teams":
      return "info";
    case "meeting":
    case "transition":
      return "neutral";
    case "weight-room":
      return "success";
    case "break":
      return "outline";
    default:
      return "neutral";
  }
}

export function mapEventTypeToTagVariant(type: string): TagVariant {
  switch (type) {
    case "game":
      return "danger";
    case "practice":
      return "accent";
    case "meeting":
      return "warning";
    case "film":
      return "info";
    default:
      return "neutral";
  }
}

export default Tag;
