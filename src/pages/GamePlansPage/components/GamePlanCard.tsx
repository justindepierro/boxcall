import React from "react";
import { Icon } from "../../../components/ui/Icon";
import { Typography } from "../../../components/design-system/Typography";
import type { GamePlan as ModalGamePlan } from "../../../components/playbook/GamePlanModal/types";
import { useIsMobile } from "../../../hooks/useBreakpoint";

interface GamePlanCardProps {
  plan: ModalGamePlan;
  onEdit: (plan: ModalGamePlan) => void;
  onDuplicate: (plan: ModalGamePlan) => void;
  onArchive: (plan: ModalGamePlan) => void;
  onDelete: (id: string) => void;
  onExportPDF: (plan: ModalGamePlan) => void;
}

const getTotalPlays = (plan: ModalGamePlan) => {
  return plan.situations.reduce(
    (sum, situation) => sum + situation.plays.length,
    0
  );
};

export const GamePlanCard: React.FC<GamePlanCardProps> = ({
  plan,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  onExportPDF,
}) => {
  const isMobile = useIsMobile();

  return (
    <div
      className="bg-primary rounded-2xl border border-border p-5 shadow-purple-md hover:shadow-purple-lg hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      onClick={() => onEdit(plan)}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1.5">
            <Typography
              variant="headline-sm"
              className="text-primary font-semibold leading-tight line-clamp-2"
            >
              {plan.name}
            </Typography>
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
              {plan.opponent && (
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-2.5 py-1 shadow-purple-sm">
                  vs {plan.opponent}
                </span>
              )}
              <span className="badge-purple inline-flex items-center rounded-full px-2.5 py-1">
                {plan.gameDate
                  ? new Date(plan.gameDate).toLocaleDateString()
                  : "Date TBD"}
              </span>
              {plan.gameLocation && (
                <span className="badge-purple inline-flex items-center rounded-full px-2.5 py-1">
                  {plan.gameLocation}
                </span>
              )}
            </div>
          </div>
          <GamePlanActions
            plan={plan}
            isMobile={isMobile}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onArchive={onArchive}
            onDelete={onDelete}
            onExportPDF={onExportPDF}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-secondary">
        <span className="inline-flex items-center gap-2 font-medium">
          <Icon name="list" className="h-4 w-4" />
          {getTotalPlays(plan)} plays
        </span>
        <span className="inline-flex items-center gap-2">
          <Icon name="clock" className="h-4 w-4" />
          {new Date(plan.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

interface GamePlanActionsProps {
  plan: ModalGamePlan;
  isMobile: boolean;
  onEdit: (plan: ModalGamePlan) => void;
  onDuplicate: (plan: ModalGamePlan) => void;
  onArchive: (plan: ModalGamePlan) => void;
  onDelete: (id: string) => void;
  onExportPDF: (plan: ModalGamePlan) => void;
}

const GamePlanActions: React.FC<GamePlanActionsProps> = ({
  plan,
  isMobile,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  onExportPDF,
}) => (
  <div className="flex flex-wrap gap-2 justify-end">
    <button
      onClick={(e) => {
        e.stopPropagation();
        onExportPDF(plan);
      }}
      className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted transition-colors hover:bg-muted hover:text-info focus:outline-none focus:ring-2 focus:ring-brand-jade focus:ring-offset-2"
      title="Export PDF"
      aria-label="Export plan as PDF"
    >
      <Icon name="download" className="h-5 w-5" />
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDuplicate(plan);
      }}
      className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted transition-colors hover:bg-muted hover:text-secondary focus:outline-none focus:ring-2 focus:ring-brand-jade focus:ring-offset-2"
      title="Duplicate plan"
      aria-label="Duplicate plan"
    >
      <Icon name="copy" className="h-5 w-5" />
    </button>
    {!isMobile && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit(plan);
        }}
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted transition-colors hover:bg-muted hover:text-secondary focus:outline-none focus:ring-2 focus:ring-brand-jade focus:ring-offset-2"
        title="Edit plan"
        aria-label="Edit plan"
      >
        <Icon name="edit" className="h-5 w-5" />
      </button>
    )}
    <button
      onClick={(e) => {
        e.stopPropagation();
        onArchive(plan);
      }}
      className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted transition-colors hover:bg-muted hover:text-warning focus:outline-none focus:ring-2 focus:ring-brand-jade focus:ring-offset-2"
      title="Archive plan"
      aria-label="Archive plan"
    >
      <Icon name="folder" className="h-5 w-5" />
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDelete(plan.id);
      }}
      className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted transition-colors hover:bg-muted hover:text-error focus:outline-none focus:ring-2 focus:ring-brand-jade focus:ring-offset-2"
      title="Delete plan"
      aria-label="Delete plan"
    >
      <Icon name="delete" className="h-5 w-5" />
    </button>
  </div>
);

GamePlanCard.displayName = "GamePlanCard";
