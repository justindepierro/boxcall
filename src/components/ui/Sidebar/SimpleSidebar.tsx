import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "../Icon/Icon";
import { Button } from "../Button";
import type { IconName } from "../Icon";

export interface SimpleSidebarItem {
  id: string;
  label: string;
  href?: string;
  icon?: IconName;
  onClick?: () => void;
  divider?: boolean;
  badge?: string | number;
}

export interface SimpleSidebarProps {
  items: SimpleSidebarItem[];
  isOpen: boolean;
  onClose?: () => void;
  header?: React.ReactNode;
}

export const SimpleSidebar: React.FC<SimpleSidebarProps> = ({
  items,
  isOpen,
  onClose,
  header,
}) => {
  const { pathname } = useLocation();

  const handleItemClick = () => {
    // Always close sidebar when item is clicked
    onClose?.();
  };

  const handleOverlayClick = () => {
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={handleOverlayClick}
      />

      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl z-50 overflow-y-auto">
        {/* Header */}
        {header && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            {header}
          </div>
        )}

        {/* Navigation */}
        <nav className="p-2">
          {items.map((item) => {
            if (item.divider) {
              return (
                <hr
                  key={item.id}
                  className="my-2 border-gray-200 dark:border-gray-700"
                />
              );
            }

            const isActive = item.href && pathname === item.href;

            if (item.href) {
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={handleItemClick}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-jade-100 text-jade-900 dark:bg-jade-900 dark:text-jade-100"
                      : "text-text-primary hover:bg-subtle"
                  }`}
                >
                  {item.icon && (
                    <Icon
                      name={item.icon}
                      size="sm"
                      className={
                        isActive ? "text-jade-600" : "text-text-secondary"
                      }
                    />
                  )}
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-subtle text-text-muted text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            }

            return (
              <Button
                key={item.id}
                onClick={() => {
                  item.onClick?.();
                  handleItemClick();
                }}
                variant="ghost"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-primary hover:bg-subtle transition-colors w-full text-left justify-start"
              >
                {item.icon && (
                  <Icon
                    name={item.icon}
                    size="sm"
                    className="text-text-secondary"
                  />
                )}
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-subtle text-text-muted text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Button>
            );
          })}
        </nav>
      </div>
    </>
  );
};
