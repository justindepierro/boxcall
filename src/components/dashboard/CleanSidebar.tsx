import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "../ui/Icon/Icon";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import { Tooltip } from "../ui/Tooltip/Tooltip";
import type { IconName } from "../ui/Icon";

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: IconName;
  badge?: number;
  isActive?: boolean;
}

interface CleanSidebarProps {
  items: NavigationItem[];
  isOpen: boolean;
  onClose?: () => void;
}

/**
 * Clean, Modern Sidebar Navigation
 *
 * Features:
 * - Clean, minimal design
 * - Responsive behavior (overlay on mobile, static on desktop)
 * - Proper accessibility
 * - Badge support for notifications
 * - Active state indication
 */
export const CleanSidebar: React.FC<CleanSidebarProps> = ({
  items,
  isOpen,
  onClose,
}) => {
  const location = useLocation();

  // Update active states based on current location
  const updatedItems = items.map((item) => ({
    ...item,
    isActive:
      location.pathname === item.href ||
      location.pathname.startsWith(item.href + "/"),
  }));

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-text-primary bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-surface-card z-40 transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto lg:top-0 lg:h-full
        `}
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className="p-4 border-b border-muted">
          <div className="flex items-center justify-between">
            <Typography variant="headline-sm" className="font-bold">
              BoxCall
            </Typography>
            {/* Close button - only visible on mobile */}
            <Tooltip content="Close sidebar (Esc)">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="lg:hidden p-2"
                aria-label="Close sidebar"
              >
                <Icon name="close" size="sm" />
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {updatedItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.href}
                  onClick={onClose} // Close sidebar on mobile when item is clicked
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 group relative
                    ${
                      item.isActive
                        ? "bg-primary text-on-primary"
                        : "text-primary hover:bg-surface-hover"
                    }
                  `}
                  aria-current={item.isActive ? "page" : undefined}
                >
                  <Icon
                    name={item.icon}
                    size="sm"
                    className={
                      item.isActive
                        ? "text-on-primary"
                        : "text-muted group-hover:text-primary"
                    }
                  />
                  <span className="flex-1 font-medium">{item.label}</span>

                  {/* Badge */}
                  {item.badge && item.badge > 0 && (
                    <span
                      className={`
                      px-2 py-1 text-xs font-medium rounded-full min-w-5 text-center
                      ${
                        item.isActive
                          ? "bg-primary bg-opacity-20 text-on-primary"
                          : "bg-primary text-on-primary"
                      }
                    `}
                    >
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};
