import React from "react";
import { Icon } from "../../../components/ui/Icon";
import { Typography } from "../../../components/design-system/Typography";
import type { GamePlan as ModalGamePlan } from "../../../components/playbook/GamePlanModal/types";

interface ArchivedPlanCardProps {
  plan: ModalGamePlan;
  onRestore: (plan: ModalGamePlan) => void;
}

const getTotalPlays = (plan: ModalGamePlan) => {
  return plan.situations.reduce(
    (sum, situation) => sum + situation.plays.length,
    0
  );
};

export const ArchivedPlanCard: React.FC<ArchivedPlanCardProps> = ({
  plan,
  onRestore,
}) => {
  return (
    <div className="bg-secondary/80 rounded-2xl border border-border p-5 opacity-90">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-1.5">
          <Typography
            variant="headline-sm"
            className="text-primary font-semibold leading-tight line-clamp-2"
          >
            {plan.name}
          </Typography>
        </div>
        <button
          onClick={() => onRestore(plan)}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-muted transition-colors hover:bg-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-brand-jade focus:ring-offset-2"
          title="Restore plan"
          aria-label="Restore plan"
        >
          <Icon name="inbox" className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-4 space-y-2 text-sm text-secondary">
        <span className="inline-flex items-center gap-2">
          <Icon name="list" className="h-4 w-4" />
          {getTotalPlays(plan)} plays
        </span>
        {plan.opponent && (
          <span className="inline-flex items-center gap-2">
            <Icon name="users" className="h-4 w-4" />
            vs {plan.opponent}
          </span>
        )}
        <span className="inline-flex items-center gap-2">
          <Icon name="calendar" className="h-4 w-4" />
          {plan.gameDate
            ? new Date(plan.gameDate).toLocaleDateString()
            : "Date TBD"}
        </span>
      </div>
    </div>
  );
};

ArchivedPlanCard.displayName = "ArchivedPlanCard";
