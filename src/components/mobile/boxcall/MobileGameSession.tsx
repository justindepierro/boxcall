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

import { useState, useCallback, useMemo, memo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Typography } from "../../design-system";
import { Button, Dropdown } from "../../ui";
import { Icon } from "../../ui/Icon/Icon";
import { useGameSession } from "../../../hooks/useGameSession";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";
import type { ExecutionResult } from "../../../types/session";
import { logError } from "../../../utils/logger";
import { yardLineToBallOn } from "../../../utils/ballOn";

// Animation variants for smooth transitions
const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const pageTransition = {
  duration: 0.2,
  ease: "easeOut" as const,
};

// Skeleton component for loading state
const LoadingSkeleton = memo(() => (
  <div
    className="flex flex-col h-screen bg-surface-primary"
    role="status"
    aria-label="Loading game session"
  >
    {/* Header skeleton */}
    <div className="bg-surface-secondary p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-neutral-200 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-48 rounded bg-neutral-200 animate-pulse" />
          <div className="h-4 w-32 rounded bg-neutral-200 animate-pulse" />
        </div>
      </div>
    </div>
    {/* Situation skeleton */}
    <div className="p-4 bg-gradient-to-r from-neutral-100 to-neutral-50">
      <div className="h-8 w-32 mx-auto rounded bg-neutral-200 animate-pulse" />
    </div>
    {/* Content skeleton */}
    <div className="flex-1 p-4 space-y-4">
      <div className="h-32 rounded-xl bg-neutral-200 animate-pulse" />
      <div className="h-24 rounded-xl bg-neutral-200 animate-pulse" />
    </div>
    {/* Bottom skeleton */}
    <div className="p-4 bg-surface-secondary border-t border-border">
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 rounded-xl bg-neutral-200 animate-pulse" />
        <div className="h-24 rounded-xl bg-neutral-200 animate-pulse" />
      </div>
    </div>
  </div>
));
LoadingSkeleton.displayName = "LoadingSkeleton";

