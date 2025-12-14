/**
 * AssignmentsFooter Component
 *
 * Footer with save/close buttons
 */

import { Typography } from "../../../design-system/Typography";
import { Button } from "../../ui/Button";
import { Icon } from "../../ui/Icon";
import { useIsMobile } from "@hooks/useBreakpoint";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";
import type { AssignmentsFooterProps } from "./types";

export function AssignmentsFooter({
  canEdit,
  hasChanges,
  saving,
  onClose,
  onSave,
}: AssignmentsFooterProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center justify-between pt-3 border-t border-primary">
      <div>
        {!canEdit && (
          <Typography variant="caption" className="text-tertiary">
            <Icon name="lock" size="sm" className="inline mr-1" />
            View-only mode
          </Typography>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size={isMobile ? "md" : "sm"}
          onClick={() => {
            if (isMobile) triggerHapticFeedback("light");
            onClose();
          }}
        >
          {hasChanges ? "Cancel" : "Close"}
        </Button>
        {canEdit && (
          <Button
            variant="primary"
            size={isMobile ? "md" : "sm"}
            onClick={onSave}
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <>
                <Icon name="activity" className="animate-pulse mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Icon name="save" className="mr-2" />
                Save
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
