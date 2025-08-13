import React from "react";
import { Button } from "../../../ui/Button";
import { useDiagramEditor, useAddPlayer } from "../context";
import { TelemetryEventTypes } from "../../../../telemetry/events";
import { telemetry } from "../../../../telemetry/dispatcher";
import { svgElementToDataUrl } from "../thumbnail";

interface ToolbarProps {
  onClose?: () => void;
  svgRef: React.MutableRefObject<SVGSVGElement | null>;
}
export const Toolbar: React.FC<ToolbarProps> = ({ onClose, svgRef }) => {
  const { state, dispatch } = useDiagramEditor();
  const addPlayer = useAddPlayer();
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-subtle px-4 py-2 bg-white/80 backdrop-blur z-10">
      <div className="flex items-center gap-2 mr-4 whitespace-nowrap">
        <span className="font-medium text-slate-700">Diagram Builder v2</span>
        {onClose && (
          <Button size="xs" variant="ghost" onClick={onClose} aria-label="Close builder">
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
          </div>
        </div>
    </div>
  );
};
