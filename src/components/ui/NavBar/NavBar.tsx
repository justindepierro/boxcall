import type { ReactNode } from "react";
import React, { useState } from "react";
import { Button } from "../Button";

export interface NavBarItem {
  /** Unique identifier for the nav item */
  id: string;
  /** Display label for the nav item */
  label: string;
  /** Optional icon (React component or string) */
  icon?: ReactNode;
  /** Click handler for the nav item */
  onClick?: () => void;
  /** Whether the item is active/selected */
  active?: boolean;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Optional badge/counter */
  badge?: string | number;
  /** Dropdown items for this nav item */
  children?: NavBarItem[];
}

export interface NavBarProps {
  /** Navigation items */
  items: NavBarItem[];
  /** Logo/brand content */
  brand?: ReactNode;
  /** Additional actions on the right side */
  actions?: ReactNode;
  /** Whether the navbar is sticky */
  sticky?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Callback when mobile menu is toggled */
  onMobileMenuToggle?: (isOpen: boolean) => void;
  /** Whether to show mobile menu button */
  showMobileMenu?: boolean;
}

// NavBar styles using only Tailwind dark mode classes
const getNavBarStyles = (sticky: boolean) => {
  const baseStyles = `
    w-full transition-all duration-200 ease-in-out
    border-b border-gray-200 dark:border-gray-700
    bg-white dark:bg-gray-800
  `;

  const stickyStyles = sticky ? "sticky top-0 z-40 shadow-sm" : "";

  return `${baseStyles} ${stickyStyles}`;
};

const getNavItemStyles = (item: NavBarItem) => {
  const baseStyles = `
    relative flex items-center px-3 py-2 rounded-md text-sm font-medium
    transition-colors duration-200 ease-in-out cursor-pointer
  `;

  if (item.disabled) {
    return `${baseStyles} text-gray-400 dark:text-gray-500 cursor-not-allowed`;
  }

  if (item.active) {
    return `${baseStyles} bg-blue-100 dark:bg-gray-700 text-blue-700 dark:text-white`;
  }

  return `${baseStyles} text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white`;
};

const getBadgeStyles = () => {
  return `
    absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-medium rounded-full
    bg-blue-500 dark:bg-blue-600 text-white
  `;
};

const NavBarItem: React.FC<{
  item: NavBarItem;
  isMobile?: boolean;
  onItemClick?: (item: NavBarItem) => void;
}> = ({ item, isMobile = false, onItemClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleClick = () => {
    if (item.disabled) return;

    if (item.children && item.children.length > 0) {
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      item.onClick?.();
      onItemClick?.(item);
    }
  };

  const hasDropdown = item.children && item.children.length > 0;

  return (
    <div className={`relative ${isMobile ? "block" : "inline-block"}`}>
      <div className={getNavItemStyles(item)} onClick={handleClick}>
        {item.icon && <span className="mr-2 flex-shrink-0">{item.icon}</span>}
        <span>{item.label}</span>

        {hasDropdown && (
          <svg
            className={`ml-1 h-4 w-4 transition-transform duration-200 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}

        {item.badge && <span className={getBadgeStyles()}>{item.badge}</span>}
      </div>

      {/* Dropdown Menu */}
      {hasDropdown && isDropdownOpen && (
        <div
          className={`
          ${isMobile ? "ml-4 mt-1" : "absolute left-0 mt-2 w-48"}
          bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700
          border rounded-md shadow-lg z-50
        `}
        >
          {item.children?.map((childItem) => (
            <div
              key={childItem.id}
              className={`
                block px-4 py-2 text-sm cursor-pointer
                ${
                  childItem.disabled
                    ? "text-gray-400 dark:text-gray-500"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white"
                }
              `}
              onClick={() => {
                if (!childItem.disabled) {
                  childItem.onClick?.();
                  onItemClick?.(childItem);
                  setIsDropdownOpen(false);
                }
              }}
            >
              <div className="flex items-center">
                {childItem.icon && (
                  <span className="mr-2 flex-shrink-0">{childItem.icon}</span>
                )}
                <span>{childItem.label}</span>
                {childItem.badge && (
                  <span className={`ml-auto ${getBadgeStyles()}`}>
                    {childItem.badge}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const NavBar: React.FC<NavBarProps> = ({
  items,
  brand,
  actions,
  sticky = true,
  className = "",
  onMobileMenuToggle,
  showMobileMenu = true,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    onMobileMenuToggle?.(newState);
  };

  const handleItemClick = () => {
    // Close mobile menu when item is clicked
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
      onMobileMenuToggle?.(false);
    }
  };

  return (
    <nav className={`${getNavBarStyles(sticky)} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand/Logo */}
          {brand && <div className="flex-shrink-0">{brand}</div>}

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {items.map((item) => (
                <NavBarItem
                  key={item.id}
                  item={item}
                  onItemClick={handleItemClick}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="hidden md:block">{actions}</div>

          {/* Mobile menu button */}
          {showMobileMenu && (
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMobileMenuToggle}
                className="inline-flex items-center justify-center p-2"
                aria-label="Toggle mobile menu"
              >
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 dark:border-gray-700">
              {items.map((item) => (
                <NavBarItem
                  key={item.id}
                  item={item}
                  isMobile={true}
                  onItemClick={handleItemClick}
                />
              ))}

              {/* Mobile Actions */}
              {actions && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  {actions}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
