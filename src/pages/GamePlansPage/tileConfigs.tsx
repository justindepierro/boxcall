/**
 * Game Plans Tile Configurations
 *
 * Aurora tile configs for the game plans dashboard
 */

import React from "react";
import type { IconName } from "../../components/ui/Icon";
import type { GamePlan as ModalGamePlan } from "../../components/playbook/GamePlanModal/types";

export interface TileConfig {
  key: string;
  title: string;
  description: string;
  icon: IconName;
  accentOverlayClass: string;
  glowClassName: string;
  statusBadge: string;
  iconClassName: string;
  footnote: string;
  onOpen: () => void;
  body: React.ReactNode;
}

/** Calculate total plays across all situations in a plan */
export const getTotalPlays = (plan: ModalGamePlan): number => {
  return plan.situations.reduce(
    (sum: number, situation: ModalGamePlan["situations"][number]) =>
      sum + situation.plays.length,
    0
  );
};

interface TileConfigParams {
  activePlans: ModalGamePlan[];
  archivedPlans: ModalGamePlan[];
  onCreatePlan: () => void;
  onNavigateToPlaybook: () => void;
  onScrollToList: () => void;
}

/**
 * Generate tile configurations for the dashboard
 */
export function createTileConfigs(params: TileConfigParams): TileConfig[] {
  const {
    activePlans,
    archivedPlans,
    onCreatePlan,
    onNavigateToPlaybook,
    onScrollToList,
  } = params;

  return [
    {
      key: "create",
      title: "Build New Plan",
      description: "Design scripted drives and install packages.",
      icon: "target" as IconName,
      accentOverlayClass: "bg-aurora-emerald",
      glowClassName: "glow-aurora-emerald",
      statusBadge: "Ready",
      iconClassName: "card-emerald-icon",
      footnote: "Start planning",
      onOpen: onCreatePlan,
      body: (
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between text-secondary">
            <span>Active plans</span>
            <span className="font-semibold text-primary">
              {activePlans.length}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-secondary">
            <span>Total plays</span>
            <span className="font-semibold text-primary">
              {activePlans.reduce((sum, p) => sum + getTotalPlays(p), 0)}
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
      onOpen: onNavigateToPlaybook,
      body: (
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between text-secondary">
            <span>Playbook link</span>
            <span className="font-semibold text-primary">Ready</span>
          </div>
          <div className="flex items-center justify-between text-xs text-secondary">
            <span>Opponent focus</span>
            <span className="font-semibold text-primary">Set later</span>
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
      statusBadge: "Collaborate",
      iconClassName: "card-purple-icon",
      footnote: "Jump to list",
      onOpen: onScrollToList,
      body: (
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between text-secondary">
            <span>Active plans</span>
            <span className="font-semibold text-primary">
              {activePlans.length}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-secondary">
            <span>Archived</span>
            <span className="font-semibold text-primary">
              {archivedPlans.length}
            </span>
          </div>
        </div>
      ),
    },
  ];
}
