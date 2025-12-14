/**
 * NotesSection Component
 *
 * Collapsible notes input for session notes
 *
 * NOTE: This component intentionally uses raw Tailwind colors for:
 * - Focus states (jade-*)
 * - Subtle backgrounds (slate-*)
 */

/* eslint-disable boxcall-design/no-raw-tailwind-colors */

import React from "react";
import { Button } from "../../ui";
import { Icon } from "../../ui/Icon/Icon";
import type { NotesSectionProps } from "./types";

/**
 * Collapsible notes section for adding session notes
 */
export const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  showNotes,
  isPaused,
  onNotesChange,
  onToggleNotes,
}) => (
  <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <span className="text-primary font-semibold text-sm flex items-center gap-2">
        <Icon name="edit-3" size="sm" className="text-slate-400" />
        Session Notes
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleNotes}
        className="text-jade-600"
      >
        {showNotes ? "Hide" : "Add Note"}
      </Button>
    </div>
    {showNotes && (
      <textarea
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Add notes for this rep..."
        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-primary placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-jade-500/50 focus:border-jade-500 transition-all"
        rows={3}
        disabled={isPaused}
      />
    )}
  </div>
);
