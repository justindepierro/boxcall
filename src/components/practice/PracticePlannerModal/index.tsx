import React from "react";

import { ActionFooter } from "./components/ActionFooter";
import { DevelopmentTools } from "./components/DevelopmentTools";
import { AddBlockModal } from "./components/Forms/AddBlockModal";
import { PracticeBlockList } from "./components/PracticeBlockList";
import { PracticePlannerHeader } from "./components/PracticePlannerHeader";
import { PracticeTimeline } from "./components/PracticeTimeline";
import { ScriptSelectorModal } from "./components/ScriptSelector/ScriptSelectorModal";
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

  const eventData = {
    title: event.title,
    date: new Date(event.start).toISOString(),
  };

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
    return "bg-blue-100 text-blue-800";
  };

  const getCategoryIcon = (_category: string) => {
    // TODO: Move to utility function
    return "target";
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        // Only close if clicking the backdrop, not the modal content
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="surface-card elevation-modal rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bc-card-padding">
          <PracticePlannerHeader
            event={event}
            userRole={practiceState.userRole}
            timeAllocationMode={practiceState.timeAllocationMode}
            scaffoldMode={practiceState.scaffoldMode}
            practiceBlocks={practiceState.practiceBlocks}
            totalDuration={practiceState.totalDuration}
            onClose={onClose}
            onTimeAllocationModeToggle={() =>
              practiceState.setTimeAllocationMode(
                !practiceState.timeAllocationMode
              )
            }
            onScaffoldModeToggle={() =>
              practiceState.setScaffoldMode(!practiceState.scaffoldMode)
            }
            onPracticeBlocksChange={practiceState.setPracticeBlocks}
            onOriginalBlocksChange={
              practiceState.setOriginalBlocksBeforeScaffold
            }
            onTimelineAllocationChange={practiceState.setTimelineAllocation}
            onSelectedCategoryChange={practiceState.setSelectedCategory}
            onSelectedBlockChange={practiceState.setSelectedBlock}
            eventData={eventData}
          />

          {/* Content based on mode */}
          {practiceState.scaffoldMode ? (
            <PracticeTimeline
              timelineAllocation={practiceState.timelineAllocation}
              selectedCategory={practiceState.selectedCategory}
              selectedBlock={practiceState.selectedBlock}
              sliderValue={practiceState.sliderValue}
              scheduledDuration={practiceState.scheduledDuration}
              onCategorySelect={practiceState.setSelectedCategory}
              onTimelineClick={() => {
                /* TODO */
              }}
              onMouseDown={() => {
                /* TODO */
              }}
              onMouseEnter={() => {
                /* TODO */
              }}
              onMouseUp={() => {
                /* TODO */
              }}
              onSliderChange={practiceState.setSliderValue}
              onSaveBlock={() => {
                /* TODO */
              }}
              onCancelBlock={() => practiceState.setSelectedBlock(null)}
              onSaveTimeAllocation={() => {
                /* TODO */
              }}
              onCancelScaffold={() => {
                practiceState.setScaffoldMode(false);
                practiceState.setTimelineAllocation({});
                practiceState.setSelectedCategory(null);
                practiceState.setSelectedBlock(null);
              }}
              getCategoryColor={getCategoryColor}
            />
          ) : (
            <>
              {/* Practice Blocks List */}
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

              {/* Add Block Modal */}
              {practiceState.showAddBlock && (
                <AddBlockModal
                  newBlock={practiceState.newBlock}
                  userRole={practiceState.userRole}
                  onBlockChange={practiceState.setNewBlock}
                  onAddBlock={() => {
                    /* TODO: Implement */
                  }}
                  onCancel={() => practiceState.setShowAddBlock(false)}
                  onRoleSwitch={() =>
                    practiceState.setUserRole(
                      practiceState.userRole === "head_coach"
                        ? "position_coach"
                        : "head_coach"
                    )
                  }
                />
              )}
            </>
          )}

          {/* Development Tools */}
          <DevelopmentTools eventId={event.id || "default"} />

          {/* Action Footer */}
          <ActionFooter
            isOvertime={
              practiceState.totalDuration > practiceState.scheduledDuration
            }
            totalDuration={practiceState.totalDuration}
            scheduledDuration={practiceState.scheduledDuration}
            onClose={onClose}
            onSaveWithOvertime={() => {
              /* TODO: Implement save */
            }}
            showOvertimeWarning={practiceState.showOvertimeWarning}
            onShowOvertimeWarning={practiceState.setShowOvertimeWarning}
          />
        </div>

        {/* Script Selector Modal */}
        <ScriptSelectorModal
          isOpen={practiceState.showScriptSelector}
          selectedBlockId={practiceState.selectedBlockForScript}
          selectedGroupId={
            practiceState.selectedGroupForScript?.groupId || null
          }
          onClose={() => practiceState.setShowScriptSelector(false)}
          onScriptSelect={() => {
            /* TODO: Implement */
          }}
        />
      </div>
    </div>
  );
};
