/**
 * BoxCall API - Unified Export
 *
 * Industry-leading API layer for BoxCall with:
 * - Type-safe queries
 * - Request deduplication
 * - Automatic retry with exponential backoff
 * - Proper auth token management
 * - Offline support ready
 */

export { ApiClient, getApiClient, api } from "./client";
export type {
  ApiClientConfig,
  QueryOptions,
  QueryFilter,
  ApiResponse,
  ApiError,
} from "./client";

// React Query hooks
export {
  queryKeys,
  useTeam,
  usePlaybooks,
  usePlays,
  useFormations,
  useUserTeamMemberships,
  useProfile,
  useGamePlans,
  usePracticeScripts,
  usePlaybookData,
  useInvalidateTeamData,
  usePrefetchTeamData,
} from "./hooks";
