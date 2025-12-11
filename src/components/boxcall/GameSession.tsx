/**
 * GameSession Component
 * Main game tracking interface with situational awareness
 *
 * Modernized Dec 2025: Premium visual design with gradients
 *
 * NOTE: This component intentionally uses raw Tailwind colors for:
 * - Gradient effects (emerald-*, teal-*, slate-*)
 * - Visual polish (shadows, subtle backgrounds)
 * These are design choices that don't need dark mode variants.
 */

/* eslint-disable boxcall-design/no-raw-tailwind-colors */

import React, { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Typography } from "../design-system";
import { Button, FormSelect } from "../ui";
import { Card } from "../ui";
import { Icon } from "../ui/Icon/Icon";
import { DownDistanceTracker } from "./DownDistanceTracker";
import { SituationFilter } from "./SituationFilter";
import { useGameSession } from "../../hooks/useGameSession";
import { useActiveTeamStore } from "../../stores/activeTeamStore";
import type { ExecutionResult, OpponentCoverage } from "../../types/session";
import { logError } from "../../utils/logger";
import { useToast } from "../../hooks/useToast";
import { ConfirmationModal } from "../ui/ConfirmationModal/ConfirmationModal";

/**
 * GameSession - Live/retroactive game tracking
 *
 * Features:
 * - Situational play filtering (Billick situations)
 * - Down/distance/yard line tracking
 * - Auto-advance logic (first downs, touchdowns, turnovers)
 * - Quick play logging (5-10 seconds per play)
 * - Drive statistics
 * - Offline support with auto-sync
 * - Real-time stats updates
 */
