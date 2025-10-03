import React from "react";

import { Button } from "../../../ui/Button";
import { useDiagramEditor } from "../context/useDiagramEditor";
import { useAddPlayer } from "../context/useAddPlayer";
// Thumbnail helpers are loaded on-demand to keep bundle size down

interface ToolbarProps {
  onClose?: () => void;
  svgRef: React.MutableRefObject<SVGSVGElement | null>;
}
export const Toolbar: React.FC<ToolbarProps> = ({
  onClose,
  svgRef: _svgRef,
}) => {
  const { state, dispatch } = useDiagramEditor();
  const addPlayer = useAddPlayer();
  return (
    <div
      data-testid="toolbar-root"
      className="panel-cupertino px-3 py-2 z-10 flex flex-wrap items-center gap-2"
    >
      <div className="flex items-center gap-2 mr-4 whitespace-nowrap">
        <span className="font-medium text-text-primary">
          Diagram Builder v2
        </span>
        {onClose && (
          <Button
            size="xs"
            variant="ghost"
            onClick={onClose}
            aria-label="Close builder"
          >
            X
          </Button>
        )}
      </div>
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
        <div className="mx-2 w-px h-5 bg-border-medium" />
        <Button
          size="xs"
          variant={state.ui.snap ? "secondary" : "ghost"}
          onClick={() =>
            dispatch({ type: "SET_SNAP", enabled: !state.ui.snap })
          }
          aria-pressed={state.ui.snap}
          aria-label="Toggle snap to grid"
        >
          Snap {state.ui.snap ? "On" : "Off"}
        </Button>
      </div>
    </div>
  );
};
