import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import React from "react";
import { Card } from "../components/ui/Card";
import { Typography } from "../components/design-system";
import { AuroraTile } from "../components/ui/AuroraTile";

const TemplatesPage: React.FC = React.memo(function TemplatesPage() {
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
            <div className="flex items-center justify-between text-secondary">
              <span>Highlights</span>
              <span className="font-semibold text-primary">Install, OTA</span>
            </div>
            <div className="flex items-center justify-between text-xs text-secondary">
              <span>Status</span>
              <span className="font-semibold text-primary">Launching</span>
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
            <div className="flex items-center justify-between text-secondary">
              <span>Assets</span>
              <span className="font-semibold text-primary">Scripts, PDF</span>
            </div>
            <div className="flex items-center justify-between text-xs text-secondary">
              <span>Availability</span>
              <span className="font-semibold text-primary">Q4</span>
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
            <div className="flex items-center justify-between text-secondary">
              <span>Focus</span>
              <span className="font-semibold text-primary">Staff ops</span>
            </div>
            <div className="flex items-center justify-between text-xs text-secondary">
              <span>ETA</span>
              <span className="font-semibold text-primary">2026</span>
            </div>
          </div>
        ),
      },
    ],
    [navigate, scrollToOverview]
  );

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-6">
          <Typography variant="headline-lg" className="text-primary mb-1">
            Templates
          </Typography>
          <Typography variant="body" className="text-secondary">
            Reusable practice, planning, and communication templates.
          </Typography>
        </header>
        <div className="mb-8">
          <div className="rounded-xl bg-primary p-5 shadow-lg backdrop-blur-sm sm:p-6 xl:p-7">
            <div className="mb-6">
              <Typography variant="headline-sm" className="text-primary">
                Launch a template workspace
              </Typography>
              <Typography variant="body-sm" className="text-secondary mt-1">
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
      </div>
    </div>
  );
});

TemplatesPage.displayName = "TemplatesPage";

export default TemplatesPage;
