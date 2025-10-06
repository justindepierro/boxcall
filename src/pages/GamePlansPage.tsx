import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button/Button";
import { Icon } from "../components/ui/Icon";
import { Typography } from "../components/design-system/Typography";
import { PageLayout } from "../components/layout/PageLayout";
import { AuroraTile } from "../components/ui/AuroraTile";
import { Aurora } from "../components/ui/Aurora";

interface GamePlan {
  id: string;
  name: string;
  opponent: string;
  date: string;
  plays: string[];
  createdAt: Date;
  updatedAt: Date;
}

export default function GamePlansPage() {
  const navigate = useNavigate();
  const [gamePlans, setGamePlans] = useState<GamePlan[]>([]);

  const handleCreatePlan = useCallback(() => {
    // TODO: Open create game plan modal or navigate to editor
    console.log("Create new game plan");
  }, []);

  const handleEditPlan = (plan: GamePlan) => {
    // TODO: Navigate to plan editor
    console.log("Edit plan:", plan);
  };

  const handleDeletePlan = (planId: string) => {
    setGamePlans((prev) => prev.filter((p) => p.id !== planId));
    // TODO: Delete from database
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
        icon: "target",
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
        icon: "play",
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
        icon: "mail",
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
          <div className="rounded-xl border border-slate-200/40 bg-aurora-shell p-5 shadow-md shadow-slate-200/40 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/80 dark:shadow-slate-900/40 sm:p-6 xl:p-7">
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
                        {new Date(plan.date).toLocaleDateString()}
                      </Typography>
                    </div>
                    <div className="flex space-x-2">
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
                    <span>{plan.plays.length} plays</span>
                    <span>{plan.updatedAt.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </PageLayout>
    </Aurora>
  );
}
