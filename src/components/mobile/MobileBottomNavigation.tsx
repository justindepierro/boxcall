import React from "react";
import { Icon } from "../ui/Icon/Icon";
import { Button } from "../ui";
import { NotificationBadge } from "../ui/Badge";

export interface MobileNavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: number;
  isActive?: boolean;
}

export interface MobileBottomNavigationProps {
  items: MobileNavItem[];
  onNavigate?: (href: string, item: MobileNavItem) => void;
  className?: string;
}

/**
 * Mobile Bottom Navigation Component
 *
 * Features:
 * - Thumb-friendly navigation positioned at bottom
 * - 44px minimum touch targets for accessibility
 * - Visual feedback and haptic-style animations
 * - Notification badges for important updates
 * - Safe area support for modern phones
 */
export const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({
  items,
  onNavigate,
  className = "",
}) => {
  const handleItemClick = (item: MobileNavItem) => {
    // Provide haptic-style feedback
    const button = document.activeElement as HTMLElement;
    if (button) {
      button.style.transform = "scale(0.95)";
      setTimeout(() => {
        button.style.transform = "scale(1)";
      }, 100);
    }

    // Handle navigation
    if (onNavigate) {
      onNavigate(item.href, item);
    } else {
      window.location.href = item.href;
    }
  };

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-50
        bg-white dark:bg-gray-900
        border-t border-gray-200 dark:border-gray-700
        shadow-lg
        pb-safe-area-inset-bottom
        md:hidden
        ${className}
      `}
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      <div className="px-2 py-1">
        <div className="flex justify-between items-center max-w-sm mx-auto">
          {items.map((item) => (
            <Button
              key={item.id}
              onClick={() => handleItemClick(item)}
              variant={item.isActive ? "primary" : "ghost"}
              size="sm"
              className={`relative flex flex-col items-center justify-center min-w-[60px] px-2 py-2 h-auto active:scale-95 focus-visible:ring-2 focus-visible:ring-jade-500 ${ item.isActive ? "text-brand-jade dark:text-brand-jade-light" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" } text-text-secondary`}
              style={{ minHeight: "60px" }}
              aria-label={`Navigate to ${item.label}`}
            >
              {/* Icon Container */}
              <div className="relative mb-1">
                <Icon
                  name={
                    item.icon as "home" | "calendar" | "users" | "user" | "menu"
                  }
                  size="sm"
                  className={`
                    transition-colors duration-200
                    ${item.isActive ? "text-brand-jade dark:text-brand-jade-light" : ""}
                  `}
                />

                {/* Notification Badge */}
                {item.badge && item.badge > 0 && (
                  <div className="absolute -top-2 -right-2">
                    <NotificationBadge count={item.badge} size="sm" />
                  </div>
                )}

                {/* Active Indicator */}
                {item.isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-1 h-1 bg-brand-jade dark:bg-brand-jade-light rounded-full" />
                  </div>
                )}
              </div>

              {/* Label */}
              <span className="text-xs font-medium leading-tight">
                {item.label}
              </span>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
};
