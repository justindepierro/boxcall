import type { ReactNode } from "react";
import React, { useEffect, useRef } from "react";
import { Button } from "../Button";
export interface SidebarItem {
  /** Unique identifier for the sidebar item */
  id: string;
  /** Display label for the sidebar item */
  label: string;
  /** Optional icon (React component or string) */
  icon?: ReactNode;
  /** Click handler for the sidebar item */
  onClick?: () => void;
  /** Whether the item is active/selected */
  active?: boolean;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Optional badge/counter */
  badge?: string | number;
  /** Nested sidebar items */
  children?: SidebarItem[];
  /** Whether to show as a divider */
  divider?: boolean;
}
export interface SidebarProps {
  /** Sidebar items */
  items: SidebarItem[];
  /** Whether the sidebar is open */
  isOpen: boolean;
  /** Function to close the sidebar */
  onClose?: () => void;
  /** Optional header content */
  header?: ReactNode;
  /** Optional footer content */
  footer?: ReactNode;
  /** Width of the sidebar when open */
  width?: "sm" | "md" | "lg";
  /** Whether to show overlay on mobile */
  showOverlay?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Position of the sidebar */
  position?: "left" | "right";
}
const getSidebarWidth = (width: SidebarProps["width"]) => {
  switch (width) {
    case "sm":
      return "w-64";
    case "md":
      return "w-80";
    case "lg":
      return "w-96";
    default:
      return "w-64";
  }
};
const getSidebarPosition = (
  position: SidebarProps["position"],
  isOpen: boolean
) => {
  const baseTransform =
    position === "right" ? "translate-x-full" : "-translate-x-full";
  const openTransform = "translate-x-0";
  return `
    ${position === "right" ? "right-0" : "left-0"}
    transform transition-transform duration-300 ease-in-out
    ${isOpen ? openTransform : baseTransform}
  `;
};
const getSidebarStyles = () => {
  return `
    fixed top-0 bottom-0 z-50 flex flex-col
    bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700
    border-r shadow-lg
  `;
};
const getSidebarItemStyles = (item: SidebarItem, level: number = 0) => {
  const paddingLeft = level > 0 ? `pl-${4 + level * 4}` : "pl-4";
  const baseStyles = `
    flex items-center px-4 py-3 text-sm font-medium cursor-pointer
    transition-colors duration-200 ease-in-out
    ${paddingLeft}
  `;
  if (item.divider) {
    return `border-t border-gray-200 dark:border-gray-700 my-2`;
  }
  if (item.disabled) {
    return `${baseStyles} text-gray-400 dark:text-gray-500 cursor-not-allowed`;
  }
  if (item.active) {
    return `${baseStyles} bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-white border-r-2 border-jade-600`;
  }
  return `${baseStyles} text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white`;
};
const getBadgeStyles = () => {
  return `
    ml-auto px-2 py-0.5 text-xs font-medium rounded-full
    bg-jade-600 dark:bg-jade-600 text-white
  `;
};
const SidebarItem: React.FC<{
  item: SidebarItem;
  level?: number;
  onItemClick?: (item: SidebarItem) => void;
}> = ({ item, level = 0, onItemClick }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  if (item.divider) {
    return <div className={getSidebarItemStyles(item, level)} />;
  }
  const handleClick = () => {
    if (item.disabled) return;
    if (item.children && item.children.length > 0) {
      setIsExpanded(!isExpanded);
    } else {
      item.onClick?.();
      onItemClick?.(item);
    }
  };
  const hasChildren = item.children && item.children.length > 0;
  return (
    <div>
      <div className={getSidebarItemStyles(item, level)} onClick={handleClick}>
        {/* Icon area with fixed width for alignment */}
        <div className="flex items-center justify-start w-9 flex-shrink-0">
          {item.icon && item.icon}
        </div>
        <span className="flex-1 text-left">{item.label}</span>
        {item.badge && <span className={getBadgeStyles()}>{item.badge}</span>}
        {hasChildren && (
          <svg
            className={`ml-2 h-4 w-4 transition-transform duration-200 ${
              isExpanded ? "rotate-90" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        )}
      </div>
      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {item.children?.map((childItem) => (
            <SidebarItem
              key={childItem.id}
              item={childItem}
              level={level + 1}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};
export const Sidebar: React.FC<SidebarProps> = ({
  items,
  isOpen,
  onClose,
  header,
  footer,
  width = "md",
  showOverlay = true,
  className = "",
  position = "left",
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  // Close sidebar when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);
  // Close sidebar on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);
  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  const handleItemClick = () => {
    // Close sidebar when item is clicked (for mobile)
    if (window.innerWidth < 768) {
      onClose?.();
    }
  };
  if (!isOpen) return null;
  return (
    <>
      {/* Overlay */}
      {showOverlay && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70"
          onClick={onClose}
        />
      )}
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`
          ${getSidebarStyles()}
          ${getSidebarWidth(width)}
          ${getSidebarPosition(position, isOpen)}
          ${className}
        `}
      >
        {/* Header */}
        {header && (
          <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">{header}</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="ml-4 p-1"
                aria-label="Close sidebar"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>
          </div>
        )}
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <nav className="py-4">
            {items.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                onItemClick={handleItemClick}
              />
            ))}
          </nav>
        </div>
        {/* Footer */}
        {footer && (
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            {footer}
          </div>
        )}
      </div>
    </>
  );
};
