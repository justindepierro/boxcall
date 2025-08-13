import React, { useEffect, useRef, useState, useCallback } from "react";
import { DiagramEditorProvider, useDiagramEditor } from "./context";
import { Toolbar } from "./components/Toolbar";
import { PlayerSidebar } from "./components/PlayerSidebar";
import { RoutesPanel } from "./components/RoutesPanel";
import { CanvasPane } from "./components/CanvasPane";
import type { DiagramDocument } from "./types";

interface ShellProps {
  onDocumentChange?: (doc: DiagramDocument) => void;
  onClose?: () => void;
}

const Shell: React.FC<ShellProps> = ({ onDocumentChange, onClose }) => {
  const { state, dispatch } = useDiagramEditor();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState<number>(260);
  const resizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(260);

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    resizingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = sidebarWidth;
    document.body.classList.add("select-none", "cursor-col-resize");
  };
  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (!resizingRef.current) return;
    const delta = e.clientX - startXRef.current;
    const next = Math.min(420, Math.max(200, startWidthRef.current + delta));
    setSidebarWidth(next);
  }, []);
  const handleGlobalMouseUp = useCallback(() => {
    if (resizingRef.current) {
      resizingRef.current = false;
      document.body.classList.remove("select-none", "cursor-col-resize");
    }
  }, []);
  useEffect(() => {
    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [handleGlobalMouseMove, handleGlobalMouseUp]);

  // Keyboard delete handler (bulk or single)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (state.ui.selectedIds && state.ui.selectedIds.length > 1) {
          dispatch({ type: "SET_PENDING_BULK_DELETE", pending: true });
        } else if (state.ui.selectedIds && state.ui.selectedIds.length === 1) {
          dispatch({ type: "SET_PENDING_DELETE", id: state.ui.selectedIds[0] });
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.ui.selectedIds, dispatch]);

  // Propagate document changes upward
  useEffect(() => {
    if (onDocumentChange) onDocumentChange(state.doc);
  }, [state.doc, onDocumentChange]);

  return (
    <div className="flex flex-col h-full min-h-[620px]">
      <Toolbar onClose={onClose} svgRef={svgRef} />
      <div className="flex flex-1 min-h-0" style={{ width: "100%" }}>
        <div
          className="flex flex-col border-r border-subtle bg-slate-50/60 backdrop-blur px-3 py-2 overflow-y-auto"
          style={{ width: sidebarWidth }}
        >
          <PlayerSidebar />
          <RoutesPanel />
        </div>
        <div
          role="separator"
          aria-orientation="vertical"
          onMouseDown={handleResizeMouseDown}
          className="w-1 cursor-col-resize bg-transparent hover:bg-blue-200 active:bg-blue-300 transition-colors"
        />
  <CanvasPane svgRef={svgRef} className="flex-1 min-w-0 flex flex-col p-3" />
      </div>
    </div>
  );
};

export const VisualPlayBuilderV2: React.FC<{
  onDocumentChange?: (doc: DiagramDocument) => void;
  onClose?: () => void;
}> = ({ onDocumentChange, onClose }) => (
  <DiagramEditorProvider>
    <Shell onDocumentChange={onDocumentChange} onClose={onClose} />
  </DiagramEditorProvider>
);
