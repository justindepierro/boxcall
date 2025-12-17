/**
 * PlayNotes Component
 *
 * Shared play notes section
 */

import { Typography } from "../../../design-system/Typography";
import { TextArea } from "../../../ui/TextArea";
import { Icon } from "../../../ui/Icon";
import type { PlayNotesProps } from "./types";

export function PlayNotes({
  playNotes,
  canEdit,
  onUpdateNotes,
}: PlayNotesProps) {
  return (
    <div className="bg-secondary rounded-lg p-3 border border-primary">
      <div className="flex items-center gap-2 mb-2">
        <Icon name="file" className="text-tertiary" />
        <Typography variant="label-md">Play Notes</Typography>
        <Typography variant="caption" className="text-tertiary">
          (shared with all positions)
        </Typography>
      </div>
      <TextArea
        value={playNotes}
        onChange={(e) => onUpdateNotes(e.target.value)}
        placeholder={
          canEdit ? "General notes about this play..." : "No play notes yet"
        }
        disabled={!canEdit}
        rows={3}
        className="w-full"
      />
    </div>
  );
}
