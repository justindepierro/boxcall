/**
 * useDragAndDrop Hook
 * Handles drag and drop reordering for plays
 */

import { useState, useCallback, useMemo } from "react";
import type { DropResult } from "@hello-pangea/dnd";
import type { Play } from "../../../../types/play";

interface UseDragAndDropProps {
  filteredPlays: Play[];
}

interface UseDragAndDropResult {
  displayPlays: Play[];
  handleDragEnd: (result: DropResult) => void;
}

export function useDragAndDrop({
  filteredPlays,
}: UseDragAndDropProps): UseDragAndDropResult {
  const [reorderedPlays, setReorderedPlays] = useState<Play[]>([]);

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const sourceIndex = result.source.index;
      const destinationIndex = result.destination.index;

      if (sourceIndex === destinationIndex) return;

      // Reorder the filtered plays
      const reordered = Array.from(filteredPlays);
      const [removed] = reordered.splice(sourceIndex, 1);
      reordered.splice(destinationIndex, 0, removed);

      setReorderedPlays(reordered);
    },
    [filteredPlays]
  );

  // Use reordered plays if available, otherwise use filtered plays
  const displayPlays = useMemo(() => {
    return reorderedPlays.length > 0 ? reorderedPlays : filteredPlays;
  }, [reorderedPlays, filteredPlays]);

  return { displayPlays, handleDragEnd };
}
