/**
 * PositionsGrid Component
 *
 * Drag-drop grid of position assignments
 */

import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import { Typography } from "../../../design-system/Typography";
import { Button } from "../../ui/Button";
import { Icon } from "../../ui/Icon";
import { useIsMobile } from "@hooks/useBreakpoint";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";
import { PositionCard } from "./PositionCard";
import type { AssignmentData } from "./types";

interface PositionsGridProps {
  positions: string[];
  assignments: Map<string, AssignmentData>;
  customPositions: string[];
  isEditingPositions: boolean;
  editingLabel: string | null;
  canEdit: boolean;
  viewMode: "coach" | "player";
  isCoach: boolean;
  currentPlayerPosition?: string;
  previewPosition: string | null;
  onDragEnd: (result: DropResult) => void;
  onToggleEditingPositions: () => void;
  onResetToDefaults: () => void;
  onUpdateAssignment: (position: string, text: string) => void;
  onRenamePosition: (oldLabel: string, newLabel: string) => void;
  onSetEditingLabel: (label: string | null) => void;
  onSetCustomPositions: (positions: string[]) => void;
}

export function PositionsGrid({
  positions,
  assignments,
  customPositions,
  isEditingPositions,
  editingLabel,
  canEdit,
  viewMode,
  isCoach,
  currentPlayerPosition,
  previewPosition,
  onDragEnd,
  onToggleEditingPositions,
  onResetToDefaults,
  onUpdateAssignment,
  onRenamePosition,
  onSetEditingLabel,
  onSetCustomPositions,
}: PositionsGridProps) {
  const isMobile = useIsMobile();

  // Check if position is current player's (or previewed position for coaches)
  const isCurrentPlayerPosition = (position: string): boolean => {
    if (viewMode === "player" && isCoach && previewPosition) {
      return position === previewPosition;
    }
    return !!currentPlayerPosition && position === currentPlayerPosition;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Typography variant="label-md">Position Assignments</Typography>
        {canEdit && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size={isMobile ? "sm" : "xs"}
              onClick={() => {
                if (isMobile) triggerHapticFeedback("light");
                onToggleEditingPositions();
              }}
              title={
                isEditingPositions
                  ? "Done editing"
                  : "Reorder & relabel positions"
              }
            >
              <Icon
                name={isEditingPositions ? "check" : "edit"}
                className={`${isMobile ? "h-4 w-4" : "h-3 w-3"} mr-1`}
              />
              {isEditingPositions ? "Done" : "Edit"}
            </Button>
            {customPositions.length > 0 && (
              <Button
                variant="ghost"
                size={isMobile ? "sm" : "xs"}
                onClick={() => {
                  if (isMobile) triggerHapticFeedback("light");
                  onResetToDefaults();
                }}
                title="Reset to default positions"
              >
                <Icon name="refresh-cw" className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
          </div>
        )}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable
          droppableId="positions"
          isDropDisabled={!isEditingPositions || !canEdit}
        >
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {positions.map((position, index) => {
                const assignment = assignments.get(position);
                const isCurrentPlayer = isCurrentPlayerPosition(position);
                const isEditing = editingLabel === position;

                return (
                  <PositionCard
                    key={position}
                    position={position}
                    index={index}
                    assignment={assignment}
                    isCurrentPlayer={isCurrentPlayer}
                    isEditing={isEditing}
                    isEditingPositions={isEditingPositions}
                    canEdit={canEdit}
                    positions={positions}
                    onUpdateAssignment={onUpdateAssignment}
                    onRenamePosition={onRenamePosition}
                    onSetEditingLabel={onSetEditingLabel}
                    onSetCustomPositions={onSetCustomPositions}
                  />
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
