import { useEffect, useState } from "react";
import { table } from "../data/supabase/db";
import { logError } from "../utils/logger";

export interface PlayStatus {
  hasDiagram: boolean;
  hasAssignments: boolean;
  practiceCount: number;
  gamePlanCount: number;
}

/**
 * Hook to fetch play status indicators for Quick Actions
 * - hasDiagram: Whether play has a diagram_url
 * - hasAssignments: Whether play has any assignments
 * - practiceCount: Number of practice scripts containing this play
 * - gamePlanCount: Number of game plans containing this play
 */
export function usePlayStatus(playId: string, playbookId: string): PlayStatus {
  const [status, setStatus] = useState<PlayStatus>({
    hasDiagram: false,
    hasAssignments: false,
    practiceCount: 0,
    gamePlanCount: 0,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchStatus() {
      try {
        // Query 1: Check for assignments (count only)
        const { count: assignmentsCount, error: assignmentsError } =
          await table("play_assignments")
            .select("*", { count: "exact", head: true })
            .eq("play_id", playId)
            .eq("playbook_id", playbookId);

        if (assignmentsError) {
          logError("Error fetching assignments:", assignmentsError);
        }

        // Query 2: Count practice script usage
        const { count: practiceCount, error: practiceError } = await table(
          "practice_script_plays"
        )
          .select("*", { count: "exact", head: true })
          .eq("play_id", playId);

        if (practiceError) {
          logError("Error fetching practice count:", practiceError);
        }

        // Query 3: Count game plan usage
        // Note: HEAD request with RLS on empty tables can return 500 errors
        // Use regular SELECT instead of HEAD for more reliable counting
        const { count: gamePlanCount, error: gamePlanError } = await table(
          "game_plan_plays"
        )
          .select("id", { count: "exact" })
          .eq("play_id", playId);

        if (gamePlanError) {
          logError("Error fetching game plan count:", gamePlanError);
        }

        if (isMounted) {
          setStatus({
            hasDiagram: false, // Will be set from play.diagram_url prop in component
            hasAssignments: (assignmentsCount || 0) > 0,
            practiceCount: practiceCount || 0,
            gamePlanCount: gamePlanCount || 0,
          });
        }
      } catch (error) {
        logError("Error fetching play status:", error);
      }
    }

    fetchStatus();

    return () => {
      isMounted = false;
    };
  }, [playId, playbookId]);

  return status;
}
