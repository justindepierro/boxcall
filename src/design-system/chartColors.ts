/**
 * Chart Color Tokens
 *
 * Centralized color constants for Recharts and other data visualization.
 * These map to CSS variables in design-tokens-unified.css but provide
 * JavaScript values since Recharts doesn't support CSS variables natively.
 *
 * Usage:
 * import { CHART_COLORS, getSuccessRateColor } from '@/design-system/chartColors';
 *
 * <Line stroke={CHART_COLORS.blue} />
 * <Bar fill={getSuccessRateColor(75)} />
 */

/**
 * Primary chart color palette
 * Use these for data series, bars, lines, etc.
 */
export const CHART_COLORS = {
  // Primary data colors
  blue: "#3b82f6",
  emerald: "#10b981",
  purple: "#8b5cf6",
  orange: "#f97316",
  pink: "#ec4899",
  cyan: "#06b6d4",
  amber: "#f59e0b",
  red: "#ef4444",
  indigo: "#6366f1",
  teal: "#14b8a6",
  lime: "#84cc16",

  // Chart infrastructure
  grid: "#e5e7eb",
  axis: "#6b7280",
  axisText: "#6b7280",

  // Special purposes
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
} as const;

/**
 * Default color sequence for multi-series charts
 */
export const CHART_COLOR_SEQUENCE = [
  CHART_COLORS.blue,
  CHART_COLORS.emerald,
  CHART_COLORS.purple,
  CHART_COLORS.orange,
  CHART_COLORS.pink,
  CHART_COLORS.cyan,
  CHART_COLORS.amber,
  CHART_COLORS.indigo,
  CHART_COLORS.teal,
  CHART_COLORS.lime,
] as const;

/**
 * Get color based on success rate thresholds
 * @param successRate - Percentage (0-100)
 * @returns Hex color code
 */
export function getSuccessRateColor(successRate: number): string {
  if (successRate >= 75) return CHART_COLORS.emerald; // green - excellent
  if (successRate >= 60) return CHART_COLORS.amber; // yellow - good
  if (successRate >= 45) return CHART_COLORS.orange; // orange - fair
  return CHART_COLORS.red; // red - needs improvement
}

/**
 * Play type color mapping for consistent visualization
 */
export const PLAY_TYPE_COLORS: Record<string, string> = {
  run: CHART_COLORS.blue,
  pass: CHART_COLORS.red,
  screen: CHART_COLORS.emerald,
  rpo: CHART_COLORS.amber,
  special: CHART_COLORS.purple,
  "special teams": CHART_COLORS.emerald,
} as const;

/**
 * Get color for a play type
 * @param playType - Play type string (case-insensitive)
 * @returns Hex color code
 */
export function getPlayTypeColor(playType: string): string {
  return PLAY_TYPE_COLORS[playType.toLowerCase()] ?? CHART_COLORS.axis;
}

/**
 * Pie chart / donut chart default data with colors
 * For distribution charts
 */
export const DEFAULT_PIE_COLORS = [
  { name: "Run", color: CHART_COLORS.blue },
  { name: "Pass", color: CHART_COLORS.red },
  { name: "Special Teams", color: CHART_COLORS.emerald },
  { name: "Screen", color: CHART_COLORS.amber },
] as const;

/**
 * Rich Text Editor Colors
 *
 * These MUST be raw hex values because they're used for:
 * 1. ContentEditable/HTML content styling (not Tailwind classes)
 * 2. User-selectable color pickers
 * 3. Direct DOM style manipulation
 *
 * DO NOT use CSS variables here - they won't work in HTML content.
 */
export const EDITOR_TEXT_COLORS = [
  "#000000", // Black
  "#FF0000", // Red
  "#00FF00", // Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#FFA500", // Orange
  "#800080", // Purple
  "#008000", // Dark Green
  "#000080", // Navy
  "#808080", // Gray
] as const;

export const EDITOR_HIGHLIGHT_COLORS = [
  { name: "None", value: "" },
  { name: "Yellow", value: "#FFFF00" },
  { name: "Green", value: "#90EE90" },
  { name: "Blue", value: "#ADD8E6" },
  { name: "Pink", value: "#FFB6C1" },
  { name: "Orange", value: "#FFD700" },
] as const;

/**
 * Personnel Badge Color Presets
 *
 * These MUST be raw hex values because they're stored in the database
 * and rendered dynamically on elements.
 */
export const PERSONNEL_BADGE_PRESETS = [
  { name: "Green", bg: "#10b981", text: "#ffffff" },
  { name: "Orange", bg: "#f97316", text: "#ffffff" },
  { name: "Purple", bg: "#9333ea", text: "#ffffff" },
  { name: "Blue", bg: "#3b82f6", text: "#ffffff" },
  { name: "Red", bg: "#ef4444", text: "#ffffff" },
  { name: "Yellow", bg: "#eab308", text: "#000000" },
  { name: "Pink", bg: "#ec4899", text: "#ffffff" },
  { name: "Indigo", bg: "#6366f1", text: "#ffffff" },
  { name: "Teal", bg: "#14b8a6", text: "#ffffff" },
  { name: "Gray", bg: "#6b7280", text: "#ffffff" },
  { name: "Black", bg: "#000000", text: "#ffffff" },
  { name: "White", bg: "#ffffff", text: "#000000" },
] as const;

export const DEFAULT_BADGE_COLORS = {
  bg: "#10b981",
  text: "#ffffff",
} as const;

/**
 * Mini Diagram Colors
 *
 * These are for SVG/Canvas rendering where CSS classes don't apply.
 */
export const DIAGRAM_COLORS = {
  offense: { fill: "#22c55e", stroke: "#16a34a" },
  defense: { fill: "#3b82f6", stroke: "#1e40af" },
  neutral: { fill: "#1f2937", stroke: "#1f2937" },
} as const;
