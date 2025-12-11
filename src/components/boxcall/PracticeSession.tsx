/**
 * Practice Session Component
 * UI for conducting live or retroactive practice sessions
 *
 * Modernized Dec 2025: Premium visual design with gradients
 *
 * NOTE: This component intentionally uses raw Tailwind colors for:
 * - Gradient effects (jade-50, emerald-*, slate-*)
 * - Visual polish (shadows, subtle backgrounds)
 * These are design choices that don't need dark mode variants.
 */

/* eslint-disable boxcall-design/no-raw-tailwind-colors */

// TODO: Fix types when integrating Stage 3 (Session Management)

import React, { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Typography } from "../design-system";
import { Button } from "../ui";
import { Card } from "../ui";
import { Icon } from "../ui/Icon/Icon";
import { RepTracker } from "./RepTracker";
import { MiniDiagram } from "./MiniDiagram";
import { usePracticeSession } from "../../hooks/usePracticeSession";
import type { ExecutionResult } from "../../types/session";
import { logError } from "../../utils/logger";
import { useToast } from "../../hooks/useToast";
import { ConfirmationModal } from "../ui/ConfirmationModal/ConfirmationModal";
import { useActiveTeamStore } from "../../stores/activeTeamStore";
import { getDisplayName, getSubtitleText } from "../../utils/playNameUtils";
import { getPlayTypeColor } from "../playbook/play-card/helpers";
import { PersonnelBadge } from "../playbook/PersonnelBadge";
import type { Play } from "../../types/play";

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
  const { activeTeamId } = useActiveTeamStore();

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
    isLastRep: _isLastRep,
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

  // No team selected state
  if (!activeTeamId) {
    return (
      <div className="py-6">
        <div className="container-page">
          <Card className="p-6 text-center">
            <Icon name="users" size="xl" color="warning" className="mb-4" />
            <Typography variant="headline-md" className="mb-2">
              No Team Selected
            </Typography>
            <Typography variant="body-md" color="muted" className="mb-4">
              Please select a team from the dashboard to start a practice
              session.
            </Typography>
            <Button variant="primary" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </Card>
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
            <Typography variant="body-sm" color="muted" className="mb-4">
              Script ID: {scriptId || "(none)"}
            </Typography>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => navigate("/boxcall")}>
                Back to BoxCall
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate("/practice-plans")}
              >
                Create Script
              </Button>
            </div>
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

            <div className="bg-secondary rounded-lg p-6 mb-6">
              <Typography variant="body-md" className="mb-4">
                <strong>Session Overview:</strong>
              </Typography>
              <ul className="space-y-2 text-secondary">
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

  // Helper to get play display info
  const getPlayDisplayInfo = (play: Play | undefined) => {
    if (!play) return { displayName: "Unknown Play", subtitle: null };
    const displayName = getDisplayName(play, false);
    const subtitle = getSubtitleText(play, false);
    return { displayName, subtitle };
  };

  // Active session screen
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-surface-primary via-surface-primary to-jade-50/30">
        <div className="container-page py-8">
          {/* Modern Header with Glass Effect */}
          <div className="relative mb-8">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-jade-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-jade-500/25">
                    <Icon name="clipboard" size="md" className="text-white" />
                  </div>
                  <div>
                    <Typography
                      variant="headline-lg"
                      className="text-primary leading-tight"
                    >
                      {practiceScript.name}
                    </Typography>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                          mode === "live"
                            ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                            : "bg-gradient-to-r from-amber-400 to-orange-400 text-white"
                        }`}
                      >
                        {mode === "live" ? "● LIVE SESSION" : "◐ RETROACTIVE"}
                      </span>
                      {hasPendingSync && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                          <Icon name="cloud-off" size="xs" />
                          Syncing...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isPaused ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={resumeSession}
                    className="shadow-lg shadow-jade-500/25"
                  >
                    <Icon name="play" size="sm" />
                    Resume
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" onClick={pauseSession}>
                    <Icon name="pause" size="sm" />
                    Pause
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEnd}
                  className="text-error hover:bg-error/10"
                >
                  <Icon name="x" size="sm" />
                  End
                </Button>
              </div>
            </div>
          </div>

          {/* Overall Progress - Enhanced with glow effect */}
          <div className="mb-8 p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-jade-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon name="trending-up" size="sm" className="text-jade-600" />
                <span className="text-secondary text-sm font-semibold uppercase tracking-wider">
                  Overall Progress
                </span>
              </div>
              <span className="text-2xl font-black text-jade-600">
                {Math.round(overallProgress)}%
              </span>
            </div>
            <div className="w-full bg-jade-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-jade-500 via-emerald-400 to-jade-500 rounded-full h-3 transition-all duration-500 shadow-sm relative"
                style={{ width: `${overallProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/30 to-transparent" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Current Play - Hero Card */}
            <div className="lg:col-span-2 space-y-5">
              {/* ===== CURRENT PLAY HERO CARD ===== */}
              <div className="relative overflow-hidden rounded-3xl bg-white border border-jade-100 shadow-xl shadow-jade-500/10">
                {/* Decorative gradient top bar */}
                <div className="h-2 bg-gradient-to-r from-jade-500 via-emerald-400 to-jade-500" />

                {/* Header row with play number and navigation */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-jade-50">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-jade-500 to-emerald-600 text-white font-black text-lg shadow-md shadow-jade-500/25">
                      {currentPlayIndex + 1}
                    </span>
                    <div>
                      <span className="text-secondary text-xs font-semibold uppercase tracking-wider">
                        Current Play
                      </span>
                      <p className="text-primary font-medium text-sm">
                        {currentPlayIndex + 1} of {scriptPlays.length}
                      </p>
                    </div>
                  </div>

                  {/* Navigation arrows - Enhanced */}
                  <div className="flex gap-2">
                    <button
                      onClick={previousPlay}
                      disabled={currentPlayIndex === 0 || isPaused}
                      className="group p-2.5 rounded-xl bg-surface-muted text-secondary hover:bg-jade-100 hover:text-jade-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                    >
                      <Icon
                        name="chevron-left"
                        size="sm"
                        className="group-hover:-translate-x-0.5 transition-transform"
                      />
                    </button>
                    <button
                      onClick={nextPlay}
                      disabled={isLastPlay || isPaused}
                      className="group p-2.5 rounded-xl bg-jade-500 text-white hover:bg-jade-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-jade-500/25"
                    >
                      <Icon
                        name="chevron-right"
                        size="sm"
                        className="group-hover:translate-x-0.5 transition-transform"
                      />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {currentPlay && currentPlay.play && (
                    <>
                      {/* Play Type Badge + Personnel - Modern pills */}
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        {currentPlay.play.p_type && (
                          <span
                            className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${getPlayTypeColor(currentPlay.play.p_type)}`}
                          >
                            {currentPlay.play.p_type}
                          </span>
                        )}
                        {currentPlay.play.personnel && (
                          <PersonnelBadge
                            personnel={currentPlay.play.personnel}
                            size="md"
                          />
                        )}
                        {currentPlay.play.formation && (
                          <span className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 border border-purple-200 rounded-full text-sm font-semibold shadow-sm">
                            {currentPlay.play.formation}
                          </span>
                        )}
                        {currentPlay.play.pref_hash && (
                          <span className="px-2.5 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                            {currentPlay.play.pref_hash}
                          </span>
                        )}
                      </div>

                      {/* Main Play Name - Extra Large & Bold with gradient underline */}
                      <div className="relative">
                        <h2 className="text-3xl md:text-4xl font-mono font-black text-primary leading-tight">
                          {
                            getPlayDisplayInfo(currentPlay.play as Play)
                              .displayName
                          }
                        </h2>
                        <div className="mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-jade-500 to-emerald-400" />
                      </div>

                      {/* Subtitle */}
                      {getPlayDisplayInfo(currentPlay.play as Play)
                        .subtitle && (
                        <p className="text-secondary text-base italic mt-3">
                          {
                            getPlayDisplayInfo(currentPlay.play as Play)
                              .subtitle
                          }
                        </p>
                      )}

                      {/* Play Progress Bar - Enhanced */}
                      <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-jade-50 to-emerald-50 border border-jade-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-jade-700 text-sm font-semibold flex items-center gap-2">
                            <Icon
                              name="target"
                              size="sm"
                              className="text-jade-500"
                            />
                            Play Progress
                          </span>
                          <span className="text-jade-700 text-lg font-black">
                            {Math.round(playProgress)}%
                          </span>
                        </div>
                        <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner">
                          <div
                            className="bg-gradient-to-r from-emerald-500 via-jade-400 to-emerald-500 rounded-full h-3 transition-all duration-300 relative"
                            style={{ width: `${playProgress}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/30 to-transparent" />
                          </div>
                        </div>
                      </div>

                      {/* Coach Notes - Enhanced styling */}
                      {currentPlay.notes && (
                        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 shadow-sm">
                          <p className="text-amber-800 text-sm flex items-start gap-2">
                            <span className="text-xl">📋</span>
                            <span>
                              <strong className="block text-amber-900 mb-1">
                                Coach Notes
                              </strong>
                              {currentPlay.notes}
                            </span>
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Mini Diagram (if available) */}
              {currentPlay?.play?.diagram_data && (
                <div className="rounded-2xl bg-white border border-jade-100 p-5 shadow-md">
                  <div className="flex items-center justify-center">
                    <MiniDiagram
                      players={
                        Array.isArray(currentPlay.play.diagram_data)
                          ? currentPlay.play.diagram_data
                          : []
                      }
                    />
                  </div>
                </div>
              )}

              {/* ===== REP TRACKER CARD ===== */}
              <div className="rounded-3xl bg-white border border-jade-100 p-6 shadow-xl shadow-jade-500/10">
                <RepTracker
                  currentRep={currentRepNumber}
                  totalReps={totalRepsForCurrentPlay}
                  onResult={handleRepResult}
                  onSkip={handleSkip}
                  onGoToRep={goToRep}
                  repHistory={repHistory}
                  disabled={isPaused}
                />
              </div>

              {/* Notes Section - Enhanced */}
              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-primary font-semibold text-sm flex items-center gap-2">
                    <Icon name="edit-3" size="sm" className="text-slate-400" />
                    Session Notes
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNotes(!showNotes)}
                    className="text-jade-600"
                  >
                    {showNotes ? "Hide" : "Add Note"}
                  </Button>
                </div>
                {showNotes && (
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes for this rep..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-primary placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-jade-500/50 focus:border-jade-500 transition-all"
                    rows={3}
                    disabled={isPaused}
                  />
                )}
              </div>
            </div>

            {/* Right Column: Stats & Play List */}
            <div className="space-y-5">
              {/* ===== SESSION STATS CARD ===== */}
              <div className="rounded-3xl bg-white border border-jade-100 p-6 shadow-xl shadow-jade-500/10 overflow-hidden relative">
                {/* Decorative gradient corner */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-jade-500/20 to-emerald-500/10 rounded-full blur-2xl" />

                <h3 className="text-primary font-bold text-lg mb-5 flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-jade-500 to-emerald-600 flex items-center justify-center shadow-md shadow-jade-500/25">
                    <Icon name="bar-chart-2" size="sm" className="text-white" />
                  </div>
                  Session Stats
                </h3>

                {/* Main Stats Grid - Enhanced - Using computedStats for real-time updates */}
                <div className="grid grid-cols-2 gap-4 mb-5 relative z-10">
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 text-center border border-slate-200">
                    <div className="text-3xl font-black text-primary">
                      {computedStats.completedReps}
                      <span className="text-lg text-secondary font-semibold">
                        /{computedStats.totalReps}
                      </span>
                    </div>
                    <div className="text-slate-500 text-xs uppercase tracking-wider mt-1 font-semibold">
                      Total Reps
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 text-center border border-emerald-200">
                    <div className="text-3xl font-black text-emerald-600">
                      {computedStats.successRate.toFixed(0)}%
                    </div>
                    <div className="text-emerald-600/70 text-xs uppercase tracking-wider mt-1 font-semibold">
                      Success Rate
                    </div>
                  </div>
                </div>

                {/* Detailed Breakdown - Modernized - Using computedStats */}
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <span className="text-slate-600 text-sm flex items-center gap-3 font-medium">
                      <span className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 shadow-sm"></span>
                      Successful
                    </span>
                    <span className="text-emerald-600 font-black text-lg">
                      {computedStats.successfulReps}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 border border-red-100">
                    <span className="text-slate-600 text-sm flex items-center gap-3 font-medium">
                      <span className="w-3 h-3 rounded-full bg-gradient-to-br from-red-400 to-rose-500 shadow-sm"></span>
                      Failed
                    </span>
                    <span className="text-red-600 font-black text-lg">
                      {computedStats.failedReps}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-200">
                    <span className="text-slate-600 text-sm flex items-center gap-3 font-medium">
                      <span className="w-3 h-3 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 shadow-sm"></span>
                      Neutral
                    </span>
                    <span className="text-slate-600 font-black text-lg">
                      {computedStats.neutralReps}
                    </span>
                  </div>
                </div>
              </div>

              {/* ===== SCRIPT PLAYS LIST ===== */}
              <div className="rounded-3xl bg-white border border-jade-100 p-6 shadow-xl shadow-jade-500/10">
                <h3 className="text-primary font-bold text-lg mb-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-md shadow-purple-500/25">
                    <Icon name="list" size="sm" className="text-white" />
                  </div>
                  Script Plays
                </h3>
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                  {scriptPlays.map((scriptPlay, index) => {
                    const isActive = index === currentPlayIndex;
                    const isCompleted = index < currentPlayIndex;
                    const playInfo = getPlayDisplayInfo(
                      scriptPlay.play as Play | undefined
                    );

                    return (
                      <button
                        key={scriptPlay.id}
                        onClick={() => {
                          // TODO: Implement direct play navigation
                        }}
                        disabled={isPaused}
                        className={`
                          w-full text-left p-3.5 rounded-2xl border-2 transition-all duration-200 group
                          ${
                            isActive
                              ? "bg-gradient-to-r from-jade-50 to-emerald-50 border-jade-400 shadow-md shadow-jade-500/15"
                              : isCompleted
                                ? "bg-gradient-to-r from-emerald-50/50 to-green-50/50 border-emerald-200"
                                : "bg-white border-slate-200 hover:border-jade-300 hover:shadow-sm"
                          }
                          ${isPaused ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          {/* Number indicator - Enhanced */}
                          <span
                            className={`
                            w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm transition-all
                            ${
                              isActive
                                ? "bg-gradient-to-br from-jade-500 to-emerald-600 text-white shadow-jade-500/30 scale-110"
                                : isCompleted
                                  ? "bg-gradient-to-br from-emerald-400 to-green-500 text-white"
                                  : "bg-slate-100 text-slate-500 group-hover:bg-jade-100 group-hover:text-jade-600"
                            }
                          `}
                          >
                            {isCompleted ? "✓" : index + 1}
                          </span>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-mono font-bold text-sm truncate transition-colors ${
                                isActive
                                  ? "text-jade-700"
                                  : isCompleted
                                    ? "text-emerald-700"
                                    : "text-primary group-hover:text-jade-600"
                              }`}
                            >
                              {playInfo.displayName}
                            </p>
                            <p className="text-slate-500 text-xs mt-0.5">
                              {scriptPlay.repetitions || 10} reps
                            </p>
                          </div>

                          {/* Active indicator */}
                          {isActive && (
                            <div className="w-2 h-2 rounded-full bg-jade-500 animate-pulse" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
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
