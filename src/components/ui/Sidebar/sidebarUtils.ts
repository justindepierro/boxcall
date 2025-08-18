// Sidebar style utilities for BoxCall
// Centralizes all style logic for Sidebar, NavItem, NavGroup, badges, etc.

export const getSidebarWidth = (width: "sm" | "md" | "lg" = "md") => {
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

export const getSidebarPosition = (
  position: "left" | "right" = "left",
  isOpen: boolean
) => {
  const baseTransform = position === "right" ? "translate-x-full" : "-translate-x-full";
  const openTransform = "translate-x-0";
  return `
    ${position === "right" ? "right-0" : "left-0"}
    transform transition-transform duration-300 ease-in-out motion-reduce:transition-none motion-reduce:duration-0
    ${isOpen ? openTransform : baseTransform}
  `;
};

export const getSidebarStyles = () =>
  `fixed top-0 bottom-0 z-50 flex flex-col surface-nav border-subtle border-r shadow-lg rounded-r-2xl overflow-hidden`;

import type { SidebarItem } from "./Sidebar";

export const getSidebarItemStyles = (item: SidebarItem, level: number = 0) => {
  const paddingLeft = level > 0 ? `pl-${4 + level * 4}` : "pl-4";
  const baseStyles = `
    group flex items-center gap-3 px-3 py-2.5 text-sm font-medium cursor-pointer
    transition-colors duration-150 ease-in-out rounded-md
    focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--semantic-focus-ring)]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--semantic-bg-primary)]
    ${paddingLeft}
  `;
  if (item.divider) return `border-t border-subtle my-2`;
  if (item.disabled) return `${baseStyles} text-text-muted cursor-not-allowed`;
  if (item.active) return `${baseStyles} bg-[var(--semantic-bg-muted)] text-text-primary shadow-sm ring-1 ring-[color:var(--semantic-primary)]/20 border-l-2 border-[color:var(--semantic-primary)]`;
  return `${baseStyles} text-text-primary hover:bg-[var(--semantic-bg-muted)] hover:text-text-primary`;
};

export const getBadgeStyles = () =>
  `ml-auto px-2 py-0.5 text-xs font-medium rounded-full`;
