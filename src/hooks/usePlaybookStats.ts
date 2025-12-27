import { useMemo } from "react";
import type { Play } from "../types/play";
import type { Formation } from "../types/formation";
import type { PlayActivityItem } from "../services/activityService";

export interface PlayStats {
  totalPlays: number;
  playsWithDiagrams: number;
  playsWithPhotos: number; // Alias for playsWithDiagrams (UI compatibility)
  formationsCount: number;
  passPlays: number;
  runPlays: number;
  rpoPlays: number;
  playActionPlays: number;
}

export interface ActivityStats {
  recentActivity: Array<{
    id: string;
    type: Exclude<PlayActivityItem["activityType"], "deleted">;
    playName: string;
    timestamp: Date;
    details?: string;
  }>;
}

export interface FormationAuditSummary {
  needsMapping: number;
  resolved: number;
  total: number;
}

export interface PlaybookStats extends PlayStats, ActivityStats {
  formationAudit: FormationAuditSummary;
}

/**
 * Custom hook for consolidated playbook statistics
 *
 * Phase 4 Simplification: Stats now calculate directly from passed plays.
 * This ensures stats ALWAYS match what the user sees (filtered or unfiltered).
 *
 * IMPORTANT: Pass filtered plays to get filtered stats!
 *
 * @param plays - Plays to calculate statistics from (should be filtered plays for accurate display)
 * @param allFormations - All formations for counting
 * @param recentActivities - Recent activity items
 * @param formationAuditPlays - Plays needing formation mapping
 * @param totalCountOverride - Optional DB total count (for pagination scenarios)
 * @returns Consolidated playbook statistics that match displayed plays
 */
export function usePlaybookStats(
  plays: Play[],
  allFormations: Formation[],
  recentActivities: PlayActivityItem[],
  formationAuditPlays: Play[],
  totalCountOverride?: number
): PlaybookStats {
  // Play stats calculated directly from passed plays - no overrides needed
  const playStats: PlayStats = useMemo(() => {
    // Use DB total count if provided (pagination scenario), otherwise use array length
    const totalPlays = totalCountOverride ?? plays.length;
    const playsWithDiagrams = plays.filter(
      (play) => play.diagram_image_url
    ).length;

    // Count unique formations from plays
    const uniqueFormations = new Set(
      plays.map((play) => play.formation).filter(Boolean)
    );
    const formationsCount = Math.max(
      allFormations.length,
      uniqueFormations.size
    );

    // Count play types directly from plays array
    const passPlays = plays.filter(
      (play) => play.p_type?.toLowerCase() === "pass"
    ).length;
    const runPlays = plays.filter(
      (play) => play.p_type?.toLowerCase() === "run"
    ).length;
    const rpoPlays = plays.filter(
      (play) => play.p_type?.toLowerCase() === "rpo"
    ).length;
    const playActionPlays = plays.filter((play) =>
      play.p_type?.toLowerCase()?.includes("play action")
    ).length;

    return {
      totalPlays,
      playsWithDiagrams,
      playsWithPhotos: playsWithDiagrams, // Alias for UI compatibility
      formationsCount,
      passPlays,
      runPlays,
      rpoPlays,
      playActionPlays,
    };
  }, [plays, allFormations, totalCountOverride]);

  // Activity stats calculated separately
  const activityStats: ActivityStats = useMemo(
    () => ({
      recentActivity: recentActivities
        .filter(
          (activity) => activity.activityType !== "deleted" // Filter out deleted activities for dashboard
        )
        .map((activity) => ({
          id: activity.id,
          type: activity.activityType as Exclude<
            typeof activity.activityType,
            "deleted"
          >,
          playName: activity.playName || "Unknown Play",
          timestamp: new Date(activity.createdAt),
          details: activity.details
            ? JSON.stringify(activity.details)
            : undefined,
        })),
    }),
    [recentActivities]
  );

  // Formation audit summary
  const formationAudit: FormationAuditSummary = useMemo(() => {
    if (!formationAuditPlays || formationAuditPlays.length === 0) {
      return { needsMapping: 0, resolved: 0, total: 0 };
    }
    const needsMapping = formationAuditPlays.length;

    return {
      needsMapping,
      resolved: 0,
      total: needsMapping,
    };
  }, [formationAuditPlays]);

  // Combine all stats into single object
  return useMemo(
    () => ({
      ...playStats,
      ...activityStats,
      formationAudit,
    }),
    [playStats, activityStats, formationAudit]
  );
}
