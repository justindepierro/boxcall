/**
 * PopoverStates Component
 *
 * Loading and not found states for the popover
 */

import React from "react";
import { Typography } from "../../../design-system/Typography";

export function LoadingState() {
  return (
    <div className="p-6 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <Typography variant="body-sm" className="text-muted mt-2">
        Loading profile...
      </Typography>
    </div>
  );
}

export function NotFoundState() {
  return (
    <div className="p-6 text-center">
      <Typography variant="body-sm" className="text-muted">
        Profile not found
      </Typography>
    </div>
  );
}
