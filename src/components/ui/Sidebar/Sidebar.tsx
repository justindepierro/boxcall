import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../Button";
import { useSidebarState } from "../../../hooks/useSidebarState";
import { Link, useLocation } from "react-router-dom";
import { Tooltip } from "../Tooltip/Tooltip";
import { Icon } from "../Icon/Icon";
import { getSidebarIcon } from "./getSidebarIcon";
import { UserPreferencesService } from "../../../services/userPreferencesService";
import { GestureDetector } from "../../../utils/touchUtils";

import type { ReactNode } from "react";
import {
  getSidebarWidth,
  getSidebarPosition,
  getSidebarStyles,
  getSidebarItemStyles,
  getBadgeStyles,
} from "./sidebarUtils";

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
// ...existing code...
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
  const previouslyFocusedRef = useRef<Element | null>(null);
  const [focusIndex, setFocusIndex] = useState<number>(0);
  const itemRefs = useRef<(HTMLAnchorElement | HTMLDivElement | null)[]>([]);
  // Read once to avoid re-reading preferences on every render
  const [showTooltips] = useState(
    () => UserPreferencesService.loadPreferences().ui.showTooltips
  );
  // Simplified: just use all items without pinning
  const mainItems = items;

  // For backwards compatibility, add empty pinned items and IDs
  const pinnedItems: SidebarItem[] = [];
  const pinnedIds = new Set<string>();

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
    const activeIdx = mainItems.findIndex((it) =>
      it.href ? pathname === it.href : it.active
    );
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
        const anyChildActive = it.children.some(
          (c) => c.href && pathname.startsWith(c.href)
        );
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

  // Focus management: save previously focused element, auto-focus first menuitem, and trap focus while open
  useEffect(() => {
    if (!isOpen) {
      // restore focus if possible when closing
      const toRestore = previouslyFocusedRef.current as HTMLElement | null;
      if (toRestore && typeof toRestore.focus === "function") {
        // Delay to allow unmount
        setTimeout(() => toRestore.focus(), 0);
      }
      return;
    }
    // record previously focused
    previouslyFocusedRef.current = document.activeElement;

    const container = sidebarRef.current;
    if (!container) return;

    // Helper to get tabbable elements within the sidebar
    const getTabbables = (): HTMLElement[] => {
      const nodes = container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      return Array.from(nodes).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
    };

    // Try to focus the current roving item (tabIndex=0 menuitem); else first tabbable in the drawer
    const rovingTarget = container.querySelector<HTMLElement>(
      '[role="menuitem"][tabindex="0"]'
    );
    const initialFocus = rovingTarget || getTabbables()[0];
    if (initialFocus && typeof initialFocus.focus === "function") {
      // Defer to next frame so layout classes apply
      requestAnimationFrame(() => initialFocus.focus());
    }

    // Focus trap: cycle Tab within the drawer
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const tabbables = getTabbables();
      if (tabbables.length === 0) return;
      const first = tabbables[0];
      const last = tabbables[tabbables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || !container.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);
  const handleItemClick = React.useCallback(() => {
    // Close sidebar when item is clicked (for mobile)
    if (window.innerWidth < 768) {
      onClose?.();
    }
  }, [onClose]);

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
  useEffect(() => {
    if (!isOpen || !showOverlay) return;
    let startX = 0,
      startY = 0,
      startTime = 0;
    const overlay = document.querySelector('[data-testid="sidebar-overlay"]');
    if (!overlay) return;
    // Use generic EventListener and cast to TouchEvent
    const handleTouchStart = (e: Event) => {
      const te = e as TouchEvent;
      if (te.touches.length === 1) {
        startX = te.touches[0].clientX;
        startY = te.touches[0].clientY;
        startTime = te.timeStamp;
      }
    };
    const handleTouchEnd = (e: Event) => {
      const te = e as TouchEvent;
      if (te.changedTouches.length === 1) {
        const endX = te.changedTouches[0].clientX;
        const endY = te.changedTouches[0].clientY;
        const endTime = te.timeStamp;
        const result = GestureDetector.detectSwipe(
          startX,
          startY,
          endX,
          endY,
          startTime,
          endTime
        );
        // Only close sidebar on swipe left (LTR) or right (RTL)
        if (result.direction === "left" && position === "left") {
          onClose?.();
        }
        if (result.direction === "right" && position === "right") {
          onClose?.();
        }
      }
    };
    overlay.addEventListener("touchstart", handleTouchStart as EventListener);
    overlay.addEventListener("touchend", handleTouchEnd as EventListener);
    return () => {
      overlay.removeEventListener(
        "touchstart",
        handleTouchStart as EventListener
      );
      overlay.removeEventListener("touchend", handleTouchEnd as EventListener);
    };
  }, [isOpen, showOverlay, position, onClose]);
  if (!isOpen) return null;
  return (
    <>
      {/* Overlay */}
      {showOverlay && (
        <div
          data-testid="sidebar-overlay"
          className="fixed inset-0 z-40 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 backdrop-blur-[1px] transition-opacity motion-reduce:transition-none"
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
        role="dialog"
        aria-modal="true"
        aria-label="Sidebar navigation"
        aria-labelledby={header ? "sidebar-title" : undefined}
        data-testid="sidebar-panel"
        data-mode={state.mode}
      >
        {/* Header */}
        {header && (
          <div className="px-4 py-3 border-b border-subtle bg-[var(--semantic-bg-primary)]/80 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="flex-1" id="sidebar-title">
                {header}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={state.toggleMode}
                  aria-pressed={state.mode === "rail"}
                  aria-label={
                    state.mode === "rail"
                      ? "Expand sidebar"
                      : "Collapse sidebar"
                  }
                  className="p-2"
                >
                  <Icon
                    name={
                      state.mode === "rail" ? "chevron-right" : "chevron-left"
                    }
                    size="sm"
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="p-2"
                  aria-label="Close sidebar"
                >
                  <Icon name="close" size="sm" />
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
          <nav className="py-3 px-2" role="menubar" aria-orientation="vertical">
            {pinnedItems.length > 0 && (
              <div className="mb-2">
                <div
                  className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted"
                  aria-hidden="true"
                >
                  Pinned
                </div>
                {pinnedItems.map((item) => {
                  const isActive = item.href
                    ? pathname === item.href
                    : !!item.active;
                  const styledItem = {
                    ...item,
                    active: isActive,
                  } as SidebarItem;
                  // compute focus map index based on main focus list start at 0; keep pinned non-roving for now
                  const focusKey = -1;
                  return (
                    <div key={`pinned-${item.id}`} className="px-1">
                      {item.href ? (
                        <Tooltip
                          content={item.label}
                          disabled={state.mode !== "rail" || !showTooltips}
                          placement="right"
                        >
                          <Link
                            to={item.href}
                            className={`${getSidebarItemStyles(styledItem)} relative`}
                            role="menuitem"
                            aria-current={isActive ? "page" : undefined}
                            title={undefined}
                            tabIndex={
                              focusKey >= 0
                                ? focusIndex === focusKey
                                  ? 0
                                  : -1
                                : -1
                            }
                            onClick={() => handleItemClick()}
                          >
                            <div
                              className={`flex items-center justify-start w-9 flex-shrink-0 ${state.mode === "rail" ? "justify-center w-10" : ""}`}
                              aria-hidden
                            >
                              {getSidebarIcon(item.icon)}
                            </div>
                            {state.mode !== "rail" && (
                              <>
                                <span className="flex-1 text-left">
                                  {item.label}
                                </span>
                                {item.badge && (
                                  <span
                                    className={getBadgeStyles()}
                                    style={{
                                      backgroundColor:
                                        "var(--semantic-primary)",
                                      color: "var(--semantic-text-inverse)",
                                    }}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                                {/* Unpin control */}
                                <Tooltip
                                  content="Unpin"
                                  disabled={!showTooltips}
                                  placement="left"
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    aria-label={`Unpin ${item.label}`}
                                    aria-pressed={true}
                                    className="ml-2 px-1 text-[color:var(--semantic-text-brand)] hover:text-[color:var(--semantic-primary-hover)] focus:text-[color:var(--semantic-primary-hover)] opacity-80 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                    tabIndex={-1}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      state.toggleFavorite(item.id);
                                    }}
                                  >
                                    <Icon name="star" size="sm" aria-hidden />
                                  </Button>
                                </Tooltip>
                              </>
                            )}
                          </Link>
                        </Tooltip>
                      ) : (
                        <Tooltip
                          content={item.label}
                          disabled={state.mode !== "rail" || !showTooltips}
                          placement="right"
                        >
                          <div
                            className={`${getSidebarItemStyles(styledItem)} relative`}
                            role="menuitem"
                            aria-current={isActive ? "page" : undefined}
                            title={undefined}
                            tabIndex={-1}
                          >
                            <div
                              className={`flex items-center justify-start w-9 flex-shrink-0 ${state.mode === "rail" ? "justify-center w-10" : ""}`}
                              aria-hidden
                            >
                              {getSidebarIcon(item.icon)}
                            </div>
                            {state.mode !== "rail" && (
                              <>
                                <span className="flex-1 text-left">
                                  {item.label}
                                </span>
                                {item.badge && (
                                  <span
                                    className={getBadgeStyles()}
                                    style={{
                                      backgroundColor:
                                        "var(--semantic-primary)",
                                      color: "var(--semantic-text-inverse)",
                                    }}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                                <Tooltip
                                  content="Unpin"
                                  disabled={!showTooltips}
                                  placement="left"
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    aria-label={`Unpin ${item.label}`}
                                    aria-pressed={true}
                                    className="ml-2 px-1 text-[color:var(--semantic-text-brand)] hover:text-[color:var(--semantic-primary-hover)] opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                    tabIndex={-1}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      state.toggleFavorite(item.id);
                                    }}
                                  >
                                    <Icon name="star" size="sm" aria-hidden />
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
              const isActive = item.href
                ? pathname === item.href
                : !!item.active;
              const styledItem = { ...item, active: isActive } as SidebarItem;
              const focusKey = focusableMap[i];
              return (
                <div key={item.id} className="px-1">
                  {item.href ? (
                    <Tooltip
                      content={item.label}
                      disabled={state.mode !== "rail" || !showTooltips}
                      placement="right"
                    >
                      <Link
                        to={item.href}
                        className={`${getSidebarItemStyles(styledItem)} relative`}
                        role="menuitem"
                        aria-current={isActive ? "page" : undefined}
                        title={undefined}
                        tabIndex={
                          focusKey >= 0
                            ? focusIndex === focusKey
                              ? 0
                              : -1
                            : -1
                        }
                        ref={(el) => {
                          if (focusKey >= 0) itemRefs.current[focusKey] = el;
                        }}
                        onClick={() => handleItemClick()}
                      >
                        <div
                          className={`flex items-center justify-start w-9 flex-shrink-0 ${state.mode === "rail" ? "justify-center w-10" : ""}`}
                          aria-hidden
                        >
                          {getSidebarIcon(item.icon)}
                        </div>
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge && (
                            <span
                              className={getBadgeStyles()}
                              style={{
                                backgroundColor: "var(--semantic-primary)",
                                color: "var(--semantic-text-inverse)",
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                          <Tooltip
                            content={pinnedIds.has(item.id) ? "Unpin" : "Pin"}
                            disabled={!showTooltips}
                            placement="left"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={
                                pinnedIds.has(item.id)
                                  ? `Unpin ${item.label}`
                                  : `Pin ${item.label}`
                              }
                              aria-pressed={pinnedIds.has(item.id)}
                              className={`ml-2 px-1 ${pinnedIds.has(item.id) ? "text-[color:var(--semantic-text-brand)]" : "text-text-secondary"} hover:text-[color:var(--semantic-primary-hover)] opacity-60 group-hover:opacity-100 focus:opacity-100 transition-opacity`}
                              tabIndex={-1}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                state.toggleFavorite(item.id);
                              }}
                            >
                              <Icon name="star" size="sm" aria-hidden />
                              <span className="text-left">
                                {pinnedIds.has(item.id) ? "Unpin" : "Pin"}
                              </span>
                            </Button>
                          </Tooltip>
                        </>
                      </Link>
                    </Tooltip>
                  ) : (
                    <Tooltip
                      content={item.label}
                      disabled={state.mode !== "rail" || !showTooltips}
                      placement="right"
                    >
                      <div
                        className={`${getSidebarItemStyles(styledItem)} relative`}
                        role="menuitem"
                        aria-current={isActive ? "page" : undefined}
                        title={undefined}
                        tabIndex={
                          focusKey >= 0
                            ? focusIndex === focusKey
                              ? 0
                              : -1
                            : -1
                        }
                        ref={(el) => {
                          if (focusKey >= 0) itemRefs.current[focusKey] = el;
                        }}
                      >
                        <div
                          className={`flex items-center justify-start w-9 flex-shrink-0 ${state.mode === "rail" ? "justify-center w-10" : ""}`}
                          aria-hidden
                        >
                          {getSidebarIcon(item.icon)}
                        </div>
                        {state.mode !== "rail" && (
                          <>
                            <span className="flex-1 text-left">
                              {item.label}
                            </span>
                            {item.badge && (
                              <span
                                className={getBadgeStyles()}
                                style={{
                                  backgroundColor: "var(--semantic-primary)",
                                  color: "var(--semantic-text-inverse)",
                                }}
                              >
                                {item.badge}
                              </span>
                            )}
                            <Tooltip
                              content={pinnedIds.has(item.id) ? "Unpin" : "Pin"}
                              disabled={!showTooltips}
                              placement="left"
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                aria-label={
                                  pinnedIds.has(item.id)
                                    ? `Unpin ${item.label}`
                                    : `Pin ${item.label}`
                                }
                                aria-pressed={pinnedIds.has(item.id)}
                                className={`ml-2 px-1 ${pinnedIds.has(item.id) ? "text-[color:var(--semantic-text-brand)]" : "text-text-secondary"} hover:text-[color:var(--semantic-primary-hover)] opacity-60 group-hover:opacity-100 focus:opacity-100 transition-opacity`}
                                tabIndex={-1}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  state.toggleFavorite(item.id);
                                }}
                              >
                                <Icon name="star" size="sm" aria-hidden />
                                <span className="text-left">
                                  {pinnedIds.has(item.id) ? "Unpin" : "Pin"}
                                </span>
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
          <div className="px-4 py-4 border-t border-subtle">{footer}</div>
        )}
      </div>
    </>
  );
};
