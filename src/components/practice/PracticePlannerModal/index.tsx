import React from "react";

import { ActionFooter } from "./components/ActionFooter";
import { PracticeBlockList } from "./components/PracticeBlockList";
import { PracticePlannerHeader } from "./components/PracticePlannerHeader";
import { usePracticeState } from "./hooks/usePracticeState";

import type { CalendarEvent } from "../../../domain/calendar/types";

interface PracticePlannerModalProps {
  event: CalendarEvent;
  onClose: () => void;
}

export const PracticePlannerModal: React.FC<PracticePlannerModalProps> = ({
  event,
  onClose,
}) => {
  const practiceState = usePracticeState(event);

  // Mock functions - these would be implemented in the hook
  const handleDragEnd = () => {
    // TODO: Implement drag and drop reordering
  };

  const handleEditBlock = () => {
    // TODO: Implement block editing
  };

  const handleDeleteBlock = () => {
    // TODO: Implement block deletion
  };

  const handleAddGroup = () => {
    // TODO: Implement group addition
  };

  const getCategoryColor = (_category: string) => {
    // TODO: Move to utility function
    return "bg-info/20 text-info";
  };

  const getCategoryIcon = (_category: string) => {
    // TODO: Move to utility function
    return "target";
  };

  return (
    <div
      className="fixed inset-0 bg-backdrop flex items-center justify-center p-4 z-modal"
      onClick={(e) => {
        // Only close if clicking the backdrop, not the modal content
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-primary elevation-modal rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <PracticePlannerHeader
            event={event}
            userRole={practiceState.userRole}
            onClose={onClose}
          />

          {/* Content */}
          <PracticeBlockList
            practiceBlocks={practiceState.practiceBlocks}
            totalDuration={practiceState.totalDuration}
            scheduledDuration={practiceState.scheduledDuration}
            userRole={practiceState.userRole}
            onDragEnd={handleDragEnd}
            onEditBlock={handleEditBlock}
            onDeleteBlock={handleDeleteBlock}
            onAddGroup={handleAddGroup}
            getCategoryColor={getCategoryColor}
            getCategoryIcon={getCategoryIcon}
          />

          {/* Action Footer */}
          <ActionFooter
            onClose={onClose}
            onSave={() => {
              /* TODO: Implement save */
            }}
          />
        </div>
      </div>
    </div>
  );
};
