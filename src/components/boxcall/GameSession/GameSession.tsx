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

/* eslint-disable max-lines-per-function */

import React, { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

import { useGameSession } from "../../../hooks/useGameSession";
import { useActiveTeamStore } from "../../../stores/activeTeamStore";
import { logError } from "../../../utils/logger";
import { useToast } from "../../../hooks/useToast";
import { ConfirmationModal } from "../../ui/ConfirmationModal/ConfirmationModal";

import type { PlayLogForm } from "./types";
import { DEFAULT_PLAY_LOG_FORM } from "./types";
import {
  GameSessionHeader,
  PlayExecutionForm,
  DriveStatsCard,
  GameStatsCard,
  LoadingState,
  ErrorState,
  PreSessionState,
  DownDistanceCard,
  PlaySelectionCard,
} from "./components";

type GameSessionViewState = "loading" | "error" | "pre-session" | "active";

const getGameSessionViewState = (params: {
  isLoading: boolean;
  error: unknown;
  gamePlan: unknown;
  isSessionActive: boolean;
  isPaused: boolean;
  session: unknown;
}): GameSessionViewState => {
  const { isLoading, error, gamePlan, isSessionActive, isPaused, session } =
    params;

  if (isLoading) return "loading";
  if (error || !gamePlan) return "error";
  if (!isSessionActive && !isPaused && !session) return "pre-session";
  return "active";
};

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
  const activeTeamId = useActiveTeamStore((state) => state.activeTeamId);
  const toast = useToast();

  const mode = (searchParams.get("mode") as "live" | "retroactive") || "live";
  const opponent = searchParams.get("opponent") || "Opponent";
  const isHomeGame = searchParams.get("home") !== "false";

  const [form, setForm] = useState<PlayLogForm>(DEFAULT_PLAY_LOG_FORM);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const {
    session,
    isLoading,
    error,
    gamePlan,
    gamePlanPlays,
    situation,
    updateSituation,
    filteredPlays,
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

  const handleFormChange = (updates: Partial<PlayLogForm>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const handleTagToggle = (tagId: string) => {
    setForm((prev) => ({
      ...prev,
      quickTags: prev.quickTags.includes(tagId)
        ? prev.quickTags.filter((t) => t !== tagId)
        : [...prev.quickTags, tagId],
    }));
  };

  const handleStart = async () => {
    try {
      await startSession();
    } catch (err) {
      logError("Error starting session:", err);
      toast.error("Failed to start session");
    }
  };

  const handleEnd = () => {
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

  const handleLogPlay = async () => {
    if (!currentPlay) {
      toast.error("Please select a play");
      return;
    }

    const yardsGained = Number(form.yardsGained) || 0;
    const penaltyYards = Number(form.penaltyYards) || 0;

    try {
      await logPlay(currentPlay, form.result, yardsGained, {
        wasTouchdown: form.wasTouchdown,
        wasTurnover: form.wasTurnover,
        wasPenalty: form.wasPenalty,
        penaltyYards: form.wasPenalty ? penaltyYards : undefined,
        notes: form.notes || undefined,
        quickTags: form.quickTags.length > 0 ? form.quickTags : undefined,
        opponentCoverage: form.opponentCoverage,
      });

      setForm(DEFAULT_PLAY_LOG_FORM);
    } catch (err) {
      logError("Error logging play:", err);
      toast.error("Failed to log play");
    }
  };

  const viewState = getGameSessionViewState({
    isLoading,
    error,
    gamePlan,
    isSessionActive,
    isPaused,
    session,
  });

  const errorMessage = (() => {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return "Game plan not found";
  })();

  const renderers: Record<GameSessionViewState, () => React.ReactNode> = {
    loading: () => <LoadingState />,
    error: () => (
      <ErrorState message={errorMessage} onBack={() => navigate("/boxcall")} />
    ),
    "pre-session": () => (
      <PreSessionState
        gamePlanName={gamePlan?.name ?? "Game Plan"}
        opponent={opponent}
        playCount={gamePlanPlays.length}
        mode={mode}
        onCancel={() => navigate("/boxcall")}
        onStart={handleStart}
      />
    ),
    active: () => (
      <>
        {/* Premium gradient background */}
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50">
          <div className="container-page py-6">
            <GameSessionHeader
              gamePlanName={gamePlan?.name ?? "Game Plan"}
              mode={mode}
              opponent={opponent}
              hasPendingSync={hasPendingSync}
              isPaused={isPaused}
              isGoalLine={isGoalLine}
              isRedZone={isRedZone}
              onBack={() => navigate("/boxcall")}
              onPause={pauseSession}
              onResume={resumeSession}
              onEnd={handleEnd}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Down/Distance & Play Selection */}
              <div className="lg:col-span-2 space-y-6">
                <DownDistanceCard
                  situation={situation}
                  onUpdate={updateSituation}
                  onFirstDown={resetDowns}
                  onNextQuarter={nextQuarter}
                  disabled={isPaused}
                />

                <PlaySelectionCard
                  situation={situation}
                  gamePlanPlays={gamePlanPlays}
                  filteredPlays={filteredPlays}
                  currentPlay={currentPlay}
                  onSelectPlay={selectPlay}
                  teamId={activeTeamId || ""}
                  disabled={isPaused}
                />

                {currentPlay && (
                  <PlayExecutionForm
                    currentPlay={currentPlay}
                    form={form}
                    onFormChange={handleFormChange}
                    onTagToggle={handleTagToggle}
                    onSubmit={handleLogPlay}
                    isPaused={isPaused}
                  />
                )}
              </div>

              {/* Right Column: Stats */}
              <div className="space-y-6">
                <DriveStatsCard
                  plays={currentDrive.plays}
                  yards={currentDrive.yards}
                  touchdowns={currentDrive.touchdowns}
                  turnovers={currentDrive.turnovers}
                />

                <GameStatsCard
                  successRate={session?.successRate || 0}
                  totalPlays={session?.totalPlays || 0}
                  totalYards={session?.totalYards || 0}
                  totalTouchdowns={session?.totalTouchdowns || 0}
                  totalTurnovers={session?.totalTurnovers || 0}
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
          title="End Session?"
          message="Are you sure you want to end this session? This will finalize the game statistics."
          confirmText="End Session"
          cancelText="Cancel"
          variant="danger"
        />
      </>
    ),
  };

  return renderers[viewState]();
};

export default GameSession;
