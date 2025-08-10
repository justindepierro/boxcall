import React from "react";
import { Typography } from "../../../design-system";
import { Button } from "../../../../components/ui";
import { Icon } from "../../../../components/ui/Icon/Icon";

interface ActionFooterProps {
  isOvertime: boolean;
  totalDuration: number;
  scheduledDuration: number;
  onClose: () => void;
  onSaveWithOvertime: () => void;
  showOvertimeWarning: boolean;
  onShowOvertimeWarning: (show: boolean) => void;
}

export const ActionFooter: React.FC<ActionFooterProps> = ({
  isOvertime,
  totalDuration,
  scheduledDuration,
  onClose,
  onSaveWithOvertime,
  showOvertimeWarning,
  onShowOvertimeWarning,
}) => {
  const handleSaveClick = () => {
    if (isOvertime) {
      onShowOvertimeWarning(true);
    } else {
      onSaveWithOvertime();
    }
  };

  return (
    <div className="flex justify-between pt-4 border-t border-gray-200">
      <div>
        {isOvertime && (
          <Typography variant="body-sm" className="text-red-600">
            <Icon name="warning" size="xs" className="mr-1" />
            Warning: Practice is {totalDuration - scheduledDuration} minutes
            over scheduled time
          </Typography>
        )}
      </div>
      <div className="flex space-x-3">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSaveClick}>
          Save Practice Plan
        </Button>
      </div>

      {/* Overtime Warning Modal */}
      {showOvertimeWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="surface-card elevation-modal rounded-lg bc-card-padding max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <Icon name="warning" size="lg" className="text-red-500 mr-3" />
              <Typography variant="headline-md" className="text-red-800">
                Practice Overtime Warning
              </Typography>
            </div>
            <Typography variant="body-md" className="mb-4">
              Your practice plan is {totalDuration - scheduledDuration} minutes
              longer than the scheduled time. This may cause conflicts with
              other activities or facilities.
            </Typography>
            <div className="flex space-x-3">
              <Button
                variant="primary"
                onClick={() => {
                  onShowOvertimeWarning(false);
                  onSaveWithOvertime();
                }}
              >
                Save Anyway
              </Button>
              <Button
                variant="outline"
                onClick={() => onShowOvertimeWarning(false)}
              >
                Go Back and Edit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
