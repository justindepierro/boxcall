import { useState, useCallback } from "react";
import type { Play } from "../../../types/play";
import type { PracticeScript } from "../../../services/practiceService";
import { debug } from "../../../utils/logger";

export function usePlaybookModalState() {
  // Diagram/Play state
  const [diagramPlay, setDiagramPlay] = useState<Play | null>(null);
  const [diagramMode, setDiagramMode] = useState<"edit" | "quick-play">("edit");
  const [assignmentsPlay, setAssignmentsPlay] = useState<Play | null>(null);

  // Practice script state
  const [editingScript, setEditingScript] = useState<PracticeScript | null>(
    null
  );
  const [showPracticeScriptModal, setShowPracticeScriptModal] = useState(false);
  const [selectedPlaysForPractice, setSelectedPlaysForPractice] = useState<
    string[]
  >([]);

  // Team bulletin state
  const [playToPost, setPlayToPost] = useState<Play | null>(null);

  // Bulk delete confirmation
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Fullscreen diagram viewer state
  const [fullscreenPlayIndex, setFullscreenPlayIndex] = useState<number | null>(
    null
  );
  const [fullscreenPlays, setFullscreenPlays] = useState<Play[]>([]);

  // Handle entering fullscreen presentation mode
  const handleEnterFullscreen = useCallback(
    (plays: Play[], playIndex: number) => {
      debug("[PlaybookPage] Entering fullscreen mode", {
        playCount: plays.length,
        startIndex: playIndex,
      });
      setFullscreenPlays(plays);
      setFullscreenPlayIndex(playIndex);
    },
    []
  );

  // Handle exiting fullscreen
  const handleExitFullscreen = useCallback(() => {
    debug("[PlaybookPage] Exiting fullscreen mode");
    setFullscreenPlayIndex(null);
    setFullscreenPlays([]);
  }, []);

  return {
    // Diagram/Play
    diagramPlay,
    setDiagramPlay,
    diagramMode,
    setDiagramMode,
    assignmentsPlay,
    setAssignmentsPlay,
    // Practice script
    editingScript,
    setEditingScript,
    showPracticeScriptModal,
    setShowPracticeScriptModal,
    selectedPlaysForPractice,
    setSelectedPlaysForPractice,
    // Team bulletin
    playToPost,
    setPlayToPost,
    // Bulk delete
    showBulkDeleteConfirm,
    setShowBulkDeleteConfirm,
    // Fullscreen
    fullscreenPlayIndex,
    fullscreenPlays,
    handleEnterFullscreen,
    handleExitFullscreen,
  };
}
