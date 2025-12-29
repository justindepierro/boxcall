/**
 * AdvancedFilters - Re-export from modular folder structure
 *
 * The component has been split into:
 * - AdvancedFilters/index.tsx - Main component
 * - AdvancedFilters/AdvancedFiltersMobile.tsx - Mobile variant
 * - AdvancedFilters/AdvancedFiltersDesktop.tsx - Desktop variant
 * - AdvancedFilters/useAdvancedFiltersController.ts - State management
 * - AdvancedFilters/helpers.ts - Filter manipulation utilities
 * - AdvancedFilters/constants.ts - Filter field definitions
 * - AdvancedFilters/types.ts - TypeScript types
 *
 * Features:
 * - Collapsed by default on desktop
 * - Filter persistence via localStorage
 * - Responsive mobile/desktop variants
 */
export { AdvancedFilters } from "./AdvancedFilters/index";
export type { AdvancedFiltersProps } from "./AdvancedFilters/types";

// For constants, import directly from:
// import { FILTER_FIELDS } from "./AdvancedFilters/constants";
