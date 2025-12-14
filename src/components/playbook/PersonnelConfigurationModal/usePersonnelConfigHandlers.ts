/**
 * usePersonnelConfigHandlers Hook
 *
 * State management and handlers for personnel configuration modal
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { usePersonnelConfigurations } from "../../../hooks/usePersonnel";
import { useToast } from "../../../hooks/useToast";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";
import type {
  BadgeCustomization,
  PersonnelConfiguration,
  PlayerPosition,
} from "../../../types/personnel";
import {
  normalizeLabel,
  getPersonnelSummary,
  createDefaultConfiguration,
} from "./types";

interface UsePersonnelConfigHandlersProps {
  playbookId?: string;
  configurations?: PersonnelConfiguration[];
  onSave?: (configurations: PersonnelConfiguration[]) => void;
}

export function usePersonnelConfigHandlers({
  playbookId,
  configurations: configsProp,
  onSave = () => {},
}: UsePersonnelConfigHandlersProps) {
  // Fetch data from Supabase if playbookId provided
  const { data: fetchedConfigs, isLoading } =
    usePersonnelConfigurations(playbookId);

  // Use provided configurations or fetched ones
  const configurations = useMemo(
    () => configsProp || fetchedConfigs || [],
    [configsProp, fetchedConfigs]
  );

  const [localConfigurations, setLocalConfigurations] =
    useState<PersonnelConfiguration[]>(configurations);
  const [expandedConfigIds, setExpandedConfigIds] = useState<Set<string>>(
    new Set()
  );
  const [customizerOpenIds, setCustomizerOpenIds] = useState<Set<string>>(
    new Set()
  );
  const [justSaved, setJustSaved] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setLocalConfigurations(configurations);
    if (configurations.length > 0) {
      setExpandedConfigIds(new Set([configurations[0].id]));
    }
  }, [configurations]);

  const handleSave = useCallback(() => {
    triggerHapticFeedback("success");
    onSave(localConfigurations);
    toast.success("Personnel configurations saved successfully!");
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }, [localConfigurations, onSave, toast]);

  const addPersonnelConfiguration = useCallback(() => {
    const newConfig = createDefaultConfiguration(playbookId || "");
    setLocalConfigurations((prev) => [...prev, newConfig]);
    setExpandedConfigIds((prev) => new Set([...prev, newConfig.id]));
  }, [playbookId]);

  const toggleExpanded = useCallback((configId: string) => {
    setExpandedConfigIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(configId)) {
        newSet.delete(configId);
      } else {
        newSet.add(configId);
      }
      return newSet;
    });
  }, []);

  const toggleDefault = useCallback((configId: string) => {
    setLocalConfigurations((prev) =>
      prev.map((config) => ({
        ...config,
        isDefault: config.id === configId,
      }))
    );
    triggerHapticFeedback("light");
  }, []);

  const updatePersonnelConfigName = useCallback(
    (configId: string, name: string) => {
      setLocalConfigurations((prev) =>
        prev.map((config) =>
          config.id === configId ? { ...config, name } : config
        )
      );
    },
    []
  );

  const removePersonnelConfiguration = useCallback((configId: string) => {
    setLocalConfigurations((prev) => prev.filter((c) => c.id !== configId));
  }, []);

  const addSkillPlayer = useCallback((configId: string) => {
    setLocalConfigurations((prev) =>
      prev.map((config) =>
        config.id === configId
          ? {
              ...config,
              players: [
                ...config.players,
                {
                  id: `p${Date.now()}`,
                  config_id: configId,
                  label: "",
                  player_position: "WR" as PlayerPosition,
                  sort_order: config.players.length,
                  is_wildcat_qb: false,
                  created_at: new Date().toISOString(),
                },
              ],
            }
          : config
      )
    );
    triggerHapticFeedback("light");
  }, []);

  const removeSkillPlayer = useCallback(
    (configId: string, playerId: string) => {
      setLocalConfigurations((prev) =>
        prev.map((config) =>
          config.id === configId
            ? {
                ...config,
                players: config.players.filter((p) => p.id !== playerId),
              }
            : config
        )
      );
      triggerHapticFeedback("light");
    },
    []
  );

  const updateBadgeCustomization = useCallback(
    (configId: string, customization: BadgeCustomization) => {
      setLocalConfigurations((prev) =>
        prev.map((config) =>
          config.id === configId
            ? { ...config, badgeCustomization: customization }
            : config
        )
      );
    },
    []
  );

  const toggleCustomizer = useCallback((configId: string) => {
    setCustomizerOpenIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(configId)) {
        newSet.delete(configId);
      } else {
        newSet.add(configId);
      }
      return newSet;
    });
    triggerHapticFeedback("light");
  }, []);

  const updatePlayerLabel = useCallback(
    (configId: string, playerId: string, label: string) => {
      const normalized = normalizeLabel(label);
      setLocalConfigurations((prev) =>
        prev.map((config) =>
          config.id === configId
            ? {
                ...config,
                players: config.players.map((player) =>
                  player.id === playerId
                    ? { ...player, label: normalized }
                    : player
                ),
              }
            : config
        )
      );
    },
    []
  );

  const updatePlayerPosition = useCallback(
    (configId: string, playerId: string, player_position: PlayerPosition) => {
      setLocalConfigurations((prev) =>
        prev.map((config) =>
          config.id === configId
            ? {
                ...config,
                players: config.players.map((player) =>
                  player.id === playerId
                    ? { ...player, player_position }
                    : player
                ),
              }
            : config
        )
      );
    },
    []
  );

  const toggleWildcatQB = useCallback(
    (configId: string, playerId: string) => {
      setLocalConfigurations((prev) =>
        prev.map((config) =>
          config.id === configId
            ? {
                ...config,
                players: config.players.map((player) =>
                  player.id === playerId
                    ? { ...player, is_wildcat_qb: !player.is_wildcat_qb }
                    : player
                ),
              }
            : config
        )
      );
    },
    []
  );

  return {
    // Data
    localConfigurations,
    expandedConfigIds,
    customizerOpenIds,
    justSaved,
    isLoading,
    // Handlers
    handleSave,
    addPersonnelConfiguration,
    toggleExpanded,
    toggleDefault,
    updatePersonnelConfigName,
    removePersonnelConfiguration,
    addSkillPlayer,
    removeSkillPlayer,
    updateBadgeCustomization,
    toggleCustomizer,
    updatePlayerLabel,
    updatePlayerPosition,
    toggleWildcatQB,
    getPersonnelSummary,
  };
}
