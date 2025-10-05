import React, { useEffect, useMemo, useRef, useState } from "react";
import { colorTokens } from "../../../../design-system/tokens";
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
  const selectedPlayers = useMemo(
    () => state.doc.players.filter((p) => sel.includes(p.id)),
    [state.doc.players, sel]
  );
  const [label, setLabel] = useState<string>(player?.label || "");
  const [assignment, setAssignment] = useState<string>(
    player?.assignment || ""
  );
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLabel(player?.label || "");
    setAssignment(player?.assignment || "");
  }, [player?.label, player?.assignment]);

  if (!player || sel.length === 0) return null;
  const isDragging = !!state.ui.dragging;
  const multi = sel.length > 1;
  const allLocked =
    selectedPlayers.length > 0 && selectedPlayers.every((p) => !!p.locked);

  // Player color palette - consistent with team/position scheme
  const colors = [
    colorTokens.blue[900],    // Deep blue
    colorTokens.blue[600],    // Medium blue
    colorTokens.emerald[700], // Emerald
    colorTokens.amber[700],   // Amber/brown
    colorTokens.red[700]      // Red
  ];
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
        <div className="surface-card/95 backdrop-blur rounded-md shadow-lg border border-subtle px-3 py-2">
          <div className="text-xs font-medium text-text-secondary mb-2">
            {multi
              ? `Selected: ${sel.length} players`
              : `Selected: ${player.id}`}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={() => {
                if (multi) return; // labels are unique; skip bulk
                dispatch({
                  type: "UPDATE_PLAYER",
                  id: player.id,
                  patch: { label },
                });
              }}
              disabled={multi}
              className="w-24 text-xs border border-border-light rounded px-2 py-1 disabled:opacity-60"
              placeholder="Label"
              aria-label="Player label"
            />
            <select
              className="text-xs border border-border-light rounded px-2 py-1"
              value={player.role || ""}
              onChange={(e) => {
                const role = e.target.value;
                if (multi)
                  dispatch({
                    type: "UPDATE_PLAYERS_BULK",
                    ids: sel,
                    patch: { role },
                  });
                else
                  dispatch({
                    type: "UPDATE_PLAYER",
                    id: player.id,
                    patch: { role },
                  });
              }}
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
                onBlur={() => {
                  if (!assignment.trim()) return;
                  if (multi)
                    dispatch({
                      type: "UPDATE_PLAYERS_BULK",
                      ids: sel,
                      patch: { assignment },
                    });
                  else
                    dispatch({
                      type: "UPDATE_PLAYER",
                      id: player.id,
                      patch: { assignment },
                    });
                }}
                className="w-full text-xs border border-border-light rounded px-2 py-1"
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
                  onClick={() => {
                    if (multi)
                      dispatch({
                        type: "UPDATE_PLAYERS_BULK",
                        ids: sel,
                        patch: { color: c },
                      });
                    else
                      dispatch({
                        type: "UPDATE_PLAYER",
                        id: player.id,
                        patch: { color: c },
                      });
                  }}
                  className="p-0 w-5 h-5 rounded-full border border-border-light"
                  style={{ background: c }}
                />
              ))}
            </div>
            <div className="flex items-center ml-auto">
              <Button
                size="xs"
                variant={allLocked ? "secondary" : "ghost"}
                aria-label={allLocked ? "Unlock players" : "Lock players"}
                title={
                  allLocked
                    ? "Unlock selected players"
                    : "Lock selected players"
                }
                onClick={() => {
                  const next = !allLocked;
                  if (multi)
                    dispatch({
                      type: "UPDATE_PLAYERS_BULK",
                      ids: sel,
                      patch: { locked: next },
                    });
                  else
                    dispatch({
                      type: "UPDATE_PLAYER",
                      id: player.id,
                      patch: { locked: next },
                    });
                }}
              >
                {allLocked ? "Unlock" : "Lock"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
