/**
 * NotesSection Component
 *
 * Displays editable play notes.
 */

import React from "react";
import { Typography } from "../../../../design-system/Typography";
import Icon from "../../../../ui/Icon/Icon";
import { InlineEditField } from "../../../../ui/InlineEditField";
import type { Play as PlayType } from "../../../../../types/play";

interface NotesSectionProps {
  notes: string | null | undefined;
  handleInlineSave: (
    field: keyof PlayType,
    value: string | number | boolean | null
  ) => Promise<void>;
  savingFields: Set<string>;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  handleInlineSave,
  savingFields,
}) => {
  return (
    <div className="bg-subtle rounded-lg p-md">
      <Typography
        variant="label-lg"
        as="h4"
        className="text-primary flex items-center mb-md"
      >
        <Icon name="file" className="h-4 w-4 mr-xs" /> Notes
      </Typography>
      <InlineEditField
        value={notes || ""}
        onSave={(value) => handleInlineSave("notes", value)}
        placeholder="Add notes about this play..."
        type="textarea"
        rows={4}
        isSaving={savingFields.has("notes")}
      />
    </div>
  );
};
