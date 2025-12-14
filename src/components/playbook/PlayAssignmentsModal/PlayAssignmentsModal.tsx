/**
 * Play Assignments Modal
 *
 * Allows coaches to create and edit position-specific assignments for plays.
 * Players can view assignments with their position highlighted.
 *
 * Features:
 * - 11 dynamic position slots (based on personnel grouping)
 * - Text editing for each assignment
 * - Shared play notes section
 * - Role-based editing (coaches edit, players view)
 */

import { Modal } from "../../ui/Modal";
import { useIsMobile } from "@hooks/useBreakpoint";
import { usePlayAssignmentsHandlers } from "./usePlayAssignmentsHandlers";
import {
  AssignmentsHeader,
  PlayerPreviewSelector,
  PersonnelSelector,
  PositionsGrid,
  PlayNotes,
  DiagramPlaceholder,
  AssignmentsFooter,
  LoadingState,
} from "./components";
import type { PlayAssignmentsModalProps } from "./types";

export function PlayAssignmentsModal({
  play,
  isOpen,
  onClose,
  userRole = "coach",
  currentPlayerPosition,
  personnelConfigurations = [],
}: PlayAssignmentsModalProps) {
  const isMobile = useIsMobile();

  const {
    // State
    assignments,
    playNotes,
    loading,
    saving,
    hasChanges,
    justSaved,
    selectedPersonnelId,
    selectedPersonnel,
    customPositions,
    isEditingPositions,
    editingLabel,
    viewMode,
    previewPosition,
    positions,
    isCoach,
    canEdit,

    // Setters
    setCustomPositions,
    setEditingLabel,
    setPreviewPosition,

    // Handlers
    handlePositionDragEnd,
    handleRenamePosition,
    resetToDefaults,
    updateAssignment,
    updatePlayNotes,
    handleSave,
    toggleViewMode,
    toggleEditingPositions,
    selectPersonnel,
  } = usePlayAssignmentsHandlers({
    play,
    isOpen,
    userRole,
    personnelConfigurations,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${play.play_name} - Assignments`}
      size={isMobile ? "fullscreen" : "xl"}
      className={justSaved ? "save-success-flash" : ""}
    >
      <div className="flex flex-col gap-4">
        {/* Header */}
        <AssignmentsHeader
          play={play}
          isCoach={isCoach}
          viewMode={viewMode}
          hasChanges={hasChanges}
          canEdit={canEdit}
          onToggleViewMode={toggleViewMode}
        />

        {/* Player Preview Position Selector (Coach Only) */}
        {isCoach && viewMode === "player" && (
          <PlayerPreviewSelector
            positions={positions}
            previewPosition={previewPosition}
            onSelectPosition={setPreviewPosition}
          />
        )}

        {/* Personnel Selector */}
        <PersonnelSelector
          personnelConfigurations={personnelConfigurations}
          selectedPersonnelId={selectedPersonnelId}
          selectedPersonnel={selectedPersonnel}
          playPersonnel={play.personnel}
          canEdit={canEdit}
          onSelectPersonnel={selectPersonnel}
        />

        {loading ? (
          <LoadingState />
        ) : (
          <>
            {/* Diagram Placeholder */}
            <DiagramPlaceholder />

            {/* Position Assignments Grid */}
            <PositionsGrid
              positions={positions}
              assignments={assignments}
              customPositions={customPositions}
              isEditingPositions={isEditingPositions}
              editingLabel={editingLabel}
              canEdit={canEdit}
              viewMode={viewMode}
              isCoach={isCoach}
              currentPlayerPosition={currentPlayerPosition}
              previewPosition={previewPosition}
              onDragEnd={handlePositionDragEnd}
              onToggleEditingPositions={toggleEditingPositions}
              onResetToDefaults={resetToDefaults}
              onUpdateAssignment={updateAssignment}
              onRenamePosition={handleRenamePosition}
              onSetEditingLabel={setEditingLabel}
              onSetCustomPositions={setCustomPositions}
            />

            {/* Play Notes */}
            <PlayNotes
              playNotes={playNotes}
              canEdit={canEdit}
              onUpdateNotes={updatePlayNotes}
            />
          </>
        )}

        {/* Footer */}
        <AssignmentsFooter
          canEdit={canEdit}
          hasChanges={hasChanges}
          saving={saving}
          onClose={onClose}
          onSave={handleSave}
        />
      </div>
    </Modal>
  );
}
