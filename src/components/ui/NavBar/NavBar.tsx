import type { ReactNode } from "react";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "../Button";
import { prefetchOnHover } from "../../../navigation/prefetch-utils";
export interface NavBarItem {
  /** Unique identifier for the nav item */
  id: string;
  /** Display label for the nav item */
  label: string;
  /** Optional icon (React component or string) */
  icon?: ReactNode;
  /** Click handler for the nav item */
  onClick?: () => void;
  /** Optional href for navigation (used for hover prefetch and a11y) */
  href?: string;
  /** Optional importer to prefetch on hover */
  importer?: () => Promise<unknown>;
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
// NavBar styles leveraging semantic surface + token utilities
const getNavBarStyles = (sticky: boolean) => {
  const base = `surface-nav w-full transition-all duration-200 ease-in-out backdrop-blur-xs`;
  const stickyStyles = sticky ? "sticky top-0 z-40 shadow-sm" : "";
  return `${base} ${stickyStyles}`;
};
const getNavItemStyles = (item: NavBarItem) => {
  let classes = `nav-item-base`;
  if (item.disabled) classes += " nav-item-disabled";
  if (item.active) classes += " nav-item-active";
  return classes;
};
const getBadgeStyles = () => {
  return `
    absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-medium rounded-full
    bg-text-primary text-surface-primary
  `;
};
const NavBarItemComponent: React.FC<{
  item: NavBarItem;
  isMobile?: boolean;
  onItemClick?: (item: NavBarItem) => void;
}> = ({ item, isMobile = false, onItemClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const anchorRef = useRef<HTMLAnchorElement | HTMLDivElement | null>(null);
  const location = useLocation?.();
  useEffect(() => {
    const enabled = String(import.meta.env.VITE_PREFETCH_ROUTES) === "true";
    if (!enabled || !item.importer || !anchorRef.current) return;
    prefetchOnHover(anchorRef.current, item.importer);
  }, [item.importer]);
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
  const isActive =
    item.active ?? (item.href ? location?.pathname === item.href : false);

  return (
    <div className={`relative ${isMobile ? "block" : "inline-block"}`}>
      {item.href && !hasDropdown ? (
        <a
          ref={anchorRef as React.RefObject<HTMLAnchorElement>}
          href={item.href}
          className={getNavItemStyles({ ...item, active: isActive })}
          aria-current={isActive ? "page" : undefined}
          aria-disabled={item.disabled}
          onClick={(e) => {
            if (item.disabled) {
              e.preventDefault();
              return;
            }
            item.onClick?.();
            onItemClick?.(item);
          }}
        >
          {item.icon && <span className="mr-2 flex-shrink-0">{item.icon}</span>}
          <span>{item.label}</span>
          {item.badge && <span className={getBadgeStyles()}>{item.badge}</span>}
        </a>
      ) : (
        <div
          ref={anchorRef as React.RefObject<HTMLDivElement>}
          role="button"
          tabIndex={0}
          aria-disabled={item.disabled}
          className={getNavItemStyles({ ...item, active: isActive })}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleClick();
          }}
        >
          {item.icon && <span className="mr-2 flex-shrink-0">{item.icon}</span>}
          <span>{item.label}</span>
          {hasDropdown && (
            <svg
              className={`ml-0.5 h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
      )}
      {/* Dropdown Menu */}
      {hasDropdown && isDropdownOpen && (
        <div
          className={`
          ${isMobile ? "ml-4 mt-1" : "absolute left-0 mt-2 w-48"}
          surface-card rounded-md shadow-lg z-50
        `}
        >
          {item.children?.map((childItem, index) => (
            <div
              key={childItem.id || `child-${index}`}
              className={`
                block px-4 py-2 text-sm cursor-pointer
                ${
                  childItem.disabled
                    ? "text-text-secondary"
                    : "text-text-primary surface-subtle-hover dark:hover:bg-text-tertiary dark:hover:text-surface-primary"
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
  const mergedActions = actions ? (
    <div className="flex items-center gap-2">{actions}</div>
  ) : null;
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
      <div className="w-full bc-container-padding">
        <div className="flex justify-between items-center h-16">
          {/* Brand/Logo */}
          {brand && <div className="flex-shrink-0">{brand}</div>}
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {items.map((item) => (
                <NavBarItemComponent
                  key={`desktop-${item.id}`}
                  item={item}
                  onItemClick={handleItemClick}
                />
              ))}
            </div>
          </div>
          {/* Actions */}
          <div className="hidden md:block">{mergedActions}</div>
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
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {items.map((item) => (
                <NavBarItemComponent
                  key={`mobile-${item.id}`}
                  item={item}
                  isMobile={true}
                  onItemClick={handleItemClick}
                />
              ))}
              {/* Mobile Actions */}
              <div className="pt-4">{mergedActions}</div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
