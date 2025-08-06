import React from 'react';
import { Typography } from '../../../../components/design-system';
import { Icon } from '../../../../components/ui/Icon/Icon';

interface DevelopmentToolsProps {
  eventId: string;
}

export const DevelopmentTools: React.FC<DevelopmentToolsProps> = ({ eventId }) => {
  const resetToSampleData = () => {
    const savedPracticeKey = `practice_plan_${eventId || "default"}`;
    localStorage.removeItem(savedPracticeKey);
    window.location.reload(); // Reload to show sample data
  };

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
      <div className="flex items-center justify-between">
        <Typography variant="body-sm" className="text-yellow-800">
          <Icon name="wrench" size="sm" className="mr-1" />
          Development Tools
        </Typography>
        <button
          onClick={resetToSampleData}
          className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs hover:bg-yellow-300 transition-colors"
        >
          Reset to Sample Data
        </button>
      </div>
    </div>
  );
};
