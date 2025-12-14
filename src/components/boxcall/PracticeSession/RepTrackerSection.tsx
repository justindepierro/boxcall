/**
 * RepTrackerSection Component
 *
 * Wrapper for the RepTracker with styled container
 */

import React from "react";
import { RepTracker } from "../RepTracker";
import type { RepTrackerSectionProps } from "./types";

/**
 * Styled container for the RepTracker component
 */
export const RepTrackerSection: React.FC<RepTrackerSectionProps> = ({
  currentRep,
  totalReps,
  repHistory,
  isPaused,
  onResult,
  onSkip,
  onGoToRep,
}) => (
  <div className="rounded-3xl bg-white border border-jade-100 p-6 shadow-xl shadow-jade-500/10">
    <RepTracker
      currentRep={currentRep}
      totalReps={totalReps}
      onResult={onResult}
      onSkip={onSkip}
      onGoToRep={onGoToRep}
      repHistory={repHistory}
      disabled={isPaused}
    />
  </div>
);
