import React from "react";
import { Typography } from "../../design-system/Typography";
import { Button } from "../../ui/Button/Button";
import Textarea from "../../ui/TextArea/TextArea";

export function PracticeScriptPlayNotes({
  isEditing,
  value,
  defaultValue,
  onChange,
  onSave,
  onCancel,
}: {
  isEditing: boolean;
  value: string;
  defaultValue: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-3">
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={value}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onChange(e.target.value)
            }
            placeholder="Add notes for this play (e.g., focus on footwork, emphasize timing)..."
            rows={2}
            className="w-full text-sm"
          />
          <div className="flex space-x-2">
            <Button variant="primary" size="sm" onClick={onSave}>
              Save
            </Button>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Typography variant="body-sm" className="text-secondary">
          {defaultValue || "No notes added"}
        </Typography>
      )}
    </div>
  );
}
