/**
 * Mobile Practice Session Component
 *
 * DESIGN PHILOSOPHY:
 * - Coach is holding clipboard/phone in one hand on the field
 * - Primary actions must be in thumb zone (bottom of screen)
 * - Minimal cognitive load - show only what's needed NOW
 * - Large touch targets (48px+ minimum)
 * - Instant visual/haptic feedback
 * - Works in bright sunlight (high contrast)
 */

/* eslint-disable max-lines-per-function */

import { useState, useCallback, useMemo, memo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "../../ui/Icon/Icon";
import { usePracticeSession } from "../../../hooks/usePracticeSession";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";
import { getDisplayName } from "../../../utils/playNameUtils";
import type { ExecutionResult } from "../../../types/session";
import { logError } from "../../../utils/logger";

// ============================================================================
// UTILITIES
// ============================================================================
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatDate = (date?: string | null): string => {
  if (!date) return "Never";
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Style helpers - avoid nested ternaries
const getSuccessRateColor = (rate: number): string => {
  if (rate >= 70) return "text-success-400";
  if (rate >= 50) return "text-warning-400";
  return "text-error-400";
};

const getResultFlashClass = (result: ExecutionResult | null): string => {
  if (result === "success") return "bg-success-500/30";
  if (result === "failure") return "bg-error-500/30";
  return "bg-neutral-500/30";
};

const getPlayCardClasses = (
  isCurrent: boolean,
  isCompleted: boolean
): string => {
  if (isCurrent) return "bg-jade-500/20 border-2 border-jade-500";
  if (isCompleted) return "bg-neutral-800/30 border border-neutral-700/50";
  return "bg-neutral-800 border border-transparent";
};

const getPlayBadgeClasses = (
  isCurrent: boolean,
  isCompleted: boolean
): string => {
  if (isCurrent) return "bg-jade-500 text-white";
  if (isCompleted) return "bg-neutral-600 text-neutral-300";
  return "bg-neutral-700 text-neutral-400";
};

const getPlayTextColor = (isCurrent: boolean, isCompleted: boolean): string => {
  if (isCurrent) return "text-white";
  if (isCompleted) return "text-neutral-500";
  return "text-neutral-300";
};

const getProgressBarColor = (
  isCurrent: boolean,
  isCompleted: boolean
): string => {
  if (isCurrent) return "bg-jade-500";
  if (isCompleted) return "bg-neutral-500";
  return "bg-neutral-600";
};

const getRepDotClasses = (idx: number, currentRep: number): string => {
  if (idx < currentRep - 1) return "w-2.5 h-2.5 bg-jade-500";
  if (idx === currentRep - 1)
    return "w-3.5 h-3.5 bg-white ring-2 ring-jade-500";
  return "w-2.5 h-2.5 bg-neutral-600";
};

const getPersonnelBadgeClasses = (
  isCurrent: boolean,
  isCompleted: boolean
): string => {
  if (isCurrent) return "bg-jade-500/30 text-jade-300";
  if (isCompleted) return "bg-neutral-700/50 text-neutral-500";
  return "bg-jade-500/20 text-jade-400";
};

// ============================================================================
// PLAY CARD ITEM (MEMOIZED)
// ============================================================================
interface PlayCardItemProps {
  play: PlayPreview;
  idx: number;
}

const PlayCardItem = memo<PlayCardItemProps>(({ play, idx }) => (
  <div className="px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-3 min-w-0 flex-1">
      <span className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center text-xs text-neutral-400 font-medium flex-shrink-0">
        {idx + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-white text-sm font-medium font-mono truncate">
          {play.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {play.personnel && (
            <span className="text-jade-400 text-xs font-medium">
              {play.personnel}
            </span>
          )}
          <span className="text-neutral-500 text-xs">
            {play.reps} rep{play.reps !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
    {play.type && (
      <span
        className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ml-2 ${
          play.type.toLowerCase() === "run"
            ? "bg-warning-500/20 text-warning-400"
            : "bg-blue-500/20 text-blue-400"
        }`}
      >
        {play.type.toUpperCase()}
      </span>
    )}
  </div>
));
PlayCardItem.displayName = "PlayCardItem";

// ============================================================================
// LOADING STATE
// ============================================================================
const LoadingScreen = memo(() => (
  <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-neutral-900">
    <div className="w-16 h-16 border-4 border-jade-500 border-t-transparent rounded-full animate-spin mb-4" />
    <p className="text-white text-lg font-medium">Loading Practice...</p>
  </div>
));
LoadingScreen.displayName = "LoadingScreen";

// ============================================================================
// ERROR STATE
// ============================================================================
const ErrorScreen = memo(
  ({ message, onBack }: { message: string; onBack: () => void }) => (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-neutral-900 p-6">
      <div className="w-20 h-20 rounded-full bg-error-500/20 flex items-center justify-center mb-6">
        <Icon name="alert-circle" className="w-10 h-10 text-error-500" />
      </div>
      <h1 className="text-white text-xl font-bold mb-2">Unable to Load</h1>
      <p className="text-neutral-400 text-center mb-8">{message}</p>
      <button
        onClick={onBack}
        className="px-8 py-4 bg-jade-500 text-white font-semibold rounded-xl active:scale-95 transition-transform"
      >
        Go Back
      </button>
    </div>
  )
);
ErrorScreen.displayName = "ErrorScreen";

// ============================================================================
// PRE-SESSION START SCREEN
// ============================================================================
interface PlayPreview {
  name: string;
  type?: string;
  reps: number;
  formation?: string;
  personnel?: string;
}

const StartScreen = memo(
  ({
    scriptName,
    scriptDescription,
    playCount,
    totalReps,
    estimatedDuration,
    lastPracticed,
    mode,
    plays,
    onStart,
    onBack,
  }: {
    scriptName: string;
    scriptDescription?: string;
    playCount: number;
    totalReps: number;
    estimatedDuration: number;
    lastPracticed?: string | null;
    mode: string;
    plays: PlayPreview[];
    onStart: () => void;
    onBack: () => void;
  }) => {
    const [showAllPlays, setShowAllPlays] = useState(false);
    const displayPlays = showAllPlays ? plays : plays.slice(0, 3);

    return (
      <div className="fixed inset-0 z-[9999] flex flex-col bg-neutral-900">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-neutral-800">
          <button
            onClick={onBack}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-neutral-800 active:bg-neutral-700"
            aria-label="Go back"
          >
            <Icon name="arrow-left" className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                mode === "live"
                  ? "bg-success-500 text-white"
                  : "bg-warning-500 text-black"
              }`}
            >
              {mode === "live" ? "● LIVE" : "REVIEW"}
            </span>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Script Header Card */}
            <div className="bg-neutral-800 rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-jade-500 flex items-center justify-center flex-shrink-0">
                  <Icon name="clipboard" className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-white text-xl font-bold truncate mb-1">
                    {scriptName}
                  </h1>
                  {scriptDescription && (
                    <p className="text-neutral-400 text-sm line-clamp-2 mb-2">
                      {scriptDescription}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-neutral-500 text-xs">
                    <Icon name="clock" className="w-3.5 h-3.5" />
                    <span>Last: {formatDate(lastPracticed)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-neutral-800 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-white">{playCount}</div>
                <div className="text-neutral-500 text-xs">Plays</div>
              </div>
              <div className="bg-neutral-800 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-white">{totalReps}</div>
                <div className="text-neutral-500 text-xs">Total Reps</div>
              </div>
              <div className="bg-neutral-800 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-white">
                  ~{Math.ceil(estimatedDuration / 60)}m
                </div>
                <div className="text-neutral-500 text-xs">Est. Time</div>
              </div>
            </div>

            {/* Play List Preview */}
            <div className="bg-neutral-800 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-700 flex items-center justify-between">
                <h2 className="text-white font-semibold text-sm">Play Order</h2>
                <span className="text-neutral-500 text-xs">
                  {playCount} plays
                </span>
              </div>
              <div className="divide-y divide-neutral-700/50">
                {displayPlays.map((play, idx) => (
                  <PlayCardItem key={idx} play={play} idx={idx} />
                ))}
              </div>
              {plays.length > 3 && (
                <button
                  onClick={() => setShowAllPlays(!showAllPlays)}
                  className="w-full px-4 py-3 border-t border-neutral-700 text-jade-400 text-sm font-medium flex items-center justify-center gap-1"
                >
                  {showAllPlays ? (
                    <>
                      Show less
                      <Icon name="chevron-up" className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Show all {plays.length} plays
                      <Icon name="chevron-down" className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Tips */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-800/50">
                <div className="w-10 h-10 rounded-lg bg-success-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon name="zap" className="w-5 h-5 text-success-500" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">
                    One-Handed Design
                  </p>
                  <p className="text-neutral-500 text-xs">
                    All actions at thumb reach
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-800/50">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon name="wifi-off" className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">
                    Works Offline
                  </p>
                  <p className="text-neutral-500 text-xs">
                    Syncs when connected
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Start Button - Full Width, Bottom */}
        <div className="flex-shrink-0 p-4 pb-safe bg-neutral-900 border-t border-neutral-800">
          <button
            onClick={onStart}
            className="w-full h-16 bg-jade-500 hover:bg-jade-600 active:scale-[0.98] text-white text-xl font-bold rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-jade-500/30"
          >
            <Icon name="play" className="w-7 h-7" />
            Start Practice
          </button>
        </div>
      </div>
    );
  }
);
StartScreen.displayName = "StartScreen";

// ============================================================================
// ACTIVE SESSION SCREEN - THE MAIN EVENT
// ============================================================================
interface PlayStats {
  success: number;
  failure: number;
  neutral: number;
  completedReps: number;
}

interface ScriptPlay {
  name: string;
  type?: string;
  reps: number;
  formation?: string;
  personnel?: string;
}

interface ActiveSessionProps {
  playName: string;
  playType?: string;
  formation?: string;
  personnel?: string;
  playImage?: string | null;
  tags?: string[];
  coachingNotes?: string;
  currentPlayIndex: number;
  totalPlays: number;
  currentRep: number;
  totalReps: number;
  overallProgress: number;
  sessionStats: {
    success: number;
    failure: number;
    neutral: number;
    skipped: number;
  };
  playStats: Record<number, PlayStats>;
  scriptPlays: ScriptPlay[];
  elapsedTime: number;
  isPaused: boolean;
  isLastPlay: boolean;
  isLastRep: boolean;
  onSuccess: () => void;
  onFailure: () => void;
  onNeutral: () => void;
  onSkip: () => void;
  onNextPlay: () => void;
  onPrevPlay: () => void;
  onJumpToPlay: (index: number) => void;
  onEnd: () => void;
  onAddNote: (note: string) => void;
}

// eslint-disable-next-line complexity
function ActiveSession({
  playName,
  playType,
  formation: _formation, // Formation is now included in playName via getDisplayName
  personnel,
  playImage,
  tags,
  coachingNotes,
  currentPlayIndex,
  totalPlays,
  currentRep,
  totalReps,
  overallProgress,
  sessionStats,
  playStats,
  scriptPlays,
  elapsedTime,
  isPaused,
  isLastPlay,
  isLastRep,
  onSuccess,
  onFailure,
  onNeutral,
  onSkip,
  onNextPlay,
  onPrevPlay: _onPrevPlay, // Reserved for future use
  onJumpToPlay,
  onEnd,
  onAddNote,
}: ActiveSessionProps) {
  const [lastResult, setLastResult] = useState<ExecutionResult | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [showImage, setShowImage] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showOnlyRemaining, setShowOnlyRemaining] = useState(false);
  const noteInputRef = useRef<HTMLTextAreaElement>(null);
  const scriptListRef = useRef<HTMLDivElement>(null);
  const currentPlayRef = useRef<HTMLButtonElement>(null);

  const handleAction = useCallback(
    (action: () => void, result?: ExecutionResult) => {
      if (result) {
        setLastResult(result);
        setTimeout(() => setLastResult(null), 400);
        // Track streak
        if (result === "success") {
          setStreak((prev) => prev + 1);
        } else {
          setStreak(0);
        }
      }
      triggerHapticFeedback(result === "success" ? "medium" : "light");
      action();
    },
    []
  );

  // Auto-scroll to current play when it changes
  useEffect(() => {
    if (currentPlayRef.current && scriptListRef.current) {
      const container = scriptListRef.current;
      const element = currentPlayRef.current;
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      // Only scroll if element is out of view
      if (
        elementRect.top < containerRect.top ||
        elementRect.bottom > containerRect.bottom
      ) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentPlayIndex]);

  const handleSaveNote = useCallback(() => {
    if (noteText.trim()) {
      onAddNote(noteText.trim());
      setNoteText("");
      setShowNotes(false);
      triggerHapticFeedback("light");
    }
  }, [noteText, onAddNote]);

  const handleJumpToPlay = useCallback(
    (index: number) => {
      triggerHapticFeedback("medium");
      onJumpToPlay(index);
    },
    [onJumpToPlay]
  );

  // Focus note input when opened
  useEffect(() => {
    if (showNotes && noteInputRef.current) {
      noteInputRef.current.focus();
    }
  }, [showNotes]);

  const totalAttempts =
    sessionStats.success + sessionStats.failure + sessionStats.neutral;
  const successRate =
    totalAttempts > 0
      ? Math.round((sessionStats.success / totalAttempts) * 100)
      : 0;

  // Calculate completed plays count
  const completedPlays = Object.values(playStats).filter(
    (s, idx) => s.completedReps >= (scriptPlays[idx]?.reps || 1)
  ).length;

  // Current play stats
  const currentPlayStats = playStats[currentPlayIndex] || {
    success: 0,
    failure: 0,
    neutral: 0,
    completedReps: 0,
  };
  const currentPlayAttempts =
    currentPlayStats.success +
    currentPlayStats.failure +
    currentPlayStats.neutral;
  const currentPlaySuccessRate =
    currentPlayAttempts > 0
      ? Math.round((currentPlayStats.success / currentPlayAttempts) * 100)
      : 0;

  // Pace calculation (reps per minute)
  const repsPerMinute =
    elapsedTime > 60 ? Math.round((totalAttempts / elapsedTime) * 60) : null;
  const totalRepsInScript = scriptPlays.reduce((sum, p) => sum + p.reps, 0);
  const estimatedTimeRemaining =
    repsPerMinute && repsPerMinute > 0
      ? Math.round((totalRepsInScript - totalAttempts) / repsPerMinute)
      : null;

  // Filter plays for display - MEMOIZED for performance
  const displayPlays = useMemo(() => {
    if (showOnlyRemaining) {
      return scriptPlays
        .map((play, idx) => ({ play, idx }))
        .filter(({ play, idx }) => {
          const stats = playStats[idx] || { completedReps: 0 };
          return stats.completedReps < play.reps;
        });
    }
    return scriptPlays.map((play, idx) => ({ play, idx }));
  }, [showOnlyRemaining, scriptPlays, playStats]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-neutral-900">
      {/* Visual Feedback Flash - Full Screen */}
      <AnimatePresence>
        {lastResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={`absolute inset-0 pointer-events-none z-50 ${getResultFlashClass(lastResult)}`}
          />
        )}
      </AnimatePresence>

      {/* ================================================================== */}
      {/* HEADER - Compact, informational */}
      {/* ================================================================== */}
      <header className="flex-shrink-0 bg-neutral-800 border-b border-neutral-700">
        {/* Top Row: Timer + Stats + Streak + Actions */}
        <div className="flex items-center justify-between px-4 py-2">
          {/* Timer + Pace */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-700 flex items-center justify-center">
              <Icon name="clock" className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-mono text-lg font-semibold leading-tight">
                {formatTime(elapsedTime)}
              </span>
              {estimatedTimeRemaining !== null && (
                <span className="text-neutral-500 text-xs leading-tight">
                  ~{estimatedTimeRemaining}m left
                </span>
              )}
            </div>
          </div>

          {/* Quick Stats + Streak */}
          <div className="flex items-center gap-2">
            {/* Streak Badge */}
            <AnimatePresence>
              {streak >= 3 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20"
                >
                  <span className="text-orange-400">🔥</span>
                  <span className="text-orange-400 text-xs font-bold">
                    {streak}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-center gap-1">
              <span className="text-success-400 font-semibold">
                {sessionStats.success}
              </span>
              <Icon name="check" className="w-4 h-4 text-success-400" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-error-400 font-semibold">
                {sessionStats.failure}
              </span>
              <Icon name="x" className="w-4 h-4 text-error-400" />
            </div>
            <div
              className={`text-sm font-medium ${getSuccessRateColor(successRate)}`}
            >
              {successRate}%
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* End Button */}
            <button
              onClick={() => handleAction(onEnd)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-error-500/20 hover:bg-error-500/30 active:scale-95 transition-all"
              aria-label="End session"
            >
              <Icon name="x" className="w-5 h-5 text-error-400" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 bg-neutral-700">
          <motion.div
            className="h-full bg-jade-500"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </header>

      {/* ================================================================== */}
      {/* MAIN CONTENT - Current Play + Inline Script */}
      {/* ================================================================== */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Current Play Card - Enhanced */}
        <div className="flex-shrink-0 p-3 border-b border-neutral-800">
          <div className="bg-neutral-800 rounded-xl p-3">
            {/* Main Row: Type + Name + Rep Counter */}
            <div className="flex items-center gap-3">
              {/* Play Type Badge */}
              {playType && (
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                    playType.toLowerCase() === "run"
                      ? "bg-warning-500/20 text-warning-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {playType}
                </span>
              )}

              {/* Personnel Badge */}
              {personnel && (
                <span className="px-2 py-1 rounded-lg text-xs font-bold bg-jade-500/20 text-jade-400">
                  {personnel}
                </span>
              )}

              {/* Play Name & Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-white text-lg font-bold font-mono truncate">
                  {playName}
                </h2>
              </div>

              {/* Rep Counter */}
              <div className="text-right">
                <div className="text-white font-bold text-lg">
                  {currentRep}/{totalReps}
                </div>
                <div className="text-neutral-500 text-xs">reps</div>
              </div>
            </div>

            {/* This Play Stats Row - NEW */}
            {currentPlayAttempts > 0 && (
              <div className="flex items-center justify-center gap-4 mt-3 py-2 px-3 rounded-lg bg-neutral-900/50">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-success-500/20 flex items-center justify-center">
                    <Icon name="check" className="w-3 h-3 text-success-400" />
                  </div>
                  <span className="text-success-400 font-semibold text-sm">
                    {currentPlayStats.success}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-error-500/20 flex items-center justify-center">
                    <Icon name="x" className="w-3 h-3 text-error-400" />
                  </div>
                  <span className="text-error-400 font-semibold text-sm">
                    {currentPlayStats.failure}
                  </span>
                </div>
                <div className="h-4 w-px bg-neutral-700" />
                <span
                  className={`text-sm font-bold ${getSuccessRateColor(currentPlaySuccessRate)}`}
                >
                  {currentPlaySuccessRate}% this play
                </span>
              </div>
            )}

            {/* Rep Progress Dots */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {Array.from({ length: totalReps }).map((_, idx) => (
                <motion.div
                  key={idx}
                  animate={idx === currentRep - 1 ? { scale: [1, 1.2, 1] } : {}}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut",
                  }}
                  className={`rounded-full transition-all duration-200 ${getRepDotClasses(idx, currentRep)}`}
                />
              ))}
            </div>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full bg-neutral-700 text-neutral-400 text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Coaching Notes - Expandable */}
            {coachingNotes && (
              <div className="mt-3 p-2 rounded-lg bg-warning-500/10 border border-warning-500/20">
                <div className="flex items-start gap-2">
                  <Icon
                    name="message"
                    className="w-3.5 h-3.5 text-warning-400 flex-shrink-0 mt-0.5"
                  />
                  <p className="text-warning-200 text-xs leading-relaxed line-clamp-2">
                    {coachingNotes}
                  </p>
                </div>
              </div>
            )}

            {/* Play Image Thumbnail - with loading optimization */}
            {playImage && (
              <button
                onClick={() => setShowImage(true)}
                className="mt-3 w-full h-16 rounded-lg bg-neutral-700 overflow-hidden relative group"
                aria-label="View play diagram fullscreen"
              >
                <img
                  src={playImage}
                  alt={`${playName} diagram`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-active:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/50 group-hover:bg-neutral-900/30 transition-colors">
                  <Icon name="maximize" className="w-5 h-5 text-white" />
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Inline Script List - Scrollable */}
        <div className="flex-1 overflow-y-auto" ref={scriptListRef}>
          <div className="px-3 py-2">
            {/* Script Header with Filter Toggle */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                Practice Script
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowOnlyRemaining(!showOnlyRemaining)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                    showOnlyRemaining
                      ? "bg-jade-500/20 text-jade-400"
                      : "bg-neutral-700/50 text-neutral-500"
                  }`}
                >
                  {showOnlyRemaining ? "Remaining" : "All"}
                </button>
                <span className="text-neutral-500 text-xs">
                  {completedPlays}/{totalPlays}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {displayPlays.map(({ play, idx }) => {
                const stats = playStats[idx] || {
                  success: 0,
                  failure: 0,
                  neutral: 0,
                  completedReps: 0,
                };
                const isCompleted = stats.completedReps >= play.reps;
                const isCurrent = idx === currentPlayIndex;
                const playAttempts =
                  stats.success + stats.failure + stats.neutral;
                const playSuccessRate =
                  playAttempts > 0
                    ? Math.round((stats.success / playAttempts) * 100)
                    : 0;

                return (
                  <motion.button
                    key={idx}
                    ref={isCurrent ? currentPlayRef : null}
                    onClick={() => handleJumpToPlay(idx)}
                    whileTap={{ scale: 0.98 }}
                    style={{ touchAction: "manipulation" }}
                    className={`w-full p-2.5 rounded-xl text-left transition-all select-none ${getPlayCardClasses(isCurrent, isCompleted)}`}
                    aria-label={`${isCurrent ? "Current play: " : ""}${play.name}${isCompleted ? " (completed)" : ""}`}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Play Number/Status */}
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${getPlayBadgeClasses(isCurrent, isCompleted)}`}
                      >
                        {isCompleted ? (
                          <Icon name="check" className="w-3.5 h-3.5" />
                        ) : (
                          idx + 1
                        )}
                      </div>

                      {/* Play Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-medium font-mono text-sm truncate ${getPlayTextColor(isCurrent, isCompleted)}`}
                          >
                            {play.name}
                          </span>
                          {play.personnel && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs font-bold ${getPersonnelBadgeClasses(isCurrent, isCompleted)}`}
                            >
                              {play.personnel}
                            </span>
                          )}
                          {play.type && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs font-bold uppercase ${
                                play.type.toLowerCase() === "run"
                                  ? "bg-warning-500/20 text-warning-400"
                                  : "bg-blue-500/20 text-blue-400"
                              }`}
                            >
                              {play.type}
                            </span>
                          )}
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`text-xs ${isCurrent ? "text-jade-400" : "text-neutral-500"}`}
                          >
                            {stats.completedReps}/{play.reps} reps
                          </span>
                          {playAttempts > 0 && (
                            <>
                              <span className="text-neutral-600">•</span>
                              <span className="text-success-400 text-xs">
                                {stats.success}✓
                              </span>
                              <span className="text-error-400 text-xs">
                                {stats.failure}✗
                              </span>
                              <span
                                className={`text-xs font-medium ${getSuccessRateColor(playSuccessRate)}`}
                              >
                                {playSuccessRate}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Current Indicator or Nav Arrow */}
                      {isCurrent ? (
                        <span className="px-1.5 py-0.5 rounded bg-jade-500 text-white text-xs font-bold uppercase">
                          NOW
                        </span>
                      ) : (
                        <Icon
                          name="chevron-right"
                          className="w-4 h-4 text-neutral-600"
                        />
                      )}
                    </div>

                    {/* Mini Progress Bar */}
                    <div className="mt-2 h-1 bg-neutral-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getProgressBarColor(isCurrent, isCompleted)}`}
                        style={{
                          width: `${(stats.completedReps / play.reps) * 100}%`,
                        }}
                      />
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Add Note Button - at bottom of script */}
            <button
              onClick={() => setShowNotes(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 mt-3 rounded-xl bg-neutral-800/50 text-neutral-500 hover:text-white transition-colors"
            >
              <Icon name="message" className="w-4 h-4" />
              <span className="text-xs font-medium">
                Add Note for {playName}
              </span>
            </button>
          </div>
        </div>
      </main>

      {/* ================================================================== */}
      {/* ACTION ZONE - The heart of the UX */}
      {/* ================================================================== */}
      <footer className="flex-shrink-0 bg-neutral-800 border-t border-neutral-700 p-4 pb-safe">
        {/* PRIMARY ACTIONS - Success / Failure */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <motion.button
            onClick={() => handleAction(onSuccess, "success")}
            disabled={isPaused}
            whileTap={{ scale: 0.95 }}
            style={{ touchAction: "manipulation" }}
            className="h-20 bg-gradient-to-br from-green-500 to-green-600 disabled:from-neutral-600 disabled:to-neutral-700 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg shadow-green-500/20 active:shadow-none transition-shadow select-none"
            aria-label="Mark rep as success"
          >
            <Icon name="check" className="w-8 h-8 text-white" />
            <span className="text-white font-bold text-base">SUCCESS</span>
          </motion.button>

          <motion.button
            onClick={() => handleAction(onFailure, "failure")}
            disabled={isPaused}
            whileTap={{ scale: 0.95 }}
            style={{ touchAction: "manipulation" }}
            className="h-20 bg-gradient-to-br from-red-500 to-red-600 disabled:from-neutral-600 disabled:to-neutral-700 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg shadow-red-500/20 active:shadow-none transition-shadow select-none"
            aria-label="Mark rep as failure"
          >
            <Icon name="x" className="w-8 h-8 text-white" />
            <span className="text-white font-bold text-base">FAILURE</span>
          </motion.button>
        </div>

        {/* SECONDARY ACTIONS - Neutral / Skip / Next Rep or Finish */}
        <div className="grid grid-cols-3 gap-3">
          <motion.button
            onClick={() => handleAction(onNeutral, "neutral")}
            disabled={isPaused}
            whileTap={{ scale: 0.95 }}
            style={{ touchAction: "manipulation" }}
            className="h-14 bg-neutral-700 hover:bg-neutral-600 disabled:bg-neutral-800 disabled:text-neutral-600 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors select-none"
            aria-label="Mark rep as neutral"
          >
            <Icon name="minus" className="w-5 h-5 text-neutral-300" />
            <span className="text-neutral-300 font-medium text-xs">
              Neutral
            </span>
          </motion.button>

          <motion.button
            onClick={() => handleAction(onSkip)}
            disabled={isPaused}
            whileTap={{ scale: 0.95 }}
            style={{ touchAction: "manipulation" }}
            className="h-14 bg-neutral-700 hover:bg-neutral-600 disabled:bg-neutral-800 disabled:text-neutral-600 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors select-none"
            aria-label="Skip this rep"
          >
            <Icon name="skip-forward" className="w-5 h-5 text-neutral-300" />
            <span className="text-neutral-300 font-medium text-xs">Skip</span>
          </motion.button>

          {isLastPlay && isLastRep ? (
            <motion.button
              onClick={() => handleAction(onEnd)}
              whileTap={{ scale: 0.95 }}
              style={{ touchAction: "manipulation" }}
              className="h-14 bg-jade-600 hover:bg-jade-500 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors select-none"
              aria-label="Finish practice session"
            >
              <Icon name="flag" className="w-5 h-5 text-white" />
              <span className="text-white font-medium text-xs">Finish</span>
            </motion.button>
          ) : (
            <motion.button
              onClick={() => handleAction(onNextPlay)}
              disabled={isPaused || isLastPlay}
              whileTap={{ scale: 0.95 }}
              style={{ touchAction: "manipulation" }}
              className="h-14 bg-jade-600 hover:bg-jade-500 disabled:bg-neutral-800 disabled:text-neutral-600 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors select-none"
              aria-label="Go to next play"
            >
              <Icon name="chevron-right" className="w-5 h-5 text-white" />
              <span className="text-white font-medium text-xs">Next</span>
            </motion.button>
          )}
        </div>
      </footer>

      {/* ================================================================== */}
      {/* NOTES MODAL */}
      {/* ================================================================== */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 flex items-end"
            onClick={() => setShowNotes(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-neutral-800 rounded-t-2xl p-4 pb-safe"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">
                  Add Note for {playName}
                </h3>
                <button
                  onClick={() => setShowNotes(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-neutral-700"
                >
                  <Icon name="x" className="w-5 h-5 text-neutral-400" />
                </button>
              </div>
              <textarea
                ref={noteInputRef}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="e.g., Timing off on the route, QB needs to step up..."
                className="w-full h-24 p-3 rounded-xl bg-neutral-700 text-white placeholder:text-neutral-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-jade-500"
              />
              <button
                onClick={handleSaveNote}
                disabled={!noteText.trim()}
                className="w-full mt-3 h-12 bg-jade-500 hover:bg-jade-600 disabled:bg-neutral-700 disabled:text-neutral-500 text-white font-semibold rounded-xl transition-colors"
              >
                Save Note
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================== */}
      {/* IMAGE FULLSCREEN MODAL */}
      {/* ================================================================== */}
      <AnimatePresence>
        {showImage && playImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black flex items-center justify-center"
            onClick={() => setShowImage(false)}
          >
            <button
              onClick={() => setShowImage(false)}
              className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center rounded-xl bg-neutral-800"
            >
              <Icon name="x" className="w-6 h-6 text-white" />
            </button>
            <img
              src={playImage}
              alt={playName}
              className="max-w-full max-h-full object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT - Orchestrates the flow
// ============================================================================
function MobilePracticeSessionInner() {
  const { scriptId } = useParams<{ scriptId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = (searchParams.get("mode") as "live" | "retroactive") || "live";

  const [notes, setNotes] = useState("");
  const [, setSessionNotes] = useState<Record<string, string[]>>({});
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    success: 0,
    failure: 0,
    neutral: 0,
    skipped: 0,
  });
  // Track stats per play index
  const [playStats, setPlayStats] = useState<Record<number, PlayStats>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Timer effect
  useEffect(() => {
    if (isSessionActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isSessionActive, isPaused]);

  // Navigation
  const handleBack = useCallback(() => {
    triggerHapticFeedback("light");
    navigate("/boxcall");
  }, [navigate]);

  // Session control
  const handleStart = useCallback(() => {
    triggerHapticFeedback("medium");
    setElapsedTime(0);
    setSessionStats({ success: 0, failure: 0, neutral: 0, skipped: 0 });
    setPlayStats({});
    startSession();
  }, [startSession]);

  const handleEnd = useCallback(() => {
    triggerHapticFeedback("light");
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    endSession();
    navigate("/boxcall");
  }, [endSession, navigate]);

  // Rep logging with stats tracking
  const handleLog = useCallback(
    async (result: ExecutionResult) => {
      try {
        await logRep(result, notes || undefined, []);
        setNotes("");
        // Update session stats
        setSessionStats((prev) => ({
          ...prev,
          [result]: prev[result] + 1,
        }));
        // Update play-level stats
        setPlayStats((prev) => {
          const current = prev[currentPlayIndex] || {
            success: 0,
            failure: 0,
            neutral: 0,
            completedReps: 0,
          };
          const resultKey = result as "success" | "failure" | "neutral";
          return {
            ...prev,
            [currentPlayIndex]: {
              ...current,
              [resultKey]: current[resultKey] + 1,
              completedReps: current.completedReps + 1,
            },
          };
        });
      } catch (err) {
        logError("Error logging rep:", err);
      }
    },
    [logRep, notes, currentPlayIndex]
  );

  const handleSuccess = useCallback(() => handleLog("success"), [handleLog]);
  const handleFailure = useCallback(() => handleLog("failure"), [handleLog]);
  const handleNeutral = useCallback(() => handleLog("neutral"), [handleLog]);

  const handleSkip = useCallback(() => {
    triggerHapticFeedback("light");
    setSessionStats((prev) => ({ ...prev, skipped: prev.skipped + 1 }));
    // Update play-level stats for skip
    setPlayStats((prev) => {
      const current = prev[currentPlayIndex] || {
        success: 0,
        failure: 0,
        neutral: 0,
        completedReps: 0,
      };
      return {
        ...prev,
        [currentPlayIndex]: {
          ...current,
          completedReps: current.completedReps + 1,
        },
      };
    });
    skipRep();
  }, [skipRep, currentPlayIndex]);

  const handleNextPlay = useCallback(() => {
    triggerHapticFeedback("light");
    nextPlay();
  }, [nextPlay]);

  const handlePrevPlay = useCallback(() => {
    triggerHapticFeedback("light");
    previousPlay();
  }, [previousPlay]);

  // Jump to a specific play
  const handleJumpToPlay = useCallback(
    (index: number) => {
      triggerHapticFeedback("medium");
      // Jump forward or backward to the target play
      const diff = index - currentPlayIndex;
      if (diff > 0) {
        for (let i = 0; i < diff; i++) {
          nextPlay();
        }
      } else if (diff < 0) {
        for (let i = 0; i < Math.abs(diff); i++) {
          previousPlay();
        }
      }
    },
    [currentPlayIndex, nextPlay, previousPlay]
  );

  const handleAddNote = useCallback(
    (note: string) => {
      const playId = currentPlay?.play?.id || "unknown";
      setSessionNotes((prev) => ({
        ...prev,
        [playId]: [...(prev[playId] || []), note],
      }));
    },
    [currentPlay?.play?.id]
  );

  // Computed values
  const scriptName =
    practiceScript?.title || practiceScript?.name || "Practice Script";
  const scriptDescription = practiceScript?.description;

  const totalReps = useMemo(
    () => scriptPlays.reduce((sum, p) => sum + (p.repetitions || 1), 0),
    [scriptPlays]
  );

  // Estimate ~30 seconds per rep
  const estimatedDuration = useMemo(() => totalReps * 30, [totalReps]);

  // Play previews for start screen
  const playPreviews: PlayPreview[] = useMemo(
    () =>
      scriptPlays.map((sp) => ({
        name: sp.play ? getDisplayName(sp.play, false) : "Unknown Play",
        type: sp.play?.p_type,
        reps: sp.repetitions || 1,
        formation: sp.play?.formation,
        personnel: sp.play?.personnel,
      })),
    [scriptPlays]
  );

  // Script plays data for the drawer
  const scriptPlaysData: ScriptPlay[] = useMemo(
    () =>
      scriptPlays.map((sp) => ({
        name: sp.play ? getDisplayName(sp.play, false) : "Unknown Play",
        type: sp.play?.p_type,
        reps: sp.repetitions || 1,
        formation: sp.play?.formation,
        personnel: sp.play?.personnel,
      })),
    [scriptPlays]
  );

  // Current play details
  const currentPlayDetails = useMemo(() => {
    const play = currentPlay?.play;
    return {
      name: play ? getDisplayName(play, false) : "Unknown Play",
      type: play?.p_type,
      formation: play?.formation,
      personnel: play?.personnel,
      image: (play as { image_url?: string | null })?.image_url,
      tags: play?.tags as string[] | undefined,
      coachingNotes: currentPlay?.notes,
    };
  }, [currentPlay]);

  // Is last rep of current play?
  const isLastRep = currentRepNumber >= totalRepsForCurrentPlay;

  // ========== RENDER ==========

  // Loading
  if (isLoading) {
    return createPortal(<LoadingScreen />, document.body);
  }

  // Error
  if (error || !practiceScript) {
    return createPortal(
      <ErrorScreen
        message={error?.message || "Practice script not found"}
        onBack={handleBack}
      />,
      document.body
    );
  }

  // Pre-session
  if (!isSessionActive) {
    return createPortal(
      <StartScreen
        scriptName={scriptName}
        scriptDescription={scriptDescription}
        playCount={scriptPlays.length}
        totalReps={totalReps}
        estimatedDuration={estimatedDuration}
        lastPracticed={
          (practiceScript as { last_practiced_at?: string | null })
            .last_practiced_at
        }
        mode={mode}
        plays={playPreviews}
        onStart={handleStart}
        onBack={handleBack}
      />,
      document.body
    );
  }

  // Active Session
  return createPortal(
    <ActiveSession
      playName={currentPlayDetails.name}
      playType={currentPlayDetails.type}
      formation={currentPlayDetails.formation}
      personnel={currentPlayDetails.personnel}
      playImage={currentPlayDetails.image}
      tags={currentPlayDetails.tags}
      coachingNotes={currentPlayDetails.coachingNotes}
      currentPlayIndex={currentPlayIndex}
      totalPlays={scriptPlays.length}
      currentRep={currentRepNumber}
      totalReps={totalRepsForCurrentPlay}
      overallProgress={overallProgress}
      sessionStats={sessionStats}
      playStats={playStats}
      scriptPlays={scriptPlaysData}
      elapsedTime={elapsedTime}
      isPaused={isPaused}
      isLastPlay={isLastPlay}
      isLastRep={isLastRep}
      onSuccess={handleSuccess}
      onFailure={handleFailure}
      onNeutral={handleNeutral}
      onSkip={handleSkip}
      onNextPlay={handleNextPlay}
      onPrevPlay={handlePrevPlay}
      onJumpToPlay={handleJumpToPlay}
      onEnd={handleEnd}
      onAddNote={handleAddNote}
    />,
    document.body
  );
}

// Export memoized component
export const MobilePracticeSession = memo(MobilePracticeSessionInner);