const GameSession: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activeTeamId } = useActiveTeamStore();

  const mode = (searchParams.get("mode") as "live" | "retroactive") || "live";
  const opponent = searchParams.get("opponent") || "Opponent";
  const isHomeGame = searchParams.get("home") !== "false";

  const [yardsGained, setYardsGained] = useState("");
  const [result, setResult] = useState<ExecutionResult>("success");
  const [wasTouchdown, setWasTouchdown] = useState(false);
  const [wasTurnover, setWasTurnover] = useState(false);
  const [wasPenalty, setWasPenalty] = useState(false);
  const [penaltyYards, setPenaltyYards] = useState("");
  const [notes, setNotes] = useState("");
  const [quickTags, setQuickTags] = useState<string[]>([]); // Phase 12.1
  const [opponentCoverage, setOpponentCoverage] =
    useState<OpponentCoverage>("Unknown"); // Phase 13.2
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const toast = useToast();

  const {
    session,
    isLoading,
    error,
    gamePlan,
    gamePlanPlays,
    situation,
    updateSituation,
    filteredPlays,
    // recommendedPlays, // Unused - commented out
    currentPlay,
    selectPlay,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    logPlay,
    resetDowns,
    nextQuarter,
    currentDrive,
    isSessionActive,
    isPaused,
    hasPendingSync,
    isRedZone,
    isGoalLine,
  } = useGameSession({
    gamePlanId: planId || "",
    mode,
    opponent,
    isHomeGame,
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

  // Handle play execution
  const handleLogPlay = async () => {
    if (!currentPlay) {
      toast.error("Please select a play");
      return;
    }

    const yards = parseInt(yardsGained) || 0;

    try {
      await logPlay(currentPlay, result, yards, {
        wasTouchdown,
        wasTurnover,
        wasPenalty,
        penaltyYards: penaltyYards ? parseInt(penaltyYards) : undefined,
        notes: notes || undefined,
        quickTags: quickTags.length > 0 ? quickTags : undefined, // Phase 12.1
        opponentCoverage, // Phase 13.2
      });

      // Reset form
      setYardsGained("");
      setResult("success");
      setWasTouchdown(false);
      setWasTurnover(false);
      setWasPenalty(false);
      setPenaltyYards("");
      setNotes("");
      setQuickTags([]); // Phase 12.1
      setOpponentCoverage("Unknown"); // Phase 13.2
    } catch (err) {
      logError("Error logging play:", err);
      toast.error("Failed to log play");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="py-6">
        <div className="container-page">
          <div className="flex items-center justify-center py-12">
            <Typography variant="body-lg" color="muted">
              Loading game session...
            </Typography>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !gamePlan) {
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
              Error Loading Game
            </Typography>
            <Typography variant="body-md" color="muted" className="mb-4">
              {error?.message || "Game plan not found"}
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
                {gamePlan.name}
              </Typography>
              <Typography variant="body-md" color="muted">
                vs {opponent} · {gamePlanPlays.length} plays ·{" "}
                {mode === "live" ? "Live" : "Retroactive"} session
              </Typography>
            </div>

            <div className="bg-secondary rounded-lg p-6 mb-6">
              <Typography variant="body-md" className="mb-4">
                <strong>Game Session Features:</strong>
              </Typography>
              <ul className="space-y-2 text-secondary">
                <li className="flex items-start gap-2">
                  <Icon name="check" size="sm" className="mt-0.5" />
                  <Typography variant="body-sm">
                    Situational play filtering (Billick situations)
                  </Typography>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="check" size="sm" className="mt-0.5" />
                  <Typography variant="body-sm">
                    Auto-advance down/distance logic
                  </Typography>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="check" size="sm" className="mt-0.5" />
                  <Typography variant="body-sm">
                    Track touchdowns, turnovers, penalties
                  </Typography>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="check" size="sm" className="mt-0.5" />
                  <Typography variant="body-sm">
                    Drive statistics and analytics
                  </Typography>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="check" size="sm" className="mt-0.5" />
                  <Typography variant="body-sm">
                    Works offline with auto-sync
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
                Start Game
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Active session screen
  return (
    <>
      {/* Premium gradient background */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50">
        <div className="container-page py-6">
          {/* ===== PREMIUM HEADER ===== */}
          <div className="mb-6">
            {/* Top Bar with Back + Title + Actions */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/boxcall")}
                  className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                >
                  <Icon name="arrow-left" size="sm" className="text-slate-600" />
                </button>
                <div>
                  <Typography variant="headline-lg" className="text-slate-800 font-bold">
                    {gamePlan.name}
                  </Typography>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm">
                      {mode === "live" ? "🔴 LIVE GAME" : "📝 RETROACTIVE"}
                    </span>
                    <Typography variant="body-sm" color="muted">
                      vs {opponent}
                    </Typography>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {hasPendingSync && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
                    <Icon name="cloud-off" size="sm" />
                    <Typography variant="body-xs" className="font-medium">Syncing...</Typography>
                  </div>
                )}
                {isPaused ? (
                  <button
                    onClick={resumeSession}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
                  >
                    <Icon name="play" size="sm" />
                    Resume
                  </button>
                ) : (
                  <button
                    onClick={pauseSession}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border-2 border-amber-300 text-amber-700 font-semibold hover:bg-amber-50 transition-colors"
                  >
                    <Icon name="pause" size="sm" />
                    Pause
                  </button>
                )}
                <button
                  onClick={handleEnd}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border-2 border-rose-300 text-rose-600 font-semibold hover:bg-rose-50 transition-colors"
                >
                  <Icon name="square" size="sm" />
                  End
                </button>
              </div>
            </div>

            {/* Field Zone Badge - Enhanced */}
            {(isGoalLine || isRedZone) && (
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm shadow-lg animate-pulse ${
                  isGoalLine
                    ? "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-rose-500/30"
                    : "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-amber-500/30"
                }`}
              >
                <Icon name="target" size="sm" />
                {isGoalLine ? "🎯 GOAL LINE SITUATION" : "🔥 RED ZONE"}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Down/Distance & Play Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Down/Distance Tracker - Premium Card */}
              <div className="rounded-3xl bg-white border border-emerald-100 p-6 shadow-xl shadow-emerald-500/10">
                <h3 className="text-primary font-bold text-lg mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/25">
                    <Icon name="map-pin" size="sm" className="text-white" />
                  </div>
                  Game Situation
                </h3>
                <DownDistanceTracker
                  situation={situation}
                  onUpdate={updateSituation}
                  onFirstDown={resetDowns}
                  onNextQuarter={nextQuarter}
                  disabled={isPaused}
                />
              </div>

              {/* Play Selection - Premium Card */}
              <div className="rounded-3xl bg-white border border-emerald-100 p-6 shadow-xl shadow-emerald-500/10">
                <h3 className="text-primary font-bold text-lg mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/25">
                    <Icon name="list" size="sm" className="text-white" />
                  </div>
                  Select Play
                </h3>
                <SituationFilter
                  situation={situation}
                  allPlays={gamePlanPlays}
                  filteredPlays={filteredPlays}
                  selectedPlay={currentPlay}
                  onSelectPlay={selectPlay}
                  teamId={activeTeamId || ""}
                  disabled={isPaused}
                />
              </div>

              {/* Play Execution Form - Premium Card */}
              {currentPlay && (
                <div className="rounded-3xl bg-white border border-emerald-100 p-6 shadow-xl shadow-emerald-500/10">
                  <h3 className="text-primary font-bold text-lg mb-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/25">
                      <Icon name="clipboard-check" size="sm" className="text-white" />
                    </div>
                    Log Play Result
                  </h3>

                  <div className="space-y-4">
                    {/* Result & Yards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-2">
                          <Typography
                            variant="body-sm"
                            className="text-secondary"
                          >
                            Result
                          </Typography>
                        </label>
                        <FormSelect
                          value={result}
                          onChange={(value) =>
                            setResult(value as ExecutionResult)
                          }
                          disabled={isPaused}
                          options={[
                            { value: "success", label: "Success" },
                            { value: "failure", label: "Failure" },
                            { value: "neutral", label: "Neutral" },
                          ]}
                        />
                      </div>

                      <div>
                        <label className="block mb-2">
                          <Typography
                            variant="body-sm"
                            className="text-secondary"
                          >
                            Yards Gained
                          </Typography>
                        </label>
                        <input
                          type="number"
                          value={yardsGained}
                          onChange={(e) => setYardsGained(e.target.value)}
                          placeholder="0"
                          disabled={isPaused}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-primary text-primary font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    {/* Special Outcomes */}
                    <div className="flex flex-wrap gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wasTouchdown}
                          onChange={(e) => setWasTouchdown(e.target.checked)}
                          disabled={isPaused}
                          className="w-4 h-4 rounded border-border text-success focus:ring-success"
                        />
                        <Typography variant="body-sm">Touchdown</Typography>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wasTurnover}
                          onChange={(e) => setWasTurnover(e.target.checked)}
                          disabled={isPaused}
                          className="w-4 h-4 rounded border-border text-error focus:ring-error"
                        />
                        <Typography variant="body-sm">Turnover</Typography>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wasPenalty}
                          onChange={(e) => setWasPenalty(e.target.checked)}
                          disabled={isPaused}
                          className="w-4 h-4 rounded border-border text-warning focus:ring-warning"
                        />
                        <Typography variant="body-sm">Penalty</Typography>
                      </label>
                    </div>

                    {wasPenalty && (
                      <div>
                        <label className="block mb-2">
                          <Typography
                            variant="body-sm"
                            className="text-secondary"
                          >
                            Penalty Yards
                          </Typography>
                        </label>
                        <input
                          type="number"
                          value={penaltyYards}
                          onChange={(e) => setPenaltyYards(e.target.value)}
                          placeholder="0"
                          disabled={isPaused}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-primary text-primary font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    )}

                    {/* Opponent Coverage - Phase 13.2 */}
                    <div>
                      <label className="block mb-2">
                        <Typography
                          variant="body-sm"
                          className="text-secondary"
                        >
                          Opponent Coverage
                        </Typography>
                      </label>
                      <FormSelect
                        value={opponentCoverage}
                        onChange={(value) =>
                          setOpponentCoverage(value as OpponentCoverage)
                        }
                        disabled={isPaused}
                        options={[
                          { value: "Unknown", label: "Unknown" },
                          { value: "Cover 0", label: "Cover 0 (Man, 0 deep)" },
                          { value: "Cover 1", label: "Cover 1 (Man, 1 deep)" },
                          {
                            value: "Cover 2",
                            label: "Cover 2 (2 deep, 5 under)",
                          },
                          {
                            value: "Cover 3",
                            label: "Cover 3 (3 deep, 4 under)",
                          },
                          { value: "Cover 4", label: "Cover 4 (Quarters)" },
                          {
                            value: "Cover 6",
                            label: "Cover 6 (Quarter-Quarter-Half)",
                          },
                          { value: "Man", label: "Man Coverage" },
                          { value: "Zone", label: "Zone Coverage" },
                          { value: "Blitz", label: "Blitz" },
                        ]}
                      />
                      <Typography
                        variant="body-xs"
                        className="text-tertiary mt-1"
                      >
                        What defense did they show?
                      </Typography>
                    </div>

                    {/* Quick Tags - Phase 12.1 */}
                    <div>
                      <label className="block mb-2">
                        <Typography
                          variant="body-sm"
                          className="text-secondary"
                        >
                          Quick Tags (Optional)
                        </Typography>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: "great-blocking", label: "Great Blocking" },
                          { id: "broken-tackle", label: "Broken Tackle" },
                          { id: "great-catch", label: "Great Catch" },
                          { id: "dropped-pass", label: "Dropped Pass" },
                          { id: "good-protection", label: "Good Protection" },
                          { id: "pressure", label: "Pressure" },
                          { id: "great-read", label: "Great Read" },
                          { id: "wrong-route", label: "Wrong Route" },
                        ].map((tag) => {
                          const isSelected = quickTags.includes(tag.id);
                          return (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => {
                                setQuickTags((prev) =>
                                  prev.includes(tag.id)
                                    ? prev.filter((t) => t !== tag.id)
                                    : [...prev, tag.id]
                                );
                              }}
                              disabled={isPaused}
                              className={`
                              px-3 py-1.5 rounded-full text-xs font-medium
                              border transition-all
                              ${
                                isSelected
                                  ? "bg-primary text-white border-primary"
                                  : "bg-primary border-border text-secondary hover:border-primary/50"
                              }
                              ${isPaused ? "opacity-50 cursor-not-allowed" : ""}
                            `}
                            >
                              {tag.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block mb-2">
                        <Typography
                          variant="body-sm"
                          className="text-secondary"
                        >
                          Notes (Optional)
                        </Typography>
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes about this play..."
                        disabled={isPaused}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-primary text-primary resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={2}
                      />
                    </div>

                    {/* Submit Button - Premium */}
                    <button
                      onClick={handleLogPlay}
                      disabled={isPaused || !yardsGained}
                      className={`
                        w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all
                        ${isPaused || !yardsGained
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 active:scale-[0.98]"
                        }
                      `}
                    >
                      <Icon name="check" size="md" />
                      Log Play
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Stats - Premium Cards */}
            <div className="space-y-6">
              {/* Current Drive Stats - Premium */}
              <div className="rounded-3xl bg-white border border-emerald-100 p-6 shadow-xl shadow-emerald-500/10">
                <h3 className="text-primary font-bold text-lg mb-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/25">
                    <Icon name="trending-up" size="sm" className="text-white" />
                  </div>
                  Current Drive
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 text-center border border-slate-200">
                    <div className="text-3xl font-black text-slate-700">{currentDrive.plays}</div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">Plays</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 text-center border border-blue-200">
                    <div className="text-3xl font-black text-blue-600">{currentDrive.yards}</div>
                    <div className="text-xs font-medium text-blue-500 uppercase tracking-wide mt-1">Yards</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 text-center border border-emerald-200">
                    <div className="text-3xl font-black text-emerald-600">{currentDrive.touchdowns}</div>
                    <div className="text-xs font-medium text-emerald-500 uppercase tracking-wide mt-1">TDs</div>
                  </div>
                  <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-2xl p-4 text-center border border-rose-200">
                    <div className="text-3xl font-black text-rose-600">{currentDrive.turnovers}</div>
                    <div className="text-xs font-medium text-rose-500 uppercase tracking-wide mt-1">Turnovers</div>
                  </div>
                </div>
              </div>

              {/* Game Stats - Premium */}
              <div className="rounded-3xl bg-white border border-emerald-100 p-6 shadow-xl shadow-emerald-500/10">
                <h3 className="text-primary font-bold text-lg mb-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md shadow-teal-500/25">
                    <Icon name="bar-chart-2" size="sm" className="text-white" />
                  </div>
                  Game Stats
                </h3>
                
                {/* Success Rate - Large Display */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 mb-4 border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-emerald-700">Success Rate</span>
                    <span className="text-3xl font-black text-emerald-600">
                      {session?.successRate?.toFixed(0) || 0}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-emerald-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${session?.successRate || 0}%` }}
                    />
                  </div>
                </div>

                {/* Other Stats Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">Total Plays</span>
                    <span className="font-bold text-slate-800">{session?.totalPlays || 0}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">Total Yards</span>
                    <span className="font-bold text-blue-600">{session?.totalYards || 0}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">Touchdowns</span>
                    <span className="font-bold text-emerald-600">{session?.totalTouchdowns || 0}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-600">Turnovers</span>
                    <span className="font-bold text-rose-600">{session?.totalTurnovers || 0}</span>
                  </div>
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
        title="End Game Session"
        message="Are you sure you want to end this game session?"
        variant="warning"
        confirmText="End Session"
        cancelText="Cancel"
      />
    </>
  );
};

export default GameSession;
