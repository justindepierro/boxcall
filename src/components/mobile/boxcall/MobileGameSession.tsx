/**
 * Mobile Game Session Component
 * Optimized for one-handed sideline operation
 *
 * Features:
 * - Quick situation updates (down, distance, yard line)
 * - Large play result buttons at bottom
 * - Minimal scrolling required
 * - Quick access to common situations
 * - Landscape support for iPad with split view
 */

/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */

import React, { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Typography } from "../../design-system";
import { Button, Dropdown } from "../../ui";
import { Icon } from "../../ui/Icon/Icon";
import { useGameSession } from "../../../hooks/useGameSession";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";
import type { ExecutionResult } from "../../../types/session";
import { logError } from "../../../utils/logger";

export const MobileGameSession: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = (searchParams.get("mode") as "live" | "retroactive") || "live";

  const [showSituationPicker, setShowSituationPicker] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [opponent] = useState("Opponent");

  const {
    isLoading,
    error,
    gamePlan,
    situation,
    updateSituation,
    currentPlay,
    startSession,
    endSession,
    logPlay,
    isSessionActive,
    isPaused,
  } = useGameSession({
    gamePlanId: planId || "",
    mode,
    opponent,
  });

  // Quick down increment (auto-advance logic)
  const handleQuickDownUpdate = () => {
    if (!situation) return;

    const nextDown = situation.down < 4 ? situation.down + 1 : 1;
    updateSituation({ down: nextDown });
  };

  // Quick play logging with haptic feedback
  const handleQuickLog = async (result: ExecutionResult, yards?: number) => {
    // Haptic feedback using standardized utility
    triggerHapticFeedback("light");

    if (!currentPlay) return;

    try {
      await logPlay(currentPlay, result, yards || 0, {
        notes: notes || undefined,
      });
      setNotes("");
      setShowNotes(false);

      // Auto-advance down on successful plays
      if (result === "success" && yards !== undefined && yards > 0) {
        handleQuickDownUpdate();
      }
    } catch (err) {
      logError("Error logging play:", err);
    }
  };

  // Quick situation presets
  const quickSituations = [
    { label: "1st & 10", down: 1, distance: 10 },
    { label: "3rd & Short", down: 3, distance: 3 },
    { label: "3rd & Long", down: 3, distance: 10 },
    { label: "Red Zone", down: 1, distance: 10, yardLine: 15 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-primary">
        <Typography variant="body-lg" className="text-secondary">
          Loading...
        </Typography>
      </div>
    );
  }

  if (error || !gamePlan) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-primary p-4">
        <Icon name="alert-circle" className="h-16 w-16 text-error-600 mb-4" />
        <Typography variant="headline-md" className="mb-2 text-center">
          Error Loading Game Plan
        </Typography>
        <Typography
          variant="body-md"
          className="text-secondary mb-6 text-center"
        >
          {error?.message || "Game plan not found"}
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
                {gamePlan.name}
              </Typography>
              <Typography variant="body-sm" className="text-secondary">
                {mode === "live" ? "Live" : "Past"} Game Session
              </Typography>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {gamePlan.opponent && (
            <div className="bg-secondary rounded-lg p-4">
              <Typography variant="body-sm" className="text-secondary mb-1">
                Opponent
              </Typography>
              <Typography variant="headline-sm" className="text-primary">
                {gamePlan.opponent}
              </Typography>
            </div>
          )}

          <div className="bg-secondary rounded-lg p-4">
            <Typography variant="headline-sm" className="mb-3 text-primary">
              Game Day Features
            </Typography>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Icon
                  name="check"
                  className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0"
                />
                <Typography variant="body-sm" className="text-secondary">
                  Quick down & distance updates
                </Typography>
              </li>
              <li className="flex items-start gap-2">
                <Icon
                  name="check"
                  className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0"
                />
                <Typography variant="body-sm" className="text-secondary">
                  Large buttons for sideline use
                </Typography>
              </li>
              <li className="flex items-start gap-2">
                <Icon
                  name="check"
                  className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0"
                />
                <Typography variant="body-sm" className="text-secondary">
                  Auto-sync when back online
                </Typography>
              </li>
            </ul>
          </div>
        </div>

        <div className="p-4 bg-secondary shadow-lg border-t border-border">
          <Button
            variant="primary"
            size="lg"
            onClick={startSession}
            className="w-full h-14 text-lg font-semibold"
          >
            <Icon name="play" className="h-6 w-6 mr-2" />
            Start Game
          </Button>
        </div>
      </div>
    );
  }

  // Active session screen
  return (
    <div className="flex flex-col h-screen bg-primary">
      {/* Compact Header with Situation */}
      <div className="bg-secondary shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="flex-1 min-w-0">
            <Typography
              variant="body-md"
              className="text-primary font-medium truncate"
            >
              {gamePlan.name}
            </Typography>
            {gamePlan.opponent && (
              <Typography variant="body-xs" className="text-secondary">
                vs {gamePlan.opponent}
              </Typography>
            )}
          </div>
          <button
            onClick={endSession}
            className="ml-3 p-2 text-secondary active:text-error-600 active:bg-error-bg rounded-lg transition-colors"
          >
            <Icon name="close" className="h-6 w-6" />
          </button>
        </div>

        {/* Down & Distance - Large and Prominent */}
        <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5">
          <button
            onClick={() => setShowSituationPicker(!showSituationPicker)}
            className="w-full"
          >
            <div className="flex items-center justify-center gap-3 mb-1">
              <Typography
                variant="headline-lg"
                className="text-primary font-bold"
              >
                {situation
                  ? `${situation.down}${["st", "nd", "rd", "th"][situation.down - 1]} & ${situation.distance}`
                  : "Tap to Set"}
              </Typography>
              <Icon
                name={showSituationPicker ? "chevron-up" : "chevron-down"}
                className="h-5 w-5 text-secondary"
              />
            </div>
            {situation?.yardLine && (
              <Typography variant="body-sm" className="text-secondary">
                Yard Line: {situation.yardLine}
              </Typography>
            )}
          </button>
        </div>

        {/* Quick Situation Picker */}
        {showSituationPicker && (
          <div className="p-4 bg-primary border-t border-border">
            <Typography variant="body-sm" className="text-secondary mb-3">
              Quick Situations
            </Typography>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {quickSituations.map((sit) => (
                <button
                  key={sit.label}
                  onClick={() => {
                    updateSituation({
                      down: sit.down,
                      distance: sit.distance,
                      yardLine: sit.yardLine,
                    });
                    setShowSituationPicker(false);
                  }}
                  className="p-3 bg-secondary active:bg-muted border border-border rounded-lg transition-all active:scale-95"
                >
                  <Typography
                    variant="body-sm"
                    className="font-medium text-primary"
                  >
                    {sit.label}
                  </Typography>
                </button>
              ))}
            </div>

            {/* Manual Adjustment */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Typography variant="body-xs" className="text-secondary mb-1">
                  Down
                </Typography>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((d) => (
                    <button
                      key={d}
                      onClick={() => updateSituation({ down: d })}
                      className={`flex-1 p-2 rounded ${
                        situation?.down === d
                          ? "bg-primary text-white"
                          : "bg-secondary text-secondary"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Typography variant="body-xs" className="text-secondary mb-1">
                  Distance
                </Typography>
                <Dropdown
                  value={String(situation?.distance || 10)}
                  onChange={(value) =>
                    updateSituation({ distance: parseInt(value) })
                  }
                  options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map((d) => ({
                    value: String(d),
                    label: String(d),
                  }))}
                  size="md"
                />
              </div>
              <div>
                <Typography variant="body-xs" className="text-secondary mb-1">
                  Yard Line
                </Typography>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={situation?.yardLine || 50}
                  onChange={(e) =>
                    updateSituation({
                      yardLine: parseInt(e.target.value) || 50,
                    })
                  }
                  className="w-full p-2 bg-secondary border border-border rounded text-primary"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content - Current Play */}
      <div className="flex-1 overflow-auto p-4">
        {currentPlay ? (
          <div className="space-y-3">
            <div className="bg-secondary rounded-lg p-4">
              <Typography variant="headline-md" className="text-primary mb-2">
                {currentPlay.play?.play_name || "Select Play"}
              </Typography>
              {currentPlay.play?.formation && (
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="grid" className="h-4 w-4 text-secondary" />
                  <Typography variant="body-sm" className="text-secondary">
                    {currentPlay.play.formation}
                  </Typography>
                </div>
              )}
              {currentPlay.notes && (
                <Typography
                  variant="body-sm"
                  className="text-secondary italic mt-2"
                >
                  {currentPlay.notes}
                </Typography>
              )}
            </div>

            {/* Notes Input */}
            {showNotes && (
              <div className="bg-secondary rounded-lg p-4">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Play notes (optional)..."
                  className="w-full bg-primary border border-border rounded-lg p-3 text-primary placeholder-text-muted resize-none"
                  rows={3}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Icon name="target" className="h-12 w-12 text-secondary mb-3" />
            <Typography variant="body-md" className="text-secondary">
              Select a play from your game plan
            </Typography>
          </div>
        )}
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

        {/* Main Action Buttons */}
        <div className="grid grid-cols-2 gap-3 p-4">
          {/* Success - Big gain */}
          <button
            onClick={() => handleQuickLog("success", 10)}
            disabled={isPaused}
            className="flex flex-col items-center justify-center h-24 bg-success-600 active:bg-success-700 disabled:bg-muted disabled:text-muted text-white rounded-xl shadow-lg transition-all active:scale-95"
          >
            <Icon name="trending-up" className="h-8 w-8 mb-1" />
            <Typography variant="body-md" className="font-semibold">
              Success
            </Typography>
            <Typography variant="body-xs" className="opacity-80">
              Big Gain
            </Typography>
          </button>

          {/* Failure - No gain */}
          <button
            onClick={() => handleQuickLog("failure", 0)}
            disabled={isPaused}
            className="flex flex-col items-center justify-center h-24 bg-error-600 active:bg-error-700 disabled:bg-muted disabled:text-muted text-white rounded-xl shadow-lg transition-all active:scale-95"
          >
            <Icon name="alert-circle" className="h-8 w-8 mb-1" />
            <Typography variant="body-md" className="font-semibold">
              Failure
            </Typography>
            <Typography variant="body-xs" className="opacity-80">
              No Gain
            </Typography>
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-3 gap-3 px-4 pb-4">
          <button
            onClick={() => handleQuickLog("neutral", 5)}
            disabled={isPaused}
            className="flex flex-col items-center justify-center h-16 bg-primary active:bg-muted disabled:opacity-50 border border-border rounded-lg transition-all active:scale-95"
          >
            <Icon name="minus" className="h-6 w-6 text-secondary mb-1" />
            <Typography variant="body-xs" className="text-secondary">
              Neutral
            </Typography>
          </button>

          <button
            onClick={() => handleQuickLog("success", 0)}
            disabled={isPaused}
            className="flex flex-col items-center justify-center h-16 bg-primary active:bg-muted disabled:opacity-50 border border-border rounded-lg transition-all active:scale-95"
          >
            <Icon name="shield" className="h-6 w-6 text-secondary mb-1" />
            <Typography variant="body-xs" className="text-secondary">
              Penalty
            </Typography>
          </button>

          <button
            onClick={handleQuickDownUpdate}
            disabled={isPaused}
            className="flex flex-col items-center justify-center h-16 bg-primary active:bg-primary-600 disabled:bg-muted disabled:text-muted text-white rounded-lg transition-all active:scale-95"
          >
            <Icon name="arrow-right" className="h-6 w-6 mb-1" />
            <Typography variant="body-xs" className="font-medium">
              Next Down
            </Typography>
          </button>
        </div>

        {/* Safe area padding for iOS */}
        <div
          className="bg-secondary"
          style={{ height: "env(safe-area-inset-bottom, 0px)" }}
        />
      </div>
    </div>
  );
};
