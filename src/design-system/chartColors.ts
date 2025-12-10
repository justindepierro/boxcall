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
