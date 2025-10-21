/**
 * Practice Session Component
 * UI for conducting live or retroactive practice sessions
 */

// @ts-nocheck
// TODO: Fix types when integrating Stage 3 (Session Management)

import React, { useCallback, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Typography } from "../design-system";
import { Button } from "../ui";
import { Card } from "../ui";
import { Icon } from "../ui/Icon/Icon";
import { RepTracker } from "./RepTracker";
import { usePracticeSession } from "../../hooks/usePracticeSession";
import type { ExecutionResult } from "../../types/session";

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

  const mode = (searchParams.get("mode") as "live" | "retroactive") || "live";

  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

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
    playProgress,
    overallProgress,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    logRep,
    skipRep,
    nextPlay,
    previousPlay,
    isSessionActive,
    isPaused,
    isLastRep,
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
      console.error("Error starting session:", err);
      alert("Failed to start session");
    }
  };

  // Handle ending the session
  const handleEnd = async () => {
    if (!confirm("Are you sure you want to end this practice session?")) {
      return;
    }

    try {
      await endSession();
      navigate("/boxcall");
    } catch (err) {
      console.error("Error ending session:", err);
      alert("Failed to end session");
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
      console.error("Error logging rep:", err);
      alert("Failed to log rep");
    }
  };

  // Handle skip
  const handleSkip = async () => {
    try {
      await skipRep(showNotes ? notes : undefined);
      setNotes(""); // Clear notes after logging
    } catch (err) {
      console.error("Error skipping rep:", err);
      alert("Failed to skip rep");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="py-6">
        <div className="container-page">
          <div className="flex items-center justify-center py-12">
            <Typography variant="body-lg" color="muted">
              Loading practice session...
            </Typography>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !practiceScript) {
    return (
      <div className="py-6">
        <div className="container-page">
          <Card className="p-6 text-center">
            <Icon
              name="alert-circle"
              size="xl"
              color="error"
              className="mb-4"
            />
            <Typography variant="headline-md" className="mb-2">
              Error Loading Practice
            </Typography>
            <Typography variant="body-md" color="muted" className="mb-4">
              {error?.message || "Practice script not found"}
            </Typography>
            <Button variant="secondary" onClick={() => navigate("/boxcall")}>
              Back to BoxCall
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Pre-session start screen
  if (!isSessionActive && !isPaused && !session) {
    return (
      <div className="py-6">
        <div className="container-page">
          <Card className="p-8">
            <div className="text-center mb-6">
              <Typography variant="headline-lg" className="mb-2">
                {practiceScript.name}
              </Typography>
              <Typography variant="body-md" color="muted">
                {scriptPlays.length} plays ·{" "}
                {mode === "live" ? "Live" : "Retroactive"} session
              </Typography>
            </div>

            <div className="bg-surface-secondary rounded-lg p-6 mb-6">
              <Typography variant="body-md" className="mb-4">
                <strong>Session Overview:</strong>
              </Typography>
              <ul className="space-y-2 text-text-secondary">
                <li className="flex items-start gap-2">
                  <Icon name="check" size="sm" className="mt-0.5" />
                  <Typography variant="body-sm">
                    Track{" "}
                    {scriptPlays.reduce((sum, p) => sum + (p.reps || 10), 0)}{" "}
                    total reps
                  </Typography>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="check" size="sm" className="mt-0.5" />
                  <Typography variant="body-sm">
                    Auto-save every 30 seconds
                  </Typography>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="check" size="sm" className="mt-0.5" />
                  <Typography variant="body-sm">
                    Works offline with auto-sync
                  </Typography>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="check" size="sm" className="mt-0.5" />
                  <Typography variant="body-sm">
                    Keyboard shortcuts: S (success), F (failure), N (neutral), K
                    (skip)
                  </Typography>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate("/boxcall")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleStart}
                className="flex-1"
              >
                <Icon name="play" size="sm" />
                Start Practice
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Active session screen
  return (
    <div className="py-6">
      <div className="container-page">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <Typography variant="headline-lg">
                {practiceScript.name}
              </Typography>
              <Typography variant="body-sm" color="muted">
                {mode === "live" ? "Live" : "Retroactive"} Practice Session
              </Typography>
            </div>
            <div className="flex items-center gap-3">
              {hasPendingSync && (
                <div className="flex items-center gap-2 text-warning">
                  <Icon name="cloud-off" size="sm" />
                  <Typography variant="body-sm">
                    Syncing offline data...
                  </Typography>
                </div>
              )}
              {isPaused ? (
                <Button variant="primary" size="md" onClick={resumeSession}>
                  <Icon name="play" size="sm" />
                  Resume
                </Button>
              ) : (
                <Button variant="secondary" size="md" onClick={pauseSession}>
                  <Icon name="pause" size="sm" />
                  Pause
                </Button>
              )}
              <Button variant="ghost" size="md" onClick={handleEnd}>
                End Session
              </Button>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <Typography variant="body-sm" className="text-text-secondary">
                Overall Progress
              </Typography>
              <Typography variant="body-sm" className="font-medium">
                {Math.round(overallProgress)}%
              </Typography>
            </div>
            <div className="w-full bg-surface-secondary rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Current Play Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Play Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Typography variant="headline-md">
                  Play {currentPlayIndex + 1} of {scriptPlays.length}
                </Typography>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={previousPlay}
                    disabled={currentPlayIndex === 0 || isPaused}
                  >
                    <Icon name="chevron-left" size="sm" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextPlay}
                    disabled={isLastPlay || isPaused}
                  >
                    <Icon name="chevron-right" size="sm" />
                  </Button>
                </div>
              </div>

              {currentPlay && (
                <>
                  <div className="mb-4">
                    <Typography variant="headline-lg" className="mb-2">
                      {currentPlay.play?.name || "Unknown Play"}
                    </Typography>
                    {currentPlay.play?.formation_name && (
                      <Typography variant="body-md" color="muted">
                        Formation: {currentPlay.play.formation_name}
                      </Typography>
                    )}
                    {currentPlay.play?.personnel_grouping && (
                      <Typography variant="body-sm" color="muted">
                        Personnel: {currentPlay.play.personnel_grouping}
                      </Typography>
                    )}
                  </div>

                  {/* Play Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Typography
                        variant="body-sm"
                        className="text-text-secondary"
                      >
                        Play Progress
                      </Typography>
                      <Typography variant="body-sm" className="font-medium">
                        {Math.round(playProgress)}%
                      </Typography>
                    </div>
                    <div className="w-full bg-surface-secondary rounded-full h-2">
                      <div
                        className="bg-success rounded-full h-2 transition-all duration-300"
                        style={{ width: `${playProgress}%` }}
                      />
                    </div>
                  </div>

                  {currentPlay.notes && (
                    <div className="bg-surface-secondary rounded-lg p-3">
                      <Typography
                        variant="body-sm"
                        className="text-text-secondary"
                      >
                        <strong>Coach Notes:</strong> {currentPlay.notes}
                      </Typography>
                    </div>
                  )}
                </>
              )}
            </Card>

            {/* Rep Tracker */}
            <Card className="p-6">
              <RepTracker
                currentRep={currentRepNumber}
                totalReps={totalRepsForCurrentPlay}
                onResult={handleRepResult}
                onSkip={handleSkip}
                disabled={isPaused}
              />
            </Card>

            {/* Optional Notes */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Typography variant="body-md" className="font-medium">
                  Add Notes (Optional)
                </Typography>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotes(!showNotes)}
                >
                  {showNotes ? "Hide" : "Show"}
                </Button>
              </div>
              {showNotes && (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes for this rep..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface-primary text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  disabled={isPaused}
                />
              )}
            </Card>
          </div>

          {/* Right Column: Session Stats */}
          <div className="space-y-6">
            {/* Session Stats */}
            <Card className="p-6">
              <Typography variant="headline-sm" className="mb-4">
                Session Stats
              </Typography>
              <div className="space-y-4">
                <div>
                  <Typography variant="body-sm" color="muted">
                    Total Reps
                  </Typography>
                  <Typography variant="headline-md">
                    {session?.completedReps || 0} / {session?.totalReps || 0}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body-sm" color="muted">
                    Success Rate
                  </Typography>
                  <Typography variant="headline-md" className="text-success">
                    {session?.successRate?.toFixed(1) || 0}%
                  </Typography>
                </div>
                <div>
                  <Typography variant="body-sm" color="muted">
                    Successful Reps
                  </Typography>
                  <Typography variant="body-lg">
                    {session?.successfulReps || 0}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body-sm" color="muted">
                    Failed Reps
                  </Typography>
                  <Typography variant="body-lg">
                    {session?.failedReps || 0}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body-sm" color="muted">
                    Neutral Reps
                  </Typography>
                  <Typography variant="body-lg">
                    {session?.neutralReps || 0}
                  </Typography>
                </div>
              </div>
            </Card>

            {/* Play List */}
            <Card className="p-6">
              <Typography variant="headline-sm" className="mb-4">
                Script Plays
              </Typography>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {scriptPlays.map((play, index) => (
                  <button
                    key={play.id}
                    onClick={() => {
                      // TODO: Implement play navigation
                    }}
                    disabled={isPaused}
                    className={`
                      w-full text-left p-3 rounded-lg border transition-colors
                      ${
                        index === currentPlayIndex
                          ? "border-primary bg-primary/10"
                          : index < currentPlayIndex
                            ? "border-success/30 bg-success/5"
                            : "border-border hover:border-primary/50"
                      }
                      ${isPaused ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                    `}
                  >
                    <Typography variant="body-sm" className="font-medium">
                      {index + 1}. {play.play?.name || "Unknown"}
                    </Typography>
                    <Typography variant="body-xs" color="muted">
                      {play.reps || 10} reps
                    </Typography>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeSession;
