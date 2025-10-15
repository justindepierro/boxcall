/**
 * Z-Index Scale
 *
 * Standardized z-index values for consistent layering
 * across the entire application.
 *
 * USAGE:
 * import { Z_INDEX } from '@/constants/zIndex';
 * className={`fixed ${Z_INDEX.dropdown} ...`}
 */

export const Z_INDEX = {
  /**
   * Base layer - Normal document flow
   */
  base: "z-0",

  /**
   * Raised layer - Content that should appear above base
   * Use for: Cards that should appear elevated
   */
  raised: "z-10",

  /**
   * Dropdown layer - All dropdowns, selects, autocompletes
   * Use for: All dropdown menus, search results, autocomplete lists
   */
  dropdown: "z-50",

  /**
   * Header layer - Fixed headers and navigation
   * Use for: AppHeader, top navigation bars
   */
  header: "z-[60]",

  /**
   * Overlay layer - Modal/dialog overlays (backdrop)
   * Use for: Dark backgrounds behind modals
   */
  overlay: "z-[70]",

  /**
   * Modal layer - Modal/dialog content
   * Use for: Modal content, dialogs, sheets
   */
  modal: "z-[80]",

  /**
   * Notification layer - Toasts, alerts, snackbars
   * Use for: Toast notifications, inline alerts
   */
  notification: "z-[90]",

  /**
   * Tooltip layer - Tooltips (always on top of content)
   * Use for: Tooltips, help text overlays
   */
  tooltip: "z-[100]",

  /**
   * Dev tools layer - Development-only overlays
   * Use for: Dev panel, debug tools (never in production UI)
   */
  dev: "z-[9999]",
} as const;

/**
 * Numeric z-index values for use in style objects
 */
export const Z_INDEX_NUMERIC = {
  base: 0,
  raised: 10,
  dropdown: 50,
  header: 60,
  overlay: 70,
  modal: 80,
  notification: 90,
  tooltip: 100,
  dev: 9999,
} as const;

/**
 * Get z-index value by layer name
 */
export function getZIndex(layer: keyof typeof Z_INDEX): string {
  return Z_INDEX[layer];
}

/**
 * Get numeric z-index for inline styles
 */
export function getZIndexNumeric(layer: keyof typeof Z_INDEX_NUMERIC): number {
  return Z_INDEX_NUMERIC[layer];
}

/**
 * Z-Index Usage Guide:
 *
 * ✅ DO:
 * - Use Z_INDEX constants for all z-index values
 * - Use 'dropdown' for all dropdown menus
 * - Use 'modal' for all modals/dialogs
 * - Document why you need a different z-index if you must
 *
 * ❌ DON'T:
 * - Use arbitrary z-index values like z-[9999]
 * - Use z-index higher than 'modal' for UI elements
 * - Stack multiple dropdowns without checking conflicts
 * - Use 'dev' z-index for user-facing features
 *
 * EXAMPLES:
 *
 * // Dropdown menu
 * <div className={`absolute ${Z_INDEX.dropdown} ...`}>
 *
 * // Modal backdrop
 * <div className={`fixed inset-0 ${Z_INDEX.overlay} bg-black/50`}>
 *
 * // Modal content
 * <div className={`fixed ${Z_INDEX.modal} ...`}>
 *
 * // Tooltip
 * <div className={`absolute ${Z_INDEX.tooltip} ...`}>
 */
