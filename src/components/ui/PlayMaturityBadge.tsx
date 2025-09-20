import React from "react";
import { Badge, type BadgeVariant } from "../ui/Badge";
import { Icon, type IconName } from "../ui/Icon";
import { useDataFlowTracking } from "../../hooks/useDataFlowTracking";

export type PlayMaturityBadgeProps = {
  playId: string;
  size?: "sm" | "md";
  showScore?: boolean;
  className?: string;
};

export const PlayMaturityBadge: React.FC<PlayMaturityBadgeProps> = ({
  playId,
  size = "sm",
  showScore = false,
  className = "",
}) => {
  const { getPlayMaturity, getMaturityLevelLabel } = useDataFlowTracking();

  const maturity = getPlayMaturity(playId);

  if (!maturity) {
    return (
      <Badge variant="neutral" size={size} className={className}>
        <Icon name="circle" className="h-3 w-3 mr-1" />
        New
      </Badge>
    );
  }

  const getVariantForLevel = (level: typeof maturity.level): BadgeVariant => {
    switch (level) {
      case "new":
        return "neutral";
      case "practice_tested":
        return "info";
      case "game_ready":
        return "success";
      case "proven":
        return "premium";
      default:
        return "neutral";
    }
  };

  const getIconForLevel = (level: typeof maturity.level): IconName => {
    switch (level) {
      case "new":
        return "circle";
      case "practice_tested":
        return "clipboard-list";
      case "game_ready":
        return "target";
      case "proven":
        return "award";
      default:
        return "circle";
    }
  };

  const label = getMaturityLevelLabel(maturity.level);
  const displayLabel = showScore ? `${label} (${maturity.score}%)` : label;

  return (
    <Badge
      variant={getVariantForLevel(maturity.level)}
      size={size}
      className={className}
    >
      <Icon name={getIconForLevel(maturity.level)} className="h-3 w-3 mr-1" />
      {displayLabel}
    </Badge>
  );
};
