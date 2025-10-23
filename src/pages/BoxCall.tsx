import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { Typography } from "../components/design-system";
import { Button } from "../components/ui";
import { Card } from "../components/ui";
import { Icon } from "../components/ui/Icon/Icon";
import { useActiveTeamStore } from "../stores/activeTeamStore";
import { PracticeService } from "../services/practiceService";
import { GamePlanService } from "../services/gamePlanService";
import type { PracticeScript } from "../services/practiceService";
import type { GamePlan } from "../services/gamePlanService";

interface RecentSession {
  id: string;
  type: "practice" | "game";
  name: string;
  date: string;
  stats: {
    totalPlays: number;
    successRate: number;
  };
}

/**
 * BoxCall - Live Session Tracking Platform
 * Available to coaches only
 *
 * Features:
 * - Live practice session tracking with rep counting
 * - Live game session tracking with situational awareness
 * - Retroactive session recording
 * - Real-time execution analytics
 */
const BoxCall: React.FC = () => {
  const navigate = useNavigate();
  const { activeTeamId } = useActiveTeamStore();
  const [practiceScripts, setPracticeScripts] = useState<PracticeScript[]>([]);
  const [gamePlans, setGamePlans] = useState<GamePlan[]>([]);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPracticeScript, setSelectedPracticeScript] =
    useState<string>("");
  const [selectedGamePlan, setSelectedGamePlan] = useState<string>("");

  const loadData = useCallback(async () => {
    if (!activeTeamId) return;

    try {
      setLoading(true);
      const [scripts, plans] = await Promise.all([
        PracticeService.getPracticeScripts(activeTeamId),
        GamePlanService.getGamePlans(activeTeamId),
      ]);

      setPracticeScripts(scripts);
      setGamePlans(plans);

      // TODO: Load recent sessions from ExecutionTrackingService
      // For now, showing empty state
      setRecentSessions([]);
    } catch (error) {
      console.error("Error loading BoxCall data:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTeamId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStartPractice = (mode: "live" | "retroactive") => {
    if (!selectedPracticeScript) {
      alert("Please select a practice script");
      return;
    }
    navigate(`/boxcall/practice/${selectedPracticeScript}?mode=${mode}`);
  };

  const handleStartGame = (mode: "live" | "retroactive") => {
    if (!selectedGamePlan) {
      alert("Please select a game plan");
      return;
    }
    navigate(`/boxcall/game/${selectedGamePlan}?mode=${mode}`);
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="container-page">
          <div className="flex items-center justify-center py-12">
            <Typography variant="body-lg" color="muted">
              Loading...
            </Typography>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="container-page">
        {/* Header */}
        <div className="mb-8">
          <Typography variant="headline-xl" className="text-text-primary">
            BoxCall Live
          </Typography>
          <Typography variant="body-lg" color="muted" className="mt-2">
            Track practice and game sessions in real-time
          </Typography>
        </div>

        {/* Session Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Practice Session Card */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Icon name="clipboard-list" size="lg" color="primary" />
              </div>
              <div className="flex-1">
                <Typography variant="headline-md" className="mb-1">
                  Practice Session
                </Typography>
                <Typography variant="body-sm" color="muted">
                  Track reps and execution quality during practice
                </Typography>
              </div>
            </div>

            {/* Practice Script Selector */}
            <div className="mb-4">
              <label className="block mb-2">
                <Typography variant="body-sm" className="text-text-secondary">
                  Select Practice Script
                </Typography>
              </label>
              <select
                value={selectedPracticeScript}
                onChange={(e) => setSelectedPracticeScript(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={practiceScripts.length === 0}
              >
                <option value="">
                  {practiceScripts.length === 0
                    ? "No practice scripts available"
                    : "Choose a script..."}
                </option>
                {practiceScripts.map((script) => (
                  <option key={script.id} value={script.id}>
                    {script.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => handleStartPractice("live")}
                disabled={!selectedPracticeScript}
                className="flex-1"
              >
                <Icon name="play" size="sm" />
                Start Live
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => handleStartPractice("retroactive")}
                disabled={!selectedPracticeScript}
                className="flex-1"
              >
                <Icon name="clock" size="sm" />
                Record Past
              </Button>
            </div>
          </Card>

          {/* Game Session Card */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-success/10 p-3 rounded-lg">
                <Icon name="zap" size="lg" className="text-success" />
              </div>
              <div className="flex-1">
                <Typography variant="headline-md" className="mb-1">
                  Game Session
                </Typography>
                <Typography variant="body-sm" color="muted">
                  Track plays and performance during games
                </Typography>
              </div>
            </div>

            {/* Game Plan Selector */}
            <div className="mb-4">
              <label className="block mb-2">
                <Typography variant="body-sm" className="text-text-secondary">
                  Select Game Plan
                </Typography>
              </label>
              <select
                value={selectedGamePlan}
                onChange={(e) => setSelectedGamePlan(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={gamePlans.length === 0}
              >
                <option value="">
                  {gamePlans.length === 0
                    ? "No game plans available"
                    : "Choose a game plan..."}
                </option>
                {gamePlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => handleStartGame("live")}
                disabled={!selectedGamePlan}
                className="flex-1"
              >
                <Icon name="play" size="sm" />
                Start Live
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => handleStartGame("retroactive")}
                disabled={!selectedGamePlan}
                className="flex-1"
              >
                <Icon name="clock" size="sm" />
                Record Past
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Sessions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Typography variant="headline-md">Recent Sessions</Typography>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/boxcall/history")}
            >
              View All
            </Button>
          </div>

          {recentSessions.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-3">
                <Icon name="calendar" size="lg" className="text-text-muted" />
              </div>
              <Typography variant="body-md" color="muted">
                No sessions recorded yet
              </Typography>
              <Typography variant="body-sm" color="muted" className="mt-1">
                Start your first practice or game session above
              </Typography>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-surface-secondary transition-colors cursor-pointer"
                  onClick={() =>
                    navigate(`/boxcall/${session.type}/${session.id}`)
                  }
                >
                  <div className="flex items-center gap-4">
                    <Icon
                      name={
                        session.type === "practice" ? "clipboard-list" : "zap"
                      }
                      size="md"
                      color="primary"
                    />
                    <div>
                      <Typography variant="body-md" className="font-medium">
                        {session.name}
                      </Typography>
                      <Typography variant="body-sm" color="muted">
                        {session.date}
                      </Typography>
                    </div>
                  </div>
                  <div className="text-right">
                    <Typography variant="body-sm" className="font-medium">
                      {session.stats.successRate}% Success
                    </Typography>
                    <Typography variant="body-xs" color="muted">
                      {session.stats.totalPlays} plays
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BoxCall;
