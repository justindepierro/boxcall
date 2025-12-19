import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { Typography } from "../../design-system/Typography";
import { Icon } from "../../ui/Icon";
import { Button } from "../../ui/Button/Button";
import { Badge } from "../../ui/Badge";
import type { PracticeScriptPlay } from "@services";

export function PracticeScriptPlayHeader({
  play,
  index,
  displayName,
  isEditingNotes,
  onToggleEditNotes,
  onRemove,
  dragHandleProps,
}: {
  play: PracticeScriptPlay["play"];
  index: number;
  displayName: string;
  isEditingNotes: boolean;
  onToggleEditNotes: () => void;
  onRemove: () => void;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
}) {
  return (
    <div className="flex items-start space-x-4">
      {/* Drag Handle */}
      <div
        {...dragHandleProps}
        className="flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing text-muted hover:text-primary"
      >
        <Icon name="move" className="h-5 w-5" />
      </div>

      {/* Play Number */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
          {index + 1}
        </div>
      </div>

      {/* Play Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <Typography
              variant="body-sm"
              className="text-primary font-medium truncate"
            >
              {displayName}
            </Typography>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="neutral" size="sm">
                {play.p_type}
              </Badge>
              {play.personnel && (
                <Badge variant="accent" size="sm">
                  {play.personnel}
                </Badge>
              )}
              <Typography variant="caption" className="text-secondary">
                {play.formation}
              </Typography>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleEditNotes}
              className="text-secondary hover:text-primary"
            >
              <Icon
                name={isEditingNotes ? "check" : "edit"}
                className="h-4 w-4"
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-secondary hover:text-error"
            >
              <Icon name="delete" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
