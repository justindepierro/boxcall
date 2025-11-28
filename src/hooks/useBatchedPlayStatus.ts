import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface PlayStatus {
  hasDiagram: boolean;
  hasAssignments: boolean;
  practiceCount: number;
  gamePlanCount: number;
}

interface BatchedPlayStatus {
  [playId: string]: PlayStatus;
}

// In-memory cache with TTL
const statusCache = new Map<string, { data: PlayStatus; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

// Pending batch requests
let batchTimer: NodeJS.Timeout | null = null;
let pendingPlayIds = new Set<string>();
const BATCH_DELAY = 100; // 100ms debounce

/**
 * Batched hook to fetch play status indicators for Quick Actions
 * - Automatically batches requests within 100ms window
 * - Caches results for 30 seconds
 * - Single database query for all visible plays
 */
export function useBatchedPlayStatus(
  playId: string,
  playbookId: string
): PlayStatus {
  const [status, setStatus] = useState<PlayStatus>(() => {
    // Check cache first
    const cached = statusCache.get(playId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    return {
      hasDiagram: false,
      hasAssignments: false,
      practiceCount: 0,
      gamePlanCount: 0,
    };
  });

  useEffect(() => {
    let isMounted = true;

    // Check cache first
    const cached = statusCache.get(playId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      if (isMounted) setStatus(cached.data);
      return;
    }

    // Add to pending batch
    pendingPlayIds.add(playId);

    // Clear existing timer
    if (batchTimer) {
      clearTimeout(batchTimer);
    }

    // Set new timer to batch requests
    batchTimer = setTimeout(async () => {
      const playIdsToFetch = Array.from(pendingPlayIds);
      pendingPlayIds.clear();

      if (playIdsToFetch.length === 0) return;

      try {
        // Batch fetch game plan counts
        // NOTE: play_assignments and practice_script_plays tables don't exist yet
        // Those features are not implemented, so we only query game_plan_plays
        const { data: gamePlanPlays, error: gamePlanError } = await supabase
          .from("game_plan_plays")
          .select("play_id")
          .in("play_id", playIdsToFetch);

        if (gamePlanError) {
          console.error("Error fetching game plan count:", gamePlanError);
        }

        // Aggregate counts per play
        const statusMap: BatchedPlayStatus = {};

        playIdsToFetch.forEach((id) => {
          const gamePlanCount =
            gamePlanPlays?.filter((gp) => gp.play_id === id).length || 0;

          const playStatus: PlayStatus = {
            hasDiagram: false, // Set from play.diagram_url prop
            hasAssignments: false, // TODO: Implement when play_assignments table added
            practiceCount: 0, // TODO: Implement when practice_script_plays table added
            gamePlanCount,
          };

          statusMap[id] = playStatus;

          // Cache the result
          statusCache.set(id, {
            data: playStatus,
            timestamp: Date.now(),
          });
        });

        // Update only if this playId was in the batch
        if (isMounted && statusMap[playId]) {
          setStatus(statusMap[playId]);
        }
      } catch (error) {
        console.error("Error fetching batched play status:", error);
      }
    }, BATCH_DELAY);

    return () => {
      isMounted = false;
    };
  }, [playId, playbookId]);

  return status;
}

/**
 * Clear the status cache (useful for refetching after updates)
 */
export function clearPlayStatusCache() {
  statusCache.clear();
}
