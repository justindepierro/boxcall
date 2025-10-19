import React from "react";
import { Typography } from "../../design-system/Typography";

export interface SwipeAction {
  /** Action label */
  label: string;
  /** Icon name */
  icon?: string;
  /** Action color */
  color?: "blue" | "red" | "green" | "gray";
  /** Click handler */
  onTap: () => void;
}

export interface MobileListItemProps {
  /** Leading content (avatar, icon, etc.) */
  leading?: React.ReactNode;
  /** Main title text */
  title: string;
  /** Optional subtitle text */
  subtitle?: string;
  /** Optional metadata text */
  metadata?: string;
  /** Trailing content (badge, chevron, etc.) */
  trailing?: React.ReactNode;
  /** Click handler */
  onTap?: () => void;
  /** Swipe action configurations */
  swipeActions?: SwipeAction[];
  /** Optional class name */
  className?: string;
}

/**
 * MobileListItem - Standard List Item Component
 *
 * A flexible list item component with leading/trailing content,
 * title, subtitle, metadata, and optional swipe actions.
 *
 * @example
 * ```tsx
 * // Simple list item
 * <MobileListItem
 *   leading={<Avatar src="/avatar.jpg" />}
 *   title="Twins Same Power"
 *   subtitle="11 Personnel • Right"
 *   trailing={<Badge>Run</Badge>}
 *   onTap={() => navigate('/play/123')}
 * />
 *
 * // List item with swipe actions
 * <MobileListItem
 *   title="Power Run"
 *   subtitle="22 Personnel"
 *   swipeActions={[
 *     { label: "Edit", icon: "edit", color: "blue", onTap: () => edit() },
 *     { label: "Delete", icon: "trash", color: "red", onTap: () => delete() }
 *   ]}
 * />
 * ```
 *
 * Specifications:
 * - Height: 60-80px (auto-adjusts for content)
 * - Touch target: Full item is tappable
 * - Title: 16px semibold
 * - Subtitle: 14px regular, muted
 * - Metadata: 12px regular, muted
 * - Swipe actions: Reveal on swipe left
 */
export function MobileListItem({
  leading,
  title,
  subtitle,
  metadata,
  trailing,
  onTap,
  swipeActions,
  className = "",
}: MobileListItemProps) {
  const hasSwipeActions = swipeActions && swipeActions.length > 0;

  return (
    <div className={`relative ${className}`}>
      {/* Main Item */}
      <button
        onClick={onTap}
        disabled={!onTap}
        className={`
          w-full px-4 py-3
          flex items-center gap-3
          bg-surface-base hover:bg-surface-subtle
          transition-colors
          ${onTap ? "cursor-pointer active:scale-[0.99]" : "cursor-default"}
          ${hasSwipeActions ? "touch-pan-x" : ""}
        `}
      >
        {/* Leading Content */}
        {leading && <div className="flex-shrink-0">{leading}</div>}

        {/* Main Content */}
        <div className="flex-1 min-w-0 text-left">
          {/* Title */}
          <Typography
            variant="body"
            className="font-semibold text-primary text-base truncate"
          >
            {title}
          </Typography>

          {/* Subtitle */}
          {subtitle && (
            <Typography
              variant="body"
              className="text-muted text-sm mt-0.5 truncate"
            >
              {subtitle}
            </Typography>
          )}

          {/* Metadata */}
          {metadata && (
            <Typography
              variant="body"
              className="text-muted text-xs mt-1 truncate"
            >
              {metadata}
            </Typography>
          )}
        </div>

        {/* Trailing Content */}
        {trailing && <div className="flex-shrink-0">{trailing}</div>}
      </button>

      {/* Swipe Actions (hidden by default, revealed on swipe) */}
      {hasSwipeActions && (
        <div
          className="
            absolute top-0 right-0 h-full
            hidden
            /* TODO: Implement swipe gesture library integration */
          "
        >
          {swipeActions.map((action, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                action.onTap();
              }}
              className={`
                px-4 h-full
                text-white text-sm font-medium
                ${action.color === "blue" ? "bg-blue-500" : ""}
                ${action.color === "red" ? "bg-red-500" : ""}
                ${action.color === "green" ? "bg-green-500" : ""}
                ${action.color === "gray" ? "bg-gray-500" : ""}
              `}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * MobileListGroup - Grouped list items with dividers
 */
export interface MobileListGroupProps {
  children: React.ReactNode;
  /** Show dividers between items */
  dividers?: boolean;
  /** Optional class name */
  className?: string;
}

export function MobileListGroup({
  children,
  dividers = true,
  className = "",
}: MobileListGroupProps) {
  return (
    <div
      className={`
        bg-surface-card rounded-xl overflow-hidden
        ${dividers ? "divide-y divide-border-subtle" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
