import React from "react";

import { Typography } from "../../../design-system/Typography";
import { Button } from "../../../ui/Button";

interface HelpOverlayProps {
  open: boolean;
  onClose: () => void;
  dontShowAgain: boolean;
  onDontShowAgainChange: (v: boolean) => void;
}

export const HelpOverlay: React.FC<HelpOverlayProps> = ({
  open,
  onClose,
  dontShowAgain,
  onDontShowAgainChange,
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="diagram-help-title"
    >
      <div className="panel-cupertino max-w-3xl w-[min(90vw,900px)] max-h-[85vh] overflow-auto p-5 relative">
        <div className="absolute top-2 right-2">
          <Button
            size="xs"
            variant="ghost"
            onClick={onClose}
            aria-label="Close help"
          >
            ×
          </Button>
        </div>
        <Typography
          id="diagram-help-title"
          variant="headline-sm"
          as="h2"
          className="mb-3"
        >
          Diagram Builder — Shortcuts & Tips
        </Typography>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <section>
            <h3 className="font-medium text-slate-700 mb-1">Navigation</h3>
            <ul className="list-disc ml-5 space-y-1">
              <li>Space (hold): Pan temporarily</li>
              <li>Cmd/Ctrl + Mouse Wheel: Zoom at cursor</li>
              <li>Cmd/Ctrl + = / - : Zoom in / out</li>
              <li>Toolbar: Fit, 100%, 200% presets</li>
            </ul>
          </section>
          <section>
            <h3 className="font-medium text-slate-700 mb-1">Selection</h3>
            <ul className="list-disc ml-5 space-y-1">
              <li>Click to select, Shift/Meta to multi-select</li>
              <li>Drag on empty canvas to marquee select</li>
              <li>Arrows: Nudge 0.5% • Shift+Arrows: 2%</li>
            </ul>
          </section>
          <section>
            <h3 className="font-medium text-slate-700 mb-1">Editing</h3>
            <ul className="list-disc ml-5 space-y-1">
              <li>Alt + Drag: Duplicate selection</li>
              <li>Undo / Redo: Cmd/Ctrl + Z / Shift+Cmd/Ctrl + Z</li>
              <li>Delete: Delete/Backspace (with confirm)</li>
            </ul>
          </section>
          <section>
            <h3 className="font-medium text-slate-700 mb-1">
              Routes & Drawing
            </h3>
            <ul className="list-disc ml-5 space-y-1">
              <li>
                Route: Click to add points, Double-click/Enter to finish, Esc to
                cancel
              </li>
              <li>Draw: Line/Arrow/Curve/Freehand from palette</li>
              <li>Shift while drawing: Constrain to 0/45/90°</li>
            </ul>
          </section>
          <section className="sm:col-span-2">
            <h3 className="font-medium text-slate-700 mb-1">
              Align & Distribute (with selection)
            </h3>
            <ul className="list-disc ml-5 space-y-1">
              <li>Meta/Ctrl + Alt + Arrows: Align to edges</li>
              <li>Meta/Ctrl + Alt + C/M: Center align X / Y</li>
              <li>
                Meta/Ctrl + Alt + H/V: Distribute horizontally / vertically
              </li>
            </ul>
          </section>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => onDontShowAgainChange(e.target.checked)}
            />
            <span>Don’t show again</span>
          </label>
          <Button
            size="sm"
            variant="secondary"
            onClick={onClose}
            aria-label="Close help"
          >
            Close (Esc)
          </Button>
        </div>
      </div>
    </div>
  );
};
