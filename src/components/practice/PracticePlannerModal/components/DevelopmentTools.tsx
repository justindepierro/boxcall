import React from "react";

import { Button } from "../../../../components/ui";
import { Icon } from "../../../../components/ui/Icon/Icon";
import { Typography } from "../../../design-system";
import { requestAppReset } from "../../../../utils/appReset";
import { removeLocalItem, storageKeys } from "../../../../utils/storage";

interface DevelopmentToolsProps {
  eventId: string;
}

export const DevelopmentTools: React.FC<DevelopmentToolsProps> = ({
  eventId,
}) => {
  const resetToSampleData = () => {
    const savedPracticeKey = storageKeys.practice.planForEvent(eventId);
    removeLocalItem(savedPracticeKey);
    requestAppReset("practice-reset-to-sample");
  };

  // Only show in development
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="mb-4 p-2 bg-subtle border border-muted rounded-lg">
      <div className="flex items-center justify-between">
        <Typography variant="body-sm" className="text-warning">
          <Icon name="settings" size="sm" className="mr-1" />
          Development Tools
        </Typography>
        <Button onClick={resetToSampleData} variant="warning" size="xs">
          Reset to Sample Data
        </Button>
      </div>
    </div>
  );
};
