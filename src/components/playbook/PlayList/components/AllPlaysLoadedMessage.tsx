/**
 * AllPlaysLoadedMessage Component
 * Shows when all plays have been loaded on mobile
 */

import React from "react";
import { Typography } from "../../../design-system/Typography";

interface AllPlaysLoadedMessageProps {
  totalCount: number;
}

export const AllPlaysLoadedMessage: React.FC<AllPlaysLoadedMessageProps> = ({
  totalCount,
}) => {
  return (
    <div className="text-center py-8">
      <Typography variant="body-sm" className="text-secondary">
        All {totalCount} plays loaded
      </Typography>
    </div>
  );
};
