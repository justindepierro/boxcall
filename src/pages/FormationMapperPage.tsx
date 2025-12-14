/**
 * ⚠️ DEPRECATED PAGE - Formation Mapper
 *
 * This page was designed to pair formation variants (Left/Right) using a separate
 * formations table. As of November 28, 2025, BoxCall uses the simplified approach:
 *
 * - Formation names stored as TEXT in plays table
 * - Direction detected from name suffix ("Shotgun Trips Left" vs "Shotgun Trips Right")
 * - No separate formations table needed
 * - No formation pairing/matching needed
 *
 * This page remains for backwards compatibility but may be removed in future versions.
 *
 * See: docs/FORMATION_FIX_COMPLETE_NOV28_2025.md
 *
 * REFACTORED: December 2025 - Extracted to FormationMapperPage/ directory
 * - hooks/useFormationSuggestions.ts - Suggestion calculation logic
 * - hooks/useFormationAssignment.ts - Assignment handlers
 * - hooks/useFormationMapperState.ts - State management
 * - components/FormationMapperHeader.tsx - Header component
 * - components/FormationMapperOverview.tsx - Overview card
 * - components/FormationMapperPlayRow.tsx - Play row component
 * - components/FormationMapperSelectionBar.tsx - Selection action bar
 * - components/FormationMapperStates.tsx - Loading/empty/error states + modals
 */

export { default } from "./FormationMapperPage";
