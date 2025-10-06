import type { ReactNode } from "react";
import React, { useEffect, useRef } from "react";
import { Button } from "../Button";
import { Tooltip } from "../Tooltip/Tooltip";
import { Icon } from "../Icon/Icon";
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
  /** Function to toggle the sidebar */
  onToggle?: () => void;
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
  /** Whether the sidebar is loading */
  loading?: boolean;
  /** Whether the main header is visible (to adjust sidebar position) */
  headerVisible?: boolean;
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
const getSidebarStyles = (headerVisible: boolean) => {
  const topPosition = headerVisible ? "top-16" : "top-0";
  return `
    fixed ${topPosition} bottom-0 z-[50] flex flex-col
    bg-surface-primary/95 dark:bg-surface-secondary/95
    shadow-2xl backdrop-blur-md
    transform transition-all duration-300 ease-out
    motion-reduce:transition-none motion-reduce:transform-none
  `;
};
const getSidebarItemStyles = (item: SidebarItem, level: number = 0) => {
  const paddingLeft = level > 0 ? `pl-${4 + level * 4}` : "pl-4";
  const baseStyles = `
    flex items-center ${paddingLeft} py-3 text-sm font-medium cursor-pointer
    transition-all duration-200 ease-in-out rounded-lg mx-2 my-1
    focus:outline-none focus:ring-2 focus:ring-jade-400 focus:ring-inset
    motion-reduce:transition-none
    active:scale-[0.98] active:transition-transform duration-75
  `;
  if (item.divider) {
    return `my-2`;
  }
  if (item.disabled) {
    return `${baseStyles} text-text-tertiary dark:text-text-tertiary cursor-not-allowed opacity-50`;
  }
  if (item.active) {
    // Enhanced active state with better contrast and modern styling
    return `${baseStyles} bg-jade-50 dark:bg-jade-900/30 text-jade-700 dark:text-jade-300 border-l-4 border-jade-500 shadow-sm`;
  }
  return `${baseStyles} text-text-secondary dark:text-text-secondary hover:bg-surface-hover dark:hover:bg-surface-hover hover:text-text-primary dark:hover:text-text-primary hover:shadow-sm`;
};
const getBadgeStyles = () => {
  return `
    ml-auto px-2 py-0.5 text-xs font-medium rounded-full
    bg-jade-600 dark:bg-jade-600 text-surface-primary
  `;
};
const SidebarItemComponent: React.FC<{
  item: SidebarItem;
  level?: number;
  onItemClick?: (item: SidebarItem) => void;
  index?: number;
}> = ({ item, level = 0, onItemClick, index = 0 }) => {
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
    <div
      className={`animate-in fade-in slide-in-from-left-4 duration-300 motion-reduce:animate-none`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
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
            <SidebarItemComponent
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
  onToggle,
  header,
  footer,
  width = "md",
  showOverlay = true,
  className = "",
  position = "left",
  loading = false,
  headerVisible = true,
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [previouslyFocusedElement, setPreviouslyFocusedElement] =
    React.useState<Element | null>(null);

  // Filter items based on search query
  const filteredItems = React.useMemo(() => {
    if (!searchQuery.trim()) return items;
    return items.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Touch event handlers for swipe gestures
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Close sidebar on swipe left (for left-positioned sidebar) or swipe right (for right-positioned sidebar)
    if (
      (position === "left" && isLeftSwipe) ||
      (position === "right" && isRightSwipe)
    ) {
      onClose?.();
    }
  };
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
  // Focus management for accessibility
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      setPreviouslyFocusedElement(document.activeElement);
      // Focus the sidebar when it opens
      setTimeout(() => sidebarRef.current?.focus(), 100);
    } else if (
      previouslyFocusedElement &&
      previouslyFocusedElement instanceof HTMLElement
    ) {
      // Restore focus when sidebar closes
      setTimeout(() => previouslyFocusedElement.focus(), 100);
    }
  }, [isOpen, previouslyFocusedElement]);

  // Enhanced keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
        return;
      }

      // Tab trapping - keep focus within sidebar
      if (event.key === "Tab") {
        const focusableElements = sidebarRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements && focusableElements.length > 0) {
          const elements = Array.from(focusableElements) as HTMLElement[];
          const firstElement = elements[0];
          const lastElement = elements[elements.length - 1];

          if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        }
        return;
      }

      // Arrow key navigation for sidebar items
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const focusableElements = sidebarRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements) {
          const elements = Array.from(focusableElements) as HTMLElement[];
          const currentIndex = elements.findIndex(
            (el) => el === document.activeElement
          );
          let nextIndex;
          if (event.key === "ArrowDown") {
            nextIndex =
              currentIndex < elements.length - 1 ? currentIndex + 1 : 0;
          } else {
            nextIndex =
              currentIndex > 0 ? currentIndex - 1 : elements.length - 1;
          }
          elements[nextIndex]?.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Note: Body scroll is NOT prevented to allow scrolling with sidebar open
  // The sidebar itself is scrollable via overflow-y-auto

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
          className="fixed inset-0 top-16 z-[40] bg-text-primary/50 dark:bg-text-primary/70 transition-opacity duration-300 ease-out motion-reduce:transition-none"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`
          ${getSidebarStyles(headerVisible)}
          ${getSidebarWidth(width)}
          ${getSidebarPosition(position, isOpen)}
          ${className}
          ${isOpen ? "animate-in slide-in-from-left duration-300" : ""}
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        tabIndex={-1}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Header - Only show when main header is hidden (scrolled down) */}
        {!headerVisible && (
          <div className="px-4 py-4 divider-b">
            <div className="flex items-center gap-3">
              {onToggle && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={onToggle}
                  className="!p-spacing-sm rounded-radius-md flex-shrink-0"
                  aria-label="Toggle menu"
                >
                  <Icon name="menu" size="md" />
                </Button>
              )}
              {header && <div className="flex-1 min-w-0">{header}</div>}
              <Tooltip content="Close sidebar (Esc)">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="p-2 hover:bg-surface-hover rounded-lg transition-colors duration-200 flex-shrink-0"
                  aria-label="Close sidebar"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </Tooltip>
            </div>
          </div>
        )}
        {/* Content */}
        <div
          className="flex-1 overflow-y-auto focus-scroll scrollbar-thin scrollbar-thumb-surface-hover scrollbar-track-transparent"
          role="navigation"
          aria-label="Primary navigation"
          tabIndex={0}
        >
          {/* Search */}
          {items.length > 5 && (
            <div className="px-4 py-3">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search navigation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-surface-secondary dark:bg-surface-muted rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-jade-400 focus:border-transparent transition-colors duration-200"
                  aria-label="Search navigation items"
                />
              </div>
            </div>
          )}
          <nav className="py-4">
            {loading ? (
              // Skeleton loading state
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="mx-2 my-1 px-4 py-3 rounded-lg animate-pulse"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-4 bg-surface-hover rounded"></div>
                    <div className="flex-1 h-4 bg-surface-hover rounded"></div>
                  </div>
                </div>
              ))
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <SidebarItemComponent
                  key={item.id}
                  item={item}
                  index={index}
                  onItemClick={handleItemClick}
                />
              ))
            ) : searchQuery ? (
              <div className="px-4 py-8 text-center text-text-muted">
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-text-tertiary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="text-sm">No items found for "{searchQuery}"</p>
              </div>
            ) : null}
          </nav>
        </div>
        {/* Footer */}
        {footer && <div className="px-4 py-4">{footer}</div>}
      </div>
    </>
  );
};
