import React from "react";

import { Button } from "../../../../components/ui";

interface ActionFooterProps {
  onClose: () => void;
  onSave: () => void;
}

export const ActionFooter: React.FC<ActionFooterProps> = ({
  onClose,
  onSave,
}) => {
  return (
    <div className="flex justify-between pt-4 border-t border-muted">
      <div>{/* Simplified footer without overtime warnings */}</div>
      <div className="flex space-x-3">
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" onClick={onSave}>
          Save Practice Plan
        </Button>
      </div>
    </div>
  );
};
