/**
 * useDuplicatePlayDetection Hook
 *
 * Detects duplicate plays in real-time using the duplicate detection
 * utilities from playDataStandardization.ts
 */

import { useMemo } from "react";
import {
  buildDuplicateIndex,
  isDuplicate,
  type InboundPlay,
} from "../../../utils/playDataStandardization";
import type { Play } from "../../../types/play";

interface DuplicateDetectionResult {
  isDuplicate: boolean;
  matchingPlays: Play[];
  duplicateKey: string;
}

export function useDuplicatePlayDetection(
  existingPlays: Play[],
  currentPlay: Partial<Pick<Play, "play_name" | "formation">>
): DuplicateDetectionResult {
  return useMemo(() => {
    // Build duplicate index from existing plays
    const duplicateIndex = buildDuplicateIndex(existingPlays);

    // Check if current play is a duplicate
    const isDup = isDuplicate(duplicateIndex, currentPlay as InboundPlay);

    // Find matching plays if duplicate
    const matchingPlays = isDup
      ? existingPlays.filter(
          (p) =>
            p.play_name.toLowerCase().trim() ===
              currentPlay.play_name?.toLowerCase().trim() &&
            p.formation.toLowerCase().trim() ===
              currentPlay.formation?.toLowerCase().trim()
        )
      : [];

    // Compute duplicate key for reference
    const duplicateKey =
      currentPlay.play_name && currentPlay.formation
        ? `${currentPlay.play_name.toLowerCase().trim()}::${currentPlay.formation.toLowerCase().trim()}`
        : "";

    return {
      isDuplicate: isDup,
      matchingPlays,
      duplicateKey,
    };
  }, [existingPlays, currentPlay]);
}
