import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDiagramEditor } from "../context";
import { Button } from "../../../ui/Button";

export const ActionBar: React.FC<{
  svgRef: React.MutableRefObject<SVGSVGElement | null>;
}> = ({ svgRef: _svgRef }) => {
  const { state, dispatch } = useDiagramEditor();
  const sel = useMemo(() => state.ui.selectedIds || [], [state.ui.selectedIds]);
  const player = useMemo(
    () => state.doc.players.find((p) => p.id === sel[0]),
    [state.doc.players, sel]
  );
  const [label, setLabel] = useState<string>(player?.label || "");
  const [assignment, setAssignment] = useState<string>(player?.assignment || "");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLabel(player?.label || "");
    setAssignment(player?.assignment || "");
  }, [player?.label, player?.assignment]);

  if (!player || sel.length === 0) return null;
  const isDragging = !!state.ui.dragging;

  const colors = ["#1e3a8a", "#2563eb", "#047857", "#92400e", "#b91c1c"];
  const roles = ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB", "C"];

  return (
    <>
      {/* subtle bottom gradient to separate from field (decorative) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-14 z-10 surface-subtle/0 [mask-image:linear-gradient(to_top,black,transparent)]"
        style={{ backgroundColor: "rgba(0,0,0,0.14)" }}
      />
      <div
        ref={containerRef}
        className={`absolute inset-x-3 bottom-3 z-20 pointer-events-auto transition-opacity duration-150 ${isDragging ? "opacity-0" : "opacity-100"}`}
      >
      <div className="bg-white/95 backdrop-blur rounded-md shadow-lg border border-slate-200 px-3 py-2">
        <div className="text-xs font-medium text-slate-700 mb-2">Selected: {player.id}</div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={() => dispatch({ type: "UPDATE_PLAYER", id: player.id, patch: { label } })}
            className="w-24 text-xs border border-slate-300 rounded px-2 py-1"
            placeholder="Label"
            aria-label="Player label"
          />
          <select
            className="text-xs border border-slate-300 rounded px-2 py-1"
            value={player.role || ""}
            onChange={(e) => dispatch({ type: "UPDATE_PLAYER", id: player.id, patch: { role: e.target.value } })}
            aria-label="Role"
          >
            <option value="">Role</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <div className="grow min-w-[180px]">
          <input
            value={assignment}
            onChange={(e) => setAssignment(e.target.value)}
            onBlur={() =>
              dispatch({ type: "UPDATE_PLAYER", id: player.id, patch: { assignment } })
            }
            className="w-full text-xs border border-slate-300 rounded px-2 py-1"
            placeholder="Assignment / note"
            aria-label="Assignment"
          />
          </div>
          <div className="flex items-center gap-1">
          {colors.map((c) => (
            <Button
              key={c}
              size="xs"
              variant="ghost"
              aria-label={`Set color ${c}`}
              title="Set color"
              onClick={() =>
                dispatch({ type: "UPDATE_PLAYER", id: player.id, patch: { color: c } })
              }
              className="p-0 w-5 h-5 rounded-full border border-slate-300"
              style={{ background: c }}
            />
          ))}
          </div>
        </div>
      </div>
      </div>
    </>
  );
};
