import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

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
          await supabase
            .from("play_assignments")
            .select("*", { count: "exact", head: true })
            .eq("play_id", playId)
            .eq("playbook_id", playbookId);

        if (assignmentsError) {
          console.error("Error fetching assignments:", assignmentsError);
        }

        // Query 2: Count practice script usage
        const { count: practiceCount, error: practiceError } = await supabase
          .from("practice_script_plays")
          .select("*", { count: "exact", head: true })
          .eq("play_id", playId);

        if (practiceError) {
          console.error("Error fetching practice count:", practiceError);
        }

        // Query 3: Count game plan usage
        const { count: gamePlanCount, error: gamePlanError } = await supabase
          .from("game_plan_plays")
          .select("*", { count: "exact", head: true })
          .eq("play_id", playId);

        if (gamePlanError) {
          console.error("Error fetching game plan count:", gamePlanError);
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
        console.error("Error fetching play status:", error);
      }
    }

    fetchStatus();

    return () => {
      isMounted = false;
    };
  }, [playId, playbookId]);

  return status;
}
