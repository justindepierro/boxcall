/**
 * Icon Registry - Dynamic Icon Loading System
 *
 * Central registry that dynamically loads icons from categories
 * Enables perfect tree shaking - only loads icons that are actually used
 */

import type { LucideIcon } from "lucide-react";

// Icon registry - populated by category imports
const iconRegistry = new Map<string, LucideIcon>();

// Category loading status
const categoryStatus = new Map<string, boolean>();

/**
 * Register an icon from a category
 */
export function registerIcon(name: string, component: LucideIcon): void {
  iconRegistry.set(name, component);
}

/**
 * Register multiple icons from a category
 */
export function registerIconCategory(
  categoryName: string,
  icons: Record<string, LucideIcon>
): void {
  Object.entries(icons).forEach(([name, component]) => {
    registerIcon(name, component);
  });
  categoryStatus.set(categoryName, true);
}

/**
 * Get an icon component by name
 * Attempts to load the icon's category if not found
 */
export function getIconComponent(name: string): LucideIcon | null {
  // Check if already registered
  if (iconRegistry.has(name)) {
    return iconRegistry.get(name)!;
  }

  // Try to dynamically load the icon's category
  const category = getIconCategory(name);
  if (category && !categoryStatus.get(category)) {
    // Dynamically import the category
    loadIconCategory(category);
  }

  return iconRegistry.get(name) || null;
}

/**
 * Determine which category an icon belongs to based on its name
 */
function getIconCategory(iconName: string): string | null {
  // Navigation patterns
  if (
    [
      "menu",
      "close",
      "chevron",
      "arrow",
      "home",
      "sidebar",
      "grid",
      "list",
    ].some((pattern) => iconName.includes(pattern))
  ) {
    return "navigation";
  }

  // Action patterns
  if (
    [
      "plus",
      "minus",
      "edit",
      "delete",
      "save",
      "download",
      "upload",
      "copy",
      "check",
      "alert",
    ].some((pattern) => iconName.includes(pattern))
  ) {
    return "actions";
  }

  // Calendar patterns
  if (
    ["calendar", "clock", "timer", "watch", "alarm"].some((pattern) =>
      iconName.includes(pattern)
    )
  ) {
    return "calendar";
  }

  // Sports patterns
  if (
    [
      "target",
      "trophy",
      "medal",
      "flag",
      "crown",
      "star",
      "activity",
      "crosshair",
    ].some((pattern) => iconName.includes(pattern))
  ) {
    return "sports";
  }

  // Business patterns
  if (
    ["user", "team", "building", "briefcase", "globe", "shield"].some(
      (pattern) => iconName.includes(pattern)
    )
  ) {
    return "business";
  }

  // Media patterns
  if (
    ["image", "video", "camera", "mic", "volume", "music", "film"].some(
      (pattern) => iconName.includes(pattern)
    )
  ) {
    return "media";
  }

  // Default to system category
  return "system";
}

/**
 * Dynamically load an icon category
 */
async function loadIconCategory(category: string): Promise<void> {
  try {
    switch (category) {
      case "navigation":
        await import("./categories/NavigationIcons");
        break;
      case "actions":
        await import("./categories/ActionIcons");
        break;
      case "calendar":
        await import("./categories/CalendarIcons");
        break;
      case "sports":
        await import("./categories/SportsIcons");
        break;
      case "business":
        await import("./categories/BusinessIcons");
        break;
      case "media":
        await import("./categories/MediaIcons");
        break;
      case "system":
        await import("./categories/SystemIcons");
        break;
      default:
        console.warn(`Unknown icon category: ${category}`);
    }
  } catch (error) {
    console.error(`Failed to load icon category ${category}:`, error);
  }
}

/**
 * Get all registered icon names
 */
export function getRegisteredIconNames(): string[] {
  return Array.from(iconRegistry.keys());
}

/**
 * Check if an icon is registered
 */
export function isIconRegistered(name: string): boolean {
  return iconRegistry.has(name);
}
