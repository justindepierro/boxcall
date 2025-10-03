import React, { useState } from "react";
import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { Typography } from "../design-system/Typography";
import { Icon } from "../ui/Icon";
import { Button } from "../ui/Button/Button";
import { Badge } from "../ui/Badge";
import Textarea from "../ui/TextArea/TextArea";
import type { PracticeScriptPlay } from "@services";

interface PracticeScriptPlayItemProps {
  scriptPlay: PracticeScriptPlay;
  index: number;
  onRemove: () => void;
  onUpdateNotes: (notes: string) => void;
  onUpdateRepetitions: (repetitions: number) => void;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
}

export const PracticeScriptPlayItem: React.FC<PracticeScriptPlayItemProps> = ({
  scriptPlay,
  index,
  onRemove,
  onUpdateNotes,
  onUpdateRepetitions,
  dragHandleProps,
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(scriptPlay.notes || "");
  const [repetitionsValue, setRepetitionsValue] = useState(scriptPlay.repetitions);

  const play = scriptPlay.play;
  const displayName = `${play.formation}${play.f_dir ? ` ${play.f_dir}` : ""} - ${play.play_name}${play.p_dir ? ` (${play.p_dir})` : ""}`;

  const handleNotesSave = () => {
    onUpdateNotes(notesValue);
    setIsEditingNotes(false);
  };

  const handleNotesCancel = () => {
    setNotesValue(scriptPlay.notes || "");
    setIsEditingNotes(false);
  };

  const handleRepetitionsChange = (value: number) => {
    const clampedValue = Math.max(1, Math.min(20, value)); // Clamp between 1-20
    setRepetitionsValue(clampedValue);
    onUpdateRepetitions(clampedValue);
  };

  return (
    <div className="bg-surface-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start space-x-4">
        {/* Drag Handle */}
        <div
          {...dragHandleProps}
          className="flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing text-text-muted hover:text-text-primary"
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
              <Typography variant="body-sm" className="text-text-primary font-medium truncate">
                {displayName}
              </Typography>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="neutral" size="sm">
                  {play.p_type}
                </Badge>
                <Typography variant="caption" className="text-text-secondary">
                  {play.formation}
                </Typography>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingNotes(!isEditingNotes)}
                className="text-text-secondary hover:text-text-primary"
              >
                <Icon name={isEditingNotes ? "check" : "edit"} className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="text-text-secondary hover:text-error"
              >
                <Icon name="delete" className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mt-3">
            {isEditingNotes ? (
              <div className="space-y-2">
                <Textarea
                  value={notesValue}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotesValue(e.target.value)}
                  placeholder="Add notes for this play (e.g., focus on footwork, emphasize timing)..."
                  rows={2}
                  className="w-full text-sm"
                />
                <div className="flex space-x-2">
                  <Button variant="primary" size="sm" onClick={handleNotesSave}>
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleNotesCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Typography variant="body-sm" className="text-text-secondary">
                {scriptPlay.notes || "No notes added"}
              </Typography>
            )}
          </div>

          {/* Timing and Repetitions */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Typography variant="caption" className="text-text-secondary">
                  Repetitions:
                </Typography>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRepetitionsChange(repetitionsValue - 1)}
                    disabled={repetitionsValue <= 1}
                    className="h-6 w-6 p-0"
                  >
                    <Icon name="minus" className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">
                    {repetitionsValue}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRepetitionsChange(repetitionsValue + 1)}
                    disabled={repetitionsValue >= 20}
                    className="h-6 w-6 p-0"
                  >
                    <Icon name="plus" className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Typography variant="caption" className="text-text-secondary">
                  Time:
                </Typography>
                <Badge variant="info" size="sm">
                  {scriptPlay.estimatedTime * repetitionsValue} min
                </Badge>
              </div>
            </div>

            <Typography variant="caption" className="text-text-muted">
              Added {new Date(scriptPlay.addedAt).toLocaleDateString()}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};