/**
 * PracticePlannerModal - Refactored Version
 *
 * Main orchestrating component using extracted components and centralized state management.
 * This is the new, modular version that replaces the 2732-line monolithic component.
 */
import React, { useState } from "react";
import { ScriptSelectorModal } from "./ScriptSelectorModal";
import { PDFExportTrigger } from "./LazyPDFExport";
import { usePracticeState } from "./hooks/usePracticeState";
import {
  PracticeHeader,
  TimeSummary,
  TimelineAllocation,
  PracticeBlocksList,
  AddBlockModal,
  AddGroupModal,
  EditGroupModal,
} from "./components";
import type { PracticePlannerModalProps, Script } from "./types";
export const PracticePlannerModalNew: React.FC<PracticePlannerModalProps> = ({
  event,
  onClose,
}) => {
  // PDF Export state
  const [isPDFExportOpen, setIsPDFExportOpen] = useState(false);
  // Prepare practice data for PDF export
  const preparePracticeDataForPDF = () => {
    // Convert practice blocks to PDF format
    const pdfBlocks = practiceBlocks.map((block) => ({
      id: block.id,
      title: block.title,
      category: block.category,
      duration: block.duration,
      startTime: block.startTime || "",
      endTime: block.endTime || "",
      location: block.location || "",
      notes: block.notes || "",
      assignedCoach: block.assignedCoach || "",
      scriptId: block.scriptId,
      scriptTitle: block.scriptTitle,
      groups: block.groups?.map((group) => ({
        id: group.id,
        name: group.name,
        location: group.location || "",
        notes: group.notes || "",
        scriptId: group.scriptId,
        scriptTitle: group.scriptTitle,
      })),
    }));
    // Calculate category breakdown
    const categoryBreakdown: Record<string, number> = {};
    const coachUtilization: Record<string, number> = {};
    let totalMinutes = 0;
    practiceBlocks.forEach((block) => {
      categoryBreakdown[block.category] =
        (categoryBreakdown[block.category] || 0) + block.duration;
      totalMinutes += block.duration;
      if (block.assignedCoach) {
        coachUtilization[block.assignedCoach] =
          (coachUtilization[block.assignedCoach] || 0) + block.duration;
      }
    });
    return {
      title: event.title || "Practice Plan",
      date: new Date(event.start).toLocaleDateString(),
      duration: totalDuration,
      location: "", // Could be extracted from event location
      weather: undefined,
      blocks: pdfBlocks,
      coaches: [
        // Mock coach data - could be enhanced with real data
        {
          id: "1",
          name: "Head Coach",
          role: "Head Coach",
          assignments: ["Overall direction"],
        },
        {
          id: "2",
          name: "Offensive Coordinator",
          role: "OC",
          assignments: ["Offense blocks"],
        },
        {
          id: "3",
          name: "Defensive Coordinator",
          role: "DC",
          assignments: ["Defense blocks"],
        },
        {
          id: "4",
          name: "Special Teams Coach",
          role: "STC",
          assignments: ["Special teams"],
        },
      ],
      equipment: [
        // Mock equipment data
        { item: "Cones", quantity: 20, location: "Equipment shed" },
        { item: "Footballs", quantity: 10, location: "Equipment room" },
        { item: "Blocking pads", quantity: 8, location: "Field storage" },
      ],
      summary: {
        totalMinutes,
        categoryBreakdown,
        coachUtilization,
        objectives: [
          "Team coordination improvement",
          "Skill development focus",
          "Game preparation",
        ],
      },
    };
  };
  // Use centralized state management hook
  const {
    // State
    practiceBlocks,
    userRole,
    timeAllocationMode,
    scaffoldMode,
    editingBlock: _editingBlock,
    editingGroup,
    showAddBlock,
    showScriptSelector,
    selectedBlockForScript,
    selectedGroupForScript,
    // Timeline state
    timelineAllocation,
    selectedCategory,
    selectedBlock,
    sliderValue,
    isSelecting,
    selectionStart,
    // Computed values
    scheduledDuration,
    totalDuration,
    // Event handlers
    setUserRole,
    setTimeAllocationMode,
    setScaffoldMode,
    setShowAddBlock,
    setShowScriptSelector,
    setSelectedBlockForScript,
    setSelectedGroupForScript,
    setEditingGroup,
    // Timeline handlers
    setSelectedCategory,
    setSelectedBlock,
    setSliderValue,
    handleTimelineClick,
    handleBlockClick,
    updateSelectedBlockDuration,
    removeEmptyTime,
    saveTimeAllocation,
    // Block and group handlers
    handleDragEnd,
    handleAddBlock,
    handleEditBlock,
    handleRemoveBlock,
    handleAddGroup,
    handleEditGroup,
    handleUpdateGroup,
    handleRemoveGroup,
    handleAddScriptToBlock,
    handleAddScriptToGroup,
    handleRemoveScriptFromGroup,
    handleAutoAssignCoaches,
    // Script assignment functions
    assignScriptToBlock,
    assignScriptToGroup,
    // Modal handlers
    handleCancelScaffold,
  } = usePracticeState(event);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header Component */}
          <PracticeHeader
            event={event}
            userRole={userRole}
            timeAllocationMode={timeAllocationMode}
            scaffoldMode={scaffoldMode}
            onUserRoleChange={setUserRole}
            onTimeAllocationModeToggle={() =>
              setTimeAllocationMode(!timeAllocationMode)
            }
            onScaffoldModeToggle={() => setScaffoldMode(!scaffoldMode)}
            onPDFExport={() => setIsPDFExportOpen(true)}
            onClose={onClose}
          />
          {/* Time Summary Component */}
          <TimeSummary
            scheduledDuration={scheduledDuration}
            totalDuration={totalDuration}
            practiceBlocks={practiceBlocks}
            event={event}
          />
          {/* Main Content - Timeline or Blocks */}
          <div className="mb-6">
            {scaffoldMode ? (
              /* Timeline Allocation Component (Scaffold Mode) */
              <TimelineAllocation
                scheduledDuration={scheduledDuration}
                timelineAllocation={timelineAllocation}
                selectedCategory={selectedCategory}
                selectedBlock={selectedBlock}
                sliderValue={sliderValue}
                isSelecting={isSelecting}
                selectionStart={selectionStart}
                onCategorySelect={setSelectedCategory}
                onTimelineClick={handleTimelineClick}
                onBlockClick={handleBlockClick}
                onSliderChange={setSliderValue}
                onUpdateBlockDuration={updateSelectedBlockDuration}
                onClearSelected={() => setSelectedBlock(null)}
                onClearAll={() => {
                  // This would need to be implemented in the hook
                }}
                onRemoveEmpty={removeEmptyTime}
                onCancel={handleCancelScaffold}
                onSave={saveTimeAllocation}
              />
            ) : (
              /* Practice Blocks List Component (Regular Mode) */
              <PracticeBlocksList
                practiceBlocks={practiceBlocks}
                userRole={userRole}
                scaffoldMode={scaffoldMode}
                onDragEnd={handleDragEnd}
                onEditBlock={handleEditBlock}
                onRemoveBlock={handleRemoveBlock}
                onAddGroup={handleAddGroup}
                onEditGroup={handleEditGroup}
                onRemoveGroup={handleRemoveGroup}
                onAddScriptToBlock={handleAddScriptToBlock}
                onAddScriptToGroup={handleAddScriptToGroup}
                onRemoveScriptFromGroup={handleRemoveScriptFromGroup}
                onAddBlock={() => setShowAddBlock(true)}
                onScaffoldMode={() => setScaffoldMode(true)}
                onAutoAssignCoaches={handleAutoAssignCoaches}
              />
            )}
          </div>
          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              💾 Changes auto-saved to local storage
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal Components */}
      {/* Add Block Modal */}
      <AddBlockModal
        isOpen={showAddBlock}
        onClose={() => setShowAddBlock(false)}
        onAddBlock={handleAddBlock}
        userRole={userRole}
        timeAllocationMode={timeAllocationMode}
        selectedBlock={selectedBlock}
      />
      {/* Add Group Modal */}
      <AddGroupModal
        isOpen={!!editingGroup && !editingGroup.group.id} // New group (no ID)
        blockId={editingGroup?.blockId || ""}
        onClose={() => setEditingGroup(null)}
        onAddGroup={handleAddGroup}
      />
      {/* Edit Group Modal */}
      <EditGroupModal
        isOpen={!!editingGroup && !!editingGroup.group.id} // Existing group (has ID)
        editingGroup={editingGroup}
        onClose={() => setEditingGroup(null)}
        onUpdateGroup={handleUpdateGroup}
      />
      {/* Script Selector Modal */}
      {showScriptSelector && (
        <ScriptSelectorModal
          onClose={() => {
            setShowScriptSelector(false);
            setSelectedBlockForScript(null);
            setSelectedGroupForScript(null);
          }}
          onSelectScript={(script: Script) => {
            if (selectedGroupForScript) {
              // Assign script to the selected group
              assignScriptToGroup(
                selectedGroupForScript.blockId,
                selectedGroupForScript.groupId,
                script
              );
            } else if (selectedBlockForScript) {
              // Assign script to the selected block
              assignScriptToBlock(selectedBlockForScript, script);
            }
            setShowScriptSelector(false);
            setSelectedBlockForScript(null);
            setSelectedGroupForScript(null);
          }}
          onCreateNew={() => {}}
        />
      )}
      {/* PDF Export Dialog */}
      <PracticePDFExportDialog
        isOpen={isPDFExportOpen}
        practiceData={preparePracticeDataForPDF()}
        onClose={() => setIsPDFExportOpen(false)}
      />
    </div>
  );
};
