/**
 * PositionCard Component
 *
 * Individual position assignment card with drag-drop support
 */

import { Draggable } from "@hello-pangea/dnd";
import { Badge } from "../../ui/Badge";
import { Icon } from "../../ui/Icon";
import { Input } from "../../ui/Input";
import { TextArea } from "../../ui/TextArea";
import type { PositionCardProps } from "./types";

export function PositionCard({
  position,
  index,
  assignment,
  isCurrentPlayer,
  isEditing,
  isEditingPositions,
  canEdit,
  positions,
  onUpdateAssignment,
  onRenamePosition,
  onSetEditingLabel,
  onSetCustomPositions,
}: PositionCardProps) {
  return (
    <Draggable
      key={position}
      draggableId={position}
      index={index}
      isDragDisabled={!isEditingPositions || !canEdit}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`
            p-3 rounded-lg border-2 transition-all
            ${
              isCurrentPlayer
                ? "border-accent-500 bg-accent-50 ring-2 ring-accent-200"
                : "border-primary bg-secondary"
            }
            ${snapshot.isDragging ? "shadow-lg ring-2 ring-accent-400" : ""}
          `}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 flex-1">
              {isEditingPositions && canEdit && (
                <div {...provided.dragHandleProps}>
                  <Icon
                    name="grip-vertical"
                    className="h-4 w-4 text-tertiary cursor-grab active:cursor-grabbing"
                  />
                </div>
              )}
              {isEditing ? (
                <Input
                  value={position}
                  onChange={(e) => {
                    const newPositions = [...positions];
                    newPositions[index] = e.target.value;
                    onSetCustomPositions(newPositions);
                  }}
                  onBlur={(e) => onRenamePosition(position, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onRenamePosition(position, e.currentTarget.value);
                    } else if (e.key === "Escape") {
                      onSetEditingLabel(null);
                    }
                  }}
                  autoFocus
                  className="h-6 text-sm px-2 py-0 w-24"
                />
              ) : (
                <Badge
                  variant={isCurrentPlayer ? "accent" : "neutral"}
                  size="sm"
                  onClick={() => {
                    if (isEditingPositions && canEdit) {
                      onSetEditingLabel(position);
                    }
                  }}
                  className={
                    isEditingPositions && canEdit
                      ? "cursor-pointer hover:bg-accent-100"
                      : ""
                  }
                >
                  {position}
                </Badge>
              )}
            </div>
            {isCurrentPlayer && (
              <Badge variant="success" size="sm">
                You
              </Badge>
            )}
          </div>
          <TextArea
            value={assignment?.assignment_text || ""}
            onChange={(e) => onUpdateAssignment(position, e.target.value)}
            placeholder={
              canEdit ? `Assignment for ${position}...` : "No assignment yet"
            }
            disabled={!canEdit}
            rows={2}
            className="w-full text-sm"
          />
        </div>
      )}
    </Draggable>
  );
}
