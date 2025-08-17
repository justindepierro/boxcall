import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../Button";
import { useSidebarState } from "../../../hooks/useSidebarState";
import { Link, useLocation } from "react-router-dom";
import { Tooltip } from "../Tooltip/Tooltip";
import { UserPreferencesService } from "../../../services/userPreferencesService";

import type { ReactNode } from "react";

export interface SidebarItem {
  /** Unique identifier for the sidebar item */
  id: string;
  /** Display label for the sidebar item */
  label: string;
  /** Optional href for navigation */
  href?: string;
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
  surface-nav border-subtle
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
    return `border-t border-subtle dark:border-gray-700 my-2`;
  }
  if (item.disabled) {
    return `${baseStyles} text-gray-400 dark:text-gray-500 cursor-not-allowed`;
  }
  if (item.active) {
    // Strengthened active contrast (previously blue-50 background with blue-700 text could blend into light surfaces)
    return `${baseStyles} bg-brand-navy text-white dark:bg-gray-700 dark:text-white border-r-2 border-brand-jade-dark`;
  }
  return `${baseStyles} text-text-secondary dark:text-text-secondary surface-subtle-hover dark:hover:bg-gray-700 hover:text-text-primary dark:hover:text-text-inverse`;
};
const getBadgeStyles = () => {
  return `
    ml-auto px-2 py-0.5 text-xs font-medium rounded-full
    bg-jade-600 dark:bg-jade-600 text-white
  `;
};
// (Legacy nested SidebarItem component removed; main Sidebar renders items directly)
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
  const state = useSidebarState();
  const { pathname } = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [focusIndex, setFocusIndex] = useState<number>(0);
  const itemRefs = useRef<(HTMLAnchorElement | HTMLDivElement | null)[]>([]);
  const showTooltips = UserPreferencesService.loadPreferences().ui.showTooltips;
  const pinnedIds = useMemo(() => new Set(state.favorites), [state.favorites]);
  const pinnedItems = useMemo(
    () => items.filter((it) => pinnedIds.has(it.id) && !it.divider && !it.disabled),
    [items, pinnedIds]
  );
  const mainItems = useMemo(
    () => items.filter((it) => !pinnedIds.has(it.id)),
    [items, pinnedIds]
  );

  // Build a list of focusable indices aligned with rendered MAIN items (skip dividers/disabled)
  const focusableMap = useMemo(() => {
    let idx = 0;
    return mainItems.map((it) => {
      const isFocusable = !it.divider && !it.disabled;
      return isFocusable ? idx++ : -1;
    });
  }, [mainItems]);

  // Initialize focus index to active item when possible
  useEffect(() => {
    const activeIdx = mainItems.findIndex((it) => (it.href ? pathname === it.href : it.active));
    if (activeIdx >= 0 && focusableMap[activeIdx] >= 0) {
      setFocusIndex(focusableMap[activeIdx]);
    } else {
      // default to first focusable
      const firstFocusable = focusableMap.findIndex((n) => n === 0);
      if (firstFocusable >= 0) setFocusIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, mainItems]);
  // Auto-expand parent groups when current route is within them (if using groups)
  useEffect(() => {
    // Expand any item whose href is a prefix of the current path
    items.forEach((it) => {
      if (it.children && it.children.length > 0) {
        const anyChildActive = it.children.some((c) => c.href && pathname.startsWith(c.href));
        if (anyChildActive) {
          // Best effort: if ids represent groups, ensure expanded
          state.expand?.(it.id);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
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

  // Keyboard navigation for menu (roving tabindex)
  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    const maxIndex = Math.max(0, focusableMap.filter((n) => n >= 0).length - 1);
    const move = (to: number) => {
      const clamped = Math.min(maxIndex, Math.max(0, to));
      setFocusIndex(clamped);
      requestAnimationFrame(() => itemRefs.current[clamped]?.focus());
    };
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        move(focusIndex + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        move(focusIndex - 1);
        break;
      case "Home":
        e.preventDefault();
        move(0);
        break;
      case "End":
        e.preventDefault();
        move(maxIndex);
        break;
      case "Enter":
      case " ": // Space
        {
          const el = itemRefs.current[focusIndex];
          if (el) {
            e.preventDefault();
            (el as HTMLElement).click();
          }
        }
        break;
      default:
        break;
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
        data-mode={state.mode}
      >
        {/* Header */}
        {header && (
          <div className="px-4 py-4 border-b border-subtle dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">{header}</div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={state.toggleMode}
                  aria-pressed={state.mode === "rail"}
                  aria-label={state.mode === "rail" ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {state.mode === "rail" ? "Expand" : "Collapse"}
                </Button>
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
          </div>
        )}
        {/* Content */}
        <div
          className="flex-1 overflow-y-auto focus-scroll"
          role="navigation"
          aria-label="Primary navigation"
          tabIndex={-1}
          onKeyDown={onKeyDown}
        >
          <nav className="py-4" role="menubar" aria-orientation="vertical">
            {pinnedItems.length > 0 && (
              <div className="mb-2">
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                  Pinned
                </div>
                {pinnedItems.map((item) => {
                  const isActive = item.href ? pathname === item.href : !!item.active;
                  const styledItem = { ...item, active: isActive } as SidebarItem;
                  // compute focus map index based on main focus list start at 0; keep pinned non-roving for now
                  const focusKey = -1;
                  return (
                    <div key={`pinned-${item.id}`} className="px-2">
                      {item.href ? (
                        <Tooltip
                          content={item.label}
                          disabled={state.mode !== "rail" || !showTooltips}
                          placement="right"
                        >
                          <Link
                            to={item.href}
                            className={getSidebarItemStyles(styledItem)}
                            role="menuitem"
                            aria-current={isActive ? "page" : undefined}
                            title={undefined}
                            tabIndex={focusKey >= 0 ? (focusIndex === focusKey ? 0 : -1) : -1}
                            onClick={() => handleItemClick()}
                          >
                            <div className="flex items-center justify-start w-9 flex-shrink-0">
                              {item.icon}
                            </div>
                            {state.mode !== "rail" && (
                              <>
                                <span className="flex-1 text-left">{item.label}</span>
                                {item.badge && (
                                  <span className={getBadgeStyles()}>{item.badge}</span>
                                )}
                                {/* Unpin control */}
                                <Tooltip content="Unpin" disabled={!showTooltips} placement="left">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    aria-label="Unpin"
                                    aria-pressed={true}
                                    className="ml-2 px-1 text-jade-600 hover:text-jade-700"
                                    tabIndex={-1}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      state.toggleFavorite(item.id);
                                    }}
                                  >
                                    ★
                                  </Button>
                                </Tooltip>
                              </>
                            )}
                          </Link>
                        </Tooltip>
                      ) : (
                        <Tooltip content={item.label} disabled={state.mode !== "rail" || !showTooltips} placement="right">
                          <div
                            className={getSidebarItemStyles(styledItem)}
                            role="menuitem"
                            aria-current={isActive ? "page" : undefined}
                            title={undefined}
                            tabIndex={-1}
                          >
                            <div className="flex items-center justify-start w-9 flex-shrink-0">
                              {item.icon}
                            </div>
                            {state.mode !== "rail" && (
                              <>
                                <span className="flex-1 text-left">{item.label}</span>
                                {item.badge && (
                                  <span className={getBadgeStyles()}>{item.badge}</span>
                                )}
                                <Tooltip content="Unpin" disabled={!showTooltips} placement="left">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    aria-label="Unpin"
                                    aria-pressed={true}
                                    className="ml-2 px-1 text-jade-600 hover:text-jade-700"
                                    tabIndex={-1}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      state.toggleFavorite(item.id);
                                    }}
                                  >
                                    ★
                                  </Button>
                                </Tooltip>
                              </>
                            )}
                          </div>
                        </Tooltip>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {mainItems.map((item, i) => {
              const isActive = item.href ? pathname === item.href : !!item.active;
              const styledItem = { ...item, active: isActive } as SidebarItem;
              const focusKey = focusableMap[i];
              return (
              <div key={item.id} className="px-2">
                {item.href ? (
                  <Tooltip
                    content={item.label}
                    disabled={state.mode !== "rail" || !showTooltips}
                    placement="right"
                  >
                    <Link
                    to={item.href}
                    className={getSidebarItemStyles(styledItem)}
                    role="menuitem"
                    aria-current={isActive ? "page" : undefined}
                      title={undefined}
                    tabIndex={focusKey >= 0 ? (focusIndex === focusKey ? 0 : -1) : -1}
                    ref={(el) => {
                      if (focusKey >= 0) itemRefs.current[focusKey] = el;
                    }}
                    onClick={() => handleItemClick()}
                  >
                    <div className="flex items-center justify-start w-9 flex-shrink-0">
                      {item.icon}
                    </div>
                    {state.mode !== "rail" && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span className={getBadgeStyles()}>{item.badge}</span>
                        )}
                        {/* Pin/Unpin control */}
                        <Tooltip content={pinnedIds.has(item.id) ? "Unpin" : "Pin"} disabled={!showTooltips} placement="left">
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={pinnedIds.has(item.id) ? "Unpin" : "Pin"}
                            aria-pressed={pinnedIds.has(item.id)}
                            className={`ml-2 px-1 ${pinnedIds.has(item.id) ? "text-jade-600" : "text-text-tertiary"} hover:text-jade-700`}
                            tabIndex={-1}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              state.toggleFavorite(item.id);
                            }}
                          >
                            ★
                          </Button>
                        </Tooltip>
                      </>
                    )}
                    </Link>
                  </Tooltip>
                ) : (
                  <Tooltip content={item.label} disabled={state.mode !== "rail" || !showTooltips} placement="right">
                    <div
                      className={getSidebarItemStyles(styledItem)}
                      role="menuitem"
                      aria-current={isActive ? "page" : undefined}
                      title={undefined}
                      tabIndex={focusKey >= 0 ? (focusIndex === focusKey ? 0 : -1) : -1}
                      ref={(el) => {
                        if (focusKey >= 0) itemRefs.current[focusKey] = el;
                      }}
                    >
                      <div className="flex items-center justify-start w-9 flex-shrink-0">
                        {item.icon}
                      </div>
                      {state.mode !== "rail" && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge && (
                            <span className={getBadgeStyles()}>{item.badge}</span>
                          )}
                          <Tooltip content={pinnedIds.has(item.id) ? "Unpin" : "Pin"} disabled={!showTooltips} placement="left">
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={pinnedIds.has(item.id) ? "Unpin" : "Pin"}
                              aria-pressed={pinnedIds.has(item.id)}
                              className={`ml-2 px-1 ${pinnedIds.has(item.id) ? "text-jade-600" : "text-text-tertiary"} hover:text-jade-700`}
                              tabIndex={-1}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                state.toggleFavorite(item.id);
                              }}
                            >
                              ★
                            </Button>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </Tooltip>
                )}
              </div>
              );
            })}
          </nav>
        </div>
        {/* Footer */}
        {footer && (
          <div className="px-4 py-4 border-t border-subtle dark:border-gray-700">
            {footer}
          </div>
        )}
      </div>
    </>
  );
};
