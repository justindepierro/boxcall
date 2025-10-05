import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { PageLayout } from "../components/layout/PageLayout";
import { Card } from "../components/ui/Card";
import { Typography } from "../components/design-system";
import { AuroraTile } from "../components/ui/AuroraTile";
import { Aurora } from "../components/ui/Aurora";

const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();

  const scrollToOverview = useCallback(() => {
    const section = document.getElementById("templates-overview");
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const heroTiles = useMemo(
    () => [
      {
        key: "practice",
        title: "Practice Scripts",
        description: "Plug-and-play period plans ready for install days.",
        icon: "target" as const,
        accentOverlayClass: "bg-aurora-emerald",
        glowClassName: "glow-aurora-emerald",
        statusBadge: "On Field",
        iconClassName: "text-emerald-600",
        footnote: "View scripts",
        onOpen: () => navigate("/practice-plans"),
        body: (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-text-secondary">
              <span>Highlights</span>
              <span className="font-semibold text-text-primary">
                Install, OTA
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>Status</span>
              <span className="font-semibold text-text-primary">Launching</span>
            </div>
          </div>
        ),
      },
      {
        key: "game",
        title: "Game Plan Kits",
        description: "Opponent scouting, call sheets, and film packets.",
        icon: "clipboard-list" as const,
        accentOverlayClass: "bg-aurora-indigo",
        glowClassName: "glow-aurora-indigo",
        statusBadge: "Strategy",
        iconClassName: "text-sky-600",
        footnote: "Open planner",
        onOpen: () => navigate("/game-plans"),
        body: (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-text-secondary">
              <span>Assets</span>
              <span className="font-semibold text-text-primary">
                Scripts, PDF
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>Availability</span>
              <span className="font-semibold text-text-primary">Q4</span>
            </div>
          </div>
        ),
      },
      {
        key: "communications",
        title: "Comms & Ops",
        description: "Parent updates, travel sheets, and post-game recaps.",
        icon: "mail" as const,
        accentOverlayClass: "bg-aurora-violet",
        glowClassName: "glow-aurora-violet",
        statusBadge: "Coming Soon",
        iconClassName: "text-purple-600",
        footnote: "See roadmap",
        onOpen: scrollToOverview,
        body: (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-text-secondary">
              <span>Focus</span>
              <span className="font-semibold text-text-primary">Staff ops</span>
            </div>
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>ETA</span>
              <span className="font-semibold text-text-primary">2026</span>
            </div>
          </div>
        ),
      },
    ],
    [navigate, scrollToOverview]
  );

  return (
    <Aurora variant="shell" fullHeight>
      <PageLayout
        title="Templates"
        subtitle="Reusable practice, planning, and communication templates."
        variant="detail"
      >
        <div className="mb-8">
          <div className="rounded-[2.25rem] border border-slate-200/40 bg-aurora-shell p-5 shadow-md shadow-slate-200/40 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/80 dark:shadow-slate-900/40 sm:p-6 xl:p-7">
            <div className="mb-6">
              <Typography variant="headline-sm" className="text-text-primary">
                Launch a template workspace
              </Typography>
              <Typography
                variant="body-sm"
                className="text-text-secondary mt-1"
              >
                Choose the toolkit you need and we’ll drop you into the right
                builder.
              </Typography>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
              {heroTiles.map((tile) => (
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

        <Card className="p-6" id="templates-overview">
          <Typography variant="body-lg">
            We're building a library of ready-made templates for playbooks,
            practices, and team communication. Stay tuned for updates, and let
            us know which templates would help your staff most.
          </Typography>
        </Card>
      </PageLayout>
    </Aurora>
  );
};

export default TemplatesPage;
