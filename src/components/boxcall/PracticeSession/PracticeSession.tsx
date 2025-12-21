/**
 * PracticeSession Component
 *
 * UI for conducting live or retroactive practice sessions
 *
 * Modularized Dec 2025: Split into smaller components for maintainability
 */

import React, { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { usePracticeSession } from "../../../hooks/usePracticeSession";
import { useActiveTeamStore } from "../../../stores/activeTeamStore";
import { useToast } from "../../../hooks/useToast";
import { logError } from "../../../utils/logger";
import { ConfirmationModal } from "../../ui/ConfirmationModal/ConfirmationModal";
import type { ExecutionResult } from "../../../types/session";
import {
  LoadingState,
  NoTeamState,
  ErrorState,
  PreSessionState,
  PracticeSessionHeader,
  OverallProgressBar,
  CurrentPlayCard,
  SessionStatsCard,
  ScriptPlaysList,
  NotesSection,
  RepTrackerSection,
} from "./components";

/**
 * PracticeSession - Live/retroactive practice tracking
 *
 * Features:
 * - Visual rep tracking with dots
 * - Quick result buttons (Success/Failure/Neutral/Skip)
 * - Auto-advance to next play
 * - Progress indicators
 * - Offline support
 * - Auto-save every 30 seconds
 */
const PracticeSession: React.FC = () => {
  const { scriptId } = useParams<{ scriptId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTeamId = useActiveTeamStore((state) => state.activeTeamId);

  const mode = (searchParams.get("mode") as "live" | "retroactive") || "live";

  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const toast = useToast();

  const {
    session,
    isLoading,
    error,
    practiceScript,
    scriptPlays,
    currentPlayIndex,
    currentPlay,
    currentRepNumber,
    totalRepsForCurrentPlay,
    repHistory,
    computedStats,
    playProgress,
    overallProgress,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    logRep,
    skipRep,
    goToRep,
    nextPlay,
    previousPlay,
    isSessionActive,
    isPaused,
    isLastPlay,
    hasPendingSync,
  } = usePracticeSession({
    practiceScriptId: scriptId || "",
    mode,
  });

  // Handle starting the session
  const handleStart = async () => {
    try {
      await startSession();
    } catch (err) {
      logError("Error starting session:", err);
      toast.error("Failed to start session");
    }
  };

  // Handle ending the session
  const handleEnd = async () => {
    setShowEndConfirm(true);
  };

  const confirmEnd = async () => {
    try {
      await endSession();
      navigate("/boxcall");
    } catch (err) {
      logError("Error ending session:", err);
      toast.error("Failed to end session");
    } finally {
      setShowEndConfirm(false);
    }
  };

  // Handle rep result
  const handleRepResult = async (
    result: ExecutionResult,
    notes?: string,
    tags?: string[]
  ) => {
    try {
      await logRep(result, notes, tags);
    } catch (err) {
      logError("Error logging rep:", err);
      toast.error("Failed to log rep");
    }
  };

  // Handle skip
  const handleSkip = async () => {
    try {
      await skipRep(showNotes ? notes : undefined);
      setNotes(""); // Clear notes after logging
    } catch (err) {
      logError("Error skipping rep:", err);
      toast.error("Failed to skip rep");
    }
  };

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // No team selected state
  if (!activeTeamId) {
    return <NoTeamState onNavigate={() => navigate("/dashboard")} />;
  }

  // Error state
  if (error || !practiceScript) {
    return (
      <ErrorState
        error={error}
        scriptId={scriptId}
        onBack={() => navigate("/boxcall")}
        onCreate={() => navigate("/practice-plans")}
      />
    );
  }

  // Pre-session start screen
  if (!isSessionActive && !isPaused && !session) {
    return (
      <PreSessionState
        practiceScript={practiceScript}
        scriptPlays={scriptPlays}
        mode={mode}
        onCancel={() => navigate("/boxcall")}
        onStart={handleStart}
      />
    );
  }

  // Active session screen
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-surface-primary via-surface-primary to-jade-50/30">
        <div className="container-page py-8">
          {/* Header */}
          <PracticeSessionHeader
            practiceScript={practiceScript}
            mode={mode}
            hasPendingSync={hasPendingSync}
            isPaused={isPaused}
            onPause={pauseSession}
            onResume={resumeSession}
            onEnd={handleEnd}
          />

          {/* Overall Progress */}
          <OverallProgressBar progress={overallProgress} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Current Play */}
            <div className="lg:col-span-2 space-y-5">
              {/* Current Play Card */}
              <CurrentPlayCard
                currentPlay={currentPlay}
                currentPlayIndex={currentPlayIndex}
                totalPlays={scriptPlays.length}
                playProgress={playProgress}
                isPaused={isPaused}
                isLastPlay={isLastPlay}
                onPrevious={previousPlay}
                onNext={nextPlay}
              />

              {/* Rep Tracker */}
              <RepTrackerSection
                currentRep={currentRepNumber}
                totalReps={totalRepsForCurrentPlay}
                repHistory={repHistory}
                isPaused={isPaused}
                onResult={handleRepResult}
                onSkip={handleSkip}
                onGoToRep={goToRep}
              />

              {/* Notes Section */}
              <NotesSection
                notes={notes}
                showNotes={showNotes}
                isPaused={isPaused}
                onNotesChange={setNotes}
                onToggleNotes={() => setShowNotes(!showNotes)}
              />
            </div>

            {/* Right Column: Stats & Play List */}
            <div className="space-y-5">
              {/* Session Stats */}
              <SessionStatsCard computedStats={computedStats} />

              {/* Script Plays List */}
              <ScriptPlaysList
                scriptPlays={scriptPlays}
                currentPlayIndex={currentPlayIndex}
                isPaused={isPaused}
              />
            </div>
          </div>
        </div>
      </div>

      {/* End Session Confirmation Modal */}
      <ConfirmationModal
        isOpen={showEndConfirm}
        onClose={() => setShowEndConfirm(false)}
        onConfirm={confirmEnd}
        title="End Practice Session"
        message="Are you sure you want to end this practice session?"
        variant="warning"
        confirmText="End Session"
        cancelText="Cancel"
      />
    </>
  );
};

export default PracticeSession;
