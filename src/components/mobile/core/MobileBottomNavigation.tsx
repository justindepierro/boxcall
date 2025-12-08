import React, { useEffect, useRef } from "react";
import { Icon } from "../../ui/Icon/Icon";
import { Button } from "../../ui";
import { NotificationBadge } from "../../ui/Badge";
import { prefetchOnHover } from "../../../navigation/prefetch-utils";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";

export interface MobileNavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: number;
  isActive?: boolean;
  importer?: () => Promise<unknown>;
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
  const itemRefs = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    const enabled = String(import.meta.env.VITE_PREFETCH_ROUTES) === "true";
    if (!enabled) return;
    items.forEach((item) => {
      const el = itemRefs.current.get(item.id) || null;
      if (el && item.importer) {
        prefetchOnHover(el, item.importer);
      }
    });
  }, [items]);

  const handleItemClick = (item: MobileNavItem) => {
    // Trigger haptic feedback for mobile devices
    triggerHapticFeedback("light");

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
        fixed bottom-0 left-0 right-0 z-fixed
        bg-white/95 dark:bg-neutral-900/95
        backdrop-blur-lg
        border-t border-neutral-200 dark:border-neutral-800
        shadow-[0_-4px_20px_rgba(0,0,0,0.08)]
        md:hidden
        ${className}
      `}
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      <div className="px-3 py-2">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {items.map((item) => (
            <div
              key={item.id}
              ref={(el) => {
                if (el) itemRefs.current.set(item.id, el);
                else itemRefs.current.delete(item.id);
              }}
              className="inline-flex"
            >
              <Button
                onClick={() => handleItemClick(item)}
                variant="ghost"
                size="sm"
                className={`
                  relative flex flex-col items-center justify-center 
                  min-w-16 px-3 py-1.5 h-auto 
                  rounded-xl
                  active:scale-95 
                  focus-visible:ring-2 focus-visible:ring-brand-jade 
                  transition-all duration-150
                  ${item.isActive 
                    ? "text-brand-jade bg-brand-jade/10" 
                    : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
                  }
                `}
                style={{ minHeight: "52px" }}
                aria-label={`Navigate to ${item.label}`}
                aria-current={item.isActive ? "page" : undefined}
              >
                {/* Icon Container */}
                <div className="relative mb-0.5">
                  <Icon
                    name={
                      item.icon as
                        | "home"
                        | "calendar"
                        | "users"
                        | "user"
                        | "menu"
                    }
                    size="sm"
                    className={`
                      transition-all duration-150
                      ${item.isActive ? "scale-110" : ""}
                    `}
                  />

                  {/* Notification Badge */}
                  {item.badge && item.badge > 0 && (
                    <div className="absolute -top-1.5 -right-1.5">
                      <NotificationBadge count={item.badge} size="sm" />
                    </div>
                  )}
                </div>

                {/* Label */}
                <span className={`
                  text-xs font-medium leading-tight
                  ${item.isActive ? "font-semibold" : ""}
                `}>
                  {item.label}
                </span>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};
