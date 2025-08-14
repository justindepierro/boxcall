import React from "react";
import { Button } from "../../../ui/Button";
import { useDiagramEditor, useAddPlayer } from "../context";
import { TelemetryEventTypes } from "../../../../telemetry/events";
import { telemetry } from "../../../../telemetry/dispatcher";
import { svgElementToDataUrl, svgFullToPngDataUrl, svgFullToString } from "../thumbnail";
import { FORMATION_OPTIONS } from "../formations";
import type { DiagramFieldConfig } from "../types";

interface ToolbarProps {
  onClose?: () => void;
  svgRef: React.MutableRefObject<SVGSVGElement | null>;
}
export const Toolbar: React.FC<ToolbarProps> = ({ onClose, svgRef }) => {
  const { state, dispatch } = useDiagramEditor();
  const addPlayer = useAddPlayer();
  return (
    <div className="panel-cupertino px-3 py-2 z-10 flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 mr-4 whitespace-nowrap">
        <span className="font-medium text-slate-700">Diagram Builder v2</span>
        {onClose && (
          <Button
            size="xs"
            variant="ghost"
            onClick={onClose}
            aria-label="Close builder"
          >
            ✕
          </Button>
        )}
      </div>
  <div className="flex items-center gap-2 text-xs flex-wrap">
        <div className="flex items-center gap-1 pr-3 border-r border-subtle">
          <Button
            size="xs"
            variant={state.ui.tool === "select" ? "secondary" : "ghost"}
            onClick={() => dispatch({ type: "SET_TOOL", tool: "select" })}
          >
            Select
          </Button>
          <Button
            size="xs"
            variant={state.ui.tool === "add-player" ? "secondary" : "ghost"}
            onClick={addPlayer}
          >
            Player
          </Button>
          <Button
            size="xs"
            variant={state.ui.tool === "route" ? "secondary" : "ghost"}
            onClick={() => dispatch({ type: "SET_TOOL", tool: "route" })}
          >
            Route
          </Button>
          {/* Draw controls moved to on-canvas ToolPalette */}
          {state.ui.tool === "route" && (
            <div className="inline-flex items-center gap-1 ml-1" role="group" aria-label="Route mode">
              <Button
                size="xs"
                variant={state.ui.routeMode === "line" ? "secondary" : "ghost"}
                onClick={() => dispatch({ type: "SET_ROUTE_MODE", mode: "line" })}
              >
                Line
              </Button>
              <Button
                size="xs"
                variant={state.ui.routeMode === "curve" ? "secondary" : "ghost"}
                onClick={() => dispatch({ type: "SET_ROUTE_MODE", mode: "curve" })}
              >
                Curve
              </Button>
            </div>
          )}
          <Button
            size="xs"
            variant={state.ui.tool === "motion" ? "secondary" : "ghost"}
            onClick={() =>
              dispatch({
                type: "SET_TOOL",
                tool: "motion" as typeof state.ui.tool,
              })
            }
          >
            Motion
          </Button>
          <div className="mx-2 w-px h-5 bg-slate-200" />
          <Button
            size="xs"
            variant={state.ui.snap ? "secondary" : "ghost"}
            onClick={() => dispatch({ type: "SET_SNAP", enabled: !state.ui.snap })}
            aria-pressed={state.ui.snap}
            aria-label="Toggle snap to grid"
          >
            Snap {state.ui.snap ? "On" : "Off"}
          </Button>
          <select
            className="text-xs border border-slate-300 rounded px-2 py-1"
            value={state.ui.snapGrid}
            onChange={(e) => dispatch({ type: "SET_SNAP_GRID", size: Number(e.target.value) })}
            aria-label="Snap grid size"
          >
            <option value={1}>1%</option>
            <option value={2}>2%</option>
            <option value={5}>5%</option>
          </select>
          <Button
            size="xs"
            variant="ghost"
            onClick={async () => {
              if (!svgRef.current) return;
              const started = performance.now();
              try {
                const dataUrl = await svgElementToDataUrl(svgRef.current, {
                  width: 480,
                  background: "#0f5132",
                });
                telemetry.enqueue({
                  type: TelemetryEventTypes.PlayDiagramExportThumbnail,
                  data: {
                    ok: true,
                    durMs: Math.round(performance.now() - started),
                    bytes: Math.round((dataUrl.length * 3) / 4),
                    w: 480,
                  },
                });
                const a = document.createElement("a");
                a.href = dataUrl;
                a.download = `diagram-${Date.now()}.png`;
                a.click();
              } catch (err: unknown) {
                telemetry.enqueue({
                  type: TelemetryEventTypes.PlayDiagramExportThumbnail,
                  data: {
                    ok: false,
                    durMs: Math.round(performance.now() - started),
                    error: err instanceof Error ? err.message : String(err),
                  },
                });
              }
            }}
          >
            Thumbnail
          </Button>
          <Button
            size="xs"
            variant="ghost"
            onClick={async () => {
              if (!svgRef.current) return;
              const started = performance.now();
              try {
                const width = 1600;
                const dataUrl = await svgFullToPngDataUrl(svgRef.current, {
                  width,
                  background: "#0f5132",
                });
                telemetry.enqueue({
                  type: TelemetryEventTypes.ExportScope,
                  data: {
                    format: "png",
                    ok: true,
                    durMs: Math.round(performance.now() - started),
                    bytes: Math.round((dataUrl.length * 3) / 4),
                    w: width,
                  },
                });
                const a = document.createElement("a");
                a.href = dataUrl;
                a.download = `diagram-full-${Date.now()}.png`;
                a.click();
              } catch (err: unknown) {
                telemetry.enqueue({
                  type: TelemetryEventTypes.ExportScope,
                  data: {
                    format: "png",
                    ok: false,
                    durMs: Math.round(performance.now() - started),
                    error: err instanceof Error ? err.message : String(err),
                  },
                });
              }
            }}
          >
            Export PNG
          </Button>
          <Button
            size="xs"
            variant="ghost"
            onClick={async () => {
              if (!svgRef.current) return;
              const started = performance.now();
              try {
                const width = 1600;
                const dataUrl = await svgFullToPngDataUrl(svgRef.current, {
                  width,
                  background: "#0f5132",
                });
                const { jsPDF } = await import("jspdf");
                const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
                const pageW = pdf.internal.pageSize.getWidth();
                const pageH = pdf.internal.pageSize.getHeight();
                // Maintain 16:9 fit within page with small margin
                const margin = 24;
                const maxW = pageW - margin * 2;
                const maxH = pageH - margin * 2;
                const imgW = maxW;
                const imgH = Math.min(maxH, (maxW * 9) / 16);
                const x = (pageW - imgW) / 2;
                const y = (pageH - imgH) / 2;
                pdf.addImage(dataUrl, "PNG", x, y, imgW, imgH, undefined, "FAST");
                pdf.save(`diagram-${Date.now()}.pdf`);
                telemetry.enqueue({
                  type: TelemetryEventTypes.ExportScope,
                  data: {
                    format: "pdf",
                    ok: true,
                    durMs: Math.round(performance.now() - started),
                    w: width,
                  },
                });
              } catch (err: unknown) {
                telemetry.enqueue({
                  type: TelemetryEventTypes.ExportScope,
                  data: {
                    format: "pdf",
                    ok: false,
                    durMs: Math.round(performance.now() - started),
                    error: err instanceof Error ? err.message : String(err),
                  },
                });
              }
            }}
          >
            Export PDF
          </Button>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => {
              if (!svgRef.current) return;
              const started = performance.now();
              try {
                const width = 1600;
                const svgText = svgFullToString(svgRef.current, {
                  width,
                  background: "#0f5132",
                });
                const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `diagram-full-${Date.now()}.svg`;
                a.click();
                URL.revokeObjectURL(url);
                telemetry.enqueue({
                  type: TelemetryEventTypes.ExportScope,
                  data: {
                    format: "svg",
                    ok: true,
                    durMs: Math.round(performance.now() - started),
                    bytes: blob.size,
                    w: width,
                  },
                });
              } catch (err: unknown) {
                telemetry.enqueue({
                  type: TelemetryEventTypes.ExportScope,
                  data: {
                    format: "svg",
                    ok: false,
                    durMs: Math.round(performance.now() - started),
                    error: err instanceof Error ? err.message : String(err),
                  },
                });
              }
            }}
          >
            Export SVG
          </Button>
        </div>
        {/* Formations & Transform */}
        <div className="flex items-center gap-1 pr-3 border-r border-subtle">
          <span className="text-[11px] text-slate-600 mr-1">Formations</span>
          <select
            className="text-xs border border-slate-300 rounded px-2 py-1"
            onChange={(e) => {
              if (!e.target.value) return;
              dispatch({ type: "APPLY_FORMATION", formation: e.target.value });
            }}
            defaultValue=""
            aria-label="Apply formation"
          >
            <option value="" disabled>
              Choose…
            </option>
            {FORMATION_OPTIONS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
          <div className="mx-2 w-px h-5 bg-slate-200" />
          <Button
            size="xs"
            variant="ghost"
            onClick={() => dispatch({ type: "MIRROR" })}
            aria-label="Mirror play"
          >
            Mirror
          </Button>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => {
              // Reset view: zero pan, reset zoom
              dispatch({ type: "SET_ZOOM", zoom: 1 });
              // We only have PAN deltas; apply inverse of current pan to zero it out
              const { panX, panY } = state.ui;
              if (panX || panY) dispatch({ type: "PAN", dx: -panX, dy: -panY });
            }}
            aria-label="Reset view"
          >
            Reset View
          </Button>
        </div>
        {/* Field Settings */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-600">Field</span>
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={state.doc.field.showYardLines}
              onChange={() => dispatch({ type: "TOGGLE_FIELD_FLAG", flag: "showYardLines" })}
            />
            <span>Lines</span>
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={state.doc.field.showHashMarks}
              onChange={() => dispatch({ type: "TOGGLE_FIELD_FLAG", flag: "showHashMarks" })}
            />
            <span>Hashes</span>
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={state.doc.field.showPlayerLabels}
              onChange={() => dispatch({ type: "TOGGLE_FIELD_FLAG", flag: "showPlayerLabels" })}
            />
            <span>Labels</span>
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={state.doc.field.showDefensePlayers}
              onChange={() => dispatch({ type: "TOGGLE_FIELD_FLAG", flag: "showDefensePlayers" })}
            />
            <span>Defense</span>
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={!!state.doc.field.showRedZone}
              onChange={() => dispatch({ type: "TOGGLE_FIELD_FLAG", flag: "showRedZone" })}
            />
            <span>Red Zone</span>
          </label>
          <div className="mx-2 w-px h-5 bg-slate-200" />
          <select
            className="text-xs border border-slate-300 rounded px-2 py-1"
            value={state.doc.field.theme || "classic"}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD_THEME",
                theme: e.target.value as NonNullable<DiagramFieldConfig["theme"]>,
              })
            }
            aria-label="Field theme"
          >
            <option value="classic">Classic</option>
            <option value="mono-light">Mono Light</option>
            <option value="mono-dark">Mono Dark</option>
          </select>
          <select
            className="text-xs border border-slate-300 rounded px-2 py-1"
            value={state.doc.field.hashLayout || "highschool"}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD_HASH_LAYOUT",
                layout: e.target.value as NonNullable<DiagramFieldConfig["hashLayout"]>,
              })
            }
            aria-label="Hash layout"
          >
            <option value="highschool">HS Hashes</option>
            <option value="college">College</option>
            <option value="nfl">NFL</option>
          </select>
          <div className="flex items-center gap-1" role="group" aria-label="Ball hash">
            <Button
              size="xs"
              variant={state.doc.field.ballHash === "left" ? "secondary" : "ghost"}
              onClick={() => dispatch({ type: "SET_BALL_HASH", hash: "left" })}
            >
              Hash L
            </Button>
            <Button
              size="xs"
              variant={state.doc.field.ballHash === "middle" ? "secondary" : "ghost"}
              onClick={() => dispatch({ type: "SET_BALL_HASH", hash: "middle" })}
            >
              Hash M
            </Button>
            <Button
              size="xs"
              variant={state.doc.field.ballHash === "right" ? "secondary" : "ghost"}
              onClick={() => dispatch({ type: "SET_BALL_HASH", hash: "right" })}
            >
              Hash R
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
