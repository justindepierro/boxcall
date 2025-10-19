import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button/Button";
import { Icon, type IconName } from "../components/ui/Icon";
import { Typography } from "../components/design-system/Typography";
import { PageLayout } from "../components/layout/PageLayout";
import { AuroraTile } from "../components/ui/AuroraTile";
import { Aurora } from "../components/ui/Aurora";
import { GamePlanModal } from "../components/playbook/GamePlanModal";
import { GamePlanPDFService } from "../services/gamePlanPdfService";
import { GamePlanService } from "../services/gamePlanService_new";
import type { GamePlan } from "../components/playbook/GamePlanModal/types";
import { useAuth } from "../app/auth-store";
import { useToast } from "../hooks/useToast";

export default function GamePlansPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [gamePlans, setGamePlans] = useState<GamePlan[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<GamePlan | undefined>(
    undefined
  );
  const [_loading, setLoading] = useState(true);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);

  // Get active team ID from localStorage or user
  useEffect(() => {
    const teamId = localStorage.getItem("activeTeamId");
    setActiveTeamId(teamId);
  }, []);

  const loadGamePlans = useCallback(async () => {
    if (!user || !activeTeamId) return;

    setLoading(true);
    try {
      const plans = await GamePlanService.getGamePlans(activeTeamId, false);

      // Map to our component's GamePlan type
      const mappedPlans: GamePlan[] = plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        opponent: plan.opponent || "",
        gameDate: plan.gameDate,
        gameLocation: plan.gameLocation as
          | "Home"
          | "Away"
          | "Neutral"
          | undefined,
        situations: (plan.situations || []).map((sit) => ({
          id: sit.id,
          situationType: sit.situationType,
          plays: (sit.plays || []).map((p) => ({
            id: p.id,
            playId: p.playId,
            playName: p.play?.play_name || "Unknown Play",
            formation: p.play?.formation,
            personnel: p.play?.personnel,
            wristbandNumber: p.play?.wristband_number,
            priority: p.priority,
          })),
        })),
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
        isArchived: plan.isArchived,
      }));

      setGamePlans(mappedPlans);
    } catch (error) {
      console.error("Failed to load game plans:", error);
      toast.error("Failed to load game plans");
    } finally {
      setLoading(false);
    }
  }, [user, activeTeamId, toast]);

  // Load game plans from database
  useEffect(() => {
    loadGamePlans();
  }, [loadGamePlans]);

  const handleCreatePlan = useCallback(() => {
    setEditingPlan(undefined);
    setShowModal(true);
  }, []);

  const handleEditPlan = (plan: GamePlan) => {
    setEditingPlan(plan);
    setShowModal(true);
  };

  const handleSavePlan = async (plan: GamePlan) => {
    if (!activeTeamId) {
      toast.error("No active team found");
      return;
    }

    try {
      if (editingPlan) {
        // Update existing game plan
        await GamePlanService.updateGamePlan(plan.id, {
          name: plan.name,
          opponent: plan.opponent,
          gameDate: plan.gameDate,
          gameLocation: plan.gameLocation,
        });
        toast.success("Game plan updated successfully");
      } else {
        // Create new game plan
        await GamePlanService.createGamePlan({
          teamId: activeTeamId,
          name: plan.name,
          opponent: plan.opponent,
          gameDate: plan.gameDate,
          gameLocation: plan.gameLocation,
        });
        toast.success("Game plan created successfully");
      }

      // Reload game plans
      await loadGamePlans();
      setShowModal(false);
      setEditingPlan(undefined);
    } catch (error) {
      console.error("Failed to save game plan:", error);
      toast.error("Failed to save game plan");
    }
  };

  const handleDuplicatePlan = async (plan: GamePlan) => {
    try {
      const newName = `${plan.name} (Copy)`;
      await GamePlanService.duplicateGamePlan(plan.id, newName);
      await loadGamePlans();
      toast.success("Game plan duplicated successfully");
    } catch (error) {
      console.error("Failed to duplicate game plan:", error);
      toast.error("Failed to duplicate game plan");
    }
  };

  const handleExportPDF = async (plan: GamePlan) => {
    try {
      await GamePlanPDFService.exportGamePlan(plan, "call-sheet");
      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("Failed to export PDF:", error);
      toast.error("Failed to export PDF");
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this game plan?")) return;

    try {
      await GamePlanService.deleteGamePlan(planId);
      await loadGamePlans();
      toast.success("Game plan deleted successfully");
    } catch (error) {
      console.error("Failed to delete game plan:", error);
      toast.error("Failed to delete game plan");
    }
  };

  const getTotalPlays = (plan: GamePlan) => {
    return plan.situations.reduce(
      (sum, situation) => sum + situation.plays.length,
      0
    );
  };

  const scrollToList = () => {
    if (typeof window === "undefined") return;
    const section = document.getElementById("game-plans-section");
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const tileConfigs = useMemo(
    () => [
      {
        key: "create",
        title: "Build New Plan",
        description: "Design scripted drives and install packages.",
        icon: "target" as IconName,
        accentOverlayClass: "bg-aurora-emerald",
        glowClassName: "glow-aurora-emerald",
        statusBadge: "Creator",
        iconClassName: "text-emerald-600",
        footnote: "Start drafting",
        onOpen: handleCreatePlan,
        body: (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-text-secondary">
              <span>Total plans</span>
              <span className="font-semibold text-text-primary">
                {gamePlans.length}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>Last update</span>
              <span className="font-semibold text-text-primary">
                {gamePlans[0]?.updatedAt
                  ? gamePlans[0].updatedAt.toLocaleDateString()
                  : "—"}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "film",
        title: "Film Script",
        description: "Tag cutups and align plays with opponent looks.",
        icon: "play" as IconName,
        accentOverlayClass: "bg-aurora-indigo",
        glowClassName: "glow-aurora-indigo",
        statusBadge: "Scouting",
        iconClassName: "text-sky-600",
        footnote: "Open board",
        onOpen: () => navigate("/playbook"),
        body: (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-text-secondary">
              <span>Playbook link</span>
              <span className="font-semibold text-text-primary">Ready</span>
            </div>
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>Opponent focus</span>
              <span className="font-semibold text-text-primary">Set later</span>
            </div>
          </div>
        ),
      },
      {
        key: "share",
        title: "Share Packet",
        description: "Distribute call sheets to staff in one tap.",
        icon: "mail" as IconName,
        accentOverlayClass: "bg-aurora-violet",
        glowClassName: "glow-aurora-violet",
        statusBadge: "Collab",
        iconClassName: "text-purple-600",
        footnote: "Jump to list",
        onOpen: scrollToList,
        body: (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-text-secondary">
              <span>Staff ready</span>
              <span className="font-semibold text-text-primary">Awaiting</span>
            </div>
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>Export status</span>
              <span className="font-semibold text-text-primary">PDF soon</span>
            </div>
          </div>
        ),
      },
    ],
    [gamePlans, handleCreatePlan, navigate]
  );

  return (
    <Aurora variant="field" fullHeight>
      <PageLayout
        title="Game Plans"
        subtitle="Create and manage strategic game plans for upcoming matches"
        variant="list"
        actions={
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate("/playbook")}
              variant="secondary"
              size="sm"
            >
              <Icon name="arrow-left" className="h-4 w-4 mr-2" />
              Back to Playbook
            </Button>
            <Button onClick={handleCreatePlan} variant="primary" size="sm">
              <Icon name="plus" className="h-4 w-4 mr-2" />
              New Plan
            </Button>
          </div>
        }
      >
        <div className="mb-8">
          <div className="rounded-xl border border/40 bg-aurora-shell p-5 shadow-md shadow-slate-200/40 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/80 dark:shadow-slate-900/40 sm:p-6 xl:p-7">
            <div className="mb-6">
              <Typography variant="headline-sm" className="text-text-primary">
                Dial in this week’s script
              </Typography>
              <Typography
                variant="body-sm"
                className="text-text-secondary mt-1"
              >
                Launch the workspace you need for planning, film, and
                distribution.
              </Typography>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
              {tileConfigs.map((tile) => (
                <AuroraTile
                  key={tile.key}
                  title={tile.title}
                  description={tile.description}
                  icon={tile.icon}
                  accentOverlayClass={tile.accentOverlayClass}
                  glowClassName={tile.glowClassName}
                  statusBadge={tile.statusBadge}
                  iconClassName={tile.iconClassName}
                  footnote={tile.footnote}
                  onOpen={tile.onOpen}
                >
                  {tile.body}
                </AuroraTile>
              ))}
            </div>
          </div>
        </div>

        {gamePlans.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-surface-muted rounded-full flex items-center justify-center mb-6">
              <Icon name="target" className="h-12 w-12 text-text-muted" />
            </div>
            <Typography
              variant="headline-md"
              className="text-text-primary mb-2"
            >
              No Game Plans Yet
            </Typography>
            <Typography
              variant="body-lg"
              className="text-text-secondary mb-8 max-w-md mx-auto"
            >
              Create your first game plan to strategize plays and formations for
              upcoming matches.
            </Typography>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleCreatePlan} variant="primary" size="lg">
                <Icon name="plus" className="h-5 w-5 mr-2" />
                Create New Plan
              </Button>
              <Button
                onClick={() => navigate("/playbook")}
                variant="secondary"
                size="lg"
              >
                <Icon name="book" className="h-5 w-5 mr-2" />
                Browse Playbook
              </Button>
            </div>
          </div>
        ) : (
          // Plans List
          <div className="space-y-6" id="game-plans-section">
            {/* Header with Create Button */}
            <div className="flex justify-between items-center">
              <Typography variant="headline-md" className="text-text-primary">
                Your Game Plans ({gamePlans.length})
              </Typography>
              <Button onClick={handleCreatePlan} variant="primary">
                <Icon name="plus" className="h-4 w-4 mr-2" />
                New Plan
              </Button>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {gamePlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-surface-primary rounded-lg border border-border p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleEditPlan(plan)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Typography
                        variant="headline-sm"
                        className="text-text-primary mb-1"
                      >
                        {plan.name}
                      </Typography>
                      <Typography
                        variant="body-sm"
                        className="text-text-secondary"
                      >
                        vs {plan.opponent}
                      </Typography>
                      <Typography variant="body-sm" className="text-text-muted">
                        {plan.gameDate
                          ? new Date(plan.gameDate).toLocaleDateString()
                          : "Date TBD"}
                      </Typography>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportPDF(plan);
                        }}
                        className="p-1 text-text-muted hover:text-text-info transition-colors"
                        title="Export PDF"
                      >
                        <Icon name="download" className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicatePlan(plan);
                        }}
                        className="p-1 text-text-muted hover:text-text-secondary transition-colors"
                        title="Duplicate plan"
                      >
                        <Icon name="copy" className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPlan(plan);
                        }}
                        className="p-1 text-text-muted hover:text-text-secondary transition-colors"
                        title="Edit plan"
                      >
                        <Icon name="edit" className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlan(plan.id);
                        }}
                        className="p-1 text-text-muted hover:text-text-error transition-colors"
                        title="Delete plan"
                      >
                        <Icon name="delete" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-text-secondary">
                    <span>{getTotalPlays(plan)} plays</span>
                    <span>{plan.updatedAt.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Game Plan Modal */}
        {showModal && (
          <GamePlanModal
            onClose={() => {
              setShowModal(false);
              setEditingPlan(undefined);
            }}
            onSave={handleSavePlan}
            initialGamePlan={editingPlan}
          />
        )}
      </PageLayout>
    </Aurora>
  );
}