function MobileGameSessionInner() {
  const { planId } = useParams<{ planId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = (searchParams.get("mode") as "live" | "retroactive") || "live";

  const [showSituationPicker, setShowSituationPicker] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [opponent] = useState("Opponent");
  const [lastLogResult, setLastLogResult] = useState<ExecutionResult | null>(
    null
  );

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

  // Memoized quick down increment (auto-advance logic)
  const handleQuickDownUpdate = useCallback(() => {
    if (!situation) return;
    triggerHapticFeedback("light");
    const nextDown = situation.down < 4 ? situation.down + 1 : 1;
    updateSituation({ down: nextDown });
  }, [situation, updateSituation]);

  // Memoized play logging with visual feedback
  const handleQuickLog = useCallback(
    async (result: ExecutionResult, yards?: number) => {
      triggerHapticFeedback(result === "success" ? "medium" : "light");
      setLastLogResult(result);

      // Clear visual feedback after animation
      setTimeout(() => setLastLogResult(null), 400);

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
    },
    [currentPlay, logPlay, notes, handleQuickDownUpdate]
  );

  // Memoized button handlers
  const handleSuccessLog = useCallback(
    () => handleQuickLog("success", 10),
    [handleQuickLog]
  );
  const handleFailureLog = useCallback(
    () => handleQuickLog("failure", 0),
    [handleQuickLog]
  );
  const handleNeutralLog = useCallback(
    () => handleQuickLog("neutral", 5),
    [handleQuickLog]
  );
  const handlePenaltyLog = useCallback(
    () => handleQuickLog("success", 0),
    [handleQuickLog]
  );
  const handleBackNavigation = useCallback(() => {
    triggerHapticFeedback("light");
    navigate("/boxcall");
  }, [navigate]);
  const handleToggleNotes = useCallback(() => {
    triggerHapticFeedback("light");
    setShowNotes((prev) => !prev);
  }, []);
  const handleToggleSituationPicker = useCallback(() => {
    triggerHapticFeedback("light");
    setShowSituationPicker((prev) => !prev);
  }, []);
  const handleStartSession = useCallback(() => {
    triggerHapticFeedback("medium");
    startSession();
  }, [startSession]);
  const handleEndSession = useCallback(() => {
    triggerHapticFeedback("light");
    endSession();
  }, [endSession]);

  // Memoized quick situation presets
  const quickSituations = useMemo(
    () => [
      { label: "1st & 10", down: 1, distance: 10 },
      { label: "3rd & Short", down: 3, distance: 3 },
      { label: "3rd & Long", down: 3, distance: 10 },
      { label: "Red Zone", down: 1, distance: 10, yardLine: 15 },
    ],
    []
  );

  // Memoized mode label
  const modeLabel = useMemo(() => (mode === "live" ? "Live" : "Past"), [mode]);

  // Loading state with skeleton
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !gamePlan) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-screen bg-surface-primary p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        role="alert"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mb-6 shadow-lg shadow-red-500/25">
          <Icon
            name="alert-circle"
            className="h-10 w-10 text-white"
            aria-hidden="true"
          />
        </div>
        <Typography
          variant="headline-md"
          className="mb-2 text-center text-primary"
        >
          Error Loading Game Plan
        </Typography>
        <Typography
          variant="body-md"
          className="text-secondary mb-6 text-center max-w-xs"
        >
          {error?.message || "Game plan not found"}
        </Typography>
        <Button
          variant="primary"
          size="lg"
          onClick={handleBackNavigation}
          className="w-full max-w-sm"
        >
          Back to BoXCall
        </Button>
      </motion.div>
    );
  }

  // Pre-session start screen
  if (!isSessionActive) {
    return (
      <motion.div
        className="flex flex-col h-screen bg-surface-primary"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
      >
        {/* Header */}
        <header className="bg-surface-secondary p-4 shadow-sm border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackNavigation}
              className="p-2 -ml-2 text-secondary hover:text-primary active:scale-95 rounded-lg transition-all touch-manipulation"
              aria-label="Back to BoxCall"
            >
              <Icon name="arrow-left" className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex-1 min-w-0">
              <Typography
                variant="headline-md"
                className="text-primary truncate"
              >
                {gamePlan.name}
              </Typography>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm ${
                    mode === "live"
                      ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                      : "bg-gradient-to-r from-amber-400 to-orange-400 text-white"
                  }`}
                >
                  {mode === "live" ? "● LIVE" : "◐ RETROACTIVE"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Game Summary Card */}
          <div className="bg-gradient-to-br from-navy-600 to-navy-700 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Icon
                  name="target"
                  className="h-6 w-6 text-white"
                  aria-hidden="true"
                />
              </div>
              <div>
                <Typography variant="headline-sm" className="text-white">
                  Game Day Ready
                </Typography>
                {gamePlan.opponent && (
                  <Typography variant="body-sm" className="text-white/80">
                    vs {gamePlan.opponent}
                  </Typography>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white/10 rounded-lg p-2">
                <Typography variant="headline-md" className="text-white">
                  {modeLabel}
                </Typography>
                <Typography variant="body-xs" className="text-white/70">
                  Mode
                </Typography>
              </div>
              <div className="bg-white/10 rounded-lg p-2">
                <Typography variant="headline-md" className="text-white">
                  0
                </Typography>
                <Typography variant="body-xs" className="text-white/70">
                  Plays Logged
                </Typography>
              </div>
              <div className="bg-white/10 rounded-lg p-2">
                <Typography variant="headline-md" className="text-white">
                  Q1
                </Typography>
                <Typography variant="body-xs" className="text-white/70">
                  Quarter
                </Typography>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-surface-secondary rounded-xl p-4 border border-border">
            <Typography
              variant="label-md"
              className="mb-3 text-secondary uppercase tracking-wide"
            >
              Game Day Features
            </Typography>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-success-100 flex items-center justify-center flex-shrink-0">
                  <Icon
                    name="check"
                    className="h-4 w-4 text-success-600"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <Typography
                    variant="body-sm"
                    className="text-primary font-medium"
                  >
                    Quick Down Updates
                  </Typography>
                  <Typography variant="body-xs" className="text-secondary">
                    Tap to update down & distance instantly
                  </Typography>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-jade/10 flex items-center justify-center flex-shrink-0">
                  <Icon
                    name="hand"
                    className="h-4 w-4 text-brand-jade"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <Typography
                    variant="body-sm"
                    className="text-primary font-medium"
                  >
                    Sideline-Ready
                  </Typography>
                  <Typography variant="body-xs" className="text-secondary">
                    Large buttons designed for one-handed use
                  </Typography>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Icon
                    name="wifi-off"
                    className="h-4 w-4 text-blue-600"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <Typography
                    variant="body-sm"
                    className="text-primary font-medium"
                  >
                    Works Offline
                  </Typography>
                  <Typography variant="body-xs" className="text-secondary">
                    Auto-sync when back online
                  </Typography>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="p-4 bg-surface-secondary shadow-lg border-t border-border">
          <Button
            variant="primary"
            size="lg"
            onClick={handleStartSession}
            className="w-full h-14 text-lg font-semibold shadow-lg shadow-jade-500/25"
          >
            <Icon name="play" className="h-6 w-6 mr-2" aria-hidden="true" />
            Start Game
          </Button>
          {/* Safe area padding */}
          <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
        </div>
      </motion.div>
    );
  }

  // Active session screen
  return (
    <motion.div
      className="flex flex-col h-screen bg-surface-primary"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      role="main"
      aria-label="Active game session"
    >
      {/* Compact Header with Situation */}
      <header className="bg-surface-secondary shadow-sm flex-shrink-0 border-b border-border">
        <div className="flex items-center justify-between p-3">
          <div className="flex-1 min-w-0">
            <Typography
              variant="body-md"
              className="text-primary font-semibold truncate"
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
            onClick={handleEndSession}
            className="ml-3 p-2.5 text-secondary hover:text-error-600 hover:bg-error-50 active:scale-95 rounded-lg transition-all touch-manipulation"
            aria-label="End session"
          >
            <Icon name="close" className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Down & Distance - Large and Prominent */}
        <div className="p-4 bg-gradient-to-r from-navy-500/10 to-navy-500/5">
          <button
            onClick={handleToggleSituationPicker}
            className="w-full touch-manipulation"
            aria-expanded={showSituationPicker}
            aria-label="Toggle situation picker"
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
                aria-hidden="true"
              />
            </div>
            {situation?.yardLine != null && (
              <Typography variant="body-sm" className="text-secondary">
                Ball On: {yardLineToBallOn(situation.yardLine)}
              </Typography>
            )}
          </button>
        </div>

        {/* Quick Situation Picker */}
        <AnimatePresence>
          {showSituationPicker && (
            <motion.div
              className="p-4 bg-surface-primary border-t border-border"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Typography variant="body-sm" className="text-secondary mb-3">
                Quick Situations
              </Typography>
              <div
                className="grid grid-cols-2 gap-2 mb-4"
                role="group"
                aria-label="Quick situation presets"
              >
                {quickSituations.map((sit) => (
                  <motion.button
                    key={sit.label}
                    onClick={() => {
                      triggerHapticFeedback("light");
                      updateSituation({
                        down: sit.down,
                        distance: sit.distance,
                        yardLine: sit.yardLine,
                      });
                      setShowSituationPicker(false);
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-surface-secondary hover:bg-neutral-100 border border-border rounded-xl transition-all touch-manipulation"
                  >
                    <Typography
                      variant="body-sm"
                      className="font-medium text-primary"
                    >
                      {sit.label}
                    </Typography>
                  </motion.button>
                ))}
              </div>

              {/* Manual Adjustment */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Typography variant="body-xs" className="text-secondary mb-1">
                    Down
                  </Typography>
                  <div
                    className="flex gap-1"
                    role="group"
                    aria-label="Down selector"
                  >
                    {[1, 2, 3, 4].map((d) => (
                      <button
                        key={d}
                        onClick={() => {
                          triggerHapticFeedback("light");
                          updateSituation({ down: d });
                        }}
                        className={`flex-1 p-2 rounded-lg transition-all touch-manipulation ${
                          situation?.down === d
                            ? "bg-brand-jade text-white font-semibold"
                            : "bg-surface-secondary text-secondary hover:bg-neutral-100"
                        }`}
                        aria-pressed={situation?.down === d}
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
                    options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map(
                      (d) => ({
                        value: String(d),
                        label: String(d),
                      })
                    )}
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
                    className="w-full p-2 bg-surface-secondary border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-jade-500/50"
                    aria-label="Yard line"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content - Current Play */}
      <main className="flex-1 overflow-auto p-4">
        {currentPlay ? (
          <div className="space-y-3">
            <motion.div
              className="bg-surface-secondary rounded-xl p-4 border border-border shadow-sm"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              key={currentPlay.id}
            >
              <Typography variant="headline-md" className="text-primary mb-2">
                {currentPlay.play?.play_name || "Select Play"}
              </Typography>
              {currentPlay.play?.formation && (
                <div className="flex items-center gap-2 mb-1">
                  <Icon
                    name="grid"
                    className="h-4 w-4 text-secondary"
                    aria-hidden="true"
                  />
                  <Typography variant="body-sm" className="text-secondary">
                    {currentPlay.play.formation}
                  </Typography>
                </div>
              )}
              {currentPlay.play?.personnel && (
                <div className="flex items-center gap-2">
                  <Icon
                    name="users"
                    className="h-4 w-4 text-secondary"
                    aria-hidden="true"
                  />
                  <Typography variant="body-sm" className="text-secondary">
                    {currentPlay.play.personnel}
                  </Typography>
                </div>
              )}
              {currentPlay.notes && (
                <div className="pt-2 mt-2 border-t border-border">
                  <Typography
                    variant="body-sm"
                    className="text-secondary italic"
                  >
                    {currentPlay.notes}
                  </Typography>
                </div>
              )}
            </motion.div>

            {/* Notes Input */}
            <AnimatePresence>
              {showNotes && (
                <motion.div
                  className="bg-surface-secondary rounded-xl p-4 border border-border"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes for this play..."
                    className="w-full bg-surface-primary border border-border rounded-lg p-3 text-primary placeholder-neutral-400 resize-none focus:outline-none focus:ring-2 focus:ring-jade-500/50"
                    rows={3}
                    aria-label="Play notes"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
              <Icon
                name="target"
                className="h-8 w-8 text-secondary"
                aria-hidden="true"
              />
            </div>
            <Typography variant="body-md" className="text-secondary">
              Select a play from your game plan
            </Typography>
          </div>
        )}
      </main>

      {/* Bottom Action Bar - Thumb Zone */}
      <footer className="flex-shrink-0 bg-surface-secondary shadow-2xl border-t border-border relative">
        {/* Visual feedback overlay for play logging */}
        <AnimatePresence>
          {lastLogResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={`absolute inset-0 pointer-events-none ${
                lastLogResult === "success"
                  ? "bg-success-500/10"
                  : lastLogResult === "failure"
                    ? "bg-error-500/10"
                    : "bg-neutral-500/10"
              }`}
            />
          )}
        </AnimatePresence>

        {/* Notes Toggle */}
        <div className="px-4 pt-3 pb-2">
          <button
            onClick={handleToggleNotes}
            className="flex items-center gap-2 text-secondary hover:text-primary active:scale-95 transition-all touch-manipulation"
            aria-pressed={showNotes}
            aria-label={showNotes ? "Hide notes" : "Add notes"}
          >
            <Icon
              name="message-circle"
              className="h-5 w-5"
              aria-hidden="true"
            />
            <Typography variant="body-sm">
              {showNotes ? "Hide" : "Add"} Notes
            </Typography>
          </button>
        </div>

        {/* Main Action Buttons - Large and Thumb-Friendly */}
        <div
          className="grid grid-cols-2 gap-3 px-4 pb-3"
          role="group"
          aria-label="Play result actions"
        >
          {/* Success - Big gain */}
          <motion.button
            onClick={handleSuccessLog}
            disabled={isPaused}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center h-24 bg-gradient-to-br from-success-500 to-success-600 disabled:from-neutral-300 disabled:to-neutral-400 text-white rounded-2xl shadow-lg shadow-success-500/30 transition-all touch-manipulation"
            aria-label="Log success - big gain"
          >
            <Icon
              name="trending-up"
              className="h-9 w-9 mb-1"
              aria-hidden="true"
            />
            <Typography variant="body-md" className="font-bold">
              Success
            </Typography>
            <Typography variant="body-xs" className="opacity-80">
              Big Gain
            </Typography>
          </motion.button>

          {/* Failure - No gain */}
          <motion.button
            onClick={handleFailureLog}
            disabled={isPaused}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center h-24 bg-gradient-to-br from-error-500 to-error-600 disabled:from-neutral-300 disabled:to-neutral-400 text-white rounded-2xl shadow-lg shadow-error-500/30 transition-all touch-manipulation"
            aria-label="Log failure - no gain"
          >
            <Icon
              name="alert-circle"
              className="h-9 w-9 mb-1"
              aria-hidden="true"
            />
            <Typography variant="body-md" className="font-bold">
              Failure
            </Typography>
            <Typography variant="body-xs" className="opacity-80">
              No Gain
            </Typography>
          </motion.button>
        </div>

        {/* Secondary Actions */}
        <div
          className="grid grid-cols-3 gap-3 px-4 pb-4"
          role="group"
          aria-label="Secondary actions"
        >
          <motion.button
            onClick={handleNeutralLog}
            disabled={isPaused}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center h-16 bg-surface-primary hover:bg-neutral-100 disabled:opacity-50 border border-border rounded-xl transition-all touch-manipulation"
            aria-label="Log neutral result"
          >
            <Icon
              name="minus-circle"
              className="h-6 w-6 text-secondary mb-1"
              aria-hidden="true"
            />
            <Typography
              variant="body-xs"
              className="text-secondary font-medium"
            >
              Neutral
            </Typography>
          </motion.button>

          <motion.button
            onClick={handlePenaltyLog}
            disabled={isPaused}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center h-16 bg-surface-primary hover:bg-neutral-100 disabled:opacity-50 border border-border rounded-xl transition-all touch-manipulation"
            aria-label="Log penalty"
          >
            <Icon
              name="flag"
              className="h-6 w-6 text-secondary mb-1"
              aria-hidden="true"
            />
            <Typography
              variant="body-xs"
              className="text-secondary font-medium"
            >
              Penalty
            </Typography>
          </motion.button>

          <motion.button
            onClick={handleQuickDownUpdate}
            disabled={isPaused}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center h-16 bg-brand-jade hover:bg-jade-600 disabled:bg-neutral-200 disabled:text-neutral-400 text-white rounded-xl transition-all touch-manipulation"
            aria-label="Advance to next down"
          >
            <Icon
              name="chevron-right"
              className="h-6 w-6 mb-1"
              aria-hidden="true"
            />
            <Typography variant="body-xs" className="font-semibold">
              Next Down
            </Typography>
          </motion.button>
        </div>

        {/* Safe area padding for iOS */}
        <div
          className="bg-surface-secondary"
          style={{ height: "env(safe-area-inset-bottom, 0px)" }}
        />
      </footer>
    </motion.div>
  );
}

// Export memoized component
export const MobileGameSession = memo(MobileGameSessionInner);
