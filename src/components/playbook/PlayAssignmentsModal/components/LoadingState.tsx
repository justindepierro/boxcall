/**
 * LoadingState Component
 *
 * Loading state for assignments
 */

import { Typography } from "../../../design-system/Typography";
import { Icon } from "../../../ui/Icon";

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <Icon name="activity" className="animate-pulse text-accent-600" />
      <Typography className="ml-2">Loading assignments...</Typography>
    </div>
  );
}
