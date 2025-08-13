import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDiagramEditor } from "../context";
import { Button } from "../../../ui/Button";

export const ActionBar: React.FC<{
  svgRef: React.MutableRefObject<SVGSVGElement | null>;
}> = ({ svgRef }) => {
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

  // Convert player's world coords to container-relative pixels
  const svg = svgRef.current;
  if (!svg) return null;
  const rect = svg.getBoundingClientRect();
  const worldX = (player.x / 100) * 1600;
  const worldY = (player.y / 100) * 900;
  const vx = state.ui.panX + state.ui.zoom * worldX;
  const vy = state.ui.panY + state.ui.zoom * worldY;
  const left = (vx / 1600) * rect.width;
  const top = (vy / 900) * rect.height;

  const colors = ["#1e3a8a", "#2563eb", "#047857", "#92400e", "#b91c1c"];
  const roles = ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB", "C"];

  return (
    <div
      ref={containerRef}
      className="absolute z-20"
      style={{ left: Math.round(left) - 60, top: Math.round(top) - 56 }}
    >
      <div className="bg-white/95 backdrop-blur rounded-md shadow-lg border border-slate-200 px-2 py-2 w-[180px]">
        <div className="text-xs font-medium text-slate-700 mb-1">{player.id}</div>
  <div className="flex items-center gap-1 mb-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={() => dispatch({ type: "UPDATE_PLAYER", id: player.id, patch: { label } })}
            className="w-20 text-xs border border-slate-300 rounded px-1 py-0.5"
            placeholder="Label"
            aria-label="Player label"
          />
          <select
            className="text-xs border border-slate-300 rounded px-1 py-0.5"
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
        </div>
        <div className="mb-2">
          <input
            value={assignment}
            onChange={(e) => setAssignment(e.target.value)}
            onBlur={() =>
              dispatch({ type: "UPDATE_PLAYER", id: player.id, patch: { assignment } })
            }
            className="w-full text-xs border border-slate-300 rounded px-1 py-0.5"
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
  );
};
