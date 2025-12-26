import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ActivityService, PlaysService } from "@services";
import { SecurePlaysService } from "../../../services/securePlaysService";
import { getCurrentUserId } from "../../../lib/auth-helpers";
import { error as logError, debug } from "../../../utils/logger";
import { useToast } from "../../../hooks/useToast";
import type { PlayActivityItem } from "@services";
import {
  readLocalString,
  storageKeys,
  writeLocalString,
} from "../../../utils/storage";

interface UsePlaybookStateProps {
  activeTeamId: string | null;
  teamPlaybooks: Array<{ id: string; play_count?: number }>;
  allPlaysForStats: Array<{
    id: string;
    playbook_id: string;
    formation?: string;
    play_name?: string;
  }>;
  dispatch: React.Dispatch<any>;
}

export function usePlaybookState({
  activeTeamId,
  teamPlaybooks,
  allPlaysForStats,
  dispatch,
}: UsePlaybookStateProps) {
  const toast = useToast();
  const sanitizedFormationIdsRef = useRef(new Set<string>());

  // Memoized team plays
  const teamPlaybookIds = useMemo(
    () => new Set(teamPlaybooks.map((pb) => pb.id)),
    [teamPlaybooks]
  );

  const playsForActiveTeam = useMemo(() => {
    if (!activeTeamId) return [];
    if (teamPlaybookIds.size === 0) return [];
    return allPlaysForStats.filter((play) =>
      teamPlaybookIds.has(play.playbook_id)
    );
  }, [activeTeamId, allPlaysForStats, teamPlaybookIds]);

  const playbookIdsWithPlays = useMemo(() => {
    const ids = new Set<string>();
    for (const p of playsForActiveTeam) {
      if (p?.playbook_id) ids.add(p.playbook_id);
    }
    return ids;
  }, [playsForActiveTeam]);

  const teamPlayCount = playsForActiveTeam.length;

  // State for selected playbook
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string>("");

  const selectedPlaybookPlayCount = useMemo(() => {
    if (!selectedPlaybookId) return teamPlayCount;
    return playsForActiveTeam.filter(
      (p) => p.playbook_id === selectedPlaybookId
    ).length;
  }, [playsForActiveTeam, selectedPlaybookId, teamPlayCount]);

  // Recent activities
  const [recentActivities, setRecentActivities] = useState<PlayActivityItem[]>(
    []
  );

  // Suggestions for inline editing
  const [suggestions, setSuggestions] = useState({
    formations: [] as string[],
    playNames: [] as string[],
    personnel: [] as string[],
  });

  // Initialize play count from data
  useEffect(() => {
    if (!activeTeamId) {
      dispatch({ type: "SET_PLAYS_CREATED", count: 0 });
      return;
    }
    dispatch({ type: "SET_PLAYS_CREATED", count: selectedPlaybookPlayCount });
  }, [activeTeamId, dispatch, selectedPlaybookPlayCount]);

  // Initialize selected playbook from preferences
  useEffect(() => {
    if (teamPlaybooks.length === 0) return;

    const savedPlaybookId = activeTeamId
      ? readLocalString(
          storageKeys.playbook.activePlaybookForTeam(activeTeamId)
        )
      : null;

    if (
      savedPlaybookId &&
      teamPlaybooks.some((pb) => pb.id === savedPlaybookId)
    ) {
      setSelectedPlaybookId(savedPlaybookId);
    } else {
      // `play_count` isn't always reliable (can be 0 in some fetch paths).
      // Prefer the first playbook that actually has any plays loaded.
      const playbookWithPlays = teamPlaybooks.find((pb) =>
        playbookIdsWithPlays.has(pb.id)
      );
      const defaultPlaybook = playbookWithPlays || teamPlaybooks[0];
      setSelectedPlaybookId(defaultPlaybook.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTeamId, teamPlaybooks.length, playbookIdsWithPlays]);

  // Save preference when playbook changes
  const handlePlaybookChange = useCallback(
    (playbookId: string) => {
      setSelectedPlaybookId(playbookId);
      if (activeTeamId) {
        writeLocalString(
          storageKeys.playbook.activePlaybookForTeam(activeTeamId),
          playbookId
        );
      }
      debug(`[PlaybookPage] Switched to playbook: ${playbookId}`);
    },
    [activeTeamId]
  );

  // Helper to refresh recent activities
  const refreshActivities = useCallback(async () => {
    try {
      const userId = getCurrentUserId();
      if (!userId) return;

      const activities = await ActivityService.getRecentActivities(
        activeTeamId || undefined,
        10
      );
      setRecentActivities(activities);
      debug(`Refreshed ${activities.length} recent activities`);
    } catch (err) {
      logError("Failed to refresh recent activities:", err);
    }
  }, [activeTeamId]);

  // Load recent activities on mount
  useEffect(() => {
    const loadActivities = async () => {
      try {
        const userId = getCurrentUserId();
        if (!userId) {
          debug("Skipping activities load - user not authenticated yet");
          return;
        }

        const activities = await ActivityService.getRecentActivities(
          activeTeamId || undefined,
          10
        );
        setRecentActivities(activities);
        debug(`Loaded ${activities.length} recent activities`);
      } catch (err) {
        logError("Failed to load recent activities:", err);
      }
    };

    void loadActivities();
  }, [activeTeamId]);

  // Load suggestions for inline editing
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const [formations, playNames, personnel] = await Promise.all([
          PlaysService.getUniqueFormations(),
          PlaysService.getUniquePlayNames(),
          PlaysService.getUniquePersonnel(),
        ]);

        setSuggestions({
          formations,
          playNames,
          personnel,
        });
      } catch (error) {
        logError("Failed to load suggestions:", error);
      }
    };

    loadSuggestions();
  }, []);

  // Auto-sanitize invalid formations
  useEffect(() => {
    if (!allPlaysForStats || allPlaysForStats.length === 0) return;

    const invalidPlays = allPlaysForStats.filter((play) => {
      if (!play || !play.id) return false;
      const formationValue =
        typeof play.formation === "string" ? play.formation : "";
      if (!formationValue.trim()) return false;
      const looksLikePersonnel = /^\d{2}$/.test(formationValue);
      return (
        looksLikePersonnel && !sanitizedFormationIdsRef.current.has(play.id)
      );
    });

    if (invalidPlays.length === 0) return;

    void (async () => {
      let didUpdate = false;

      for (const play of invalidPlays) {
        sanitizedFormationIdsRef.current.add(play.id);
        try {
          await SecurePlaysService.updatePlay(play.id, {
            formation: null,
            formation_id: null,
          });
          didUpdate = true;
          toast.warning(
            `Cleared invalid formation "${play.formation}" from ${play.play_name || "a play"}.`
          );
        } catch (error) {
          sanitizedFormationIdsRef.current.delete(play.id);
          logError("Failed to sanitize formation", error);
        }
      }

      if (didUpdate) {
        dispatch({ type: "INCREMENT_REFRESH" });
      }
    })();
  }, [allPlaysForStats, dispatch, toast]);

  // Never fall back to teamId here; PlayList expects a real playbook id.
  const activePlaybookId = selectedPlaybookId || teamPlaybooks[0]?.id || "";

  return {
    selectedPlaybookId,
    setSelectedPlaybookId,
    handlePlaybookChange,
    activePlaybookId,
    playsForActiveTeam,
    teamPlayCount,
    recentActivities,
    refreshActivities,
    suggestions,
  };
}
