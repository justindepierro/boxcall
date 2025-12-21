/**
 * Personnel Hooks
 *
 * React Query hooks for managing personnel configurations and players.
 * Provides automatic caching, loading states, and optimistic updates.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PersonnelService } from "../services/personnelService";
import { RQ_STALE } from "../app/reactQueryTimes";
import { queryKeys } from "../lib/queryKeys";
import type {
  PersonnelConfiguration,
  CreatePersonnelConfiguration,
  UpdatePersonnelConfiguration,
} from "../types/personnel";

/**
 * Query Keys
 */
export const personnelKeys = {
  // Compat shim; prefer using `queryKeys.personnel*` directly.
  all: queryKeys.personnel,
  configurations: queryKeys.personnelConfigurations,
  configuration: queryKeys.personnelConfiguration,
  players: queryKeys.personnelPlayers,
};

/**
 * Get all personnel configurations for a playbook
 * @param playbookId - Playbook UUID
 */
export function usePersonnelConfigurations(playbookId: string | undefined) {
  return useQuery({
    queryKey: personnelKeys.configurations(playbookId || ""),
    queryFn: () =>
      playbookId
        ? PersonnelService.getPersonnelConfigurations(playbookId)
        : Promise.resolve([]),
    enabled: !!playbookId,
    staleTime: RQ_STALE.MEDIUM,
  });
}

/**
 * Get a specific personnel configuration by name
 * Used when loading diagrams to preload personnel
 * @param playbookId - Playbook UUID
 * @param name - Configuration name (e.g., "11 Personnel")
 */
export function usePersonnelConfigurationByName(
  playbookId: string | undefined,
  name: string | undefined
) {
  return useQuery({
    queryKey: personnelKeys.configuration(playbookId || "", name || ""),
    queryFn: () =>
      playbookId && name
        ? PersonnelService.getPersonnelConfigurationByName(playbookId, name)
        : Promise.resolve(null),
    enabled: !!playbookId && !!name,
    staleTime: RQ_STALE.MEDIUM,
  });
}

/**
 * Get players for a specific configuration
 * @param configId - Configuration UUID
 */
export function usePersonnelPlayers(configId: string | undefined) {
  return useQuery({
    queryKey: personnelKeys.players(configId || ""),
    queryFn: () =>
      configId
        ? PersonnelService.getPersonnelPlayers(configId)
        : Promise.resolve([]),
    enabled: !!configId,
    staleTime: RQ_STALE.MEDIUM,
  });
}

/**
 * Create a new personnel configuration
 * Invalidates configurations query on success
 */
export function useCreatePersonnelConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: CreatePersonnelConfiguration) =>
      PersonnelService.createPersonnelConfiguration(config),
    onSuccess: (data) => {
      // Invalidate configurations list
      queryClient.invalidateQueries({
        queryKey: personnelKeys.configurations(data.playbook_id),
      });
    },
  });
}

/**
 * Update an existing personnel configuration
 * Invalidates related queries on success
 */
export function useUpdatePersonnelConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdatePersonnelConfiguration;
    }) => PersonnelService.updatePersonnelConfiguration(id, updates),
    onSuccess: (data) => {
      // Invalidate configurations list
      queryClient.invalidateQueries({
        queryKey: personnelKeys.configurations(data.playbook_id),
      });
      // Invalidate specific configuration by name
      queryClient.invalidateQueries({
        queryKey: personnelKeys.configuration(data.playbook_id, data.name),
      });
      // Invalidate players
      queryClient.invalidateQueries({
        queryKey: personnelKeys.players(data.id),
      });
    },
  });
}

/**
 * Delete a personnel configuration
 * Requires playbookId to invalidate queries
 */
export function useDeletePersonnelConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
    }: {
      id: string;
      playbookId: string; // Keep for query invalidation in onSuccess
    }) => PersonnelService.deletePersonnelConfiguration(id),
    onSuccess: (_, variables) => {
      // Invalidate configurations list
      queryClient.invalidateQueries({
        queryKey: personnelKeys.configurations(variables.playbookId),
      });
      // Invalidate players
      queryClient.invalidateQueries({
        queryKey: personnelKeys.players(variables.id),
      });
    },
  });
}

/**
 * Hook: Get personnel configuration with optimistic state
 * Returns the most recent data including optimistic updates
 */
export function usePersonnelConfigurationOptimistic(
  playbookId: string | undefined,
  name: string | undefined
) {
  const queryClient = useQueryClient();
  const query = usePersonnelConfigurationByName(playbookId, name);

  // Check for optimistic updates in cache
  const optimisticData = queryClient.getQueryData<PersonnelConfiguration>(
    personnelKeys.configuration(playbookId || "", name || "")
  );

  return {
    ...query,
    data: optimisticData || query.data,
  };
}
