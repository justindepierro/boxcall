/**
 * AuroraDashboard Component
 *
 * Dashboard section with Aurora tiles for quick actions
 */

import React, { useMemo } from "react";
import { Typography } from "../../components/design-system/Typography";
import { AuroraTile } from "../../components/ui/AuroraTile";
import type { IconName } from "../../components/ui/Icon";
import type { PracticeScript } from "../../services/practiceService";

interface AuroraDashboardProps {
  activeScripts: PracticeScript[];
  archivedScripts: PracticeScript[];
  onCreateScript: () => void;
  onScrollToList: () => void;
  onShowTemplates: () => void;
}

export const AuroraDashboard: React.FC<AuroraDashboardProps> = ({
  activeScripts,
  archivedScripts,
  onCreateScript,
  onScrollToList,
  onShowTemplates,
}) => {
  const tileConfigs = useMemo(
    () => [
      {
        key: "plan",
        title: "Build Script",
        description: "Craft install-ready periods with reps and notes.",
        icon: "target" as IconName,
        accentOverlayClass: "bg-aurora-emerald",
        glowClassName: "glow-aurora-emerald",
        statusBadge: "Creator",
        iconClassName: "text-emerald-600",
        footnote: "Start new",
        onOpen: onCreateScript,
        body: (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-secondary">
              <span>Total scripts</span>
              <span className="font-semibold text-primary">
                {activeScripts.length}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-secondary">
              <span>Latest build</span>
              <span className="font-semibold text-primary">
                {activeScripts[0]?.updatedAt
                  ? new Date(activeScripts[0].updatedAt).toLocaleDateString()
                  : "—"}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "templates",
        title: "Template Library",
        description: "Reuse favorite period groups for faster installs.",
        icon: "grid" as IconName,
        accentOverlayClass: "bg-aurora-indigo",
        glowClassName: "glow-aurora-indigo",
        statusBadge: "Library",
        iconClassName: "text-sky-600",
        footnote: "Coming soon",
        onOpen: onShowTemplates,
        body: (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-secondary">
              <span>Quick add</span>
              <span className="font-semibold text-primary">Soon</span>
            </div>
            <div className="flex items-center justify-between text-xs text-secondary">
              <span>Most used</span>
              <span className="font-semibold text-primary">—</span>
            </div>
          </div>
        ),
      },
      {
        key: "share",
        title: "View Scripts",
        description: "See all your practice scripts and templates.",
        icon: "mail" as IconName,
        accentOverlayClass: "bg-aurora-violet",
        glowClassName: "glow-aurora-violet",
        statusBadge: "Browse",
        iconClassName: "text-purple-600",
        footnote: "View list",
        onOpen: onScrollToList,
        body: (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-secondary">
              <span>Active scripts</span>
              <span className="font-semibold text-primary">
                {activeScripts.length}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-secondary">
              <span>Archived</span>
              <span className="font-semibold text-primary">
                {archivedScripts.length}
              </span>
            </div>
          </div>
        ),
      },
    ],
    [activeScripts, archivedScripts, onCreateScript, onScrollToList, onShowTemplates]
  );

  return (
    <div className="mb-8">
      <div className="rounded-xl bg-primary p-5 shadow-lg backdrop-blur-sm sm:p-6 xl:p-7">
        <div className="mb-6">
          <Typography variant="headline-sm" className="text-primary">
            Set the tone for practice
          </Typography>
          <Typography variant="body-sm" className="text-secondary mt-1">
            Launch scripts, pull templates, or share the agenda in seconds.
          </Typography>
        </div>
        <div className="grid-dashboard gap-4 md:gap-5">
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
  );
};

AuroraDashboard.displayName = "AuroraDashboard";
