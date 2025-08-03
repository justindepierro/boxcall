/**
 * PracticePlannerModal - Refactored Version
 * 
 * Main orchestrating component using extracted components and centralized state management.
 * This is the new, modular version that replaces the 2732-line monolithic component.
 */

import React from "react";
import { ScriptSelectorModal } from "./ScriptSelectorModal";
import { usePracticeState } from "./hooks/usePracticeState";
import { 
  PracticeHeader, 
  TimeSummary, 
  TimelineAllocation, 
  PracticeBlocksList,
  AddBlockModal,
  AddGroupModal,
  EditGroupModal 
} from "./components";
import type { PracticePlannerModalProps } from "./types";

export const PracticePlannerModalNew: React.FC<PracticePlannerModalProps> = ({
  event,
  onClose,
}) => {
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
            onTimeAllocationModeToggle={() => setTimeAllocationMode(!timeAllocationMode)}
            onScaffoldModeToggle={() => setScaffoldMode(!scaffoldMode)}
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
                  console.log('Clear all timeline allocation');
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
        blockId={editingGroup?.blockId || ''}
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
          isOpen={showScriptSelector}
          onClose={() => {
            setShowScriptSelector(false);
            setSelectedBlockForScript(null);
            setSelectedGroupForScript(null);
          }}
          onSelectScript={(scriptId: string, scriptTitle: string) => {
            if (selectedGroupForScript) {
              handleAddScriptToGroup(
                selectedGroupForScript.blockId, 
                selectedGroupForScript.groupId, 
                scriptId, 
                scriptTitle
              );
            } else if (selectedBlockForScript) {
              // Handle block script assignment
              console.log('Assign script to block:', selectedBlockForScript, scriptId);
            }
            setShowScriptSelector(false);
            setSelectedBlockForScript(null);
            setSelectedGroupForScript(null);
          }}
        />
      )}
    </div>
  );
};
