import React from "react";
import { Typography } from "../../../components/design-system/Typography";
import { AuroraTile } from "../../../components/ui/AuroraTile";
import type { PracticeBlock } from "../../../types/practice";

interface PracticeHeroProps {
  currentBlocks: PracticeBlock[];
  totalDurationMinutes: number;
  practiceStarted: boolean;
  practiceElapsed: string | null;
  practiceFinishEta: string | null;
  scheduleDateLabel: string;
  scheduleLocationLabel: string;
  scrollToSection: (sectionId: string) => void;
}

export function PracticeHero({
  currentBlocks,
  totalDurationMinutes,
  practiceStarted,
  practiceElapsed,
  practiceFinishEta,
  scheduleDateLabel,
  scheduleLocationLabel,
  scrollToSection,
}: PracticeHeroProps) {
  const heroTiles = [
    {
      key: "board",
      title: "Practice Board",
      description: "Manage blocks, scripts, and timing in one place.",
      icon: "clipboard-list" as const,
      accentOverlayClass: "bg-aurora-emerald",
      glowClassName: "glow-aurora-emerald",
      statusBadge: practiceStarted ? "Live" : "Plan",
      iconClassName: "text-emerald-600",
      footnote: practiceStarted ? "Timer running" : "Open board",
      onOpen: () => scrollToSection("practice-schedule-blocks"),
      body: (
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between text-text-secondary">
            <span>Total blocks</span>
            <span className="font-semibold text-text-primary">
              {currentBlocks.length}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Duration planned</span>
            <span className="font-semibold text-text-primary">
              {totalDurationMinutes} min
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "timer",
      title: "Live Timer",
      description: "Keep the tempo right for every period.",
      icon: "clock" as const,
      accentOverlayClass: "bg-aurora-indigo",
      glowClassName: "glow-aurora-indigo",
      statusBadge: practiceStarted ? "On Field" : "Ready",
      iconClassName: "text-sky-600",
      footnote: practiceStarted ? "Running" : "View controls",
      onOpen: () => scrollToSection("practice-controls"),
      body: (
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between text-text-secondary">
            <span>Elapsed</span>
            <span className="font-semibold text-text-primary">
              {practiceElapsed || "00:00"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Time to finish</span>
            <span className="font-semibold text-text-primary">
              {practiceFinishEta || "--:--"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "schedule",
      title: "Schedule Card",
      description: "Review date, location, and staff assignments.",
      icon: "calendar" as const,
      accentOverlayClass: "bg-aurora-violet",
      glowClassName: "glow-aurora-violet",
      statusBadge: "Logistics",
      iconClassName: "text-purple-600",
      footnote: "View schedule",
      onOpen: () => scrollToSection("practice-schedule-summary"),
      body: (
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between text-text-secondary">
            <span>Next session</span>
            <span className="font-semibold text-text-primary">
              {scheduleDateLabel}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Location</span>
            <span className="font-semibold text-text-primary">
              {scheduleLocationLabel}
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="mb-8">
      <div className="rounded-3xl border border-slate-200/40 bg-aurora-shell p-5 shadow-md shadow-slate-200/40 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/80 dark:shadow-slate-900/40 sm:p-6 xl:p-7">
        <div className="mb-6">
          <Typography variant="headline-sm" className="text-text-primary">
            Command your practice flow
          </Typography>
          <Typography variant="body-sm" className="text-text-secondary mt-1">
            Jump straight into blocks, timing, or logistics with a single tap.
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
  );
}
