import React from "react";
import { Button } from "../ui";
import { Icon } from "../ui/Icon/Icon";
import { Typography } from "../design-system/Typography";

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color?: "jade" | "blue" | "red" | "yellow" | "gray";
  onClick: () => void;
  badge?: number;
}

export interface MobileQuickActionsProps {
  actions: QuickAction[];
  className?: string;
}

/**
 * Mobile Quick Actions Component
 *
 * Features:
 * - Large, touch-friendly action buttons
 * - Contextual colors for different action types
 * - Floating action button style for prominent actions
 * - Swipe-friendly horizontal layout
 */
export const MobileQuickActions: React.FC<MobileQuickActionsProps> = ({
  actions,
  className = "",
}) => {
  const getActionStyles = (color: string = "gray") => {
    const colorMap = {
      jade: "bg-brand-jade hover:bg-brand-jade-dark text-white shadow-jade/25",
      blue: "bg-jade-600 hover:bg-jade-600 text-white shadow-blue/25",
      red: "bg-red-500 hover:bg-red-600 text-white shadow-red/25",
      yellow: "bg-yellow-500 hover:bg-yellow-600 text-white shadow-yellow/25",
      gray: "surface-subtle surface-subtle-hover text-gray-700 shadow-gray/25 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300",
    };

    return `${colorMap[color as keyof typeof colorMap] || colorMap.gray}`;
  };

  const handleActionClick = (action: QuickAction) => {
    // Haptic feedback effect
    const button = document.activeElement as HTMLElement;
    if (button) {
      button.style.transform = "scale(0.95)";
      setTimeout(() => {
        button.style.transform = "scale(1)";
      }, 100);
    }

    action.onClick();
  };

  return (
    <div className={`${className}`}>
      {/* Quick Actions Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <Typography
          variant="label-lg"
          as="h3"
          className="text-gray-700 dark:text-gray-300"
        >
          Quick Actions
        </Typography>
        <span className="text-xs text-text-secondary">Tap to execute</span>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant="secondary"
            size="sm"
            onClick={() => handleActionClick(action)}
            className={`relative flex flex-col items-center justify-center min-h-[80px] p-4 rounded-md shadow-lg active:shadow-sm transition-all duration-200 ease-out active:scale-95 transform touch-manipulation ${getActionStyles(action.color)} !h-auto`}
            aria-label={action.label}
          >
            {/* Icon */}
            <div className="mb-2">
              <Icon
                name={
                  action.icon as
                    | "plus"
                    | "calendar"
                    | "users"
                    | "message"
                    | "play"
                    | "edit"
                }
                size="lg"
                className="drop-shadow-sm"
              />
            </div>

            {/* Label */}
            <span className="text-xs font-medium text-center leading-tight">
              {action.label}
            </span>

            {/* Badge */}
            {action.badge && action.badge > 0 && (
              <div className="absolute -top-1 -right-1">
                <div className="flex items-center justify-center w-5 h-5 bg-red-500 rounded-full">
                  <span className="text-xs font-bold text-text-primary">
                    {action.badge > 9 ? "9+" : action.badge}
                  </span>
                </div>
              </div>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};

/**
 * Floating Action Button for primary mobile actions
 */
export interface FloatingActionButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  color?: "jade" | "blue" | "red";
  position?: "bottom-right" | "bottom-center" | "bottom-left";
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  label,
  onClick,
  color = "jade",
  position = "bottom-right",
  className = "",
}) => {
  const getPositionStyles = () => {
    switch (position) {
      case "bottom-center":
        return "bottom-20 left-1/2 transform -translate-x-1/2";
      case "bottom-left":
        return "bottom-20 left-4";
      case "bottom-right":
      default:
        return "bottom-20 right-4";
    }
  };

  const getColorStyles = () => {
    const colorMap = {
      jade: "bg-brand-jade hover:bg-brand-jade-dark text-white shadow-jade/30",
      blue: "bg-jade-600 hover:bg-jade-600 text-white shadow-blue/30",
      red: "bg-red-500 hover:bg-red-600 text-white shadow-red/30",
    };

    return colorMap[color];
  };

  const handleClick = () => {
    // Haptic feedback effect
    const button = document.activeElement as HTMLElement;
    if (button) {
      button.style.transform = "scale(0.9)";
      setTimeout(() => {
        button.style.transform = "scale(1)";
      }, 100);
    }

    onClick();
  };

  return (
    <Button
      onClick={handleClick}
      variant="primary"
      size="sm"
      className={`fixed z-40 md:hidden w-14 h-14 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 ease-out active:scale-90 transform touch-manipulation ${getPositionStyles()} ${getColorStyles()} ${className}`}
      aria-label={label}
      title={label}
    >
      <Icon
        name={icon as "plus" | "edit" | "message"}
        size="lg"
        className="drop-shadow-sm"
      />
    </Button>
  );
};
