/**
 * Roster Page Hooks
 * Centralized export for all custom hooks
 */

export { useRosterData } from "../../../hooks/useRosterData";
export type { UseRosterDataReturn } from "../../../hooks/useRosterData";

export { useRosterFilters } from "./useRosterFilters";
export type { UseRosterFiltersReturn } from "./useRosterFilters";

export { useRosterSelection } from "./useRosterSelection";
export type { UseRosterSelectionReturn } from "./useRosterSelection";

export { useRosterStats } from "./useRosterStats";
export type { UseRosterStatsReturn } from "./useRosterStats";

export { useAutosavePlayer } from "./useAutosavePlayer";
export type {
  UseAutosavePlayerOptions,
  UseAutosavePlayerReturn,
} from "./useAutosavePlayer";

export { useRosterModals } from "./useRosterModals";
export type { UseRosterModalsReturn } from "./useRosterModals";

export { useRosterCrud, INITIAL_FORM_DATA } from "./useRosterCrud";
export type { UseRosterCrudReturn, PlayerFormData } from "./useRosterCrud";

export { useRosterBulkOps } from "./useRosterBulkOps";
export type { UseRosterBulkOpsReturn } from "./useRosterBulkOps";

export { useRosterInvitations } from "./useRosterInvitations";
export type { UseRosterInvitationsReturn } from "./useRosterInvitations";
