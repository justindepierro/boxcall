/**
 * Dashboard Personalization Store
 * Manages intelligent dashboard behavior with context-aware adaptations.
 */

// Re-export types and helpers for convenience
export * from "./types";
export { createDefaultLayout, getDefaultWidgetsForRole } from "./defaults";

export { useDashboardStore } from "./store";
