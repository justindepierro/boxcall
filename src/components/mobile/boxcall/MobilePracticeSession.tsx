/**
 * Mobile Practice Session Component
 * Optimized for one-handed operation while holding scripts
 *
 * Features:
 * - Large thumb-friendly buttons at bottom
 * - Swipe gestures for quick actions
 * - Minimal top-screen tapping
 * - Landscape support for iPad
 */

import React, { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Typography } from "../../design-system";
import { Button } from "../../ui";
import { Icon } from "../../ui/Icon/Icon";
import { usePracticeSession } from "../../../hooks/usePracticeSession";
import type { ExecutionResult } from "../../../types/session";

export const MobilePracticeSession: React.FC = () => {
  const { scriptId } = useParams<{ scriptId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = (searchParams.get("mode") as "live" | "retroactive") || "live";

  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [touchStartX, setTouchStartX] = useState(0);

  const {
    isLoading,
    error,
    practiceScript,
    scriptPlays,
    currentPlayIndex,
    currentPlay,
    currentRepNumber,
    totalRepsForCurrentPlay,
    overallProgress,
    startSession,
    endSession,
    logRep,
    skipRep,
    nextPlay,
    previousPlay,
    isSessionActive,
    isPaused,
    isLastPlay,
  } = usePracticeSession({
    practiceScriptId: scriptId || "",
    mode,
  });

  // Swipe gesture handling for next/previous play
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    // Swipe left = next play (if diff > 50px)
    if (diff > 50 && !isLastPlay) {
      nextPlay();
    }
    // Swipe right = previous play (if diff < -50px)
    else if (diff < -50 && currentPlayIndex > 0) {
      previousPlay();
    }

    setTouchStartX(0);
  };

  // Quick rep logging with haptic feedback
  const handleQuickLog = async (result: ExecutionResult) => {
    // Haptic feedback on iOS
    if ("vibrate" in navigator) {
      navigator.vibrate(10);
    }

    try {
      await logRep(result, notes || undefined, []);
      setNotes(""); // Clear notes
      setShowNotes(false);
    } catch (err) {
      console.error("Error logging rep:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-primary">
        <Typography variant="body-lg" className="text-secondary">
          Loading...
        </Typography>
      </div>
    );
  }

  if (error || !practiceScript) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-primary p-4">
        <Icon name="alert-circle" className="h-16 w-16 text-error-600 mb-4" />
        <Typography variant="headline-md" className="mb-2 text-center">
          Error Loading Practice Script
        </Typography>
        <Typography
          variant="body-md"
          className="text-secondary mb-6 text-center"
        >
          {error?.message || "Practice script not found"}
        </Typography>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate("/boxcall")}
          className="w-full max-w-sm"
        >
          Back to BoXCall
        </Button>
      </div>
    );
  }

  // Pre-session start screen
  if (!isSessionActive) {
    return (
      <div className="flex flex-col h-screen bg-primary">
        {/* Header */}
        <div className="bg-secondary p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate("/boxcall")}
              className="p-2 -ml-2 text-secondary active:text-primary"
            >
              <Icon name="arrow-left" className="h-6 w-6" />
            </button>
            <div className="flex-1">
              <Typography variant="headline-md" className="text-primary">
                {practiceScript.title || "Practice Script"}
              </Typography>
              <Typography variant="body-sm" className="text-secondary">
                {mode === "live" ? "Live" : "Past"} Practice Session
              </Typography>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          <div className="bg-secondary rounded-lg p-4">
            <Typography
              variant="headline-sm"
              className="mb-3 text-primary"
            >
              Quick Tips
            </Typography>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Icon
                  name="check"
                  className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0"
                />
                <Typography variant="body-sm" className="text-secondary">
                  Buttons at bottom for one-handed use
                </Typography>
              </li>
              <li className="flex items-start gap-2">
                <Icon
                  name="check"
                  className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0"
                />
                <Typography variant="body-sm" className="text-secondary">
                  Swipe left/right to change plays
                </Typography>
              </li>
              <li className="flex items-start gap-2">
                <Icon
                  name="check"
                  className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0"
                />
                <Typography variant="body-sm" className="text-secondary">
                  Works offline - syncs automatically
                </Typography>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="p-4 bg-secondary shadow-lg border-t border-border">
          <Button
            variant="primary"
            size="lg"
            onClick={startSession}
            className="w-full h-14 text-lg font-semibold"
          >
            <Icon name="play" className="h-6 w-6 mr-2" />
            Start Practice
          </Button>
        </div>
      </div>
    );
  }

  // Active session screen
  return (
    <div
      className="flex flex-col h-screen bg-primary"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Compact Header */}
      <div className="bg-secondary p-3 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <Typography
              variant="body-md"
              className="text-primary font-medium truncate"
            >
              {currentPlay?.play?.name || "Unknown Play"}
            </Typography>
            <Typography variant="body-xs" className="text-secondary">
              Play {currentPlayIndex + 1}/{scriptPlays.length || 0} • Rep{" "}
              {currentRepNumber}/{totalRepsForCurrentPlay}
            </Typography>
          </div>
          <button
            onClick={endSession}
            className="ml-3 p-2 text-secondary active:text-error-600 active:bg-error-bg rounded-lg transition-colors"
          >
            <Icon name="close" className="h-6 w-6" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-2 bg-primary rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-600 transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Main Content Area - Minimal top interaction */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-3">
          {/* Rep Progress Dots */}
          <div className="flex flex-wrap gap-2 justify-center py-2">
            {Array.from({ length: totalRepsForCurrentPlay }).map((_, idx) => (
              <div
                key={idx}
                className={`h-3 w-3 rounded-full transition-all ${
                  idx < currentRepNumber - 1
                    ? "bg-success-600"
                    : idx === currentRepNumber - 1
                      ? "bg-primary ring-4 ring-primary/20 scale-125"
                      : "bg-secondary"
                }`}
              />
            ))}
          </div>

          {/* Play Details */}
          {currentPlay?.play && (
            <div className="bg-secondary rounded-lg p-4 space-y-2">
              {currentPlay.play.formation_name && (
                <div className="flex items-center gap-2">
                  <Icon name="grid" className="h-4 w-4 text-secondary" />
                  <Typography variant="body-sm" className="text-secondary">
                    {currentPlay.play.formation_name}
                  </Typography>
                </div>
              )}
              {currentPlay.play.personnel_grouping && (
                <div className="flex items-center gap-2">
                  <Icon name="users" className="h-4 w-4 text-secondary" />
                  <Typography variant="body-sm" className="text-secondary">
                    {currentPlay.play.personnel_grouping}
                  </Typography>
                </div>
              )}
              {currentPlay.notes && (
                <div className="pt-2 border-t border-border">
                  <Typography
                    variant="body-sm"
                    className="text-secondary italic"
                  >
                    {currentPlay.notes}
                  </Typography>
                </div>
              )}
            </div>
          )}

          {/* Notes Input (optional) */}
          {showNotes && (
            <div className="bg-secondary rounded-lg p-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes for this rep..."
                className="w-full bg-primary border border-border rounded-lg p-3 text-primary placeholder-text-muted resize-none"
                rows={3}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar - Thumb Zone */}
      <div className="flex-shrink-0 bg-secondary shadow-2xl border-t border-border">
        {/* Notes Toggle */}
        <div className="px-4 pt-3 pb-2">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center gap-2 text-secondary active:text-primary"
          >
            <Icon name="message-circle" className="h-5 w-5" />
            <Typography variant="body-sm">
              {showNotes ? "Hide" : "Add"} Notes
            </Typography>
          </button>
        </div>

        {/* Main Action Buttons - Large and Thumb-Friendly */}
        <div className="grid grid-cols-2 gap-3 p-4">
          {/* Success Button - Bottom Left (easiest thumb reach) */}
          <button
            onClick={() => handleQuickLog("success")}
            disabled={isPaused}
            className="flex flex-col items-center justify-center h-24 bg-success-600 active:bg-success-700 disabled:bg-muted disabled:text-muted text-white rounded-xl shadow-lg transition-all active:scale-95"
          >
            <Icon name="check-circle" className="h-8 w-8 mb-1" />
            <Typography variant="body-md" className="font-semibold">
              Success
            </Typography>
          </button>

          {/* Failure Button - Bottom Right */}
          <button
            onClick={() => handleQuickLog("failure")}
            disabled={isPaused}
            className="flex flex-col items-center justify-center h-24 bg-error-600 active:bg-error-700 disabled:bg-muted disabled:text-muted text-white rounded-xl shadow-lg transition-all active:scale-95"
          >
            <Icon name="x-circle" className="h-8 w-8 mb-1" />
            <Typography variant="body-md" className="font-semibold">
              Failure
            </Typography>
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-3 gap-3 px-4 pb-4">
          <button
            onClick={() => handleQuickLog("neutral")}
            disabled={isPaused}
            className="flex flex-col items-center justify-center h-16 bg-primary active:bg-muted disabled:opacity-50 border border-border rounded-lg transition-all active:scale-95"
          >
            <Icon
              name="minus-circle"
              className="h-6 w-6 text-secondary mb-1"
            />
            <Typography variant="body-xs" className="text-secondary">
              Neutral
            </Typography>
          </button>

          <button
            onClick={() => skipRep()}
            disabled={isPaused}
            className="flex flex-col items-center justify-center h-16 bg-primary active:bg-muted disabled:opacity-50 border border-border rounded-lg transition-all active:scale-95"
          >
            <Icon
              name="skip-forward"
              className="h-6 w-6 text-secondary mb-1"
            />
            <Typography variant="body-xs" className="text-secondary">
              Skip
            </Typography>
          </button>

          <button
            onClick={nextPlay}
            disabled={isPaused || isLastPlay}
            className="flex flex-col items-center justify-center h-16 bg-primary active:bg-primary-600 disabled:bg-muted disabled:text-muted text-white rounded-lg transition-all active:scale-95"
          >
            <Icon name="chevron-right" className="h-6 w-6 mb-1" />
            <Typography variant="body-xs" className="font-medium">
              Next Play
            </Typography>
          </button>
        </div>

        {/* Safe area padding for iOS */}
        <div className="h-safe-area-inset-bottom bg-secondary" />
      </div>
    </div>
  );
};
