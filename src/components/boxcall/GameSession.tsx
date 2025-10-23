/**
 * GameSession Component
 * Main game tracking interface with situational awareness
 */

import React, { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Typography } from "../design-system";
import { Button } from "../ui";
import { Card } from "../ui";
import { Icon } from "../ui/Icon/Icon";
import { DownDistanceTracker } from "./DownDistanceTracker";
import { SituationFilter } from "./SituationFilter";
import { useGameSession } from "../../hooks/useGameSession";
import { useActiveTeamStore } from "../../stores/activeTeamStore";
import type { ExecutionResult, OpponentCoverage } from "../../types/session";

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
      console.error("Error starting session:", err);
      alert("Failed to start session");
    }
  };

  // Handle ending the session
  const handleEnd = async () => {
    if (!confirm("Are you sure you want to end this game session?")) {
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

  // Handle play execution
  const handleLogPlay = async () => {
    if (!currentPlay) {
      alert("Please select a play");
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
      console.error("Error logging play:", err);
      alert("Failed to log play");
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

            <div className="bg-surface-secondary rounded-lg p-6 mb-6">
              <Typography variant="body-md" className="mb-4">
                <strong>Game Session Features:</strong>
              </Typography>
              <ul className="space-y-2 text-text-secondary">
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
    <div className="py-6">
      <div className="container-page">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <Typography variant="headline-lg">{gamePlan.name}</Typography>
              <Typography variant="body-sm" color="muted">
                vs {opponent} · {mode === "live" ? "Live" : "Retroactive"} Game
                Session
              </Typography>
            </div>
            <div className="flex items-center gap-3">
              {hasPendingSync && (
                <div className="flex items-center gap-2 text-warning">
                  <Icon name="cloud-off" size="sm" />
                  <Typography variant="body-sm">Syncing...</Typography>
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
                End Game
              </Button>
            </div>
          </div>

          {/* Field Zone Badge */}
          {(isGoalLine || isRedZone) && (
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
                isGoalLine
                  ? "bg-error/10 text-error"
                  : "bg-warning/10 text-warning"
              }`}
            >
              <Icon name="target" size="sm" />
              <Typography variant="body-sm" className="font-medium">
                {isGoalLine ? "GOAL LINE SITUATION" : "RED ZONE"}
              </Typography>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Down/Distance & Play Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Down/Distance Tracker */}
            <Card className="p-6">
              <Typography variant="headline-md" className="mb-4">
                Game Situation
              </Typography>
              <DownDistanceTracker
                situation={situation}
                onUpdate={updateSituation}
                onFirstDown={resetDowns}
                onNextQuarter={nextQuarter}
                disabled={isPaused}
              />
            </Card>

            {/* Play Selection */}
            <Card className="p-6">
              <Typography variant="headline-md" className="mb-4">
                Select Play
              </Typography>
              <SituationFilter
                situation={situation}
                allPlays={gamePlanPlays}
                filteredPlays={filteredPlays}
                selectedPlay={currentPlay}
                onSelectPlay={selectPlay}
                teamId={activeTeamId || ""}
                disabled={isPaused}
              />
            </Card>

            {/* Play Execution Form */}
            {currentPlay && (
              <Card className="p-6">
                <Typography variant="headline-md" className="mb-4">
                  Log Play Result
                </Typography>

                <div className="space-y-4">
                  {/* Result & Yards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-2">
                        <Typography
                          variant="body-sm"
                          className="text-text-secondary"
                        >
                          Result
                        </Typography>
                      </label>
                      <select
                        value={result}
                        onChange={(e) =>
                          setResult(e.target.value as ExecutionResult)
                        }
                        disabled={isPaused}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="success">Success</option>
                        <option value="failure">Failure</option>
                        <option value="neutral">Neutral</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2">
                        <Typography
                          variant="body-sm"
                          className="text-text-secondary"
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
                        className="w-full px-3 py-2 border border-border rounded-lg bg-surface-primary text-text-primary font-mono focus:outline-none focus:ring-2 focus:ring-primary"
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
                          className="text-text-secondary"
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
                        className="w-full px-3 py-2 border border-border rounded-lg bg-surface-primary text-text-primary font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  )}

                  {/* Opponent Coverage - Phase 13.2 */}
                  <div>
                    <label className="block mb-2">
                      <Typography
                        variant="body-sm"
                        className="text-text-secondary"
                      >
                        Opponent Coverage
                      </Typography>
                    </label>
                    <select
                      value={opponentCoverage}
                      onChange={(e) =>
                        setOpponentCoverage(e.target.value as OpponentCoverage)
                      }
                      disabled={isPaused}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Unknown">Unknown</option>
                      <option value="Cover 0">Cover 0 (Man, 0 deep)</option>
                      <option value="Cover 1">Cover 1 (Man, 1 deep)</option>
                      <option value="Cover 2">Cover 2 (2 deep, 5 under)</option>
                      <option value="Cover 3">Cover 3 (3 deep, 4 under)</option>
                      <option value="Cover 4">Cover 4 (Quarters)</option>
                      <option value="Cover 6">
                        Cover 6 (Quarter-Quarter-Half)
                      </option>
                      <option value="Man">Man Coverage</option>
                      <option value="Zone">Zone Coverage</option>
                      <option value="Blitz">Blitz</option>
                    </select>
                    <Typography
                      variant="body-xs"
                      className="text-text-tertiary mt-1"
                    >
                      What defense did they show?
                    </Typography>
                  </div>

                  {/* Quick Tags - Phase 12.1 */}
                  <div>
                    <label className="block mb-2">
                      <Typography
                        variant="body-sm"
                        className="text-text-secondary"
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
                                  : "bg-surface-primary border-border text-text-secondary hover:border-primary/50"
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
                        className="text-text-secondary"
                      >
                        Notes (Optional)
                      </Typography>
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this play..."
                      disabled={isPaused}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface-primary text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={2}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleLogPlay}
                    disabled={isPaused || !yardsGained}
                    className="w-full"
                  >
                    <Icon name="check" size="sm" />
                    Log Play
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column: Stats */}
          <div className="space-y-6">
            {/* Current Drive Stats */}
            <Card className="p-6">
              <Typography variant="headline-sm" className="mb-4">
                Current Drive
              </Typography>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Typography variant="body-sm" color="muted">
                    Plays
                  </Typography>
                  <Typography variant="headline-sm">
                    {currentDrive.plays}
                  </Typography>
                </div>
                <div className="flex items-center justify-between">
                  <Typography variant="body-sm" color="muted">
                    Yards
                  </Typography>
                  <Typography variant="headline-sm">
                    {currentDrive.yards}
                  </Typography>
                </div>
                <div className="flex items-center justify-between">
                  <Typography variant="body-sm" color="muted">
                    TDs
                  </Typography>
                  <Typography variant="headline-sm" className="text-success">
                    {currentDrive.touchdowns}
                  </Typography>
                </div>
                <div className="flex items-center justify-between">
                  <Typography variant="body-sm" color="muted">
                    Turnovers
                  </Typography>
                  <Typography variant="headline-sm" className="text-error">
                    {currentDrive.turnovers}
                  </Typography>
                </div>
              </div>
            </Card>

            {/* Game Stats */}
            <Card className="p-6">
              <Typography variant="headline-sm" className="mb-4">
                Game Stats
              </Typography>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Typography variant="body-sm" color="muted">
                    Total Plays
                  </Typography>
                  <Typography variant="body-lg">
                    {session?.totalPlays || 0}
                  </Typography>
                </div>
                <div className="flex items-center justify-between">
                  <Typography variant="body-sm" color="muted">
                    Success Rate
                  </Typography>
                  <Typography variant="body-lg" className="text-success">
                    {session?.successRate?.toFixed(1) || 0}%
                  </Typography>
                </div>
                <div className="flex items-center justify-between">
                  <Typography variant="body-sm" color="muted">
                    Total Yards
                  </Typography>
                  <Typography variant="body-lg">
                    {session?.totalYards || 0}
                  </Typography>
                </div>
                <div className="flex items-center justify-between">
                  <Typography variant="body-sm" color="muted">
                    Touchdowns
                  </Typography>
                  <Typography variant="body-lg" className="text-success">
                    {session?.totalTouchdowns || 0}
                  </Typography>
                </div>
                <div className="flex items-center justify-between">
                  <Typography variant="body-sm" color="muted">
                    Turnovers
                  </Typography>
                  <Typography variant="body-lg" className="text-error">
                    {session?.totalTurnovers || 0}
                  </Typography>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSession;
