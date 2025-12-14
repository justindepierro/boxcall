/**
 * AssignmentsHeader Component
 *
 * Header with play info and view mode toggle
 */

import { Typography } from "../../../design-system/Typography";
import { Badge } from "../../ui/Badge";
import { Icon } from "../../ui/Icon";
import { useIsMobile } from "@hooks/useBreakpoint";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";
import type { AssignmentsHeaderProps } from "./types";

export function AssignmentsHeader({
  play,
  isCoach,
  viewMode,
  hasChanges,
  canEdit,
  onToggleViewMode,
}: AssignmentsHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center justify-between">
      <div>
        <Typography variant="body-sm" className="text-secondary">
          {play.formation} • {play.personnel || "11 Personnel"}
        </Typography>
      </div>
      <div className="flex items-center gap-2">
        {isCoach ? (
          <button
            onClick={() => {
              if (isMobile) triggerHapticFeedback("light");
              onToggleViewMode();
            }}
            className={`group ${isMobile ? "min-h-[44px]" : ""}`}
            title={`Switch to ${viewMode === "coach" ? "Player" : "Coach"} View`}
          >
            <Badge
              variant={viewMode === "coach" ? "accent" : "neutral"}
              className={`cursor-pointer transition-all hover:ring-2 hover:ring-accent-400 ${isMobile ? "px-3 py-2" : ""}`}
            >
              <Icon
                name={viewMode === "coach" ? "eye" : "eye-off"}
                className={`${isMobile ? "h-4 w-4" : "h-3 w-3"} mr-1 inline-block`}
              />
              {viewMode === "coach" ? "Coach View" : "Player Preview"}
            </Badge>
          </button>
        ) : (
          <Badge variant="neutral">Player View</Badge>
        )}
        {hasChanges && canEdit && <Badge variant="warning">Unsaved</Badge>}
      </div>
    </div>
  );
}
