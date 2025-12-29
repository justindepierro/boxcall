/**
 * FullscreenDiagramViewer Component
 *
 * Fullscreen presentation mode for play diagrams
 * - Navigate through filtered plays with arrow keys or buttons
 * - Perfect for projecting on whiteboard during meetings
 * - Shows play info and allows scrubbing through current playbook selection
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import type { Play as PlayType } from "../../../types/play";
import { Icon } from "../../ui/Icon/Icon";

interface FullscreenDiagramViewerProps {
  plays: PlayType[]; // All filtered plays from playbook
  initialPlayIndex: number; // Index of play to start with in original array
  onClose: () => void;
}

export const FullscreenDiagramViewer: React.FC<
  FullscreenDiagramViewerProps
> = ({ plays, initialPlayIndex, onClose }) => {
  // Filter to only plays with diagram_image_url
  const playsWithDiagrams = useMemo(
    () => plays.filter((play) => play.diagram_url || play.diagram_image_url),
    [plays]
  );

  // Find the index of the initial play in the filtered array
  const initialFilteredIndex = useMemo(() => {
    const initialPlay = plays[initialPlayIndex];
    if (!initialPlay) return 0;
    const index = playsWithDiagrams.findIndex((p) => p.id === initialPlay.id);
    return index >= 0 ? index : 0;
  }, [plays, initialPlayIndex, playsWithDiagrams]);

  const [currentIndex, setCurrentIndex] = useState(initialFilteredIndex);
  const currentPlay = playsWithDiagrams[currentIndex];

  // Use the full play_name as displayed in the playbook list
  const displayName = currentPlay?.play_name || "Untitled";

  // Navigation handlers
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) =>
      prev > 0 ? prev - 1 : playsWithDiagrams.length - 1
    );
  }, [playsWithDiagrams.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) =>
      prev < playsWithDiagrams.length - 1 ? prev + 1 : 0
    );
  }, [playsWithDiagrams.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, goToPrevious, goToNext]);

  if (!currentPlay) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black z-[10000] flex flex-col">
      {/* Top Control Bar */}
      <div className="bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-700 px-6 py-4 flex items-center justify-between">
        {/* Left: Play Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-white truncate">
            {displayName}
          </h2>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {currentPlay.p_type && (
              <span className="text-sm text-neutral-300">
                {currentPlay.p_type}
              </span>
            )}
            {currentPlay.personnel && (
              <span className="px-2 py-0.5 bg-jade-600 text-white rounded-md text-xs font-semibold">
                {currentPlay.personnel}
              </span>
            )}
            {currentPlay.formation && (
              <span className="text-sm text-neutral-400">
                {currentPlay.formation}
              </span>
            )}
          </div>
        </div>

        {/* Center: Play Counter */}
        <div className="text-neutral-300 text-lg font-medium mx-8">
          {currentIndex + 1} / {playsWithDiagrams.length}
        </div>

        {/* Right: Close Button */}
        <button
          onClick={onClose}
          className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-600 transition-colors"
          aria-label="Exit fullscreen"
        >
          <Icon name="close" size="md" className="text-white" />
        </button>
      </div>

      {/* Main Content: Diagram */}
      <div className="flex-1 flex items-center justify-center bg-white relative overflow-hidden">
        {currentPlay.diagram_url || currentPlay.diagram_image_url ? (
          <img
            src={
              currentPlay.diagram_url ||
              currentPlay.diagram_image_url ||
              undefined
            }
            alt={`${displayName} diagram`}
            className="w-full h-full object-contain p-4"
          />
        ) : (
          <div className="text-neutral-500 text-xl">No diagram available</div>
        )}

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-neutral-800/90 hover:bg-neutral-700 rounded-full border border-neutral-600 transition-all hover:scale-110 shadow-xl"
          aria-label="Previous play"
        >
          <Icon name="arrow-left" size="lg" className="text-white" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-neutral-800/90 hover:bg-neutral-700 rounded-full border border-neutral-600 transition-all hover:scale-110 shadow-xl"
          aria-label="Next play"
        >
          <Icon name="arrow-right" size="lg" className="text-white" />
        </button>
      </div>

      {/* Bottom Info Bar */}
      <div className="bg-neutral-900/95 backdrop-blur-sm border-t border-neutral-700 px-6 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-neutral-300">
            <span>
              <strong className="text-white font-semibold">
                {currentPlay.times_called || 0}
              </strong>{" "}
              times called
            </span>
            {currentPlay.install_phase && (
              <span className="px-2 py-1 bg-jade-600 text-white rounded-md font-semibold uppercase text-xs">
                {currentPlay.install_phase}
              </span>
            )}
          </div>

          <div className="text-neutral-500">
            Use arrow keys or click buttons to navigate • Press ESC to exit
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
